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
import { POST_CATEGORIES, detectCategory, buildBrandInstructions } from '@/lib/types'
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
import CaptionTemplates from '@/components/app/CaptionTemplates'

const PLATFORMS = ['instagram', 'facebook', 'linkedin']

/**
 * Center-crops an image to the given CSS aspect ratio string (e.g. "4/5")
 * and uploads the result to Supabase, returning the new public URL.
 * Falls back to the original URL if anything goes wrong.
 */
async function cropToRatio(imageUrl: string, ratio: string, upload: (f: File) => Promise<string>): Promise<string> {
  const parts = ratio.split('/')
  const rw = parseFloat(parts[0])
  const rh = parseFloat(parts[1])
  if (!rw || !rh) return imageUrl

  return new Promise<string>((resolve) => {
    const img = new window.Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      const sw = img.naturalWidth
      const sh = img.naturalHeight

      // Calculate centered crop
      let cropW = sw
      let cropH = sw * (rh / rw)
      if (cropH > sh) {
        cropH = sh
        cropW = sh * (rw / rh)
      }
      const cropX = (sw - cropW) / 2
      const cropY = (sh - cropH) / 2

      // Output at max 1080px wide (Instagram standard)
      const outW = Math.min(1080, Math.round(cropW))
      const outH = Math.round(outW * (rh / rw))

      const canvas = document.createElement('canvas')
      canvas.width = outW
      canvas.height = outH
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(imageUrl); return }
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, outW, outH)

      canvas.toBlob(async (blob) => {
        if (!blob) { resolve(imageUrl); return }
        try {
          const file = new File([blob], 'cropped.jpg', { type: 'image/jpeg' })
          const url = await upload(file)
          resolve(url)
        } catch {
          resolve(imageUrl) // fall back to original on upload error
        }
      }, 'image/jpeg', 0.92)
    }
    img.onerror = () => resolve(imageUrl)
    img.src = imageUrl
  })
}

