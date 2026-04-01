'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import toast from 'react-hot-toast'
import type { WorkspaceBrand, BrandReport, BrandGoal } from '@/lib/types'
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
  DocumentTextIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  XMarkIcon,
  BuildingStorefrontIcon,
  FlagIcon,
  CalendarDaysIcon,
} from '@heroicons/react/16/solid'

const TONES = ['professional', 'casual', 'playful', 'luxury', 'inspirational', 'friendly'] as const
const LENGTHS = ['short', 'medium', 'long'] as const
const RESEARCH_TYPES = [
  { value: 'market', label: 'Market Research', desc: 'Industry analysis, market size, trends' },
  { value: 'competitor', label: 'Competitor Analysis', desc: 'Competitive landscape, SWOT' },
  { value: 'audience', label: 'Audience Research', desc: 'Personas, motivations, pain points' },
  { value: 'voice', label: 'Brand Voice Guide', desc: 'Tone, style, writing guidelines' },
] as const
const REPORT_TYPE_LABELS: Record<string, string> = {
  ai_research: 'AI Research', competitor: 'Competitor', audience: 'Audience',
  market: 'Market', manual: 'Manual',
}

const EMPTY_BRAND: Partial<WorkspaceBrand> = {
  name: '', tagline: '', businessName: '', industry: '', location: '', website: '',
  primaryColor: '#8b5cf6', logoUrl: '', authorName: '', blogPath: '/blog',
  brandVoice: '', postingInstructions: '', defaultAspectRatio: '', tone: 'professional', outputLength: 'medium', focusAreas: [],
  includeHashtags: true, includeEmojis: false, socialHandles: {},
  platforms: [], bufferChannels: [], mission: '', values: '',
  targetAudience: '', uniqueValueProp: '', competitors: '', keyMessages: [],
}

// ─── Brand Form Modal ───────────────────────────────────────────────────────

