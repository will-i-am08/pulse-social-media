'use client'

import { useState } from 'react'
import { useBlog } from '@/context/BlogContext'
import { BlogBrand, FOCUS_AREA_LABELS } from '@/lib/types'
import toast from 'react-hot-toast'
import {
  ChevronDownIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/16/solid'

// ===================== TYPES =====================
export interface BrandFormData {
  name: string; tagline: string; businessName: string; location: string
  website: string; industry: string; primaryColor: string; brandVoice: string
  focusAreas: string[]; authorName: string; blogPath: string
}

// ===================== CONSTANTS =====================
export const ALL_FOCUS_AREAS = Object.keys(FOCUS_AREA_LABELS)

export const GEEKLY_VOICE = `Warm, approachable, knowledgeable, and locally grounded — like a friendly neighbour who happens to be a tech expert.
Plain, jargon-free language. Technical concepts explained simply.
Confident but not arrogant — back claims with proof (reviews, warranty, track record) but frame through helping, not boasting.
Community-focused with strong local identity.
Transparent and honest — no hidden fees, published pricing.
Friendly and casual — conversational register, natural tone.
Educational — share helpful tips, position as teachers not just technicians.
Direct and action-oriented — clear low-friction CTAs: "Walk-ins welcome", "Pop in anytime!".

MUST AVOID: Tech jargon without explanation, aggressive sales language, urgency tactics, corporate formality.`

// ===================== BRAND MANAGER MODAL =====================
interface BrandManagerProps {
  brand: BlogBrand | null
  onClose: () => void
  onCreate: (data: BrandFormData) => Promise<void>
  onUpdate: (id: string, data: BrandFormData) => Promise<void>
  onDelete: (id: string) => Promise<void>
}

export function BrandManagerModal({ brand, onClose, onCreate, onUpdate, onDelete }: BrandManagerProps) {
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
              {saving ? 'Saving...' : brand ? 'Save Changes' : 'Create Brand'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ===================== BRAND SWITCHER =====================
export function BrandSwitcher({ onManage }: { onManage: (brand: BlogBrand | null) => void }) {
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
