'use client'

import { useState, useRef, useCallback } from 'react'
import { useTab } from '../BlogShell'
import { useBlog } from '@/context/BlogContext'
import { BlogBrand, BlogPost, FOCUS_AREA_LABELS } from '@/lib/types'
import toast from 'react-hot-toast'
import {
  SparklesIcon,
  ChevronDownIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ClipboardDocumentIcon,
  ArrowUpTrayIcon,
  EyeIcon,
} from '@heroicons/react/16/solid'

// ===================== UTILITIES =====================
const SLUG_STOP = new Set(['the','a','an','is','are','was','how','to','for','your','in','on','at','of','and','or','it','with','do','we','you','get','can','i','my','this','that','from','by','up','what','why','when','where','will','would','not','no','but','just','all','more','has','have'])

function slugify(title: string, existing: string[] = []): string {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w && !SLUG_STOP.has(w))
  const padded = [...words]
  while (padded.length < 3) padded.push(['guide','tips','blog'][padded.length % 3])
  const base = padded.slice(0, 3).join('-')
  if (!existing.includes(base)) return base
  for (let i = 2; i < 100; i++) { const c = `${base}-${i}`; if (!existing.includes(c)) return c }
  return `draft-${Date.now()}`
}

function wordCount(text: string) { return text.trim() ? text.trim().split(/\s+/).length : 0 }

