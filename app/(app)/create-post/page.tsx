'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uid } from '@/lib/utils'
import { callClaude, buildImageContent } from '@/lib/claude'
import { uploadImage } from '@/lib/supabase/storage'
import type { Post, BrandGoal } from '@/lib/types'
import {
  SparklesIcon,
  ArrowPathIcon,
  BookmarkIcon,
  CalendarIcon,
  PaperClipIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
  PhotoIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/16/solid'

const PLATFORMS = ['instagram', 'facebook', 'linkedin']

export default function CreatePostPage() {
  const router = useRouter()
  const { brands, posts, savePosts, settings, photos } = useWorkspace()

  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [brandId, setBrandId] = useState('')
  const [platforms, setPlatforms] = useState<string[]>(['instagram'])
  const [images, setImages] = useState<string[]>([])
  const [caption, setCaption] = useState('')
  const [customPrompt, setCustomPrompt] = useState('')
  const [scheduledAt, setScheduledAt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  // Bulk state
  const [bulkBrandId, setBulkBrandId] = useState('')
  const [bulkPlatforms, setBulkPlatforms] = useState<string[]>(['instagram'])
  const [bulkRows, setBulkRows] = useState([{ image: '', prompt: '', caption: '', status: 'idle' }])
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [bulkScheduling, setBulkScheduling] = useState(false)
  const [activeGoals, setActiveGoals] = useState<BrandGoal[]>([])
  const [useGoals, setUseGoals] = useState(true)
  const [showLibrary, setShowLibrary] = useState(false)
  const [libraryTarget, setLibraryTarget] = useState<'single' | number>('single')
  const [librarySearch, setLibrarySearch] = useState('')

  const brand = brands.find(b => b.id === brandId)

  // Fetch active goals when brand changes
  const activeBrandId = mode === 'single' ? brandId : bulkBrandId
  useEffect(() => {
    if (!activeBrandId) { setActiveGoals([]); return }
    fetch(`/api/brands/goals?brandId=${activeBrandId}`)
      .then(r => r.json())
      .then(goals => {
        if (Array.isArray(goals)) {
          const today = new Date().toISOString().slice(0, 10)
          setActiveGoals(goals.filter((g: BrandGoal) => g.isActive && g.startDate <= today && g.endDate >= today))
        }
      })
      .catch(() => {})
  }, [activeBrandId]) // eslint-disable-line react-hooks/exhaustive-deps

  function togglePlatform(p: string) {
    setPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleImageUpload(files: FileList | null) {
    if (!files) return
    for (const file of Array.from(files)) {
      try {
        const url = await uploadImage(file)
        setImages(prev => [...prev, url])
      } catch (e: any) {
        toast.error('Upload failed: ' + e.message)
      }
    }
  }

  async function generate() {
    if (!brand) return
    setGenerating(true)
    try {
      const length = brand.output_length || 'medium'
      const hashtags = brand.include_hashtags !== false ? 'Include relevant hashtags.' : 'Do not include hashtags.'
      const emojis = brand.include_emojis !== false ? 'Use emojis where appropriate.' : 'Do not use emojis.'
      const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations, no quotation marks, nothing else.'
      const goalsSection = useGoals && activeGoals.length > 0
        ? `\nCurrent brand goals (align content with these):\n${activeGoals.map(g => `- [${g.period}] ${g.title}${g.description ? ' — ' + g.description : ''}`).join('\n')}\n`
        : ''
      const textPrompt = `Write a ${length} social media caption for the brand "${brand.name}".
Brand tone: ${brand.tone || 'professional'}
Brand guidelines: ${brand.brand_guidelines || 'N/A'}
Platforms: ${platforms.join(', ') || 'instagram'}
${hashtags}
${emojis}${goalsSection}
${customPrompt ? 'Additional instructions: ' + customPrompt : ''}
${images.length > 0 ? 'The caption MUST be specifically about the content shown in the attached image.' : 'Write an engaging caption that reflects the brand voice.'}`

      const content = images.length > 0 ? buildImageContent(images[0], textPrompt) : textPrompt
      const result = await callClaude(sys, content, 512)
      if (result) { setCaption(result); toast.success('Caption generated!') }
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setGenerating(false)
    }
  }

  function savePost(status: Post['status']) {
    if (!brandId) { toast.error('Select a brand first'); return }
    setSaving(true)
    const newPost: Post = {
      id: uid(),
      brand_profile_id: brandId,
      image_url: images[0] || null,
      image_urls: [...images],
      caption,
      platforms: [...platforms],
      status,
      scheduled_at: scheduledAt || null,
      created_date: new Date().toISOString(),
      client_visible: false,
      client_approved: false,
    }
    savePosts([newPost, ...posts])
    toast.success(status === 'draft' ? 'Draft saved!' : 'Post scheduled!')
    router.push('/posts')
  }

  // Bulk helpers
  function toggleBulkPlatform(p: string) {
    setBulkPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleBulkImage(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const file = e.target.files?.[0]
    if (!file) return
    const rows = [...bulkRows]
    rows[idx] = { ...rows[idx], status: 'uploading' }
    setBulkRows(rows)
    try {
      const url = await uploadImage(file)
      rows[idx] = { ...rows[idx], image: url, status: 'idle' }
    } catch (e: any) {
      toast.error('Upload failed: ' + e.message)
      rows[idx] = { ...rows[idx], status: 'idle' }
    }
    setBulkRows([...rows])
  }

  async function bulkGenerateAll() {
    const bb = brands.find(b => b.id === bulkBrandId)
    if (!bb) { toast.error('Select a brand first'); return }
    setBulkGenerating(true)
    const rows = [...bulkRows]
    const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations.'
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      if (!row.image && !row.prompt) continue
      rows[i] = { ...rows[i], status: 'generating' }
      setBulkRows([...rows])
      const bulkGoals = useGoals && activeGoals.length > 0
        ? `\nCurrent brand goals (align content with these):\n${activeGoals.map(g => `- [${g.period}] ${g.title}${g.description ? ' — ' + g.description : ''}`).join('\n')}\n`
        : ''
      const textPrompt = `Write a ${bb.output_length || 'medium'} social media caption for "${bb.name}".
Tone: ${bb.tone || 'professional'}
Guidelines: ${bb.brand_guidelines || 'N/A'}
Platforms: ${bulkPlatforms.join(', ') || 'instagram'}
${bb.include_hashtags !== false ? 'Include hashtags.' : 'No hashtags.'}
${bb.include_emojis !== false ? 'Use emojis.' : 'No emojis.'}${bulkGoals}
${row.prompt ? 'Additional instructions: ' + row.prompt : ''}
${row.image ? 'The caption MUST be specifically about the content shown in the attached image.' : ''}`
      const content = row.image ? buildImageContent(row.image, textPrompt) : textPrompt
      const result = await callClaude(sys, content, 400)
      rows[i] = { ...rows[i], caption: result || '', status: result ? 'done' : 'idle' }
      setBulkRows([...rows])
    }
    setBulkGenerating(false)
    toast.success('All captions generated!')
  }

  function bulkSaveAllDrafts() {
    if (!bulkBrandId) { toast.error('Select a brand first'); return }
    const toSave = bulkRows.filter(r => r.caption)
    if (!toSave.length) { toast.error('No captions to save'); return }
    const newPosts: Post[] = toSave.map(r => ({
      id: uid(),
      brand_profile_id: bulkBrandId,
      caption: r.caption,
      platforms: [...bulkPlatforms],
      status: 'draft',
      image_url: r.image || null,
      image_urls: r.image ? [r.image] : [],
      created_date: new Date().toISOString(),
      client_visible: false,
      client_approved: false,
    }))
    savePosts([...newPosts, ...posts])
    toast.success(`${toSave.length} draft${toSave.length > 1 ? 's' : ''} saved!`)
    router.push('/posts')
  }

  function openLibrary(target: 'single' | number) {
    setLibraryTarget(target)
    setLibrarySearch('')
    setShowLibrary(true)
  }

  function pickFromLibrary(url: string) {
    if (libraryTarget === 'single') {
      setImages(prev => [...prev, url])
    } else {
      const r = [...bulkRows]
      r[libraryTarget as number] = { ...r[libraryTarget as number], image: url }
      setBulkRows(r)
    }
    setShowLibrary(false)
  }

  const filteredLibrary = photos.filter(p =>
    !librarySearch || p.name?.toLowerCase().includes(librarySearch.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(librarySearch.toLowerCase()))
  )

  async function bulkSendToBuffer() {
    const bb = brands.find(b => b.id === bulkBrandId)
    if (!bb) { toast.error('Select a brand first'); return }
    const profileIds = bb.buffer_profile_ids || []
    if (!profileIds.length) { toast.error('Configure Buffer profiles for this brand in Settings first'); return }
    const toSave = bulkRows.filter(r => r.caption)
    if (!toSave.length) { toast.error('No captions to send'); return }

    setBulkScheduling(true)
    const newPosts: Post[] = toSave.map((r) => ({
      id: uid(),
      brand_profile_id: bulkBrandId,
      caption: r.caption,
      platforms: [...bulkPlatforms],
      status: 'published' as const,
      scheduled_at: null,
      image_url: r.image || null,
      image_urls: r.image ? [r.image] : [],
      created_date: new Date().toISOString(),
      client_visible: false,
      client_approved: false,
    }))

    let sent = 0
    for (const post of newPosts) {
      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileIds,
            text: post.caption,
            media: post.image_url ? { photo: post.image_url } : undefined,
          }),
        })
        const data = await res.json()
        if (data.success) sent++
      } catch { /* continue */ }
    }

    savePosts([...newPosts, ...posts])
    setBulkScheduling(false)
    toast.success(`${sent} post${sent !== 1 ? 's' : ''} added to Buffer queue!`)
    router.push('/posts')
  }

  if (mode === 'bulk') {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-1">
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Create Post</h1>
          <div className="flex rounded-lg overflow-hidden border border-[rgba(90,64,66,0.4)] text-sm">
            <button className="px-4 py-1.5 text-[#e1bec0] hover:bg-[rgba(255,84,115,0.08)]" onClick={() => setMode('single')}>Single</button>
            <button className="px-4 py-1.5 bg-[#ff5473] text-white">Bulk</button>
          </div>
        </div>
        <p className="text-[#e1bec0] mb-6">Generate multiple captions at once</p>

        <div className="card p-5 mb-5">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="lbl">Brand (all rows)</label>
              <select className="sel" value={bulkBrandId} onChange={e => setBulkBrandId(e.target.value)}>
                <option value="">Select a brand...</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
            <div>
              <label className="lbl">Platforms (all rows)</label>
              <div className="flex gap-4 pt-1">
                {PLATFORMS.map(p => (
                  <label key={p} className="flex items-center gap-1.5 cursor-pointer">
                    <input type="checkbox" className="w-4 h-4 accent-[#ff5473]" checked={bulkPlatforms.includes(p)} onChange={() => toggleBulkPlatform(p)} />
                    <span className="text-sm capitalize text-[#e6e1e1]">{p}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          {activeGoals.length > 0 && (
            <div className="flex items-center gap-3 mt-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 accent-[#ff5473]" checked={useGoals} onChange={e => setUseGoals(e.target.checked)} />
                <span className="text-sm text-[#e6e1e1]">Align with brand goals</span>
              </label>
              <span className="text-[10px] text-[#5a4042]">{activeGoals.map(g => g.title).join(', ')}</span>
              {!useGoals && <span className="text-[10px] text-[#e1bec0] bg-[#2b2a29] px-2 py-0.5 rounded-full">General posts</span>}
            </div>
          )}
        </div>

        <div className="space-y-3 mb-4">
          {bulkRows.map((row, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {row.image ? (
                    <div className="relative w-20 h-20">
                      <img src={row.image} alt="" className="w-20 h-20 rounded-lg object-cover" />
                      <button onClick={() => { const r = [...bulkRows]; r[i] = { ...r[i], image: '' }; setBulkRows(r) }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-1">
                      <label className="flex flex-col items-center justify-center w-20 h-[38px] border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg cursor-pointer hover:border-[#ff5473] transition-colors text-center text-[10px] text-[#e1bec0]">
                        <PaperClipIcon className="w-3 h-3" />
                        <span>Upload</span>
                        <input type="file" accept="image/*" className="hidden" onChange={e => handleBulkImage(e, i)} />
                      </label>
                      {photos.length > 0 && (
                        <button onClick={() => openLibrary(i)}
                          className="flex flex-col items-center justify-center w-20 h-[38px] border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg hover:border-[#ff5473] transition-colors text-center text-[10px] text-[#e1bec0]">
                          <PhotoIcon className="w-3 h-3" />
                          <span>Library</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <input className="inp text-sm" placeholder="Custom prompt (optional)..."
                    value={row.prompt} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], prompt: e.target.value }; setBulkRows(r) }} />
                  {row.caption && (
                    <textarea className="ta text-sm" rows={3} value={row.caption}
                      onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], caption: e.target.value }; setBulkRows(r) }} />
                  )}
                  {row.status === 'uploading' && <p className="text-xs text-[#e1bec0] flex items-center gap-1"><ArrowPathIcon className="w-3 h-3 animate-spin" /> Uploading...</p>}
                  {row.status === 'generating' && <p className="text-xs text-[#ffb2b9] flex items-center gap-1"><ArrowPathIcon className="w-3 h-3 animate-spin" /> Generating...</p>}
                  {row.status === 'done' && <span className="text-xs text-emerald-400">Ready</span>}
                </div>
                <button onClick={() => { if (bulkRows.length > 1) { const r = [...bulkRows]; r.splice(i, 1); setBulkRows(r) } }}
                  className="text-[#5a4042] hover:text-[#f87171]">
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <button className="btn btn-o flex items-center gap-2" disabled={bulkRows.length >= 10}
            onClick={() => setBulkRows(r => [...r, { image: '', prompt: '', caption: '', status: 'idle' }])}>
            <PlusIcon className="w-4 h-4" /> Add Row{bulkRows.length >= 10 ? ' (max 10)' : ''}
          </button>
          <button className="btn btn-p flex items-center gap-2" disabled={bulkGenerating} onClick={bulkGenerateAll}>
            {bulkGenerating ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating...</> : <><SparklesIcon className="w-4 h-4" /> Generate All Captions</>}
          </button>
          <button className="btn btn-o flex items-center gap-2" disabled={!bulkRows.some(r => r.caption)} onClick={bulkSaveAllDrafts}>
            <BookmarkIcon className="w-4 h-4" /> Save All as Drafts
          </button>
        </div>

        {/* Send to Buffer Queue */}
        {bulkBrandId && bulkRows.some(r => r.caption) && (() => {
          const bb = brands.find(b => b.id === bulkBrandId)
          return bb?.buffer_profile_ids?.length ? (
            <div className="card p-5 mt-5">
              <div className="flex items-center gap-2 mb-1">
                <CalendarIcon className="w-4 h-4 text-[#ff5473]" />
                <h3 className="font-semibold text-[#e6e1e1]">Send to Buffer</h3>
              </div>
              <p className="text-xs text-[#e1bec0] mb-3">
                Posts will be added to your Buffer queue. Buffer&apos;s auto-schedule will post them at your configured times.
              </p>
              <button
                className="btn btn-p flex items-center gap-2"
                disabled={bulkScheduling}
                onClick={bulkSendToBuffer}
              >
                {bulkScheduling
                  ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...</>
                  : <><PaperAirplaneIcon className="w-4 h-4" /> Add {bulkRows.filter(r => r.caption).length} Posts to Buffer Queue</>
                }
              </button>
            </div>
          ) : null
        })()}
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-3xl font-bold text-[#e6e1e1]">Create Post</h1>
        <div className="flex rounded-lg overflow-hidden border border-[rgba(90,64,66,0.4)] text-sm">
          <button className="px-4 py-1.5 bg-[#ff5473] text-white">Single</button>
          <button className="px-4 py-1.5 text-[#e1bec0] hover:bg-[rgba(255,84,115,0.08)]" onClick={() => setMode('bulk')}>Bulk</button>
        </div>
      </div>
      <p className="text-[#e1bec0] mb-8">Upload photos and generate an AI caption</p>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Left: inputs */}
        <div className="space-y-5">
          <div>
            <label className="lbl">Brand Profile</label>
            <select className="sel" value={brandId} onChange={e => setBrandId(e.target.value)}>
              <option value="">Select a brand...</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <label className="lbl">Platforms</label>
            <div className="flex gap-4 flex-wrap">
              {PLATFORMS.map(p => (
                <label key={p} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={platforms.includes(p)} onChange={() => togglePlatform(p)} className="w-4 h-4 accent-[#ff5473]" />
                  <span className="text-sm font-medium capitalize text-[#e6e1e1]">{p}</span>
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl">Photos</label>
            <div className="space-y-2">
              {images.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-2">
                  {images.map((img, i) => (
                    <div key={i} className="relative">
                      <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-[rgba(90,64,66,0.3)]" />
                      <button onClick={() => setImages(prev => prev.filter((_, j) => j !== i))}
                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center">
                        <XMarkIcon className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <label className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg cursor-pointer hover:border-[#ff5473] transition-colors">
                  <CameraIcon className="w-6 h-6 text-[#e1bec0] mb-1" />
                  <p className="text-[#e1bec0] text-sm">Upload</p>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files)} />
                </label>
                {photos.length > 0 && (
                  <button onClick={() => openLibrary('single')}
                    className="flex-1 flex flex-col items-center justify-center h-24 border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg hover:border-[#ff5473] transition-colors">
                    <PhotoIcon className="w-6 h-6 text-[#e1bec0] mb-1" />
                    <p className="text-[#e1bec0] text-sm">From Library</p>
                  </button>
                )}
              </div>
            </div>
          </div>
          <div>
            <label className="lbl">Caption</label>
            <textarea className="ta" rows={5} placeholder="Write or generate a caption..." value={caption} onChange={e => setCaption(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Custom AI Prompt (optional)</label>
            <textarea className="ta" rows={2} placeholder="e.g. Focus on summer vibes, mention a sale..." value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Schedule Date & Time</label>
            <input type="datetime-local" className="inp" value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
          </div>
          {/* Goals toggle */}
          {activeGoals.length > 0 && (
            <div className="flex items-center gap-3 p-3 bg-[#211f1f] rounded-lg">
              <label className="flex items-center gap-2 cursor-pointer flex-1">
                <input type="checkbox" className="w-4 h-4 accent-[#ff5473]" checked={useGoals} onChange={e => setUseGoals(e.target.checked)} />
                <div>
                  <p className="text-sm font-medium text-[#e6e1e1]">Align with brand goals</p>
                  <p className="text-[10px] text-[#5a4042]">{activeGoals.map(g => g.title).join(', ')}</p>
                </div>
              </label>
              {!useGoals && <span className="text-[10px] text-[#e1bec0] bg-[#2b2a29] px-2 py-0.5 rounded-full">General post</span>}
            </div>
          )}
          <button className="btn btn-p w-full flex items-center justify-center gap-2" disabled={!brandId || generating} onClick={generate}>
            {generating ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating...</> : <><SparklesIcon className="w-4 h-4" /> Generate Caption</>}
          </button>
        </div>

        {/* Right: preview */}
        <div className="space-y-4">
          {brand && (
            <div className="card border-dashed p-3 text-sm text-[#e1bec0] space-y-1">
              <p><strong className="text-[#e6e1e1]">Tone:</strong> {brand.tone || 'professional'}</p>
              <p><strong className="text-[#e6e1e1]">Length:</strong> {brand.output_length || 'medium'}</p>
              {brand.brand_guidelines && (
                <p><strong className="text-[#e6e1e1]">Guidelines:</strong> {brand.brand_guidelines.slice(0, 100)}...</p>
              )}
            </div>
          )}
          <div className="card p-4">
            <p className="text-sm font-medium text-[#e1bec0] mb-3">Post Preview</p>
            <div className="border border-[rgba(90,64,66,0.3)] rounded-lg overflow-hidden">
              <div className="flex items-center gap-2 p-3 border-b border-[rgba(90,64,66,0.2)]">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                  style={{ background: brand?.color || '#ff5473' }}>
                  {(brand?.name || 'B')[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#e6e1e1]">{brand?.name || 'Brand Name'}</p>
                  <p className="text-xs text-[#e1bec0]">{scheduledAt ? new Date(scheduledAt).toLocaleString() : 'Now'}</p>
                </div>
              </div>
              {images.length > 0 ? (
                <img src={images[0]} alt="" className="w-full max-h-56 object-cover" />
              ) : (
                <div className="h-32 bg-[#2b2a29] flex items-center justify-center text-[#5a4042] text-sm">No image</div>
              )}
              <div className="p-3">
                <p className="text-sm text-[#e6e1e1] whitespace-pre-wrap">
                  {caption || <span className="text-[#5a4042]">Caption will appear here...</span>}
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <button className="btn btn-o w-full flex items-center justify-center gap-2" disabled={saving || !brandId} onClick={() => savePost('draft')}>
              <BookmarkIcon className="w-4 h-4" /> Save as Draft
            </button>
            <button className="btn btn-p w-full flex items-center justify-center gap-2" disabled={saving || !brandId || !caption} onClick={() => savePost('scheduled')}>
              {saving ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving...</> : <><CalendarIcon className="w-4 h-4" /> Save as Scheduled</>}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Library Picker Modal */}
      {showLibrary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowLibrary(false)}>
          <div className="card p-5 max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-[#e6e1e1] flex items-center gap-2">
                <PhotoIcon className="w-5 h-5 text-[#ff5473]" /> Photo Library
              </h3>
              <button onClick={() => setShowLibrary(false)} className="text-[#5a4042] hover:text-[#e6e1e1]">
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <input className="inp mb-3" placeholder="Search by name or tag..." value={librarySearch} onChange={e => setLibrarySearch(e.target.value)} />
            <div className="flex-1 overflow-y-auto">
              {filteredLibrary.length === 0 ? (
                <p className="text-center text-[#5a4042] py-10">No photos found</p>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {filteredLibrary.map(photo => (
                    <button key={photo.id} onClick={() => pickFromLibrary(photo.url)}
                      className="group relative rounded-lg overflow-hidden border border-transparent hover:border-[#ff5473] transition-colors">
                      <img src={photo.url} alt={photo.name} className="w-full h-20 object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <PlusIcon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-[10px] text-[#e1bec0] truncate px-1 py-0.5">{photo.name}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
