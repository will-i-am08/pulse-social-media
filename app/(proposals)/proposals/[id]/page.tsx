'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from '@/lib/proposals/types'
import type { ProposalSection, ProposalStatus } from '@/lib/proposals/types'
import {
  PencilSquareIcon,
  PrinterIcon,
  PaperAirplaneIcon,
  DocumentDuplicateIcon,
  TrashIcon,
  ArrowPathIcon,
  CheckIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  PlusIcon,
} from '@heroicons/react/16/solid'

interface ProposalData {
  id: string
  title: string
  type: string
  client_name: string
  client_email: string
  brand_id: string | null
  content: ProposalSection[]
  status: ProposalStatus
  start_date: string | null
  end_date: string | null
  renewal_date: string | null
  total_value: number
  signature_client: string | null
  signature_agency: string | null
  signed_at: string | null
  created_at: string
  updated_at: string
}

function uid() { return Math.random().toString(36).slice(2, 10) }

export default function ViewProposalPage() {
  const router = useRouter()
  const params = useParams()
  const [proposal, setProposal] = useState<ProposalData | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [sections, setSections] = useState<ProposalSection[]>([])
  const [title, setTitle] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch(`/api/proposals/${params.id}`)
    if (!res.ok) { toast.error('Not found'); router.push('/proposals/list'); return }
    const data = await res.json()
    setProposal(data)
    setSections(data.content || [])
    setTitle(data.title)
    setLoading(false)
  }

  useEffect(() => { load() }, [params.id])

  async function save() {
    setSaving(true)
    try {
      await fetch('/api/proposals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: params.id, title, content: sections }),
      })
      toast.success('Saved!')
      setEditing(false)
      load()
    } catch { toast.error('Save failed') }
    finally { setSaving(false) }
  }

  async function updateStatus(status: ProposalStatus) {
    await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: params.id, status }),
    })
    toast.success(`Marked as ${STATUS_LABELS[status]}`)
    load()
  }

  async function duplicate() {
    if (!proposal) return
    const res = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Copy of ${proposal.title}`,
        type: proposal.type,
        clientName: proposal.client_name,
        clientEmail: proposal.client_email,
        brandId: proposal.brand_id,
        content: proposal.content,
        status: 'draft',
        totalValue: proposal.total_value,
      }),
    })
    const data = await res.json()
    if (res.ok) { toast.success('Duplicated!'); router.push(`/proposals/${data.id}`) }
  }

  async function deleteDoc() {
    if (!confirm('Delete this document permanently?')) return
    await fetch(`/api/proposals/${params.id}`, { method: 'DELETE' })
    toast.success('Deleted')
    router.push('/proposals/list')
  }

  if (loading || !proposal) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Action toolbar */}
      <div className="flex items-center gap-2 mb-6 flex-wrap print:hidden">
        <Link href="/proposals/list" className="text-xs text-slate-500 hover:text-slate-300 mr-2">← All Documents</Link>
        <div className="flex-1" />
        <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: `${STATUS_COLORS[proposal.status]}18`, color: STATUS_COLORS[proposal.status] }}>
          {STATUS_LABELS[proposal.status]}
        </span>
        {!editing ? (
          <>
            <button onClick={() => setEditing(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <PencilSquareIcon className="w-3.5 h-3.5" /> Edit
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <PrinterIcon className="w-3.5 h-3.5" /> Export PDF
            </button>
            {proposal.status === 'draft' && (
              <button onClick={() => updateStatus('sent')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors">
                <PaperAirplaneIcon className="w-3.5 h-3.5" /> Mark Sent
              </button>
            )}
            <Link href={`/proposals/${params.id}/sign`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors">
              <PencilSquareIcon className="w-3.5 h-3.5" /> Sign
            </Link>
            <button onClick={duplicate} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors">
              <DocumentDuplicateIcon className="w-3.5 h-3.5" /> Duplicate
            </button>
            <button onClick={deleteDoc} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 hover:bg-red-500/10 transition-colors">
              <TrashIcon className="w-3.5 h-3.5" /> Delete
            </button>
          </>
        ) : (
          <>
            <button onClick={() => { setSections(proposal.content || []); setTitle(proposal.title); setEditing(false) }} className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white transition-colors">Cancel</button>
            <button onClick={save} disabled={saving} className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white" style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}>
              {saving ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <CheckIcon className="w-3.5 h-3.5" />}
              Save
            </button>
          </>
        )}
      </div>

      {/* Document */}
      <div className="proposal-document bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-8 md:p-12">
        {/* Header */}
        {editing ? (
          <input className="w-full bg-transparent text-2xl font-bold text-white outline-none mb-2 border-b border-[rgba(255,255,255,0.1)] pb-2" value={title} onChange={e => setTitle(e.target.value)} />
        ) : (
          <h1 className="text-2xl font-bold text-white mb-2">{proposal.title}</h1>
        )}
        <div className="flex flex-wrap gap-4 text-xs text-slate-500 mb-8 border-b border-[rgba(255,255,255,0.06)] pb-6">
          <span>From: <span className="text-white">Pulse Social Media</span></span>
          {proposal.client_name && <span>Client: <span className="text-white">{proposal.client_name}</span></span>}
          <span className="capitalize">{TYPE_LABELS[proposal.type as keyof typeof TYPE_LABELS]}</span>
          {proposal.start_date && <span>Start: {new Date(proposal.start_date).toLocaleDateString('en-AU')}</span>}
          {proposal.end_date && <span>End: {new Date(proposal.end_date).toLocaleDateString('en-AU')}</span>}
          {proposal.total_value > 0 && <span>Value: <span className="text-white">${proposal.total_value.toLocaleString()}</span></span>}
        </div>

        {/* Sections */}
        {editing ? (
          <div className="space-y-4">
            {sections.map((s, i) => (
              <div key={s.id} className="border border-[rgba(255,255,255,0.06)] rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <input className="flex-1 bg-transparent text-white font-semibold text-sm outline-none" value={s.title} onChange={e => { const arr = [...sections]; arr[i] = { ...s, title: e.target.value }; setSections(arr) }} />
                  <div className="flex gap-0.5">
                    {i > 0 && <button onClick={() => { const arr = [...sections]; [arr[i], arr[i-1]] = [arr[i-1], arr[i]]; setSections(arr) }} className="p-1 text-slate-500 hover:text-slate-300"><ArrowUpIcon className="w-3 h-3" /></button>}
                    {i < sections.length - 1 && <button onClick={() => { const arr = [...sections]; [arr[i], arr[i+1]] = [arr[i+1], arr[i]]; setSections(arr) }} className="p-1 text-slate-500 hover:text-slate-300"><ArrowDownIcon className="w-3 h-3" /></button>}
                    <button onClick={() => setSections(sections.filter((_, j) => j !== i))} className="p-1 text-slate-500 hover:text-red-400"><TrashIcon className="w-3 h-3" /></button>
                  </div>
                </div>
                <textarea className="w-full bg-[rgba(255,255,255,0.03)] rounded text-sm text-slate-300 px-3 py-2 outline-none resize-none" rows={4} value={s.content} onChange={e => { const arr = [...sections]; arr[i] = { ...s, content: e.target.value }; setSections(arr) }} />
              </div>
            ))}
            <button onClick={() => setSections([...sections, { id: uid(), type: 'text', title: 'New Section', content: '' }])} className="w-full py-2 border-2 border-dashed border-[rgba(16,185,129,0.2)] rounded-lg text-sm text-slate-500 hover:text-emerald-400 transition-colors">
              <PlusIcon className="w-4 h-4 inline mr-1" /> Add Section
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {(proposal.content || []).map((s: ProposalSection) => (
              <div key={s.id}>
                {s.type === 'heading' ? (
                  <h2 className="text-xl font-bold text-white mb-2">{s.title}</h2>
                ) : (
                  <h3 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-2">{s.title}</h3>
                )}
                <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">{s.content}</div>
                {s.items && s.items.length > 0 && (
                  <div className="mt-3 overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead><tr className="border-b border-[rgba(255,255,255,0.1)]">
                        <th className="text-left py-1 text-slate-500 font-medium">Description</th>
                        <th className="text-right py-1 text-slate-500 font-medium w-20">Qty</th>
                        <th className="text-right py-1 text-slate-500 font-medium w-24">Price</th>
                        <th className="text-right py-1 text-slate-500 font-medium w-24">Total</th>
                      </tr></thead>
                      <tbody>
                        {s.items.map((item, j) => (
                          <tr key={j} className="border-b border-[rgba(255,255,255,0.04)]">
                            <td className="py-1.5 text-slate-300">{item.description}</td>
                            <td className="py-1.5 text-right text-slate-400">{item.quantity || '—'}</td>
                            <td className="py-1.5 text-right text-slate-400">{item.unitPrice ? `$${item.unitPrice}` : '—'}</td>
                            <td className="py-1.5 text-right text-white font-medium">${item.total}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