function BrandForm({
  initial,
  onSave,
  onClose,
}: {
  initial: Partial<WorkspaceBrand>
  onSave: (data: Partial<WorkspaceBrand>) => Promise<void>
  onClose: () => void
}) {
  const [form, setForm] = useState<Partial<WorkspaceBrand>>({ ...EMPTY_BRAND, ...initial })
  const [tab, setTab] = useState<'overview' | 'voice' | 'research'>('overview')
  const [saving, setSaving] = useState(false)
  const [autofilling, setAutofilling] = useState(false)

  function set(k: keyof WorkspaceBrand, v: unknown) {
    setForm(f => ({ ...f, [k]: v }))
  }

  async function handleAutofill() {
    if (!form.website) { toast.error('Enter a website URL first'); return }
    setAutofilling(true)
    try {
      const res = await fetch('/api/brands/autofill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ website: form.website }),
      })
      if (!res.ok) { const e = await res.json(); throw new Error(e.error); }
      const data = await res.json()
      setForm(f => ({ ...f, ...data }))
      toast.success('Brand info auto-filled from website')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Autofill failed')
    } finally {
      setAutofilling(false)
    }
  }

  async function handleSave() {
    if (!form.name?.trim()) { toast.error('Brand name required'); return }
    setSaving(true)
    try {
      await onSave(form)
      onClose()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const TABS = [
    { id: 'overview', label: 'Overview' },
    { id: 'voice', label: 'Voice & Tone' },
    { id: 'research', label: 'Research Fields' },
  ] as const

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal-box max-w-2xl" onClick={e => e.stopPropagation()} style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[#e6e1e1] text-lg">{form.id ? 'Edit Brand' : 'New Brand'}</h2>
          <button onClick={onClose} className="text-[#6b7280] hover:text-[#e6e1e1]"><XMarkIcon className="w-5 h-5" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-5 bg-[#1c1b1b] rounded-lg p-1">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex-1 py-1.5 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'text-[#c4b5fd]' : 'text-[#6b7280] hover:text-[#e6e1e1]'}`}
              style={tab === t.id ? { background: 'rgba(139,92,246,0.2)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-4">
            <div>
              <label className="lbl">Website</label>
              <div className="flex gap-2">
                <input className="inp flex-1" value={form.website || ''} onChange={e => set('website', e.target.value)} placeholder="https://yourbrand.com" />
                <button className="btn btn-o flex-shrink-0 flex items-center gap-1.5" onClick={handleAutofill} disabled={autofilling}>
                  {autofilling ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Filling...</> : <><GlobeAltIcon className="w-4 h-4" /> Auto-fill</>}
                </button>
              </div>
              <p className="text-xs text-[#6b7280] mt-1">Paste your URL and click Auto-fill to populate the fields below automatically</p>
            </div>
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="lbl">Brand Name *</label>
                <input className="inp" value={form.name || ''} onChange={e => set('name', e.target.value)} placeholder="e.g. Geekly" />
              </div>
              <div>
                <label className="lbl">Colour</label>
                <input type="color" value={form.primaryColor || '#8b5cf6'} onChange={e => set('primaryColor', e.target.value)}
                  className="w-12 h-9 rounded cursor-pointer border border-[rgba(90,64,66,0.4)] bg-[#211f1f]" />
              </div>
            </div>
            <div>
              <label className="lbl">Tagline</label>
              <input className="inp" value={form.tagline || ''} onChange={e => set('tagline', e.target.value)} placeholder="Your brand tagline" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="lbl">Business / Trading Name</label>
                <input className="inp" value={form.businessName || ''} onChange={e => set('businessName', e.target.value)} />
              </div>
              <div>
                <label className="lbl">Industry</label>
                <input className="inp" value={form.industry || ''} onChange={e => set('industry', e.target.value)} placeholder="e.g. IT Services" />
              </div>
            </div>
            <div>
              <label className="lbl">Location</label>
              <input className="inp" value={form.location || ''} onChange={e => set('location', e.target.value)} placeholder="City, State" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="lbl">Author Name (blog)</label>
                <input className="inp" value={form.authorName || ''} onChange={e => set('authorName', e.target.value)} />
              </div>
              <div>
                <label className="lbl">Blog Path</label>
                <input className="inp" value={form.blogPath || '/blog'} onChange={e => set('blogPath', e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="lbl">Tone</label>
                <select className="sel" value={form.tone || 'professional'} onChange={e => set('tone', e.target.value)}>
                  {TONES.map(t => <option key={t} value={t} className="capitalize">{t}</option>)}
                </select>
              </div>
              <div>
                <label className="lbl">Output Length</label>
                <select className="sel" value={form.outputLength || 'medium'} onChange={e => set('outputLength', e.target.value)}>
                  {LENGTHS.map(l => <option key={l} value={l} className="capitalize">{l}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="lbl">Default Post Aspect Ratio</label>
              <select className="sel" value={form.defaultAspectRatio || ''} onChange={e => set('defaultAspectRatio', e.target.value)}>
                <option value="">No default</option>
                <option value="1/1">Square (1:1) — Instagram feed</option>
                <option value="4/5">Portrait (4:5) — Instagram portrait</option>
                <option value="9/16">Story (9:16) — Instagram/Facebook Stories</option>
                <option value="16/9">Landscape (16:9) — Facebook/LinkedIn</option>
              </select>
              <p className="text-xs text-[#6b7280] mt-1">Auto-selected when creating posts for this brand.</p>
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <span className="text-sm text-[#e6e1e1]">Hashtags</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={form.includeHashtags ?? true} onChange={e => set('includeHashtags', e.target.checked)} />
                  <div className="w-10 h-5 rounded-full bg-[#2a2a2a] peer-checked:bg-[#8b5cf6] transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <span className="text-sm text-[#e6e1e1]">Emojis</span>
                <div className="relative">
                  <input type="checkbox" className="sr-only peer" checked={form.includeEmojis ?? false} onChange={e => set('includeEmojis', e.target.checked)} />
                  <div className="w-10 h-5 rounded-full bg-[#2a2a2a] peer-checked:bg-[#8b5cf6] transition-colors" />
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow peer-checked:translate-x-5 transition-transform" />
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Voice & Tone Tab */}
        {tab === 'voice' && (
          <div className="space-y-4">
            <div>
              <label className="lbl">Brand Voice Guidelines</label>
              <textarea className="ta" rows={4} value={form.brandVoice || ''} onChange={e => set('brandVoice', e.target.value)}
                placeholder="Describe your brand's writing style, personality, and communication approach..." />
            </div>
            <div>
              <label className="lbl">Custom Posting Instructions</label>
              <textarea className="ta" rows={4} value={form.postingInstructions || ''} onChange={e => set('postingInstructions', e.target.value)}
                placeholder="e.g. Always end with a call to action. Mention our website. Never use competitor names. Use formal English only." />
              <p className="text-xs text-[#6b7280] mt-1">These instructions are included in every AI-generated caption for this brand.</p>
            </div>
            <div>
              <label className="lbl">Key Messages</label>
              <textarea className="ta" rows={3} value={(form.keyMessages || []).join('\n')}
                onChange={e => set('keyMessages', e.target.value.split('\n').filter(Boolean))}
                placeholder="One key message per line..." />
            </div>
            <div>
              <label className="lbl">Focus Areas (blog topics, one per line)</label>
              <textarea className="ta" rows={3} value={(form.focusAreas || []).join('\n')}
                onChange={e => set('focusAreas', e.target.value.split('\n').filter(Boolean))}
                placeholder="e.g. repair-tips&#10;tech-education&#10;local-community" />
            </div>
          </div>
        )}

        {/* Research Fields Tab */}
        {tab === 'research' && (
          <div className="space-y-4">
            <div>
              <label className="lbl">Mission</label>
              <textarea className="ta" rows={2} value={form.mission || ''} onChange={e => set('mission', e.target.value)} placeholder="What is this brand's purpose?" />
            </div>
            <div>
              <label className="lbl">Values</label>
              <textarea className="ta" rows={2} value={form.values || ''} onChange={e => set('values', e.target.value)} placeholder="Core values and principles..." />
            </div>
            <div>
              <label className="lbl">Target Audience</label>
              <textarea className="ta" rows={2} value={form.targetAudience || ''} onChange={e => set('targetAudience', e.target.value)} placeholder="Who does this brand serve?" />
            </div>
            <div>
              <label className="lbl">Unique Value Proposition</label>
              <textarea className="ta" rows={2} value={form.uniqueValueProp || ''} onChange={e => set('uniqueValueProp', e.target.value)} placeholder="What makes this brand different?" />
            </div>
            <div>
              <label className="lbl">Competitors</label>
              <textarea className="ta" rows={2} value={form.competitors || ''} onChange={e => set('competitors', e.target.value)} placeholder="Known competitors (names, websites)..." />
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button className="btn btn-o" onClick={onClose}>Cancel</button>
          <button className="btn text-white" style={{ background: '#8b5cf6' }} onClick={handleSave} disabled={saving}>
            {saving ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Brand'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Brand Detail Panel ──────────────────────────────────────────────────────

function BrandDetail({
  brand,
  onEdit,
  onDelete,
}: {
  brand: WorkspaceBrand
  onEdit: () => void
  onDelete: () => void
}) {
  const [tab, setTab] = useState<'guidelines' | 'research' | 'goals' | 'reports'>('guidelines')
  const [reports, setReports] = useState<BrandReport[]>([])
  const [researchType, setResearchType] = useState<'market' | 'competitor' | 'audience' | 'voice'>('market')
  const [generating, setGenerating] = useState(false)
  const [streamedContent, setStreamedContent] = useState('')
  const [savingReport, setSavingReport] = useState(false)
  const [viewingReport, setViewingReport] = useState<BrandReport | null>(null)
  const streamRef = useRef<AbortController | null>(null)

  // Goals state
  const [goals, setGoals] = useState<BrandGoal[]>([])
  const [showGoalForm, setShowGoalForm] = useState(false)
  const [goalPeriod, setGoalPeriod] = useState<BrandGoal['period']>('monthly')
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDesc, setGoalDesc] = useState('')
  const [goalStart, setGoalStart] = useState('')
  const [goalEnd, setGoalEnd] = useState('')
  const [savingGoal, setSavingGoal] = useState(false)

  const loadReports = useCallback(async () => {
    const res = await fetch(`/api/brands/reports?brandId=${brand.id}`)
    if (res.ok) setReports(await res.json())
  }, [brand.id])

  const loadGoals = useCallback(async () => {
    const res = await fetch(`/api/brands/goals?brandId=${brand.id}`)
    if (res.ok) setGoals(await res.json())
  }, [brand.id])

  useEffect(() => { loadGoals() }, [loadGoals])

  function autofillDates(period: BrandGoal['period']) {
    const now = new Date()
    let start: Date, end: Date
    switch (period) {
      case 'weekly': {
        const day = now.getDay()
        start = new Date(now); start.setDate(now.getDate() - (day === 0 ? 6 : day - 1))
        end = new Date(start); end.setDate(start.getDate() + 6)
        break
      }
      case 'monthly':
        start = new Date(now.getFullYear(), now.getMonth(), 1)
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        break
      case 'quarterly': {
        const q = Math.floor(now.getMonth() / 3)
        start = new Date(now.getFullYear(), q * 3, 1)
        end = new Date(now.getFullYear(), q * 3 + 3, 0)
        break
      }
      case 'yearly':
        start = new Date(now.getFullYear(), 0, 1)
        end = new Date(now.getFullYear(), 11, 31)
        break
    }
    setGoalStart(start.toISOString().slice(0, 10))
    setGoalEnd(end.toISOString().slice(0, 10))
  }

  async function saveGoal() {
    if (!goalTitle.trim() || !goalStart || !goalEnd) { toast.error('Fill in title and dates'); return }
    setSavingGoal(true)
    try {
      const res = await fetch('/api/brands/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, title: goalTitle, description: goalDesc, period: goalPeriod, startDate: goalStart, endDate: goalEnd }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Goal saved')
      setShowGoalForm(false)
      setGoalTitle(''); setGoalDesc(''); setGoalStart(''); setGoalEnd('')
      loadGoals()
    } catch { toast.error('Failed to save goal') }
    finally { setSavingGoal(false) }
  }

  async function toggleGoalActive(id: string, isActive: boolean) {
    await fetch('/api/brands/goals', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, isActive }) })
    loadGoals()
  }

  async function deleteGoal(id: string) {
    await fetch(`/api/brands/goals?id=${id}`, { method: 'DELETE' })
    loadGoals()
    toast.success('Goal deleted')
  }

  useEffect(() => {
    if (tab === 'reports') loadReports()
  }, [tab, loadReports])

  async function generateResearch() {
    if (generating) {
      streamRef.current?.abort()
      setGenerating(false)
      return
    }
    setStreamedContent('')
    setGenerating(true)
    const ctrl = new AbortController()
    streamRef.current = ctrl
    try {
      const res = await fetch('/api/brands/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: brand.id, researchType }),
        signal: ctrl.signal,
      })
      if (!res.ok) {
        const contentType = res.headers.get('content-type') || ''
        if (contentType.includes('application/json')) {
          const e = await res.json()
          throw new Error(e.error || 'Request failed')
        }
        throw new Error('Request failed')
      }
      const reader = res.body!.getReader()
      const decoder = new TextDecoder()
      let buf = ''
      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          buf += decoder.decode(value, { stream: true })
          const lines = buf.split('\n')
          buf = lines.pop() || ''
          for (const line of lines) {
            if (!line.startsWith('data:')) continue
            const raw = line.slice(5).trim()
            if (raw === '[DONE]') break
            try {
              const ev = JSON.parse(raw)
              if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta') {
                setStreamedContent(prev => prev + ev.delta.text)
              }
            } catch { /* skip */ }
          }
        }
      } catch {
        // Stream closed — content received so far is still valid
      }
    } catch (e) {
      if ((e as Error).name !== 'AbortError') toast.error((e as Error).message || 'Research generation failed')
    } finally {
      setGenerating(false)
    }
  }

  async function saveReport() {
    if (!streamedContent.trim()) return
    setSavingReport(true)
    try {
      const typeLabel = RESEARCH_TYPES.find(r => r.value === researchType)?.label || 'Research'
      const res = await fetch('/api/brands/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandId: brand.id,
          title: `${typeLabel} — ${brand.name}`,
          reportType: researchType === 'voice' ? 'ai_research' : researchType,
          content: streamedContent,
          summary: streamedContent.slice(0, 200) + '...',
        }),
      })
      if (!res.ok) throw new Error('Failed to save')
      toast.success('Report saved')
      setStreamedContent('')
      if (tab === 'reports') loadReports()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Save failed')
    } finally {
      setSavingReport(false)
    }
  }

  async function deleteReport(id: string) {
    await fetch(`/api/brands/reports?id=${id}`, { method: 'DELETE' })
    setReports(prev => prev.filter(r => r.id !== id))
    if (viewingReport?.id === id) setViewingReport(null)
  }

  const pc = brand.primaryColor || '#8b5cf6'

  return (
    <div className="flex flex-col h-full">
      {/* Brand header */}
      <div className="p-5 border-b" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex-shrink-0" style={{ background: pc }} />
            <div>
              <h2 className="font-bold text-[#e6e1e1] text-lg leading-tight">{brand.name}</h2>
              {brand.tagline && <p className="text-sm text-[#9ca3af]">{brand.tagline}</p>}
              {brand.industry && <p className="text-xs text-[#6b7280]">{brand.industry}{brand.location ? ` · ${brand.location}` : ''}</p>}
            </div>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <button className="btn btn-o btn-sm" onClick={onEdit}><PencilSquareIcon className="w-3.5 h-3.5" />Edit</button>
            <button className="btn btn-d btn-sm" onClick={onDelete}><TrashIcon className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {/* Detail tabs */}
        <div className="flex gap-1 mt-4 bg-[#1c1b1b] rounded-lg p-1">
          {(['guidelines', 'research', 'goals', 'reports'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`flex-1 py-1.5 rounded-md text-xs font-medium capitalize transition-colors ${
                tab === t ? 'text-[#c4b5fd]' : 'text-[#6b7280] hover:text-[#e6e1e1]'
              }`}
              style={tab === t ? { background: 'rgba(139,92,246,0.2)' } : {}}>
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">

        {/* Guidelines Tab */}
        {tab === 'guidelines' && (
          <div className="space-y-5">
            {brand.mission && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Mission</p>
                <p className="text-sm text-[#e6e1e1] leading-relaxed">{brand.mission}</p>
              </div>
            )}
            {brand.values && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Values</p>
                <p className="text-sm text-[#e6e1e1] leading-relaxed">{brand.values}</p>
              </div>
            )}
            {brand.targetAudience && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Target Audience</p>
                <p className="text-sm text-[#e6e1e1] leading-relaxed">{brand.targetAudience}</p>
              </div>
            )}
            {brand.uniqueValueProp && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Unique Value</p>
                <p className="text-sm text-[#e6e1e1] leading-relaxed">{brand.uniqueValueProp}</p>
              </div>
            )}
            {brand.brandVoice && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Brand Voice</p>
                <p className="text-sm text-[#e6e1e1] leading-relaxed whitespace-pre-wrap">{brand.brandVoice}</p>
              </div>
            )}
            {brand.keyMessages.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-1">Key Messages</p>
                <ul className="space-y-1">
                  {brand.keyMessages.map((m, i) => (
                    <li key={i} className="text-sm text-[#e6e1e1] flex items-start gap-2">
                      <span className="text-[#8b5cf6] mt-0.5">›</span>{m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <button
              className="btn btn-o btn-sm w-full"
              onClick={() => {
                const text = [
                  brand.name, brand.tagline,
                  brand.mission && `Mission: ${brand.mission}`,
                  brand.values && `Values: ${brand.values}`,
                  brand.targetAudience && `Audience: ${brand.targetAudience}`,
                  brand.brandVoice && `Brand Voice:\n${brand.brandVoice}`,
                  brand.keyMessages.length && `Key Messages:\n${brand.keyMessages.join('\n')}`,
                ].filter(Boolean).join('\n\n')
                navigator.clipboard.writeText(text)
                toast.success('Brand guidelines copied')
              }}
            >
              <ClipboardDocumentIcon className="w-4 h-4" />
              Copy guidelines to clipboard
            </button>
          </div>
        )}

        {/* AI Research Tab */}
        {tab === 'research' && (
          <div className="space-y-4">
            <div>
              <label className="lbl">Research Type</label>
              <div className="grid grid-cols-2 gap-2">
                {RESEARCH_TYPES.map(rt => (
                  <button
                    key={rt.value}
                    onClick={() => setResearchType(rt.value)}
                    className={`text-left p-3 rounded-lg border text-sm transition-all ${
                      researchType === rt.value
                        ? 'border-[#8b5cf6] bg-[rgba(139,92,246,0.1)] text-[#c4b5fd]'
                        : 'border-[rgba(90,64,66,0.3)] text-[#9ca3af] hover:border-[rgba(139,92,246,0.4)]'
                    }`}
                  >
                    <div className="font-medium">{rt.label}</div>
                    <div className="text-xs opacity-70 mt-0.5">{rt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            <button
              className="btn w-full text-white"
              style={{ background: generating ? '#6b7280' : '#8b5cf6' }}
              onClick={generateResearch}
            >
              {generating
                ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Stop Generating</>
                : <><SparklesIcon className="w-4 h-4" /> Generate Research</>
              }
            </button>

            {streamedContent && (
              <div>
                <div className="bg-[#1c1b1b] border border-[rgba(139,92,246,0.2)] rounded-xl p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-[#e6e1e1] whitespace-pre-wrap font-sans leading-relaxed">{streamedContent}</pre>
                </div>
                <div className="flex gap-2 mt-2">
                  <button className="btn btn-o btn-sm flex-1" onClick={() => { navigator.clipboard.writeText(streamedContent); toast.success('Copied') }}>
                    <ClipboardDocumentIcon className="w-4 h-4" />Copy
                  </button>
                  <button
                    className="btn btn-sm flex-1 text-white"
                    style={{ background: '#8b5cf6' }}
                    onClick={saveReport}
                    disabled={savingReport}
                  >
                    {savingReport ? <><ArrowPathIcon className="w-4 h-4 animate-spin" />Saving...</> : <><DocumentTextIcon className="w-4 h-4" />Save as Report</>}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Goals Tab */}
        {tab === 'goals' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-[#9ca3af]">Set goals/focuses that guide AI content generation</p>
              <button className="btn btn-o btn-sm flex items-center gap-1" onClick={() => { setShowGoalForm(true); autofillDates('monthly') }}>
                <PlusIcon className="w-3.5 h-3.5" /> Add Goal
              </button>
            </div>

            {showGoalForm && (
              <div className="card p-4 space-y-3" style={{ borderColor: 'rgba(139,92,246,0.3)' }}>
                <div>
                  <label className="text-xs font-medium text-[#9ca3af] mb-1 block">Period</label>
                  <div className="flex gap-1.5">
                    {(['weekly', 'monthly', 'quarterly', 'yearly'] as const).map(p => (
                      <button key={p} onClick={() => { setGoalPeriod(p); autofillDates(p) }}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors capitalize ${goalPeriod === p ? 'bg-[#8b5cf6] text-white' : 'bg-[#1c1b1b] text-[#6b7280] hover:text-[#e6e1e1]'}`}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-[#9ca3af] mb-1 block">Title</label>
                  <input className="inp" placeholder="e.g. Easter Campaign, Grow Instagram..." value={goalTitle} onChange={e => setGoalTitle(e.target.value)} autoFocus />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#9ca3af] mb-1 block">Description (optional)</label>
                  <textarea className="ta" rows={2} placeholder="What should content focus on during this period?" value={goalDesc} onChange={e => setGoalDesc(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">Start</label>
                    <input type="date" className="inp" value={goalStart} onChange={e => setGoalStart(e.target.value)} />
                  </div>
                  <div>
                    <label className="text-xs text-[#9ca3af] mb-1 block">End</label>
                    <input type="date" className="inp" value={goalEnd} onChange={e => setGoalEnd(e.target.value)} />
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button className="btn btn-o btn-sm" onClick={() => setShowGoalForm(false)}>Cancel</button>
                  <button className="btn btn-sm text-white flex items-center gap-1" style={{ background: '#8b5cf6' }} disabled={savingGoal} onClick={saveGoal}>
                    {savingGoal ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <FlagIcon className="w-3.5 h-3.5" />} Save Goal
                  </button>
                </div>
              </div>
            )}

            {goals.length === 0 && !showGoalForm ? (
              <div className="text-center py-10 text-[#6b7280]">
                <FlagIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No goals set</p>
                <p className="text-xs mt-1">Add goals to guide your AI content generation</p>
              </div>
            ) : (
              (['yearly', 'quarterly', 'monthly', 'weekly'] as const).map(period => {
                const periodGoals = goals.filter(g => g.period === period)
                if (periodGoals.length === 0) return null
                const today = new Date().toISOString().slice(0, 10)
                return (
                  <div key={period}>
                    <p className="text-xs font-semibold text-[#8b5cf6] uppercase tracking-wide mb-2 flex items-center gap-1">
                      <CalendarDaysIcon className="w-3.5 h-3.5" /> {period}
                    </p>
                    <div className="space-y-2">
                      {periodGoals.map(g => {
                        const isCurrentlyActive = g.isActive && g.startDate <= today && g.endDate >= today
                        const isExpired = g.endDate < today
                        return (
                          <div key={g.id}
                            className={`card p-3 transition-colors ${isCurrentlyActive ? 'border-emerald-500/40' : isExpired ? 'opacity-50' : ''}`}
                            style={isCurrentlyActive ? { borderColor: 'rgba(16,185,129,0.4)' } : {}}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  <p className="text-sm font-medium text-[#e6e1e1]">{g.title}</p>
                                  {isCurrentlyActive && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">Active</span>}
                                  {isExpired && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#2b2a29] text-[#6b7280]">Expired</span>}
                                  {!g.isActive && !isExpired && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400">Paused</span>}
                                </div>
                                {g.description && <p className="text-xs text-[#9ca3af] mb-1">{g.description}</p>}
                                <p className="text-[10px] text-[#6b7280]">
                                  {new Date(g.startDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} — {new Date(g.endDate).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </p>
                              </div>
                              <div className="flex gap-1 flex-shrink-0">
                                <button onClick={() => toggleGoalActive(g.id, !g.isActive)}
                                  className={`btn btn-sm ${g.isActive ? 'btn-o' : 'text-white'}`}
                                  style={!g.isActive ? { background: '#8b5cf6' } : {}}
                                  title={g.isActive ? 'Pause' : 'Activate'}>
                                  {g.isActive ? '⏸' : '▶'}
                                </button>
                                <button onClick={() => deleteGoal(g.id)} className="btn btn-d btn-sm">
                                  <TrashIcon className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Reports Tab */}
        {tab === 'reports' && (
          <div className="space-y-3">
            {viewingReport ? (
              <>
                <div className="flex items-center gap-2 mb-3">
                  <button className="btn btn-o btn-sm" onClick={() => setViewingReport(null)}>← Back</button>
                  <span className="text-sm font-medium text-[#e6e1e1] flex-1">{viewingReport.title}</span>
                  <button className="btn btn-d btn-sm" onClick={() => deleteReport(viewingReport.id)}><TrashIcon className="w-3.5 h-3.5" /></button>
                </div>
                <div className="bg-[#1c1b1b] border border-[rgba(139,92,246,0.15)] rounded-xl p-4 max-h-[60vh] overflow-auto">
                  <pre className="text-sm text-[#e6e1e1] whitespace-pre-wrap font-sans leading-relaxed">{viewingReport.content}</pre>
                </div>
                <button className="btn btn-o btn-sm w-full" onClick={() => { navigator.clipboard.writeText(viewingReport.content); toast.success('Copied') }}>
                  <ClipboardDocumentIcon className="w-4 h-4" />Copy Report
                </button>
              </>
            ) : reports.length === 0 ? (
              <div className="text-center py-10 text-[#6b7280]">
                <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No reports yet</p>
                <p className="text-xs mt-1">Use AI Research to generate your first report</p>
              </div>
            ) : (
              reports.map(r => (
                <div key={r.id}
                  className="card p-4 cursor-pointer hover:border-[rgba(139,92,246,0.4)] transition-colors"
                  onClick={() => setViewingReport(r)}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#e6e1e1] truncate">{r.title}</p>
                      <p className="text-xs text-[#6b7280] mt-0.5">
                        {REPORT_TYPE_LABELS[r.reportType] || r.reportType} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <button className="btn-d rounded p-1 flex-shrink-0"
                      onClick={e => { e.stopPropagation(); deleteReport(r.id) }}>
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {r.summary && <p className="text-xs text-[#9ca3af] mt-2 line-clamp-2">{r.summary}</p>}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function BrandResearchPage() {
  const [brands, setBrands] = useState<WorkspaceBrand[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBrand, setSelectedBrand] = useState<WorkspaceBrand | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Partial<WorkspaceBrand> | null>(null)

  async function loadBrands() {
    setLoading(true)
    const res = await fetch('/api/brands')
    if (res.ok) setBrands(await res.json())
    setLoading(false)
  }

  useEffect(() => { loadBrands() }, [])

  async function handleSave(data: Partial<WorkspaceBrand>) {
    const isUpdate = !!data.id
    const res = await fetch('/api/brands', {
      method: isUpdate ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!res.ok) { const e = await res.json(); throw new Error(e.error) }
    const saved: WorkspaceBrand = await res.json()
    if (isUpdate) {
      setBrands(prev => prev.map(b => b.id === saved.id ? saved : b))
      if (selectedBrand?.id === saved.id) setSelectedBrand(saved)
    } else {
      setBrands(prev => [...prev, saved])
      setSelectedBrand(saved)
    }
    toast.success(isUpdate ? 'Brand updated' : 'Brand created')
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this brand? This will also delete all its reports.')) return
    await fetch(`/api/brands?id=${id}`, { method: 'DELETE' })
    setBrands(prev => prev.filter(b => b.id !== id))
    if (selectedBrand?.id === id) setSelectedBrand(null)
    toast.success('Brand deleted')
  }

  return (
    <div className="flex h-[calc(100vh-48px)]">
      {/* Brand list */}
      <div className="w-72 flex-shrink-0 flex flex-col border-r" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
        <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(139,92,246,0.15)' }}>
          <h2 className="font-semibold text-[#e6e1e1]">Brands</h2>
          <button
            className="btn btn-sm text-white flex items-center gap-1"
            style={{ background: '#8b5cf6' }}
            onClick={() => { setEditingBrand({ ...EMPTY_BRAND }); setShowForm(true) }}
          >
            <PlusIcon className="w-3.5 h-3.5" />New
          </button>
        </div>

        <div className="flex-1 overflow-auto py-2 px-2">
          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3].map(i => <div key={i} className="skeleton h-16 rounded-xl" />)}
            </div>
          ) : brands.length === 0 ? (
            <div className="text-center py-10 text-[#6b7280]">
              <BuildingStorefrontIcon className="w-8 h-8 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No brands yet</p>
              <button
                className="mt-3 btn btn-sm text-white"
                style={{ background: '#8b5cf6' }}
                onClick={() => { setEditingBrand({ ...EMPTY_BRAND }); setShowForm(true) }}
              >
                Create your first brand
              </button>
            </div>
          ) : (
            brands.map(brand => (
              <button
                key={brand.id}
                className={`w-full text-left p-3 rounded-xl mb-1 transition-all ${
                  selectedBrand?.id === brand.id
                    ? 'bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.35)]'
                    : 'hover:bg-[rgba(139,92,246,0.08)] border border-transparent'
                }`}
                onClick={() => setSelectedBrand(brand)}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: brand.primaryColor || '#8b5cf6' }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#e6e1e1] truncate">{brand.name}</p>
                    {brand.industry && <p className="text-xs text-[#6b7280] truncate">{brand.industry}</p>}
                  </div>
                  <ChevronDownIcon className={`w-3.5 h-3.5 text-[#6b7280] transition-transform ${selectedBrand?.id === brand.id ? '-rotate-90' : '-rotate-0 opacity-0'}`} />
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Detail panel */}
      <div className="flex-1 overflow-hidden">
        {selectedBrand ? (
          <BrandDetail
            brand={selectedBrand}
            onEdit={() => { setEditingBrand(selectedBrand); setShowForm(true) }}
            onDelete={() => handleDelete(selectedBrand.id)}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-[#6b7280]">
            <div className="text-center">
              <BuildingStorefrontIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="text-sm">Select a brand to view details</p>
              <p className="text-xs mt-1">or create a new one to get started</p>
            </div>
          </div>
        )}
      </div>

      {/* Brand form modal */}
      {showForm && editingBrand && (
        <BrandForm
          initial={editingBrand}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditingBrand(null) }}
        />
      )}
    </div>
  )
}
