'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { useBlog } from '@/context/BlogContext'
import { BlogPost } from '@/lib/types'
import { slugify, wordCount, computeGeoScore } from './utils'
import GeoStars from './GeoStars'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  XMarkIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  CheckIcon,
  PhotoIcon,
} from '@heroicons/react/16/solid'

// ===================== TYPES =====================
export interface PhotoItem {
  id: string
  url: string
  name: string
  tags: string[]
}

// ===================== SEO PREVIEW CARD =====================
function SeoPreviewCard({ title, meta, slug, website }: { title: string; meta: string; slug: string; website: string }) {
  const displayUrl = (website || 'example.com').replace(/^https?:\/\//, '') + '/blog/' + (slug || 'post-slug')
  const titleLen = title.length
  const metaLen = meta.length

  return (
    <div className="card">
      <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">Google Preview</h4>
      <div className="bg-white/5 rounded-lg p-3 space-y-1">
        <div className="text-sm text-blue-400 truncate hover:underline cursor-default">
          {title || 'Post Title'}
        </div>
        <div className="text-xs text-green-400 truncate">{displayUrl}</div>
        <div className="text-xs text-slate-400 line-clamp-2">
          {meta || 'Meta description will appear here...'}
        </div>
      </div>
      <div className="flex gap-3 mt-2">
        <span className={`text-xs ${titleLen > 60 ? 'text-red-400' : titleLen > 50 ? 'text-amber-400' : 'text-slate-600'}`}>
          Title: {titleLen}/60
        </span>
        <span className={`text-xs ${metaLen > 160 ? 'text-red-400' : metaLen > 140 ? 'text-amber-400' : 'text-slate-600'}`}>
          Meta: {metaLen}/160
        </span>
      </div>
    </div>
  )
}

// ===================== PHOTO LIBRARY MODAL =====================
function PhotoLibraryModal({
  photos,
  onSelect,
  onClose,
}: {
  photos: PhotoItem[]
  onSelect: (url: string) => void
  onClose: () => void
}) {
  const [search, setSearch] = useState('')
  const filtered = photos.filter(p =>
    !search || p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  )

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141e] border border-white/10 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <h3 className="text-base font-bold text-white">Photo Library</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>
        <div className="px-6 py-3 border-b border-white/10">
          <input
            className="inp w-full text-sm"
            placeholder="Search photos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {filtered.length > 0 ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
              {filtered.map(photo => (
                <button
                  key={photo.id}
                  onClick={() => { onSelect(photo.url); onClose() }}
                  className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-white/30 transition-all"
                >
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-white bg-black/60 px-2 py-1 rounded-lg">Select</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-gradient-to-t from-black/70 text-xs text-white truncate">
                    {photo.name}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-sm text-slate-500">
              {search ? 'No matching photos' : 'No photos in library'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ===================== WRITER TAB =====================
export default function WriterTab({
  initialTitle = '',
  initialTags = '',
  initialDraftId = null,
  photos = [],
  onSaved,
}: {
  initialTitle?: string
  initialTags?: string
  initialDraftId?: string | null
  photos?: PhotoItem[]
  onSaved?: (post: BlogPost) => void
}) {
  const { activeBrand, drafts, saveDraft } = useBlog()
  const [title, setTitle] = useState(initialTitle)
  const [content, setContent] = useState('')
  const [meta, setMeta] = useState('')
  const [author, setAuthor] = useState(activeBrand?.authorName || '')
  const [tags, setTags] = useState(initialTags)
  const [featuredImage, setFeaturedImage] = useState<string | null>(null)
  const [customPrompt, setCustomPrompt] = useState('')
  const [generating, setGenerating] = useState(false)
  const [polishing, setPolishing] = useState(false)
  const [checkResult, setCheckResult] = useState<{ score: number; summary: string; issues: Array<{ type: string; text: string; suggestion: string }> } | null>(null)
  const [titleSuggestions, setTitleSuggestions] = useState<Array<{ title: string; reason: string }>>([])
  const [showPreview, setShowPreview] = useState(false)
  const [showPhotoLibrary, setShowPhotoLibrary] = useState(false)
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(initialDraftId)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  // Auto-save state
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'unsaved'>('idle')
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastSavedContentRef = useRef<string>('')

  const pc = activeBrand?.primaryColor || '#0d9488'
  const wc = wordCount(content)
  const readMin = Math.max(1, Math.ceil(wc / 250))
  const isHowTo = /how[- ]to|guide|step.by.step|checklist/i.test(title)

  // ---- Load draft when initialDraftId is provided ----
  useEffect(() => {
    if (initialDraftId) {
      const draft = drafts.find(d => d.id === initialDraftId)
      if (draft) {
        setTitle(draft.title)
        setContent(draft.content)
        setMeta(draft.meta)
        setAuthor(draft.author)
        setTags(draft.tags)
        setFeaturedImage(draft.featuredImage || null)
        lastSavedContentRef.current = draft.content
      }
    }
  }, [initialDraftId, drafts])

  // ---- Auto-save: debounce 30s after content changes ----
  useEffect(() => {
    if (!activeBrand || !content.trim() || !title.trim()) return
    if (content === lastSavedContentRef.current) return

    setAutoSaveStatus('unsaved')

    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    autoSaveTimerRef.current = setTimeout(async () => {
      setAutoSaveStatus('saving')
      try {
        const existingSlugs = drafts.map(d => d.slug)
        const slug = currentDraftId
          ? drafts.find(d => d.id === currentDraftId)?.slug || slugify(title, existingSlugs)
          : slugify(title, existingSlugs)
        const saved = await saveDraft({
          id: currentDraftId || undefined,
          slug,
          title: title || 'Untitled Draft',
          meta, author, content, tags,
          featuredImage: featuredImage || undefined,
          wordCount: wc,
        })
        setCurrentDraftId(saved.id)
        lastSavedContentRef.current = content
        setAutoSaveStatus('saved')
        setTimeout(() => setAutoSaveStatus(prev => prev === 'saved' ? 'idle' : prev), 3000)
      } catch {
        setAutoSaveStatus('unsaved')
      }
    }, 30000)

    return () => {
      if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current)
    }
  }, [content, title, meta, tags, activeBrand, currentDraftId, drafts, saveDraft, author, featuredImage, wc])

  // ---- Draft switcher handler ----
  function loadDraft(draftId: string) {
    const draft = drafts.find(d => d.id === draftId)
    if (!draft) return
    setCurrentDraftId(draft.id)
    setTitle(draft.title)
    setContent(draft.content)
    setMeta(draft.meta)
    setAuthor(draft.author)
    setTags(draft.tags)
    setFeaturedImage(draft.featuredImage || null)
    lastSavedContentRef.current = draft.content
    setAutoSaveStatus('idle')
    setCheckResult(null)
    setTitleSuggestions([])
  }

  // ---- Stream helper ----
  const streamResponse = useCallback(async (url: string, body: object, onChunk: (text: string) => void) => {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error || `Error ${res.status}`)
    }
    if (!res.body) throw new Error('No response body')
    const reader = res.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const data = line.slice(6).trim()
          if (data === '[DONE]') continue
          try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'content_block_delta' && parsed.delta?.text) onChunk(parsed.delta.text)
          } catch { /* skip malformed */ }
        }
      }
    }
  }, [])

  async function generatePost() {
    if (!activeBrand) { toast.error('Select a brand first'); return }
    if (!title.trim()) { toast.error('Enter a title first'); return }
    setGenerating(true); setContent('')
    try {
      let generatedContent = ''
      await streamResponse(
        '/api/blog/generate-post',
        { brandId: activeBrand.id, title, tags, postType: isHowTo ? 'howto' : 'blog', customPrompt },
        text => { generatedContent += text; setContent(prev => prev + text) },
      )
      toast.success('Generated! Running brand voice polish...')
      const polished = await polishVoiceContent(generatedContent)
      const finalContent = polished || generatedContent
      if (polished) setContent(polished)
      await generateMetaFor(title, finalContent)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function polishVoiceContent(contentToPolish: string): Promise<string | null> {
    if (!activeBrand || !contentToPolish.trim()) return null
    setPolishing(true)
    try {
      let polished = ''
      await streamResponse(
        '/api/blog/brand-polish',
        { brandId: activeBrand.id, content: contentToPolish },
        text => { polished += text },
      )
      return polished.trim().length > 100 ? polished : null
    } catch { return null }
    finally { setPolishing(false) }
  }

  async function polishVoice() {
    const polished = await polishVoiceContent(content)
    if (polished) setContent(polished)
  }

  async function checkDraft() {
    if (!activeBrand || !content.trim()) return
    const tid = toast.loading('Checking draft...')
    try {
      const res = await fetch('/api/blog/check-draft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrand.id, content }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setCheckResult(data)
      toast.dismiss(tid)
    } catch (e) {
      toast.dismiss(tid)
      toast.error(e instanceof Error ? e.message : 'Check failed')
    }
  }

  async function optimizeTitle() {
    if (!activeBrand || !title.trim()) return
    try {
      const res = await fetch('/api/blog/optimize-title', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrand.id, title }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setTitleSuggestions(data)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Optimize failed')
    }
  }

  async function generateMetaFor(titleArg: string, contentArg: string) {
    if (!activeBrand || !titleArg.trim()) return
    try {
      const res = await fetch('/api/blog/generate-meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrand.id, title: titleArg, content: contentArg }),
      })
      const data = await res.json()
      if (res.ok) setMeta(data.meta || '')
    } catch { /* silent */ }
  }

  async function generateMeta() {
    await generateMetaFor(title, content)
  }

  async function handleSave() {
    if (!activeBrand) { toast.error('Select a brand first'); return }
    const existingSlugs = drafts.map(d => d.slug)
    const slug = currentDraftId ? drafts.find(d => d.id === currentDraftId)?.slug || slugify(title, existingSlugs) : slugify(title, existingSlugs)
    try {
      const saved = await saveDraft({
        id: currentDraftId || undefined,
        slug,
        title: title || 'Untitled Draft',
        meta, author, content, tags,
        featuredImage: featuredImage || undefined,
        wordCount: wc,
      })
      setCurrentDraftId(saved.id)
      lastSavedContentRef.current = content
      setAutoSaveStatus('saved')
      toast.success('Draft saved!')
      onSaved?.(saved)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    }
  }

  function insertAtCursor(text: string) {
    const el = contentRef.current
    if (!el) return
    const s = el.selectionStart, e = el.selectionEnd
    const newVal = content.substring(0, s) + text + content.substring(e)
    setContent(newVal)
    setTimeout(() => { el.selectionStart = el.selectionEnd = s + text.length; el.focus() }, 0)
  }

  function handleFeaturedImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => setFeaturedImage(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  function exportPost(format: 'md' | 'html' | 'txt') {
    const slug = currentDraftId ? drafts.find(d => d.id === currentDraftId)?.slug || 'post' : slugify(title, [])
    let blob: Blob, ext: string
    if (format === 'md') {
      const md = `---\ntitle: "${title}"\nauthor: "${author}"\ndescription: "${meta}"\nslug: "${slug}"\ntags: [${tags.split(',').map(t => `"${t.trim()}"`).join(', ')}]\ndate: ${new Date().toISOString().split('T')[0]}\n---\n\n# ${title}\n\n${content}`
      blob = new Blob([md], { type: 'text/markdown' }); ext = 'md'
    } else if (format === 'html') {
      const body = content.replace(/^## (.+)$/gm, '<h2>$1</h2>').replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/\n{2,}/g, '</p><p>')
      blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${title}</title></head><body><h1>${title}</h1><p>${body}</p></body></html>`], { type: 'text/html' }); ext = 'html'
    } else {
      blob = new Blob([`${title}\nBy ${author}\n${'='.repeat(50)}\n\n${content}`], { type: 'text/plain' }); ext = 'txt'
    }
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${slug}.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }

  const previewHtml = content
    .replace(/^### (.+)$/gm, '<h3>$1</h3>').replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>').replace(/\n{2,}/g, '</p><p>').replace(/^---$/gm, '<hr>')

  const currentSlug = currentDraftId
    ? drafts.find(d => d.id === currentDraftId)?.slug || slugify(title, [])
    : slugify(title, [])

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Draft switcher */}
      {drafts.length > 0 && (
        <div className="flex items-center gap-3 mb-4">
          <label className="text-xs text-slate-500">Draft:</label>
          <select
            className="sel text-sm flex-1 max-w-xs"
            value={currentDraftId || ''}
            onChange={e => {
              if (e.target.value === '') {
                setCurrentDraftId(null); setTitle(''); setContent(''); setMeta('')
                setTags(''); setFeaturedImage(null); setAuthor(activeBrand?.authorName || '')
                lastSavedContentRef.current = ''; setAutoSaveStatus('idle')
              } else {
                loadDraft(e.target.value)
              }
            }}
          >
            <option value="">+ New Draft</option>
            {drafts.map(d => (
              <option key={d.id} value={d.id}>
                {d.title || 'Untitled'} ({d.status})
              </option>
            ))}
          </select>

          {/* Auto-save indicator */}
          <span className={`text-xs ml-auto ${
            autoSaveStatus === 'saving' ? 'text-amber-400' :
            autoSaveStatus === 'saved' ? 'text-green-400' :
            autoSaveStatus === 'unsaved' ? 'text-orange-400' :
            'text-slate-600'
          }`}>
            {autoSaveStatus === 'saving' && 'Saving...'}
            {autoSaveStatus === 'saved' && 'Saved \u2713'}
            {autoSaveStatus === 'unsaved' && 'Unsaved changes'}
          </span>
        </div>
      )}

      {/* Title row */}
      <div className="card mb-4">
        <div className="relative flex items-center gap-2 mb-3">
          <input
            className="inp flex-1 text-base font-semibold"
            placeholder="Post title..."
            value={title}
            onChange={e => setTitle(e.target.value)}
          />
          <button
            onClick={optimizeTitle}
            className="btn btn-sm flex-shrink-0 flex items-center gap-1"
            style={{ borderColor: `${pc}40`, color: pc }}
            disabled={!title.trim()}
          >
            <SparklesIcon className="w-3 h-3" /> Optimize
          </button>
        </div>

        {titleSuggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-[#14141e] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
            {titleSuggestions.map((s, i) => (
              <button
                key={i}
                onClick={() => { setTitle(s.title); setTitleSuggestions([]) }}
                className="w-full text-left px-4 py-3 border-b border-white/5 hover:bg-white/5 transition-colors last:border-0"
              >
                <div className="text-sm text-white font-medium">{s.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{s.reason}</div>
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-wrap gap-2">
          <div className="flex-1 min-w-[140px]">
            <label className="lbl mb-1">Author</label>
            <input className="inp" value={author} onChange={e => setAuthor(e.target.value)} placeholder="Author name" />
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="lbl mb-1">Keywords / Tags</label>
            <input className="inp" value={tags} onChange={e => setTags(e.target.value)} placeholder="keyword1, keyword2" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
        {/* Editor */}
        <div className="space-y-4">
          {/* Featured image */}
          <div className="flex items-center gap-3">
            {featuredImage ? (
              <div className="relative">
                <img src={featuredImage} alt="Featured" className="h-20 rounded-lg object-cover" />
                <button onClick={() => setFeaturedImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">&times;</button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button onClick={() => imageInputRef.current?.click()} className="btn btn-sm flex items-center gap-1 text-slate-400 border-dashed">
                  <ArrowUpTrayIcon className="w-3 h-3" /> Upload Image
                </button>
                {photos.length > 0 && (
                  <button
                    onClick={() => setShowPhotoLibrary(true)}
                    className="btn btn-sm flex items-center gap-1 text-slate-400 border-dashed"
                  >
                    <PhotoIcon className="w-3 h-3" /> From Library
                  </button>
                )}
              </div>
            )}
            <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleFeaturedImage} />
          </div>

          {/* Toolbar */}
          <div className="flex flex-wrap gap-1 pb-2 border-b border-white/10">
            {[
              { label: 'H2', action: () => insertAtCursor('\n\n## Heading\n\n') },
              { label: 'H3', action: () => insertAtCursor('\n\n### Subheading\n\n') },
              { label: 'Bold', action: () => insertAtCursor('**bold text**') },
              { label: 'List', action: () => insertAtCursor('\n\n- Item one\n- Item two\n- Item three\n\n') },
              { label: 'CTA', action: () => insertAtCursor(`\n\n[Visit ${activeBrand?.businessName || activeBrand?.name || 'us'}](${activeBrand?.website || '#'}) — we'd love to help.\n\n`) },
              { label: '---', action: () => insertAtCursor('\n\n---\n\n') },
            ].map(b => (
              <button key={b.label} onClick={b.action} className="px-2 py-1 text-xs rounded bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors font-mono">{b.label}</button>
            ))}
          </div>

          {/* Content area */}
          <textarea
            ref={contentRef}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="ta w-full min-h-[420px] font-mono text-sm"
            placeholder="Write your blog post here... or click Generate with AI"
          />

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{wc} words &middot; ~{readMin} min read</span>
            {currentDraftId && <span className="text-teal-600">Saved</span>}
          </div>

          {/* Custom prompt */}
          <details className="group">
            <summary className="text-xs text-slate-500 cursor-pointer hover:text-slate-300 transition-colors">Custom AI instructions (optional)</summary>
            <textarea
              className="ta mt-2 w-full min-h-[80px] text-xs"
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              placeholder="Additional instructions for the AI (e.g. 'Focus on commercial customers')"
            />
          </details>

          {/* Actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={generatePost} disabled={generating || !activeBrand}
              className="btn btn-p flex items-center gap-1.5 disabled:opacity-50"
              style={{ background: pc, boxShadow: `0 0 18px ${pc}44` }}
            >
              <SparklesIcon className="w-4 h-4" />
              {generating ? 'Generating...' : 'Generate with AI'}
            </button>
            <button onClick={() => polishVoice()} disabled={polishing || !content.trim()} className="btn btn-sm flex items-center gap-1 disabled:opacity-50">
              {polishing ? '\u23F3' : '\u2726'} Brand Voice Polish
            </button>
            <button onClick={checkDraft} disabled={!content.trim()} className="btn btn-sm disabled:opacity-50">\u2713 Check Draft</button>
            <button onClick={handleSave} disabled={!activeBrand} className="btn btn-sm disabled:opacity-50">\uD83D\uDCBE Save Draft</button>
            <button onClick={() => setShowPreview(true)} disabled={!content.trim()} className="btn btn-sm flex items-center gap-1 disabled:opacity-50">
              <EyeIcon className="w-3 h-3" /> Preview
            </button>
            <div className="relative group">
              <button className="btn btn-sm">Export \u2193</button>
              <div className="absolute bottom-full mb-1 left-0 hidden group-hover:flex flex-col bg-[#14141e] border border-white/10 rounded-lg overflow-hidden shadow-xl z-10 min-w-[140px]">
                {(['md', 'html', 'txt'] as const).map(f => (
                  <button key={f} onClick={() => exportPost(f)} className="px-3 py-2 text-xs text-left text-slate-300 hover:bg-white/5 transition-colors uppercase">{f}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Draft check results */}
          {checkResult && (
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className={`text-2xl font-bold ${checkResult.score >= 80 ? 'text-green-400' : checkResult.score >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{checkResult.score}</span>
                  <span className="text-xs text-slate-500">/ 100</span>
                </div>
                <p className="text-xs text-slate-400">{checkResult.summary}</p>
                <button onClick={() => setCheckResult(null)} className="text-slate-600 hover:text-slate-400"><XMarkIcon className="w-4 h-4" /></button>
              </div>
              {checkResult.issues.map((issue, i) => (
                <div key={i} className="py-2 border-t border-white/5">
                  <span className={`text-xs px-2 py-0.5 rounded-full mr-2 ${
                    issue.type === 'grammar' ? 'bg-red-500/15 text-red-400'
                    : issue.type === 'voice' ? 'bg-blue-500/15 text-blue-400'
                    : issue.type === 'structure' ? 'bg-green-500/15 text-green-400'
                    : 'bg-amber-500/15 text-amber-400'
                  }`}>{issue.type}</span>
                  <span className="text-xs text-slate-400 line-through opacity-60">{issue.text}</span>
                  <div className="text-xs text-green-400 mt-1 pl-2">{issue.suggestion}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* SEO Preview card */}
          <SeoPreviewCard
            title={title}
            meta={meta}
            slug={currentSlug}
            website={activeBrand?.website || ''}
          />

          {/* Meta */}
          <div className="card">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">SEO Meta</h4>
            <label className="lbl mb-1">Meta Description</label>
            <textarea className="ta min-h-[80px] text-xs mb-1" value={meta} onChange={e => setMeta(e.target.value)} placeholder="160-character meta description..." />
            <div className={`text-xs ${meta.length > 160 ? 'text-red-400' : meta.length > 140 ? 'text-amber-400' : 'text-slate-600'}`}>{meta.length}/160</div>
            <button onClick={generateMeta} className="btn btn-sm btn-o w-full mt-2 text-xs flex items-center justify-center gap-1" disabled={!title.trim()}>
              <SparklesIcon className="w-3 h-3" /> Generate Meta
            </button>
          </div>

          {/* Structure checklist */}
          <div className="card">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {isHowTo ? '\u2630 How-To Structure' : '\u2630 Blog Structure'}
            </h4>
            <div className="space-y-2">
              {(isHowTo ? [
                'Direct Answer paragraph',
                'What You\'ll Need (bullet list)',
                'Step-by-step instructions (H2s)',
                'Common problems section',
                'When to call a professional',
                'Brand CTA',
                'FAQ section (5 Q&As)',
              ] : [
                'Direct Answer paragraph',
                'Opening context',
                'Main topic section (H2)',
                'Cost / timeframe section',
                'Practical tips / signs',
                'Local context section',
                'Brand CTA',
                'FAQ section (5 Q&As)',
              ]).map((item, i) => {
                const isPresent = content.toLowerCase().includes(item.toLowerCase().slice(0, 12))
                return (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${isPresent ? 'bg-green-500/20 border-green-500/50' : 'border-white/20'}`}>
                      {isPresent && <CheckIcon className="w-2 h-2 text-green-400" />}
                    </div>
                    <span className={isPresent ? 'text-slate-400' : 'text-slate-600'}>{item}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* GEO score with tooltip */}
          {content.length > 100 && (
            <div className="card">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">SEO Score</h4>
              <GeoStars score={computeGeoScore({ title, content, tags }, activeBrand)} showTooltip />
              <p className="text-xs text-slate-600 mt-1">AI citation likelihood</p>
            </div>
          )}
        </div>
      </div>

      {/* Preview modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#14141e] border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 sticky top-0 bg-[#14141e]">
              <h3 className="font-bold text-white">{title || 'Preview'}</h3>
              <button onClick={() => setShowPreview(false)} className="text-slate-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
            </div>
            <div className="p-8 prose prose-invert max-w-none prose-sm">
              {featuredImage && <img src={featuredImage} alt="" className="w-full max-h-64 object-cover rounded-xl mb-6" />}
              <div className="text-xs text-slate-500 mb-6">{author} &middot; {readMin} min read</div>
              <div dangerouslySetInnerHTML={{ __html: '<p>' + previewHtml + '</p>' }} />
            </div>
          </div>
        </div>
      )}

      {/* Photo library modal */}
      {showPhotoLibrary && (
        <PhotoLibraryModal
          photos={photos}
          onSelect={url => setFeaturedImage(url)}
          onClose={() => setShowPhotoLibrary(false)}
        />
      )}
    </div>
  )
}
