'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import { uid } from '@/lib/utils'
import { callClaude, buildImageContent } from '@/lib/claude'
import { uploadImage } from '@/lib/supabase/storage'
import type { Post } from '@/lib/types'
import {
  SparklesIcon,
  ArrowPathIcon,
  BookmarkIcon,
  CalendarIcon,
  PaperClipIcon,
  CameraIcon,
  PlusIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'

const PLATFORMS = ['instagram', 'facebook', 'linkedin']

export default function CreatePostPage() {
  const router = useRouter()
  const { brands, posts, savePosts, settings } = useWorkspace()

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

  const brand = brands.find(b => b.id === brandId)

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
      const textPrompt = `Write a ${length} social media caption for the brand "${brand.name}".
Brand tone: ${brand.tone || 'professional'}
Brand guidelines: ${brand.brand_guidelines || 'N/A'}
Platforms: ${platforms.join(', ') || 'instagram'}
${hashtags}
${emojis}
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
      const textPrompt = `Write a ${bb.output_length || 'medium'} social media caption for "${bb.name}".
Tone: ${bb.tone || 'professional'}
Guidelines: ${bb.brand_guidelines || 'N/A'}
Platforms: ${bulkPlatforms.join(', ') || 'instagram'}
${bb.include_hashtags !== false ? 'Include hashtags.' : 'No hashtags.'}
${bb.include_emojis !== false ? 'Use emojis.' : 'No emojis.'}
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
                    <label className="flex flex-col items-center justify-center w-20 h-20 border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg cursor-pointer hover:border-[#ff5473] transition-colors text-center text-xs text-[#e1bec0]">
                      <PaperClipIcon className="w-4 h-4 mb-1" />
                      <span>Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={e => handleBulkImage(e, i)} />
                    </label>
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
              <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg cursor-pointer hover:border-[#ff5473] transition-colors">
                <CameraIcon className="w-6 h-6 text-[#e1bec0] mb-1" />
                <p className="text-[#e1bec0] text-sm">Upload images</p>
                <input type="file" accept="image/*" multiple className="hidden" onChange={e => handleImageUpload(e.target.files)} />
              </label>
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
    </div>
  )
}
