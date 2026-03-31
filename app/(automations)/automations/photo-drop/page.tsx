'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { uploadImage } from '@/lib/supabase/storage'
import {
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  LinkIcon,
  CheckCircleIcon,
} from '@heroicons/react/16/solid'

interface WorkspaceBrand {
  id: string
  name: string
  color: string
  tone: string
}

interface PhotoItem {
  id: string
  url: string
  groupId: string | null
}

type PostGroup = {
  id: string
  photos: PhotoItem[]
  caption: string
  status: 'idle' | 'generating' | 'done' | 'error'
}

const PLATFORMS = ['instagram', 'facebook', 'linkedin']

export default function PhotoDropPage() {
  const router = useRouter()
  const [brands, setBrands] = useState<WorkspaceBrand[]>([])
  const [brandId, setBrandId] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [prompt, setPrompt] = useState('')
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [groups, setGroups] = useState<PostGroup[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedForGroup, setSelectedForGroup] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)
  const [createdCount, setCreatedCount] = useState(0)

  useEffect(() => {
    fetch('/api/brands')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setBrands(data.map((b: any) => ({ id: b.id, name: b.name, color: b.primaryColor || b.color || '#ff5473', tone: b.tone || 'professional' })))
      })
      .catch(() => {})
  }, [])

  function uid() { return crypto.randomUUID() }

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const newPhotos: PhotoItem[] = []
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file)
        newPhotos.push({ id: uid(), url, groupId: null })
      } catch (e: any) {
        toast.error('Upload failed: ' + e.message)
      }
    }
    setPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)
  }

  function removePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id))
    setSelectedForGroup(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleSelect(id: string) {
    setSelectedForGroup(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function groupSelected() {
    if (selectedForGroup.size < 2) { toast.error('Select at least 2 photos to group as a carousel'); return }
    const groupId = uid()
    setPhotos(prev => prev.map(p => selectedForGroup.has(p.id) ? { ...p, groupId } : p))
    setSelectedForGroup(new Set())
    toast.success('Photos grouped as carousel')
  }

  function ungroupPhoto(photoId: string) {
    setPhotos(prev => prev.map(p => p.id === photoId ? { ...p, groupId: null } : p))
  }

  function buildPostGroups(): PostGroup[] {
    const grouped = new Map<string, PhotoItem[]>()
    const singles: PhotoItem[] = []

    for (const p of photos) {
      if (p.groupId) {
        if (!grouped.has(p.groupId)) grouped.set(p.groupId, [])
        grouped.get(p.groupId)!.push(p)
      } else {
        singles.push(p)
      }
    }

    const result: PostGroup[] = []
    for (const [gid, items] of grouped) {
      result.push({ id: gid, photos: items, caption: '', status: 'idle' })
    }
    for (const p of singles) {
      result.push({ id: p.id, photos: [p], caption: '', status: 'idle' })
    }
    return result
  }

  async function generateAndSubmit() {
    if (!brandId) { toast.error('Select a brand first'); return }
    if (photos.length === 0) { toast.error('Upload at least one photo'); return }

    setProcessing(true)
    const postGroups = buildPostGroups()
    setGroups(postGroups)

    let created = 0

    for (let i = 0; i < postGroups.length; i++) {
      const group = postGroups[i]
      setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'generating' } : g))

      try {
        // Generate caption with image context
        const captionRes = await fetch('/api/automations/social-caption', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            platforms,
            prompt: prompt || '',
            imageUrl: group.photos[0].url,
          }),
        })
        const captionData = await captionRes.json()
        if (!captionRes.ok) throw new Error(captionData.error || 'Caption generation failed')

        const caption = captionData.caption || ''
        setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, caption, status: 'done' } : g))

        // Create post with status 'submitted'
        const postRes = await fetch('/api/automations/social-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            brandId,
            caption,
            platforms,
            status: 'submitted',
            imageUrl: group.photos[0].url,
            imageUrls: group.photos.map(p => p.url),
          }),
        })
        const postData = await postRes.json()
        if (!postRes.ok) throw new Error(postData.error || 'Post creation failed')
        created++
      } catch (e: any) {
        setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'error', caption: e.message } : g))
      }
    }

    // Send notification
    if (created > 0) {
      await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approval',
          title: `${created} new post${created !== 1 ? 's' : ''} ready for approval`,
          message: `Photo Drop generated ${created} post${created !== 1 ? 's' : ''} for ${brands.find(b => b.id === brandId)?.name || 'your brand'}. Review and approve them to add to your Buffer queue.`,
          link: '/posts',
        }),
      }).catch(() => {})
    }

    setProcessing(false)
    setCreatedCount(created)
    setDone(true)
  }

  const ungroupedPhotos = photos.filter(p => !p.groupId)
  const groupedSets = new Map<string, PhotoItem[]>()
  for (const p of photos.filter(p => p.groupId)) {
    if (!groupedSets.has(p.groupId!)) groupedSets.set(p.groupId!, [])
    groupedSets.get(p.groupId!)!.push(p)
  }

  if (done) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="card p-10">
          <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#e6e1e1] mb-2">Posts Created!</h2>
          <p className="text-[#e1bec0] mb-6">
            {createdCount} post{createdCount !== 1 ? 's' : ''} submitted for approval. Review them on the Posts page to approve and send to Buffer.
          </p>
          <div className="space-y-3 mb-8 max-w-md mx-auto">
            {groups.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 p-3 bg-[#2b2a29] rounded-lg text-left">
                <img src={g.photos[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e1bec0] truncate">{g.caption || 'Generated caption'}</p>
                  <p className="text-[10px] text-[#5a4042]">
                    {g.photos.length > 1 ? `Carousel · ${g.photos.length} photos` : 'Single photo'}
                    {' · '}
                    <span className={g.status === 'done' ? 'text-emerald-400' : 'text-red-400'}>
                      {g.status === 'done' ? 'Created' : 'Failed'}
                    </span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/posts" className="btn btn-p">Review Posts</Link>
            <button onClick={() => { setDone(false); setPhotos([]); setGroups([]); setCreatedCount(0) }} className="btn btn-o">Drop More Photos</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Photo Drop</h1>
      <p className="text-[#e1bec0] mb-6">Upload photos, AI generates captions, posts go for approval.</p>

      {/* Config */}
      <div className="card p-5 mb-5 space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Brand</label>
            <select className="sel" value={brandId} onChange={e => setBrandId(e.target.value)}>
              <option value="">Select a brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">Platforms</label>
            <div className="flex gap-4 pt-1">
              {PLATFORMS.map(p => (
                <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                  <input type="checkbox" className="w-4 h-4 accent-[#ff5473]" checked={platforms.includes(p)} onChange={() => togglePlatform(p)} />
                  <span className="text-sm capitalize text-[#e6e1e1]">{p}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="lbl">Theme / Prompt (optional)</label>
          <input className="inp" placeholder="e.g. behind the scenes, product launch, team culture..." value={prompt} onChange={e => setPrompt(e.target.value)} />
        </div>
      </div>

      {/* Upload zone */}
      <div className="card p-5 mb-5">
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-xl p-8 cursor-pointer hover:border-[#ff5473] transition-colors text-center">
          <PhotoIcon className="w-10 h-10 text-[#5a4042] mb-2" />
          <span className="text-[#e1bec0] font-medium">
            {uploading ? 'Uploading...' : 'Click to upload photos'}
          </span>
          <span className="text-xs text-[#5a4042] mt-1">Select multiple files at once</span>
          <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
        </label>
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-[#e6e1e1]">{photos.length} photo{photos.length !== 1 ? 's' : ''}</h3>
            {selectedForGroup.size >= 2 && (
              <button onClick={groupSelected} className="btn btn-o btn-sm flex items-center gap-1">
                <LinkIcon className="w-3 h-3" /> Group as Carousel ({selectedForGroup.size})
              </button>
            )}
          </div>

          {/* Grouped carousels */}
          {Array.from(groupedSets.entries()).map(([gid, items]) => (
            <div key={gid} className="mb-4 p-3 bg-[rgba(14,165,233,0.08)] border border-[rgba(14,165,233,0.2)] rounded-lg">
              <p className="text-xs font-medium text-sky-400 mb-2">Carousel · {items.length} photos</p>
              <div className="flex gap-2 flex-wrap">
                {items.map(p => (
                  <div key={p.id} className="relative group">
                    <img src={p.url} alt="" className="w-20 h-20 rounded-lg object-cover" />
                    <button onClick={() => ungroupPhoto(p.id)}
                      className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove from carousel"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Ungrouped singles */}
          {ungroupedPhotos.length > 0 && (
            <>
              {groupedSets.size > 0 && <p className="text-xs text-[#e1bec0] mb-2 mt-4">Individual posts (click to select for carousel):</p>}
              <div className="flex gap-2 flex-wrap">
                {ungroupedPhotos.map(p => {
                  const selected = selectedForGroup.has(p.id)
                  return (
                    <div key={p.id} className="relative group">
                      <img
                        src={p.url}
                        alt=""
                        className={`w-20 h-20 rounded-lg object-cover cursor-pointer transition-all ${selected ? 'ring-2 ring-[#ff5473] ring-offset-2 ring-offset-[#1c1b1b]' : 'hover:opacity-80'}`}
                        onClick={() => toggleSelect(p.id)}
                      />
                      <button onClick={() => removePhoto(p.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {/* Progress */}
      {processing && groups.length > 0 && (
        <div className="card p-5 mb-5">
          <h3 className="font-semibold text-[#e6e1e1] mb-3">Generating captions...</h3>
          <div className="space-y-2">
            {groups.map((g, i) => (
              <div key={g.id} className="flex items-center gap-3 p-2 rounded-lg bg-[#2b2a29]">
                <img src={g.photos[0].url} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#e6e1e1]">
                    Post {i + 1} {g.photos.length > 1 ? `(carousel · ${g.photos.length})` : ''}
                  </p>
                  {g.status === 'generating' && <p className="text-xs text-[#ffb2b9] flex items-center gap-1"><ArrowPathIcon className="w-3 h-3 animate-spin" /> Generating caption...</p>}
                  {g.status === 'done' && <p className="text-xs text-emerald-400">Done</p>}
                  {g.status === 'error' && <p className="text-xs text-red-400">{g.caption}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit */}
      {photos.length > 0 && !processing && (
        <button
          className="btn btn-p w-full flex items-center justify-center gap-2 py-3 text-base"
          disabled={!brandId || processing}
          onClick={generateAndSubmit}
        >
          <SparklesIcon className="w-5 h-5" />
          Generate & Submit {buildPostGroups().length} Post{buildPostGroups().length !== 1 ? 's' : ''}
        </button>
      )}
    </div>
  )
}