const ASPECT_RATIOS = [
  { label: 'Square (1:1)',    value: '1/1'  },
  { label: 'Portrait (4:5)', value: '4/5'  },
  { label: 'Story (9:16)',   value: '9/16' },
  { label: 'Land. (16:9)',   value: '16/9' },
]

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
  const [sendingBuffer, setSendingBuffer] = useState(false)
  const [blogUrl, setBlogUrl] = useState('')
  const [fetchingBlog, setFetchingBlog] = useState(false)

  // Bulk state
  const [bulkBrandId, setBulkBrandId] = useState('')
  const [bulkPlatforms, setBulkPlatforms] = useState<string[]>(['instagram'])
  type BulkRow = { images: string[]; prompt: string; caption: string; status: string; category: string }
  const [bulkRows, setBulkRows] = useState<BulkRow[]>(
    [{ images: [], prompt: '', caption: '', status: 'idle', category: '' }]
  )
  // When ON, the photo picker adds all selected photos to a single row (carousel post).
  // When OFF, each picked photo creates its own row (one post per photo).
  const [carouselMode, setCarouselMode] = useState(false)
  // Multi-select state for the library picker (used in bulk mode)
  const [librarySelection, setLibrarySelection] = useState<Set<string>>(new Set())
  const [libraryMulti, setLibraryMulti] = useState(false)
  const [bulkGenerating, setBulkGenerating] = useState(false)
  const [bulkScheduling, setBulkScheduling] = useState(false)
  const [activeGoals, setActiveGoals] = useState<BrandGoal[]>([])
  const [useGoals, setUseGoals] = useState(true)
  const [showLibrary, setShowLibrary] = useState(false)
  const [libraryTarget, setLibraryTarget] = useState<'single' | number>('single')
  const [librarySearch, setLibrarySearch] = useState('')
  const [showTemplates, setShowTemplates] = useState(false)
  const [aspectRatio, setAspectRatio] = useState('')
  const [bulkAspectRatio, setBulkAspectRatio] = useState('')
  const [category, setCategory] = useState('')
  const [categoryAuto, setCategoryAuto] = useState(false) // true if value was auto-detected (allows overwrite on re-detect)
  const [bulkCategory, setBulkCategory] = useState('')

  // Auto-detect category from caption when user hasn't manually picked one
  useEffect(() => {
    if (!caption) return
    if (category && !categoryAuto) return // user manually set it — don't override
    const guess = detectCategory(caption)
    if (guess && guess !== category) {
      setCategory(guess)
      setCategoryAuto(true)
    }
  }, [caption]) // eslint-disable-line react-hooks/exhaustive-deps

  // Prefill from URL params (e.g. blog→social companion flow).
  // Uses window.location directly to avoid Next 14 useSearchParams Suspense requirement.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const qp = new URLSearchParams(window.location.search)
    const qpCaption = qp.get('caption')
    const qpImage = qp.get('image')
    const qpCategory = qp.get('category')
    const qpBrand = qp.get('brand')
    const qpAspect = qp.get('aspect')
    if (qpCaption) setCaption(qpCaption)
    if (qpImage) setImages([qpImage])
    if (qpCategory) setCategory(qpCategory)
    if (qpBrand) setBrandId(qpBrand)
    if (qpAspect) setAspectRatio(qpAspect)
  }, [])

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

  // Auto-set aspect ratio from brand default
  useEffect(() => {
    const b = brands.find(x => x.id === brandId)
    setAspectRatio(b?.default_aspect_ratio || '')
  }, [brandId]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const b = brands.find(x => x.id === bulkBrandId)
    setBulkAspectRatio(b?.default_aspect_ratio || '')
  }, [bulkBrandId]) // eslint-disable-line react-hooks/exhaustive-deps

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
${(() => { const i = buildBrandInstructions(brand, 'caption'); return i ? 'Custom brand instructions (MUST follow):\n' + i : '' })()}
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
      aspect_ratio: aspectRatio || null,
      category: category || null,
    }
    savePosts([newPost, ...posts])
    toast.success(status === 'draft' ? 'Draft saved!' : 'Post scheduled!')
    router.push('/posts')
  }

  async function fetchFromBlogUrl() {
    if (!brandId) { toast.error('Select a brand first'); return }
    const trimmed = blogUrl.trim()
    if (!/^https?:\/\//i.test(trimmed)) { toast.error('Enter a valid http(s) URL'); return }
    setFetchingBlog(true)
    const tid = toast.loading('Reading blog & writing caption…')
    try {
      const res = await fetch('/api/blog/scrape-and-caption', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed, brandId, platforms, customPrompt }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to read blog')
      if (data.caption) setCaption(data.caption)
      setCategory('blog')
      setCategoryAuto(false)
      if (data.image && images.length === 0) setImages([data.image])
      toast.success('Caption written from blog!', { id: tid })
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to read blog', { id: tid })
    } finally {
      setFetchingBlog(false)
    }
  }

  async function sendToBuffer() {
    if (!brandId) { toast.error('Select a brand first'); return }
    if (!caption.trim()) { toast.error('Add a caption first'); return }
    const profileIds = brand?.buffer_profile_ids || []
    if (!profileIds.length) { toast.error('Configure Buffer profiles for this brand in Settings first'); return }
    setSendingBuffer(true)
    try {
      // Crop image to selected aspect ratio before sending so Buffer receives the correct format
      let photoUrl: string | null = images[0] || null
      if (photoUrl && aspectRatio) {
        toast.loading('Cropping image to format…', { id: 'crop' })
        photoUrl = await cropToRatio(photoUrl, aspectRatio, uploadImage)
        toast.dismiss('crop')
      }

      const shareNow = category === 'blog'
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds,
          text: caption,
          media: photoUrl ? { photo: photoUrl } : undefined,
          shareNow,
        }),
      })
      const data = await res.json()
      const anySuccess = data.success || data.results?.some((r: { success: boolean }) => r.success)
      if (anySuccess) {
        const newPost: Post = {
          id: uid(),
          brand_profile_id: brandId,
          image_url: images[0] || null,
          image_urls: [...images],
          caption,
          platforms: [...platforms],
          status: 'published',
          scheduled_at: null,
          created_date: new Date().toISOString(),
          client_visible: false,
          client_approved: false,
          aspect_ratio: aspectRatio || null,
          category: category || null,
        }
        savePosts([newPost, ...posts])
        toast.success(shareNow ? 'Blog post published now!' : 'Post added to Buffer queue!')
        router.push('/posts')
      } else {
        const err = data.results?.find((r: { success: boolean; error?: string }) => r.error)?.error || data.error || 'Unknown error'
        toast.error(`Buffer error: ${err}`)
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to send to Buffer')
    } finally {
      setSendingBuffer(false)
    }
  }

  // Bulk helpers
  function toggleBulkPlatform(p: string) {
    setBulkPlatforms(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p])
  }

  async function handleBulkImage(e: React.ChangeEvent<HTMLInputElement>, idx: number) {
    const files = Array.from(e.target.files || [])
    if (!files.length) return
    const rows = [...bulkRows]
    rows[idx] = { ...rows[idx], status: 'uploading' }
    setBulkRows([...rows])
    try {
      const urls = await Promise.all(files.map(f => uploadImage(f)))
      if (carouselMode) {
        // Add all to this row
        rows[idx] = { ...rows[idx], images: [...rows[idx].images, ...urls], status: 'idle' }
        setBulkRows([...rows])
      } else {
        // First file goes to this row, the rest spawn new rows
        rows[idx] = { ...rows[idx], images: [...rows[idx].images, urls[0]], status: 'idle' }
        const extras = urls.slice(1).map(u => ({ images: [u], prompt: '', caption: '', status: 'idle', category: '' }))
        setBulkRows([...rows, ...extras])
      }
    } catch (e: any) {
      toast.error('Upload failed: ' + e.message)
      rows[idx] = { ...rows[idx], status: 'idle' }
      setBulkRows([...rows])
    }
  }

  /**
   * Assign each row a different content pillar at random (no repeats until
   * all categories are used). Forces caption generation to follow the pillar.
   */
  function randomizeCategories() {
    const ids = POST_CATEGORIES.map(c => c.id)
    // Fisher-Yates shuffle
    const shuffled = [...ids]
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
    }
    setBulkRows(rows => rows.map((r, i) => ({
      ...r,
      category: shuffled[i % shuffled.length],
    })))
    toast.success('Randomized categories — hit Generate All to write captions')
  }

  async function bulkGenerateAll() {
    const bb = brands.find(b => b.id === bulkBrandId)
    if (!bb) { toast.error('Select a brand first'); return }
    setBulkGenerating(true)
    const rows = [...bulkRows]
    const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations.'
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i]
      // A row is generatable if it has an image, a prompt, OR an assigned category
      if (!row.images.length && !row.prompt && !row.category) continue
      rows[i] = { ...rows[i], status: 'generating' }
      setBulkRows([...rows])
      const bulkGoals = useGoals && activeGoals.length > 0
        ? `\nCurrent brand goals (align content with these):\n${activeGoals.map(g => `- [${g.period}] ${g.title}${g.description ? ' — ' + g.description : ''}`).join('\n')}\n`
        : ''
      const rowCategory = row.category || bulkCategory
      const categoryGuidance: Record<string, string> = {
        happenings: "This post is about what's happening at the shop right now — new arrivals, busy days, behind the scenes vibes.",
        repairs:    'This post showcases a specific repair type the shop offers (screen, battery, water damage, data recovery, etc).',
        phones:     'This post features phones for sale — mention model, condition, price-style messaging without being a hard sell.',
        laptops:    'This post features laptops/MacBooks for sale — mention model, condition, price-style messaging.',
        team:       'This post is about the crew — introduce a team member, day-in-the-life, or a fun team moment.',
        refurb:     'This post is a weekly refurb stock update teaser. Keep it short and inviting.',
        blog:       'This post promotes a blog article — give a punchy hook and direct readers to the article.',
      }
      const catLine = rowCategory && categoryGuidance[rowCategory]
        ? `\nContent pillar: ${POST_CATEGORIES.find(c => c.id === rowCategory)?.label}\n${categoryGuidance[rowCategory]}\n`
        : ''
      const textPrompt = `Write a ${bb.output_length || 'medium'} social media caption for "${bb.name}".
Tone: ${bb.tone || 'professional'}
Guidelines: ${bb.brand_guidelines || 'N/A'}
Platforms: ${bulkPlatforms.join(', ') || 'instagram'}
${bb.include_hashtags !== false ? 'Include hashtags.' : 'No hashtags.'}
${bb.include_emojis !== false ? 'Use emojis.' : 'No emojis.'}${bulkGoals}${catLine}
${(() => { const i = buildBrandInstructions(bb, 'caption'); return i ? 'Custom brand instructions (MUST follow):\n' + i : '' })()}
${row.prompt ? 'Additional instructions: ' + row.prompt : ''}
${row.images.length ? 'The caption MUST be specifically about the content shown in the attached image' + (row.images.length > 1 ? 's (this is a carousel post — write a caption that works for the whole set).' : '.') : ''}`
      const content = row.images.length ? buildImageContent(row.images[0], textPrompt) : textPrompt
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
    const batchId = uid()
    const brandName = brands.find(b => b.id === bulkBrandId)?.name || 'Brand'
    const batchLabel = `Bulk Create — ${brandName} — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    const newPosts: Post[] = toSave.map(r => ({
      id: uid(),
      brand_profile_id: bulkBrandId,
      caption: r.caption,
      platforms: [...bulkPlatforms],
      status: 'draft',
      image_url: r.images[0] || null,
      image_urls: [...r.images],
      created_date: new Date().toISOString(),
      batch_id: batchId,
      batch_label: batchLabel,
      client_visible: false,
      client_approved: false,
      aspect_ratio: bulkAspectRatio || null,
      category: r.category || bulkCategory || null,
    }))
    savePosts([...newPosts, ...posts])
    toast.success(`${toSave.length} draft${toSave.length > 1 ? 's' : ''} saved!`)
    router.push('/posts')
  }

  function openLibrary(target: 'single' | number, multi: boolean = false) {
    setLibraryTarget(target)
    setLibrarySearch('')
    setLibrarySelection(new Set())
    setLibraryMulti(multi)
    setShowLibrary(true)
  }

  function pickFromLibrary(url: string) {
    if (libraryMulti) {
      // Toggle in multi-select set
      setLibrarySelection(prev => {
        const next = new Set(prev)
        if (next.has(url)) next.delete(url); else next.add(url)
        return next
      })
      return
    }
    if (libraryTarget === 'single') {
      setImages(prev => [...prev, url])
    } else {
      const r = [...bulkRows]
      r[libraryTarget as number] = { ...r[libraryTarget as number], images: [...r[libraryTarget as number].images, url] }
      setBulkRows(r)
    }
    setShowLibrary(false)
  }

  /**
   * Confirm multi-select. In carousel mode the photos all go onto the target row.
   * In single-photo mode, each photo becomes its own row (one post per photo),
   * starting from the target row.
   */
  function confirmMultiSelect() {
    const urls = Array.from(librarySelection)
    if (!urls.length) { setShowLibrary(false); return }
    const idx = typeof libraryTarget === 'number' ? libraryTarget : 0
    const rows = [...bulkRows]
    if (carouselMode) {
      rows[idx] = { ...rows[idx], images: [...rows[idx].images, ...urls] }
      setBulkRows(rows)
    } else {
      // First photo into target row (if it's empty), the rest spawn new rows
      const startsEmpty = rows[idx].images.length === 0 && !rows[idx].caption && !rows[idx].prompt
      const consume = startsEmpty ? urls : urls.slice()
      if (startsEmpty) {
        rows[idx] = { ...rows[idx], images: [consume.shift() as string] }
      }
      const extras = consume.map(u => ({ images: [u], prompt: '', caption: '', status: 'idle', category: '' }))
      setBulkRows([...rows, ...extras])
    }
    toast.success(`Added ${urls.length} photo${urls.length !== 1 ? 's' : ''}`)
    setLibrarySelection(new Set())
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
    const batchId = uid()
    const batchLabel = `Buffer Send — ${bb.name} — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`
    const newPosts: Post[] = toSave.map((r) => ({
      id: uid(),
      brand_profile_id: bulkBrandId,
      caption: r.caption,
      platforms: [...bulkPlatforms],
      status: 'published' as const,
      scheduled_at: null,
      image_url: r.images[0] || null,
      image_urls: [...r.images],
      created_date: new Date().toISOString(),
      batch_id: batchId,
      batch_label: batchLabel,
      client_visible: false,
      client_approved: false,
      aspect_ratio: bulkAspectRatio || null,
      category: r.category || bulkCategory || null,
    }))

    let sent = 0
    let lastError = ''
    for (const post of newPosts) {
      if (sent + (lastError ? 1 : 0) > 0) await new Promise(r => setTimeout(r, 1500))
      try {
        // Crop image to bulk aspect ratio before sending
        let photoUrl: string | null = post.image_url || null
        if (photoUrl && bulkAspectRatio) {
          photoUrl = await cropToRatio(photoUrl, bulkAspectRatio, uploadImage)
        }

        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileIds,
            text: post.caption,
            media: photoUrl ? { photo: photoUrl } : undefined,
          }),
        })
        const data = await res.json()
        // Count as sent if at least one channel succeeded
        const anySuccess = data.success || data.results?.some((r: { success: boolean }) => r.success)
        if (anySuccess) {
          sent++
        } else {
          const firstError = data.results?.find((r: { success: boolean; error?: string }) => r.error)?.error
          lastError = firstError || data.error || 'Unknown Buffer error'
        }
      } catch (e: unknown) {
        lastError = e instanceof Error ? e.message : 'Request failed'
      }
    }

    savePosts([...newPosts, ...posts])
    setBulkScheduling(false)
    if (sent > 0) {
      toast.success(`${sent} post${sent !== 1 ? 's' : ''} added to Buffer queue!`)
    } else {
      toast.error(`Failed to send to Buffer: ${lastError}`)
    }
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
          <div className="mt-3">
            <label className="lbl">Aspect Ratio (all rows)</label>
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map(r => (
                <button key={r.value} onClick={() => setBulkAspectRatio(bulkAspectRatio === r.value ? '' : r.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${bulkAspectRatio === r.value ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div className="mt-3">
            <label className="lbl">Category (all rows)</label>
            <div className="flex gap-1.5 flex-wrap">
              {POST_CATEGORIES.map(c => (
                <button key={c.id} type="button" onClick={() => setBulkCategory(bulkCategory === c.id ? '' : c.id)}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${bulkCategory === c.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}>
                  {c.label}
                </button>
              ))}
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
          <div className="flex items-center gap-3 mt-3 flex-wrap">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 accent-[#ff5473]" checked={carouselMode} onChange={e => setCarouselMode(e.target.checked)} />
              <span className="text-sm text-[#e6e1e1]">Carousel mode (multiple photos per post)</span>
            </label>
            {photos.length > 0 && (
              <button onClick={() => openLibrary(0, true)} className="btn btn-o btn-sm flex items-center gap-1 text-xs">
                <PhotoIcon className="w-3 h-3" /> Bulk pick from Library
              </button>
            )}
          </div>
        </div>

        <div className="space-y-3 mb-4">
          {bulkRows.map((row, i) => (
            <div key={i} className="card p-4">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-24 space-y-1">
                  {row.images.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {row.images.map((img, idx) => (
                        <div key={idx} className="relative w-[44px] h-[44px]">
                          <img src={img} alt="" className="w-full h-full rounded object-cover" />
                          <button onClick={() => {
                              const r = [...bulkRows]
                              r[i] = { ...r[i], images: r[i].images.filter((_, k) => k !== idx) }
                              setBulkRows(r)
                            }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[8px] flex items-center justify-center">
                            <XMarkIcon className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-col gap-1">
                    <label className="flex flex-col items-center justify-center w-full h-[34px] border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg cursor-pointer hover:border-[#ff5473] transition-colors text-center text-[10px] text-[#e1bec0]">
                      <PaperClipIcon className="w-3 h-3" />
                      <span>{row.images.length ? '+ Upload' : 'Upload'}</span>
                      <input type="file" accept="image/*" multiple={carouselMode} className="hidden" onChange={e => handleBulkImage(e, i)} />
                    </label>
                    {photos.length > 0 && (
                      <button onClick={() => openLibrary(i, carouselMode)}
                        className="flex flex-col items-center justify-center w-full h-[34px] border-2 border-dashed border-[rgba(90,64,66,0.4)] rounded-lg hover:border-[#ff5473] transition-colors text-center text-[10px] text-[#e1bec0]">
                        <PhotoIcon className="w-3 h-3" />
                        <span>Library</span>
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex gap-2 items-center">
                    <select className="sel text-xs py-1 max-w-[180px]"
                      value={row.category}
                      onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], category: e.target.value }; setBulkRows(r) }}>
                      <option value="">No category</option>
                      {POST_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
                    </select>
                    <input className="inp text-sm flex-1" placeholder="Custom prompt (optional)..."
                      value={row.prompt} onChange={e => { const r = [...bulkRows]; r[i] = { ...r[i], prompt: e.target.value }; setBulkRows(r) }} />
                  </div>
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
            onClick={() => setBulkRows(r => [...r, { images: [], prompt: '', caption: '', status: 'idle', category: '' }])}>
            <PlusIcon className="w-4 h-4" /> Add Row{bulkRows.length >= 10 ? ' (max 10)' : ''}
          </button>
          <button className="btn btn-o flex items-center gap-2" onClick={randomizeCategories}>
            <SparklesIcon className="w-4 h-4" /> Randomize Categories
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
                  {filteredLibrary.map(photo => {
                    const selected = librarySelection.has(photo.url)
                    return (
                      <button key={photo.id} onClick={() => pickFromLibrary(photo.url)}
                        className={`group relative rounded-lg overflow-hidden border transition-colors ${selected ? 'border-[#ff5473] ring-2 ring-[#ff5473]' : 'border-transparent hover:border-[#ff5473]'}`}>
                        <img src={photo.url} alt={photo.name} className="w-full h-20 object-cover" />
                        <div className={`absolute inset-0 bg-black/40 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center`}>
                          {selected ? <span className="text-white text-lg font-bold">✓</span> : <PlusIcon className="w-6 h-6 text-white" />}
                        </div>
                        <p className="text-[10px] text-[#e1bec0] truncate px-1 py-0.5">{photo.name}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {libraryMulti && (
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#5a4042]/30">
                <span className="text-xs text-[#e1bec0]">
                  {librarySelection.size} selected {carouselMode ? '(carousel)' : '(one per post)'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setShowLibrary(false)} className="btn btn-o text-sm">Cancel</button>
                  <button onClick={confirmMultiSelect} disabled={librarySelection.size === 0}
                    className="btn text-sm disabled:opacity-40">
                    Add {librarySelection.size} photo{librarySelection.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
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
            <label className="lbl">Aspect Ratio</label>
            <div className="flex gap-2 flex-wrap">
              {ASPECT_RATIOS.map(r => (
                <button key={r.value} onClick={() => setAspectRatio(aspectRatio === r.value ? '' : r.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-colors border ${aspectRatio === r.value ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="lbl flex items-center gap-2">
              Category (content pillar)
              {categoryAuto && category && <span className="text-[9px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">auto</span>}
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {POST_CATEGORIES.map(c => (
                <button key={c.id} type="button"
                  onClick={() => { setCategory(category === c.id ? '' : c.id); setCategoryAuto(false) }}
                  className={`px-2.5 py-1 rounded-full text-[11px] transition-colors border ${category === c.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 hover:text-white border-transparent'}`}>
                  {c.label}
                </button>
              ))}
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
          <div>
            <label className="lbl">From blog URL (optional)</label>
            <div className="flex gap-2">
              <input
                type="url"
                className="inp flex-1"
                placeholder="https://example.com/blog/post"
                value={blogUrl}
                onChange={e => setBlogUrl(e.target.value)}
              />
              <button
                className="btn btn-o flex items-center gap-2 whitespace-nowrap"
                disabled={!brandId || fetchingBlog || !blogUrl.trim()}
                onClick={fetchFromBlogUrl}
                type="button"
              >
                {fetchingBlog ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Reading…</> : <><PaperClipIcon className="w-4 h-4" /> Fetch & write caption</>}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="btn btn-p flex-1 flex items-center justify-center gap-2" disabled={!brandId || generating} onClick={generate}>
              {generating ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Generating...</> : <><SparklesIcon className="w-4 h-4" /> Generate Caption</>}
            </button>
            <button className="btn btn-o flex items-center gap-1" onClick={() => setShowTemplates(true)}>
              <BookmarkIcon className="w-4 h-4" /> Templates
            </button>
          </div>
        </div>

        <CaptionTemplates
          isOpen={showTemplates}
          onClose={() => setShowTemplates(false)}
          currentCaption={caption}
          currentPrompt={customPrompt}
          brandId={brandId}
          onUseCaption={setCaption}
          onUsePrompt={setCustomPrompt}
        />

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
                <div style={{ aspectRatio: aspectRatio || 'auto', maxHeight: aspectRatio ? undefined : '14rem', overflow: 'hidden' }}>
                  <img src={images[0]} alt="" className="w-full h-full object-cover" />
                </div>
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
            {brand?.buffer_profile_ids?.length ? (
              <button className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium text-white transition-opacity disabled:opacity-40"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
                disabled={sendingBuffer || !caption.trim()}
                onClick={sendToBuffer}>
                {sendingBuffer ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...</> : <><PaperAirplaneIcon className="w-4 h-4" /> Send to Buffer</>}
              </button>
            ) : null}
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
                  {filteredLibrary.map(photo => {
                    const selected = librarySelection.has(photo.url)
                    return (
                      <button key={photo.id} onClick={() => pickFromLibrary(photo.url)}
                        className={`group relative rounded-lg overflow-hidden border transition-colors ${selected ? 'border-[#ff5473] ring-2 ring-[#ff5473]' : 'border-transparent hover:border-[#ff5473]'}`}>
                        <img src={photo.url} alt={photo.name} className="w-full h-20 object-cover" />
                        <div className={`absolute inset-0 bg-black/40 ${selected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity flex items-center justify-center`}>
                          {selected ? (
                            <span className="text-white text-lg font-bold">✓</span>
                          ) : (
                            <PlusIcon className="w-6 h-6 text-white" />
                          )}
                        </div>
                        <p className="text-[10px] text-[#e1bec0] truncate px-1 py-0.5">{photo.name}</p>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
            {libraryMulti && (
              <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-[#5a4042]/30">
                <span className="text-xs text-[#e1bec0]">
                  {librarySelection.size} selected {carouselMode ? '(carousel)' : '(one per post)'}
                </span>
                <div className="flex gap-2">
                  <button onClick={() => setShowLibrary(false)} className="btn btn-o text-sm">Cancel</button>
                  <button onClick={confirmMultiSelect} disabled={librarySelection.size === 0}
                    className="btn text-sm disabled:opacity-40">
                    Add {librarySelection.size} photo{librarySelection.size !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
