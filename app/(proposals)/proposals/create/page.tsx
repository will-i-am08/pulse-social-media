'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import type { ProposalSection } from '@/lib/proposals/types'
import {
  SparklesIcon,
  ArrowPathIcon,
  CheckIcon,
  TrashIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
  DocumentTextIcon,
  DocumentDuplicateIcon,
} from '@heroicons/react/16/solid'

interface Brand { id: string; name: string }

function uid() { return Math.random().toString(36).slice(2, 10) }

export default function CreateProposalPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialType = searchParams.get('type') || 'proposal'
  const templateId = searchParams.get('template')

  const [step, setStep] = useState(templateId ? 2 : 1)
  const [docType, setDocType] = useState<'proposal' | 'contract'>(initialType as 'proposal' | 'contract')
  const [brands, setBrands] = useState<Brand[]>([])

  // Form fields
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [brandId, setBrandId] = useState('')
  const [services, setServices] = useState('')
  const [pricing, setPricing] = useState('')
  const [terms, setTerms] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [renewalDate, setRenewalDate] = useState('')
  const [totalValue, setTotalValue] = useState(0)
  const [customInstructions, setCustomInstructions] = useState('')
  const [title, setTitle] = useState('')

  // Generated content
  const [sections, setSections] = useState<ProposalSection[]>([])
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function loadBrands() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data } = await sb.from('workspace_brands').select('id, name').eq('user_id', user.id)
      if (data) setBrands(data)
    }
    loadBrands()
  }, [])

  useEffect(() => {
    if (!templateId) return
    async function loadTemplate() {
      const res = await fetch(`/api/proposals/${templateId}`)
      if (!res.ok) return
      const data = await res.json()
      setTitle(`Copy of ${data.title}`)
      setSections(data.content || [])
      setDocType(data.type === 'template' ? 'proposal' : data.type)
      setStep(4)
    }
    loadTemplate()
  }, [templateId])

  async function generate() {
    setGenerating(true)
    try {
      const res = await fetch('/api/proposals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: docType, clientName, services, pricing, terms, startDate, endDate, renewalDate, brandId, customInstructions }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Generation failed')
      setSections(data.sections || [])
      if (!title) setTitle(`${docType === 'contract' ? 'Contract' : 'Proposal'} — ${clientName || 'Client'}`)
      setStep(4)
      toast.success('Document generated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setGenerating(false)
    }
  }

  function updateSection(index: number, updates: Partial<ProposalSection>) {
    setSections(prev => prev.map((s, i) => i === index ? { ...s, ...updates } : s))
  }

  function removeSection(index: number) {
    setSections(prev => prev.filter((_, i) => i !== index))
  }

  function moveSection(index: number, dir: -1 | 1) {
    const arr = [...sections]
    const target = index + dir
    if (target < 0 || target >= arr.length) return
    ;[arr[index], arr[target]] = [arr[target], arr[index]]
    setSections(arr)
  }

  function addSection() {
    setSections([...sections, { id: uid(), type: 'text', title: 'New Section', content: '' }])
  }

  async function save(asTemplate = false) {
    if (!title.trim()) { toast.error('Add a title'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          type: asTemplate ? 'template' : docType,
          clientName,
          clientEmail,
          brandId: brandId || null,
          content: sections,
          status: 'draft',
          startDate: startDate || null,
          endDate: endDate || null,
          renewalDate: renewalDate || null,
          totalValue,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Save failed')
      toast.success(asTemplate ? 'Template saved!' : 'Document saved!')
      router.push(asTemplate ? '/proposals/templates' : `/proposals/${data.id}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setSaving(false)
    }
  }

  const inputCls = "w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-white px-4 py-2.5 outline-none text-sm"
  const labelCls = "text-xs text-slate-500 block mb-1"

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-1">
        {step === 4 ? 'Review & Edit' : 'Create Document'}
      </h1>
      <p className="text-slate-400 mb-8">
        {step === 1 && 'Choose what you want to create'}
        {step === 2 && 'Fill in the details'}
        {step === 3 && 'Generating with AI...'}
        {step === 4 && 'Edit sections before saving'}
      </p>

      {/* Step 1: Choose type */}
      {step === 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { type: 'proposal' as const, label: 'Service Proposal', desc: 'Pitch your services with scope, pricing, and timeline', icon: DocumentTextIcon },
            { type: 'contract' as const, label: 'Retainer Contract', desc: 'Monthly agreement with terms, deliverables, and renewal', icon: DocumentDuplicateIcon },
          ].map(opt => (
            <button
              key={opt.type}
              onClick={() => { setDocType(opt.type); setStep(2) }}
              className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-6 text-left hover:border-emerald-500/30 transition-colors"
            >
              <opt.icon className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="text-white font-semibold mb-1">{opt.label}</h3>
              <p className="text-xs text-slate-500">{opt.desc}</p>
            </button>
          ))}
        </div>
      )}

      {/* Step 2: Details form */}
      {step === 2 && (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>Document Title</label>
            <input className={inputCls} placeholder={`${docType === 'contract' ? 'Contract' : 'Proposal'} — Client Name`} value={title} onChange={e => setTitle(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Client Name *</label>
              <input className={inputCls} placeholder="Acme Corp" value={clientName} onChange={e => setClientName(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Client Email</label>
              <input className={inputCls} type="email" placeholder="client@example.com" value={clientEmail} onChange={e => setClientEmail(e.target.value)} />
            </div>
          </div>
          {brands.length > 0 && (
            <div>
              <label className={labelCls}>Brand (for styling & context)</label>
              <select className={inputCls} value={brandId} onChange={e => setBrandId(e.target.value)}>
                <option value="">Select a brand…</option>
                {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className={labelCls}>Services / Scope</label>
            <textarea className={inputCls + ' resize-none'} rows={3} placeholder="Describe the services you're offering…" value={services} onChange={e => setServices(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>Pricing / Budget</label>
              <input className={inputCls} placeholder="e.g. $5,000/month" value={pricing} onChange={e => setPricing(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>Total Value ($)</label>
              <input className={inputCls} type="number" min={0} value={totalValue || ''} onChange={e => setTotalValue(parseFloat(e.target.value) || 0)} />
            </div>
          </div>
          {docType === 'contract' && (
            <div>
              <label className={labelCls}>Payment Terms</label>
              <textarea className={inputCls + ' resize-none'} rows={2} placeholder="e.g. Net 30, monthly invoicing…" value={terms} onChange={e => setTerms(e.target.value)} />
            </div>
          )}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Start Date</label>
              <input className={inputCls} type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
            </div>
            <div>
              <label className={labelCls}>End Date</label>
              <input className={inputCls} type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
            </div>
            {docType === 'contract' && (
              <div>
                <label className={labelCls}>Renewal Date</label>
                <input className={inputCls} type="date" value={renewalDate} onChange={e => setRenewalDate(e.target.value)} />
              </div>
            )}
          </div>
          <div>
            <label className={labelCls}>Custom AI Instructions (optional)</label>
            <textarea className={inputCls + ' resize-none'} rows={2} placeholder="Any special requirements for the AI…" value={customInstructions} onChange={e => setCustomInstructions(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(1)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">Back</button>
            <button
              onClick={generate}
              disabled={generating || !clientName.trim()}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)', opacity: generating ? 0.7 : 1 }}
            >
              {generating ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
              {generating ? 'Generating…' : 'Generate with AI'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Generating spinner */}
      {step === 3 && (
        <div className="text-center py-20">
          <ArrowPathIcon className="w-10 h-10 animate-spin text-emerald-400 mx-auto mb-4" />
          <p className="text-slate-400">Generating your {docType}…</p>
        </div>
      )}

      {/* Step 4: Review & Edit */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="mb-6">
            <label className={labelCls}>Title</label>
            <input className={inputCls} value={title} onChange={e => setTitle(e.target.value)} />
          </div>

          {sections.map((section, i) => (
            <div key={section.id} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.12)] rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px] font-bold">{i + 1}</div>
                <input
                  className="flex-1 bg-transparent text-white font-semibold text-sm outline-none"
                  value={section.title}
                  onChange={e => updateSection(i, { title: e.target.value })}
                />
                <span className="text-[10px] text-slate-600 uppercase">{section.type}</span>
                <div className="flex gap-0.5">
                  {i > 0 && <button onClick={() => moveSection(i, -1)} className="p-1 text-slate-500 hover:text-slate-300"><ArrowUpIcon className="w-3 h-3" /></button>}
                  {i < sections.length - 1 && <button onClick={() => moveSection(i, 1)} className="p-1 text-slate-500 hover:text-slate-300"><ArrowDownIcon className="w-3 h-3" /></button>}
                  <button onClick={() => removeSection(i)} className="p-1 text-slate-500 hover:text-red-400"><TrashIcon className="w-3 h-3" /></button>
                </div>
              </div>
              <textarea
                className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none resize-none"
                rows={4}
                value={section.content}
                onChange={e => updateSection(i, { content: e.target.value })}
              />
              {section.items && section.items.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="text-[10px] text-slate-600 uppercase">Line Items</p>
                  {section.items.map((item, j) => (
                    <div key={j} className="flex gap-2 text-xs text-slate-400">
                      <span className="flex-1">{item.description}</span>
                      {item.quantity && <span>x{item.quantity}</span>}
                      {item.unitPrice && <span>${item.unitPrice}</span>}
                      <span className="font-medium text-white">${item.total}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={addSection}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-[rgba(16,185,129,0.2)] text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-colors text-sm"
          >
            <PlusIcon className="w-4 h-4" /> Add Section
          </button>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setStep(2)} className="px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-white transition-colors">Back to Details</button>
            <button
              onClick={() => save(false)}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
              style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)', opacity: saving ? 0.7 : 1 }}
            >
              {saving ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
              {saving ? 'Saving…' : 'Save as Draft'}
            </button>
            <button
              onClick={() => save(true)}
              disabled={saving}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
            >
              <DocumentDuplicateIcon className="w-4 h-4" /> Save as Template
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