function computeGeoScore(post: Partial<BlogPost>, brand: BlogBrand | null): number {
  let score = 0
  const content = (post.content || '').toLowerCase()
  if (/frequently asked|## faq/i.test(content)) score += 2
  if (content.length > 200) score += 1
  const loc = brand?.location?.split(',')[0]?.toLowerCase()
  if (loc && content.includes(loc)) score += 1
  const tags = (post.tags || '').toLowerCase().split(',').map(t => t.trim()).filter(Boolean)
  if (tags.some(t => t.length > 3 && content.includes(t))) score += 1
  return Math.min(5, Math.max(1, score))
}

function buildSchemaMarkup(post: Partial<BlogPost>, brand: BlogBrand | null): string {
  const isHowTo = /how[- ]to|guide|step.by.step|checklist/i.test(post.title || '')
  const graph = [
    isHowTo ? {
      '@type': 'HowTo',
      name: post.title,
      description: post.meta || '',
      author: { '@type': 'Person', name: post.author || brand?.authorName || '' },
      publisher: { '@type': 'Organization', name: brand?.businessName || brand?.name || '' },
      datePublished: post.publishedDate || new Date().toISOString().split('T')[0],
    } : {
      '@type': 'Article',
      headline: post.title,
      description: post.meta || '',
      author: { '@type': 'Person', name: post.author || brand?.authorName || '' },
      publisher: { '@type': 'Organization', name: brand?.businessName || brand?.name || '', url: brand?.website || '' },
      datePublished: post.publishedDate || new Date().toISOString().split('T')[0],
      wordCount: post.wordCount || 0,
    },
    {
      '@type': 'LocalBusiness',
      name: brand?.businessName || brand?.name || '',
      url: brand?.website || '',
      address: { '@type': 'PostalAddress', addressLocality: brand?.location || '' },
    },
  ]
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
}

function GeoStars({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-0.5" title={`SEO Score: ${score}/5`}>
      {[1,2,3,4,5].map(i => (
        <span key={i} className={`text-xs ${i <= score ? 'text-amber-400' : 'text-slate-700'}`}>★</span>
      ))}
    </div>
  )
}

// ===================== BRAND MANAGER MODAL =====================
interface BrandManagerProps {
  brand: BlogBrand | null
  onClose: () => void
  onCreate: (data: BrandFormData) => Promise<void>
  onUpdate: (id: string, data: BrandFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

interface BrandFormData {
  name: string; tagline: string; businessName: string; location: string
  website: string; industry: string; primaryColor: string; brandVoice: string
  focusAreas: string[]; authorName: string; blogPath: string
}

const ALL_FOCUS_AREAS = Object.keys(FOCUS_AREA_LABELS)

const GEEKLY_VOICE = `Warm, approachable, knowledgeable, and locally grounded — like a friendly neighbour who happens to be a tech expert.
Plain, jargon-free language. Technical concepts explained simply.
Confident but not arrogant — back claims with proof (reviews, warranty, track record) but frame through helping, not boasting.
Community-focused with strong local identity.
Transparent and honest — no hidden fees, published pricing.
Friendly and casual — conversational register, natural tone.
Educational — share helpful tips, position as teachers not just technicians.
Direct and action-oriented — clear low-friction CTAs: "Walk-ins welcome", "Pop in anytime!".

MUST AVOID: Tech jargon without explanation, aggressive sales language, urgency tactics, corporate formality.`

function BrandManagerModal({ brand, onClose, onCreate, onUpdate, onDelete }: BrandManagerProps) {
  const [tab, setTab] = useState<'details' | 'voice'>('details')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState<BrandFormData>({
    name: brand?.name || '',
    tagline: brand?.tagline || 'Blog Dashboard',
    businessName: brand?.businessName || '',
    location: brand?.location || '',
    website: brand?.website || '',
    industry: brand?.industry || '',
    primaryColor: brand?.primaryColor || '#0d9488',
    brandVoice: brand?.brandVoice || '',
    focusAreas: brand?.focusAreas || [],
    authorName: brand?.authorName || '',
    blogPath: brand?.blogPath || '/blog',
  })

  function set(k: keyof BrandFormData, v: string | string[]) { setForm(prev => ({ ...prev, [k]: v })) }

  function toggleFocus(area: string) {
    setForm(prev => ({
      ...prev,
      focusAreas: prev.focusAreas.includes(area)
        ? prev.focusAreas.filter(a => a !== area)
        : [...prev.focusAreas, area],
    }))
  }

  async function handleSave() {
    if (!form.name.trim()) { toast.error('Brand name is required'); return }
    setSaving(true)
    try {
      if (brand) await onUpdate(brand.id, form)
      else await onCreate(form)
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete() {
    if (!brand) return
    if (!confirm(`Delete brand "${brand.name}"? All posts for this brand will also be deleted.`)) return
    setSaving(true)
    try { await onDelete(brand.id); onClose() }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed') }
    finally { setSaving(false) }
  }

  const inp = 'w-full bg-[rgba(255,255,255,0.05)] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[var(--blog-pc)] transition-colors'

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-[#14141e] border border-white/10 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 flex-shrink-0">
          <h2 className="text-base font-bold text-white">{brand ? 'Brand Settings' : 'New Brand'}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {/* Modal tabs */}
        <div className="flex border-b border-white/10 flex-shrink-0">
          {(['details', 'voice'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 text-xs font-medium capitalize transition-colors ${tab === t ? 'text-white border-b-2' : 'text-slate-500 hover:text-slate-300'}`}
              style={tab === t ? { borderColor: form.primaryColor } : {}}
            >
              {t === 'voice' ? 'Voice & Tone' : 'Details'}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {tab === 'details' && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Brand Name *</label>
                  <input className={inp} value={form.name} onChange={e => set('name', e.target.value)} placeholder="My Brand" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Tagline</label>
                  <input className={inp} value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Blog Dashboard" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Business Name</label>
                <input className={inp} value={form.businessName} onChange={e => set('businessName', e.target.value)} placeholder="Acme Corp" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Location</label>
                  <input className={inp} value={form.location} onChange={e => set('location', e.target.value)} placeholder="City, Country" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Industry</label>
                  <input className={inp} value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Tech Repair" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Website</label>
                <input className={inp} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://example.com" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Author Name</label>
                  <input className={inp} value={form.authorName} onChange={e => set('authorName', e.target.value)} placeholder="Team Name" />
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1 block">Blog Path</label>
                  <input className={inp} value={form.blogPath} onChange={e => set('blogPath', e.target.value)} placeholder="/blog" />
                </div>
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Brand Color</label>
                <div className="flex items-center gap-3">
                  <input type="color" value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-0 bg-transparent" />
                  <input className={`${inp} flex-1`} value={form.primaryColor} onChange={e => set('primaryColor', e.target.value)} placeholder="#0d9488" />
                  <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: form.primaryColor }} />
                </div>
              </div>
              {!brand && (
                <div className="p-3 rounded-lg bg-white/5 border border-white/10">
                  <p className="text-xs text-slate-400 mb-2">Quick start with Geekly template?</p>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({
                      ...prev,
                      name: 'Geekly',
                      tagline: 'Blog Dashboard',
                      businessName: 'Geekly',
                      location: 'Bendigo, VIC, Australia',
                      industry: 'Tech Repair',
                      website: 'https://geekly.com.au',
                      primaryColor: '#7E8EF1',
                      brandVoice: GEEKLY_VOICE,
                      focusAreas: ['repair-tips','tech-education','business','community','product','behind-scenes','seasonal'],
                      authorName: 'Geekly Team',
                    }))}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[rgba(126,142,241,0.15)] text-[#7E8EF1] border border-[rgba(126,142,241,0.3)] hover:bg-[rgba(126,142,241,0.25)] transition-colors"
                  >
                    Use Geekly Template
                  </button>
                </div>
              )}
            </>
          )}

          {tab === 'voice' && (
            <>
              <div>
                <label className="text-xs text-slate-400 mb-1 block">Brand Voice & Tone</label>
                <textarea
                  className={`${inp} min-h-[200px] resize-y`}
                  value={form.brandVoice}
                  onChange={e => set('brandVoice', e.target.value)}
                  placeholder="Describe your brand voice, writing rules, things to avoid, vocabulary to use..."
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-2 block">Focus Areas (used for idea generation)</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_FOCUS_AREAS.map(area => (
                    <label key={area} className="flex items-center gap-2 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={form.focusAreas.includes(area)}
                        onChange={() => toggleFocus(area)}
                        className="w-4 h-4 rounded accent-teal-400"
                      />
                      <span className="text-xs text-slate-400 group-hover:text-slate-200 transition-colors">{FOCUS_AREA_LABELS[area]}</span>
                    </label>
                  ))}
                </div>
              </div>
            </>
          )}

        </div>

        <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between flex-shrink-0">
          {brand ? (
            <button onClick={handleDelete} disabled={saving} className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
              <TrashIcon className="w-3 h-3" /> Delete Brand
            </button>
          ) : <div />}
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-sm rounded-lg bg-white/5 text-slate-300 hover:bg-white/10 transition-colors">Cancel</button>
            <button
              onClick={handleSave} disabled={saving}
              className="px-4 py-2 text-sm rounded-lg text-white font-medium transition-colors disabled:opacity-50"
              style={{ background: form.primaryColor }}
            >
              {saving ? 'Saving…' : brand ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===================== BRAND SWITCHER =====================
function BrandSwitcher({ onManage }: { onManage: (brand: BlogBrand | null) => void }) {
  const { brands, activeBrand, setActiveBrandById } = useBlog()
  const [open, setOpen] = useState(false)
  const pc = activeBrand?.primaryColor || '#0d9488'

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
        >
          <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: pc }} />
          <span className="text-sm text-white font-medium max-w-[140px] truncate">{activeBrand?.name || 'Select Brand'}</span>
          <ChevronDownIcon className="w-3 h-3 text-slate-400" />
        </button>
        <button
          onClick={() => onManage(activeBrand)}
          className="p-1.5 rounded-lg bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          title="Brand settings"
        >
          <Cog6ToothIcon className="w-4 h-4" />
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-[#14141e] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden">
          {brands.map(b => (
            <button
              key={b.id}
              onClick={() => { setActiveBrandById(b.id); setOpen(false) }}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 text-sm hover:bg-white/5 transition-colors text-left ${activeBrand?.id === b.id ? 'bg-white/5' : ''}`}
            >
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: b.primaryColor }} />
              <span className="truncate text-slate-200">{b.name}</span>
              {activeBrand?.id === b.id && <CheckIcon className="w-3 h-3 text-teal-400 ml-auto flex-shrink-0" />}
            </button>
          ))}
          <div className="border-t border-white/10">
            <button
              onClick={() => { onManage(null); setOpen(false) }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-teal-400 hover:bg-white/5 transition-colors"
            >
              <PlusIcon className="w-4 h-4" /> New Brand
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// ===================== IDEAS TAB =====================
interface IdeaItem {
  title: string; primaryQuery: string; desc: string
  keywords: string[]; readTime: string; postType: string; category: string
}

function IdeasTab({ onSelectIdea }: { onSelectIdea: (idea: IdeaItem) => void }) {
  const { activeBrand } = useBlog()
  const [count, setCount] = useState(5)
  const [focusArea, setFocusArea] = useState('all')
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [trendData, setTrendData] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const focusOptions = [
    { value: 'all', label: 'All topics' },
    ...((activeBrand?.focusAreas || []).map(a => ({ value: a, label: FOCUS_AREA_LABELS[a] || a }))),
  ]

  async function generate() {
    if (!activeBrand) { toast.error('Select or create a brand first'); return }
    setLoading(true); setIdeas([]); setTrendData(null)
    try {
      const res = await fetch('/api/blog/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrand.id, count, focusArea }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Generation failed'); return }
      setIdeas(data.ideas || [])
      setTrendData(data.trendData || null)
    } finally {
      setLoading(false)
    }
  }

  const pc = activeBrand?.primaryColor || '#0d9488'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Idea Generator</h2>
        <p className="text-sm text-slate-500 mb-5">Generate search-optimised blog ideas based on real search trends.</p>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="lbl mb-2">Number of ideas</label>
            <div className="flex items-center gap-3">
              <input type="range" min={3} max={15} value={count} onChange={e => setCount(+e.target.value)}
                className="w-32 accent-teal-400 h-1" />
              <span className="text-2xl font-bold" style={{ color: pc }}>{count}</span>
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="lbl mb-1">Focus area</label>
            <select className="sel" value={focusArea} onChange={e => setFocusArea(e.target.value)}>
              {focusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            onClick={generate} disabled={loading || !activeBrand}
            className="btn btn-p flex items-center gap-2 disabled:opacity-50"
            style={{ background: pc, boxShadow: `0 0 18px ${pc}44` }}
          >
            <SparklesIcon className="w-4 h-4" />
            {loading ? 'Researching…' : 'Generate Ideas'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card flex flex-col items-center gap-3 py-16">
          <div className="w-10 h-10 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: pc }} />
          <p className="text-sm text-slate-400">Researching search trends and generating ideas…</p>
        </div>
      )}

      {trendData && !loading && (
        <div className="card mb-5" style={{ borderColor: `${pc}30` }}>
          <h3 className="text-sm font-semibold text-white mb-3">Search Research</h3>
          <div className="flex flex-wrap gap-2">
            {((trendData as { topQueries?: Array<{ query: string }> }).topQueries || []).slice(0, 5).map((q: { query: string }, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">&ldquo;{q.query}&rdquo;</span>
            ))}
          </div>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`card cursor-pointer transition-all hover:-translate-y-0.5 ${selected === i ? 'ring-1' : ''}`}
              style={selected === i ? { borderColor: pc, boxShadow: `0 0 20px ${pc}30, 0 0 0 1px ${pc}` } : {}}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: pc }}>{idea.category || idea.postType}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${idea.postType === 'How-To Guide' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-slate-400'}`}>{idea.postType}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{idea.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{idea.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {idea.keywords?.slice(0, 3).map((k, j) => <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{k}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{idea.readTime}</span>
                <button
                  onClick={e => { e.stopPropagation(); onSelectIdea(idea) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors"
                  style={{ background: pc }}
                >
                  Write This →
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ideas.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">💡</div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">No ideas yet</h3>
          <p className="text-sm text-slate-500">{activeBrand ? 'Click "Generate Ideas" to get started' : 'Create a brand first to generate ideas'}</p>
        </div>
      )}
    </div>
  )
}

// ===================== WRITER TAB =====================
function WriterTab({
  initialTitle = '', initialTags = '',
  onSaved,
}: {
  initialTitle?: string; initialTags?: string
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
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null)
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const pc = activeBrand?.primaryColor || '#0d9488'
  const wc = wordCount(content)
  const readMin = Math.max(1, Math.ceil(wc / 250))

  const isHowTo = /how[- ]to|guide|step.by.step|checklist/i.test(title)

  async function streamResponse(url: string, body: object, onChunk: (text: string) => void) {
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
  }

  async function generatePost() {
    if (!activeBrand) { toast.error('Select a brand first'); return }
    if (!title.trim()) { toast.error('Enter a title first'); return }
    setGenerating(true); setContent('')
    try {
      // Collect locally to avoid stale state closures in subsequent steps
      let generatedContent = ''
      await streamResponse(
        '/api/blog/generate-post',
        { brandId: activeBrand.id, title, tags, postType: isHowTo ? 'howto' : 'blog', customPrompt },
        text => { generatedContent += text; setContent(prev => prev + text) },
      )
      toast.success('Generated! Running brand voice polish…')
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
    const tid = toast.loading('Checking draft…')
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Title row */}
      <div className="card mb-4">
        <div className="relative flex items-center gap-2 mb-3">
          <input
            className="inp flex-1 text-base font-semibold"
            placeholder="Post title…"
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
                <button onClick={() => setFeaturedImage(null)} className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">✕</button>
              </div>
            ) : (
              <button onClick={() => imageInputRef.current?.click()} className="btn btn-sm flex items-center gap-1 text-slate-400 border-dashed">
                <ArrowUpTrayIcon className="w-3 h-3" /> Featured Image
              </button>
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
              { label: 'CTA', action: () => insertAtCursor(`\n\n[Visit ${activeBrand?.businessName || activeBrand?.name || 'us'}](${activeBrand?.website || '#'}) — we\'d love to help.\n\n`) },
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
            placeholder="Write your blog post here… or click Generate with AI"
          />

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span>{wc} words · ~{readMin} min read</span>
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
              {generating ? 'Generating…' : '✦ Generate with AI'}
            </button>
            <button onClick={() => polishVoice()} disabled={polishing || !content.trim()} className="btn btn-sm flex items-center gap-1 disabled:opacity-50">
              {polishing ? '⏳' : '✦'} Brand Voice Polish
            </button>
            <button onClick={checkDraft} disabled={!content.trim()} className="btn btn-sm disabled:opacity-50">✓ Check Draft</button>
            <button onClick={handleSave} disabled={!activeBrand} className="btn btn-sm disabled:opacity-50">💾 Save Draft</button>
            <button onClick={() => setShowPreview(true)} disabled={!content.trim()} className="btn btn-sm flex items-center gap-1 disabled:opacity-50">
              <EyeIcon className="w-3 h-3" /> Preview
            </button>
            <div className="relative group">
              <button className="btn btn-sm">Export ↓</button>
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
          {/* Meta */}
          <div className="card">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">SEO Meta</h4>
            <label className="lbl mb-1">Meta Description</label>
            <textarea className="ta min-h-[80px] text-xs mb-1" value={meta} onChange={e => setMeta(e.target.value)} placeholder="160-character meta description…" />
            <div className={`text-xs ${meta.length > 160 ? 'text-red-400' : meta.length > 140 ? 'text-amber-400' : 'text-slate-600'}`}>{meta.length}/160</div>
            <button onClick={generateMeta} className="btn btn-sm btn-o w-full mt-2 text-xs flex items-center justify-center gap-1" disabled={!title.trim()}>
              <SparklesIcon className="w-3 h-3" /> Generate Meta
            </button>
          </div>

          {/* Structure checklist */}
          <div className="card">
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-3">
              {isHowTo ? '☰ How-To Structure' : '☰ Blog Structure'}
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

          {/* GEO score */}
          {content.length > 100 && (
            <div className="card">
              <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-2">SEO Score</h4>
              <GeoStars score={computeGeoScore({ title, content, tags }, activeBrand)} />
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
              <div className="text-xs text-slate-500 mb-6">{author} · {readMin} min read</div>
              <div dangerouslySetInnerHTML={{ __html: '<p>' + previewHtml + '</p>' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ===================== IMAGES TAB =====================
function ImagesTab() {
  const [uploaded, setUploaded] = useState<Array<{ url: string; label: string }>>([])
  const [dragover, setDragover] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  function addFiles(files: FileList | null) {
    if (!files) return
    Array.from(files).forEach(file => {
      if (!file.type.startsWith('image/')) return
      const reader = new FileReader()
      reader.onload = e => {
        const url = e.target?.result as string
        setUploaded(prev => [...prev, { url, label: file.name.replace(/\.[^/.]+$/, '') }])
      }
      reader.readAsDataURL(file)
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Image Library</h2>
        <p className="text-sm text-slate-500">Upload images to use as featured images in your posts.</p>
      </div>

      <div
        className={`border-2 border-dashed rounded-xl p-10 text-center mb-6 cursor-pointer transition-all ${dragover ? 'border-teal-500 bg-teal-500/5' : 'border-white/10 hover:border-white/25'}`}
        onDragOver={e => { e.preventDefault(); setDragover(true) }}
        onDragLeave={() => setDragover(false)}
        onDrop={e => { e.preventDefault(); setDragover(false); addFiles(e.dataTransfer.files) }}
        onClick={() => inputRef.current?.click()}
      >
        <div className="text-4xl mb-3">🖼</div>
        <p className="text-sm text-slate-400">Drop images here or click to upload</p>
        <input ref={inputRef} type="file" multiple accept="image/*" className="hidden" onChange={e => addFiles(e.target.files)} />
      </div>

      {uploaded.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {uploaded.map((img, i) => (
            <div key={i} className="group relative aspect-square rounded-xl overflow-hidden border border-white/10 bg-white/5">
              <img src={img.url} alt={img.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(img.url).then(() => toast.success('URL copied!'))}
                  className="text-xs px-2 py-1 bg-white/20 rounded-lg text-white backdrop-blur-sm"
                >
                  Copy URL
                </button>
                <button onClick={() => setUploaded(prev => prev.filter((_, j) => j !== i))} className="text-xs text-red-400">Remove</button>
              </div>
              <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/70 text-xs text-white truncate">{img.label}</div>
            </div>
          ))}
        </div>
      )}

      {uploaded.length === 0 && (
        <div className="text-center py-8 text-slate-600 text-sm">No images uploaded yet</div>
      )}
    </div>
  )
}

// ===================== POSTS TAB =====================
function PostsTab({ onEdit }: { onEdit: (post: BlogPost) => void }) {
  const { activeBrand, drafts, deleteDraft, markPublished } = useBlog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [clusterView, setClusterView] = useState(false)
  const pc = activeBrand?.primaryColor || '#0d9488'

  const filtered = drafts.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  // Cluster by focus area
  const clusters: Record<string, BlogPost[]> = {}
  const unclustered: BlogPost[] = []
  if (clusterView && activeBrand) {
    filtered.forEach(post => {
      const matchArea = (activeBrand.focusAreas || []).find(a =>
        post.tags.toLowerCase().includes(a.replace(/-/g, ' ')) || post.tags.toLowerCase().includes(a)
      )
      if (matchArea) {
        if (!clusters[matchArea]) clusters[matchArea] = []
        clusters[matchArea].push(post)
      } else {
        unclustered.push(post)
      }
    })
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this draft?')) return
    try { await deleteDraft(id); toast.success('Deleted') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed') }
  }

  async function handlePublish(id: string) {
    try { await markPublished(id); toast.success('Marked as published!') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
  }

  function copySchema(post: BlogPost) {
    const schema = buildSchemaMarkup(post, activeBrand)
    const html = `<script type="application/ld+json">\n${schema}\n</script>`
    navigator.clipboard.writeText(html).then(() => toast.success('Schema copied!'))
  }

  function PostCard({ post }: { post: BlogPost }) {
    const geo = computeGeoScore(post, activeBrand)
    return (
      <div className="card hover:border-white/20 transition-all">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{post.title || 'Untitled'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">{post.status === 'published' ? `Published ${post.publishedDate}` : `Saved ${new Date(post.updatedAt).toLocaleDateString('en-AU')}`} · {post.wordCount} words</p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-slate-400'}`}>{post.status}</span>
            <GeoStars score={geo} />
          </div>
        </div>
        {post.tags && (
          <div className="flex flex-wrap gap-1 mb-3">
            {post.tags.split(',').slice(0, 4).map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">{t.trim()}</span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button onClick={() => onEdit(post)} className="btn btn-sm flex items-center gap-1"><PencilIcon className="w-3 h-3" /> Edit</button>
          {post.status !== 'published' && (
            <button onClick={() => handlePublish(post.id)} className="btn btn-sm flex items-center gap-1 text-green-400 border-green-500/30">
              <CheckIcon className="w-3 h-3" /> Publish
            </button>
          )}
          <button onClick={() => copySchema(post)} className="btn btn-sm flex items-center gap-1 text-slate-400" title="Copy Schema.org markup">
            <ClipboardDocumentIcon className="w-3 h-3" /> Schema
          </button>
          <button onClick={() => handleDelete(post.id)} className="btn btn-sm flex items-center gap-1 text-red-400 border-red-500/20 ml-auto">
            <TrashIcon className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">Blog Posts <span className="text-slate-500 text-base font-normal">({filtered.length})</span></h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input className="inp w-48 text-sm" placeholder="Search…" value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sel text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}>
            <option value="all">All</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </select>
          <button
            onClick={() => setClusterView(v => !v)}
            className={`btn btn-sm text-xs ${clusterView ? 'text-white' : 'text-slate-500'}`}
            style={clusterView ? { background: `${pc}20`, borderColor: `${pc}40`, color: pc } : {}}
          >
            Content Hub
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">📝</div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">No posts yet</h3>
          <p className="text-sm text-slate-500">{activeBrand ? 'Generate ideas and write your first post' : 'Create a brand first'}</p>
        </div>
      ) : clusterView && activeBrand ? (
        <div className="space-y-6">
          {Object.entries(clusters).map(([area, posts]) => (
            <div key={area}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: pc }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: pc }} />
                {FOCUS_AREA_LABELS[area] || area}
                <span className="text-slate-600 normal-case font-normal">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </div>
          ))}
          {unclustered.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-slate-500">Other</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unclustered.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  )
}

// ===================== MAIN PAGE =====================
export default function BlogEnginePage() {
  const { activeTab, setActiveTab } = useTab()
  const { activeBrand, loading, createBrand, updateBrand, deleteBrand } = useBlog()
  const [brandManagerOpen, setBrandManagerOpen] = useState(false)
  const [brandToEdit, setBrandToEdit] = useState<BlogBrand | null>(null)
  const [writerInit, setWriterInit] = useState<{ title: string; tags: string } | null>(null)

  const pc = activeBrand?.primaryColor || '#0d9488'

  function openBrandManager(brand: BlogBrand | null) {
    setBrandToEdit(brand)
    setBrandManagerOpen(true)
  }

  function handleSelectIdea(idea: IdeaItem) {
    setWriterInit({ title: idea.title, tags: idea.keywords?.join(', ') || '' })
    setActiveTab('writer')
  }

  function handleEditPost(post: BlogPost) {
    setWriterInit({ title: post.title, tags: post.tags })
    setActiveTab('writer')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: '#0d9488' }} />
          <p className="text-sm text-slate-500">Loading Blog Engine…</p>
        </div>
      </div>
    )
  }

  return (
    <div style={{ '--blog-pc': pc } as React.CSSProperties}>
      {/* Top toolbar */}
      <div className="border-b border-white/5 px-6 py-3 flex items-center gap-3 flex-wrap">
        <BrandSwitcher onManage={openBrandManager} />

        {/* Tab nav */}
        <div className="flex items-center gap-1 ml-auto">
          {[
            { id: 'ideas', label: '◇ Ideas' },
            { id: 'writer', label: '✎ Writer' },
            { id: 'images', label: '◻ Images' },
            { id: 'posts', label: '☰ Posts' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeTab === t.id ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              style={activeTab === t.id ? { background: `${pc}20`, color: pc } : {}}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {activeTab === 'ideas' && <IdeasTab onSelectIdea={handleSelectIdea} />}
      {activeTab === 'writer' && (
        <WriterTab
          key={writerInit ? `${writerInit.title}-${writerInit.tags}` : 'blank'}
          initialTitle={writerInit?.title || ''}
          initialTags={writerInit?.tags || ''}
        />
      )}
      {activeTab === 'images' && <ImagesTab />}
      {activeTab === 'posts' && <PostsTab onEdit={handleEditPost} />}

      {/* Brand manager modal */}
      {brandManagerOpen && (
        <BrandManagerModal
          brand={brandToEdit}
          onClose={() => setBrandManagerOpen(false)}
          onCreate={async (data) => { await createBrand(data) }}
          onUpdate={async (id, data) => { await updateBrand(id, data) }}
          onDelete={async (id) => { await deleteBrand(id) }}
        />
      )}
    </div>
  )
}
