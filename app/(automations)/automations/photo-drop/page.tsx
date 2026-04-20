'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { uploadImage } from '@/lib/supabase/storage'
import type { Photo, Folder } from '@/lib/types'
import {
  PhotoIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon,
  PaperAirplaneIcon,
  LinkIcon,
  CheckCircleIcon,
  PaperClipIcon,
  ClockIcon,
  CalendarDaysIcon,
} from '@heroicons/react/16/solid'

interface WorkspaceBrand { id: string; name: string; color: string; tone: string; buffer_profile_ids?: string[] }
interface PhotoItem { id: string; url: string; groupId: string | null; photoId?: string }
type PostGroup = { id: string; photos: PhotoItem[]; caption: string; status: 'idle' | 'generating' | 'done' | 'error' }
interface Schedule { id: string; brand_id: string; frequency: string; day_of_week: number; batch_size: number; platforms: string[]; prompt: string; enabled: boolean; last_run_at: string | null; next_run_at: string | null }

const PLATFORMS = ['instagram', 'facebook', 'linkedin']
const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const FREQUENCIES = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
]

export default function PhotoDropPage() {
  const [brands, setBrands] = useState<WorkspaceBrand[]>([])
  const [brandId, setBrandId] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [prompt, setPrompt] = useState('')
  const [batchSize, setBatchSize] = useState(5)
  const [photos, setPhotos] = useState<PhotoItem[]>([])
  const [allPhotos, setAllPhotos] = useState<Photo[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [groups, setGroups] = useState<PostGroup[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [selectedForGroup, setSelectedForGroup] = useState<Set<string>>(new Set())
  const [done, setDone] = useState(false)
  const [createdCount, setCreatedCount] = useState(0)
  const [processedIds, setProcessedIds] = useState<string[]>([])
  // Schedule state
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [showSchedule, setShowSchedule] = useState(false)
  const [schedFreq, setSchedFreq] = useState('weekly')
  const [schedDay, setSchedDay] = useState(1)
  const [schedBatch, setSchedBatch] = useState(5)
  const [schedPlatforms, setSchedPlatforms] = useState<string[]>(['instagram'])
  const [schedPrompt, setSchedPrompt] = useState('')
  const [savingSchedule, setSavingSchedule] = useState(false)

  useEffect(() => {
    fetch('/api/brands').then(r => r.json()).then(data => {
      if (Array.isArray(data)) setBrands(data.map((b: any) => ({ id: b.id, name: b.name, color: b.primaryColor || b.color || '#ff5473', tone: b.tone || 'professional', buffer_profile_ids: b.bufferProfileIds || [] })))
    }).catch(() => {})
    // Load folders from localStorage
    try { setFolders(JSON.parse(localStorage.getItem('cc_folders') || '[]')) } catch { setFolders([]) }
    // Load photos from workspace context isn't available here so fetch from API
    // We'll use a simpler approach: load via the workspace data endpoint
  }, [])

  // Load photos when brand changes
  useEffect(() => {
    if (!brandId) { setAllPhotos([]); return }
    // Load all workspace photos from localStorage (workspace context stores them)
    try {
      const stored = localStorage.getItem('cc_photos')
      if (stored) setAllPhotos(JSON.parse(stored))
    } catch { /* ignore */ }
    // Also fetch schedules
    fetch(`/api/automations/photo-drop/schedule?brandId=${brandId}`).then(r => r.json()).then(data => {
      if (Array.isArray(data)) setSchedules(data)
    }).catch(() => {})
  }, [brandId])

  // Get unprocessed photos from brand-linked folders
  const brandFolders = folders.filter(f => f.brand_id === brandId)
  const brandFolderIds = new Set(brandFolders.map(f => f.id))
  const unprocessedPhotos = allPhotos.filter(p => p.folder_id && brandFolderIds.has(p.folder_id) && !p.processed)

  // Auto-populate photos from library when brand changes
  useEffect(() => {
    if (unprocessedPhotos.length > 0) {
      const limited = unprocessedPhotos.slice(0, batchSize)
      setPhotos(limited.map(p => ({ id: p.id, url: p.url, groupId: null, photoId: p.id })))
    } else {
      setPhotos([])
    }
    setSelectedForGroup(new Set())
  }, [brandId, allPhotos.length, batchSize]) // eslint-disable-line react-hooks/exhaustive-deps

  function uid() { return crypto.randomUUID() }
  function togglePlatform(p: string) { setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]) }

  async function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploading(true)
    const newPhotos: PhotoItem[] = []
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file)
        newPhotos.push({ id: uid(), url, groupId: null })
      } catch (e: any) { toast.error('Upload failed: ' + e.message) }
    }
    setPhotos(prev => [...prev, ...newPhotos])
    setUploading(false)
  }

  function removePhoto(id: string) {
    setPhotos(prev => prev.filter(p => p.id !== id))
    setSelectedForGroup(prev => { const n = new Set(prev); n.delete(id); return n })
  }

  function toggleSelect(id: string) {
    setSelectedForGroup(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n })
  }

  function groupSelected() {
    if (selectedForGroup.size < 2) { toast.error('Select at least 2 photos'); return }
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
      if (p.groupId) { if (!grouped.has(p.groupId)) grouped.set(p.groupId, []); grouped.get(p.groupId)!.push(p) }
      else singles.push(p)
    }
    const result: PostGroup[] = []
    for (const [gid, items] of grouped) result.push({ id: gid, photos: items, caption: '', status: 'idle' })
    for (const p of singles) result.push({ id: p.id, photos: [p], caption: '', status: 'idle' })
    return result
  }

  async function generateAndSubmit() {
    if (!brandId) { toast.error('Select a brand first'); return }
    if (photos.length === 0) { toast.error('No photos to process'); return }

    setProcessing(true)
    const postGroups = buildPostGroups()
    setGroups(postGroups)
    let created = 0
    const processed: string[] = []
    const batchId = uid()
    const brandName = brands.find(b => b.id === brandId)?.name || 'Brand'
    const batchLabel = `Photo Drop — ${brandName} — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`

    for (let i = 0; i < postGroups.length; i++) {
      const group = postGroups[i]
      setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'generating' } : g))
      try {
        const captionRes = await fetch('/api/automations/social-caption', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId, platforms, prompt: prompt || '', imageUrl: group.photos[0].url }),
        })
        const captionData = await captionRes.json()
        if (!captionRes.ok) throw new Error(captionData.error || 'Caption generation failed')
        const caption = captionData.caption || ''
        setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, caption, status: 'done' } : g))

        const postRes = await fetch('/api/automations/social-post', {
          method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ brandId, caption, platforms, status: 'submitted', imageUrl: group.photos[0].url, imageUrls: group.photos.map(p => p.url), batchId, batchLabel }),
        })
        if (!postRes.ok) throw new Error('Post creation failed')
        created++
        // Track processed photo IDs
        for (const p of group.photos) { if (p.photoId) processed.push(p.photoId) }
      } catch (e: any) {
        setGroups(prev => prev.map((g, idx) => idx === i ? { ...g, status: 'error', caption: e.message } : g))
      }
    }

    // Mark photos as processed in localStorage
    if (processed.length > 0) {
      try {
        const stored = JSON.parse(localStorage.getItem('cc_photos') || '[]') as Photo[]
        const processedSet = new Set(processed)
        const updated = stored.map(p => processedSet.has(p.id) ? { ...p, processed: true } : p)
        localStorage.setItem('cc_photos', JSON.stringify(updated))
        setAllPhotos(updated)
      } catch { /* ignore */ }
    }

    if (created > 0) {
      await fetch('/api/notifications/send', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'approval', title: `${created} new post${created !== 1 ? 's' : ''} ready for approval`,
          message: `Photo Drop generated ${created} post${created !== 1 ? 's' : ''} for ${brands.find(b => b.id === brandId)?.name || 'your brand'}. Review and approve them to add to your Buffer queue.`,
          link: '/drafts',
        }),
      }).catch(() => {})
    }

    setProcessing(false)
    setProcessedIds(processed)
    setCreatedCount(created)
    setDone(true)
  }

  async function saveSchedule() {
    if (!brandId) { toast.error('Select a brand first'); return }
    setSavingSchedule(true)
    try {
      const res = await fetch('/api/automations/photo-drop/schedule', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId, frequency: schedFreq, dayOfWeek: schedDay, batchSize: schedBatch, platforms: schedPlatforms, prompt: schedPrompt }),
      })
      if (!res.ok) throw new Error('Failed to save schedule')
      const data = await res.json()
      setSchedules(prev => {
        const existing = prev.findIndex(s => s.brand_id === brandId)
        if (existing >= 0) { const n = [...prev]; n[existing] = data; return n }
        return [...prev, data]
      })
      setShowSchedule(false)
      toast.success('Schedule saved!')
    } catch (e: any) { toast.error(e.message) }
    finally { setSavingSchedule(false) }
  }

  async function deleteSchedule(id: string) {
    await fetch(`/api/automations/photo-drop/schedule?id=${id}`, { method: 'DELETE' }).catch(() => {})
    setSchedules(prev => prev.filter(s => s.id !== id))
    toast.success('Schedule removed')
  }

  const ungroupedPhotos = photos.filter(p => !p.groupId)
  const groupedSets = new Map<string, PhotoItem[]>()
  for (const p of photos.filter(p => p.groupId)) { if (!groupedSets.has(p.groupId!)) groupedSets.set(p.groupId!, []); groupedSets.get(p.groupId!)!.push(p) }
  const brandSchedule = schedules.find(s => s.brand_id === brandId)

  if (done) {
    return (
      <div className="p-6 max-w-2xl mx-auto text-center">
        <div className="card p-10">
          <CheckCircleIcon className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-[#e6e1e1] mb-2">Posts Created!</h2>
          <p className="text-[#e1bec0] mb-6">{createdCount} post{createdCount !== 1 ? 's' : ''} submitted for approval. Approve them to auto-send to Buffer.</p>
          <div className="space-y-3 mb-8 max-w-md mx-auto">
            {groups.map((g) => (
              <div key={g.id} className="flex items-center gap-3 p-3 bg-[#2b2a29] rounded-lg text-left">
                <img src={g.photos[0].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#e1bec0] truncate">{g.caption || 'Generated caption'}</p>
                  <p className="text-[10px] text-[#5a4042]">
                    {g.photos.length > 1 ? `Carousel · ${g.photos.length} photos` : 'Single photo'}
                    {' · '}<span className={g.status === 'done' ? 'text-emerald-400' : 'text-red-400'}>{g.status === 'done' ? 'Created' : 'Failed'}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-center">
            <Link href="/drafts" className="btn btn-p">Review Posts</Link>
            <button onClick={() => { setDone(false); setPhotos([]); setGroups([]); setCreatedCount(0) }} className="btn btn-o">Process More</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-[#e6e1e1] mb-1">Photo Drop</h1>
      <p className="text-[#e1bec0] mb-6">Auto-generates captions from your brand&apos;s photo library. Approved posts go straight to Buffer.</p>

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
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="lbl">Theme / Prompt (optional)</label>
            <input className="inp" placeholder="e.g. behind the scenes, product launch..." value={prompt} onChange={e => setPrompt(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Batch Size</label>
            <input type="number" className="inp" min={1} max={20} value={batchSize} onChange={e => setBatchSize(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))} />
          </div>
        </div>
      </div>

      {/* Brand folder photos */}
      {brandId && (
        <div className="card p-5 mb-5">
          {brandFolders.length === 0 ? (
            <div className="text-center py-6">
              <PhotoIcon className="w-10 h-10 mx-auto text-[#5a4042] mb-2" />
              <p className="text-[#e1bec0] mb-1">No folders linked to this brand</p>
              <p className="text-xs text-[#5a4042]">Go to <Link href="/library" className="text-[#ff5473] hover:underline">Photo Library</Link> and create a folder with this brand assigned.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-[#e6e1e1]">{unprocessedPhotos.length} unprocessed photo{unprocessedPhotos.length !== 1 ? 's' : ''}</h3>
                  <p className="text-xs text-[#5a4042]">
                    From: {brandFolders.map(f => f.name).join(', ')} · Showing up to {batchSize}
                  </p>
                </div>
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
                        <button onClick={() => ungroupPhoto(p.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-sky-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Remove from carousel">
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
                          <img src={p.url} alt="" className={`w-20 h-20 rounded-lg object-cover cursor-pointer transition-all ${selected ? 'ring-2 ring-[#ff5473] ring-offset-2 ring-offset-[#1c1b1b]' : 'hover:opacity-80'}`} onClick={() => toggleSelect(p.id)} />
                          <button onClick={() => removePhoto(p.id)} className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <XMarkIcon className="w-3 h-3" />
                          </button>
                        </div>
                      )
                    })}
                  </div>
                </>
              )}

              {photos.length === 0 && unprocessedPhotos.length === 0 && (
                <p className="text-sm text-[#5a4042] text-center py-4">All photos in this brand&apos;s folders have been processed.</p>
              )}
            </>
          )}

          {/* Manual upload fallback */}
          <div className="mt-4 pt-4 border-t border-[rgba(90,64,66,0.2)]">
            <label className="flex items-center justify-center gap-2 text-sm text-[#e1bec0] cursor-pointer hover:text-[#ffb2b9] transition-colors">
              <PaperClipIcon className="w-4 h-4" />
              {uploading ? 'Uploading...' : 'Or upload photos manually'}
              <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleUpload(e.target.files)} disabled={uploading} />
            </label>
          </div>
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
                  <p className="text-sm text-[#e6e1e1]">Post {i + 1} {g.photos.length > 1 ? `(carousel · ${g.photos.length})` : ''}</p>
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
        <button className="btn btn-p w-full flex items-center justify-center gap-2 py-3 text-base mb-5" disabled={!brandId || processing} onClick={generateAndSubmit}>
          <SparklesIcon className="w-5 h-5" /> Generate & Submit {buildPostGroups().length} Post{buildPostGroups().length !== 1 ? 's' : ''}
        </button>
      )}

      {/* Schedule section */}
      {brandId && (
        <div className="card p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-[#ff5473]" />
              <h3 className="font-semibold text-[#e6e1e1]">Auto Schedule</h3>
            </div>
            {!brandSchedule && !showSchedule && (
              <button onClick={() => setShowSchedule(true)} className="btn btn-o btn-sm">Set Up Schedule</button>
            )}
          </div>

          {brandSchedule && !showSchedule && (
            <div className="p-3 bg-[#2b2a29] rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[#e6e1e1]">
                    <span className="font-medium capitalize">{brandSchedule.frequency}</span> on {DAYS[brandSchedule.day_of_week]}s · {brandSchedule.batch_size} photos per run
                  </p>
                  {brandSchedule.next_run_at && (
                    <p className="text-xs text-[#5a4042] mt-1 flex items-center gap-1">
                      <CalendarDaysIcon className="w-3 h-3" /> Next run: {new Date(brandSchedule.next_run_at).toLocaleDateString('en-AU', { weekday: 'short', day: 'numeric', month: 'short' })}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSchedFreq(brandSchedule.frequency); setSchedDay(brandSchedule.day_of_week); setSchedBatch(brandSchedule.batch_size); setSchedPlatforms(brandSchedule.platforms); setSchedPrompt(brandSchedule.prompt); setShowSchedule(true) }} className="btn btn-o btn-sm">Edit</button>
                  <button onClick={() => deleteSchedule(brandSchedule.id)} className="btn btn-d btn-sm">Remove</button>
                </div>
              </div>
            </div>
          )}

          {showSchedule && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl">Frequency</label>
                  <select className="sel" value={schedFreq} onChange={e => setSchedFreq(e.target.value)}>
                    {FREQUENCIES.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="lbl">Day of Week</label>
                  <select className="sel" value={schedDay} onChange={e => setSchedDay(parseInt(e.target.value))}>
                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="lbl">Photos per Run</label>
                  <input type="number" className="inp" min={1} max={20} value={schedBatch} onChange={e => setSchedBatch(parseInt(e.target.value) || 5)} />
                </div>
                <div>
                  <label className="lbl">Platforms</label>
                  <div className="flex gap-3 pt-1">
                    {PLATFORMS.map(p => (
                      <label key={p} className="flex items-center gap-1 cursor-pointer text-sm">
                        <input type="checkbox" className="w-3.5 h-3.5 accent-[#ff5473]" checked={schedPlatforms.includes(p)} onChange={() => setSchedPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])} />
                        <span className="capitalize text-[#e6e1e1]">{p}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="lbl">Default Prompt (optional)</label>
                <input className="inp" placeholder="Applied to every auto-run..." value={schedPrompt} onChange={e => setSchedPrompt(e.target.value)} />
              </div>
              <div className="flex gap-2 justify-end">
                <button className="btn btn-o" onClick={() => setShowSchedule(false)}>Cancel</button>
                <button className="btn btn-p flex items-center gap-2" disabled={savingSchedule} onClick={saveSchedule}>
                  {savingSchedule ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <ClockIcon className="w-4 h-4" />} Save Schedule
                </button>
              </div>
            </div>
          )}

          {!brandSchedule && !showSchedule && (
            <p className="text-xs text-[#5a4042]">Set up a recurring schedule to auto-process new photos from this brand&apos;s folders.</p>
          )}
        </div>
      )}
    </div>
  )
}
