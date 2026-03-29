'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  DocumentTextIcon,
  PlusIcon,
  TrashIcon,
  DocumentDuplicateIcon,
  ArrowPathIcon,
} from '@heroicons/react/16/solid'
import { STATUS_COLORS, STATUS_LABELS, TYPE_LABELS } from '@/lib/proposals/types'
import type { ProposalStatus, ProposalType } from '@/lib/proposals/types'

interface ProposalRow {
  id: string
  title: string
  type: ProposalType
  client_name: string
  status: ProposalStatus
  total_value: number
  updated_at: string
}

export default function ProposalsListPage() {
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    let url = '/api/proposals?'
    if (typeFilter) url += `type=${typeFilter}&`
    if (statusFilter) url += `status=${statusFilter}&`
    const res = await fetch(url)
    const data = await res.json()
    if (Array.isArray(data)) setProposals(data.filter((p: ProposalRow) => p.type !== 'template'))
    setLoading(false)
  }

  useEffect(() => { load() }, [typeFilter, statusFilter])

  const filtered = search
    ? proposals.filter(p => p.title.toLowerCase().includes(search.toLowerCase()) || p.client_name.toLowerCase().includes(search.toLowerCase()))
    : proposals

  async function deleteProposal(id: string) {
    if (!confirm('Delete this document?')) return
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    setProposals(prev => prev.filter(p => p.id !== id))
    toast.success('Deleted')
  }

  async function duplicate(p: ProposalRow) {
    const res = await fetch(`/api/proposals/${p.id}`)
    const data = await res.json()
    const newRes = await fetch('/api/proposals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: `Copy of ${data.title}`,
        type: data.type,
        clientName: data.client_name,
        clientEmail: data.client_email,
        brandId: data.brand_id,
        content: data.content,
        status: 'draft',
        totalValue: data.total_value,
      }),
    })
    if (newRes.ok) { toast.success('Duplicated!'); load() }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-emerald-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">All Documents</h1>
          <p className="text-slate-400">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/proposals/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
        >
          <PlusIcon className="w-4 h-4" /> Create New
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-white px-3 py-2 outline-none w-48"
          placeholder="Search…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="proposal">Proposals</option>
          <option value="contract">Contracts</option>
        </select>
        <select
          className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <DocumentTextIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2 text-slate-400">No documents found</p>
          <Link
            href="/proposals/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
          >
            <PlusIcon className="w-4 h-4" /> Create Document
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(p => (
            <div key={p.id} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-4 hover:border-emerald-500/25 transition-colors flex items-center gap-4">
              <Link href={`/proposals/${p.id}`} className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-sm truncate">{p.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                  <span>{p.client_name || 'No client'}</span>
                  <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 capitalize">{TYPE_LABELS[p.type]}</span>
                  <span className="px-1.5 py-0.5 rounded capitalize" style={{ background: `${STATUS_COLORS[p.status]}15`, color: STATUS_COLORS[p.status] }}>{STATUS_LABELS[p.status]}</span>
                  {p.total_value > 0 && <span className="text-white">${p.total_value.toLocaleString()}</span>}
                  <span>{new Date(p.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}</span>
                </div>
              </Link>
              <div className="flex gap-1">
                <button onClick={() => duplicate(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors" title="Duplicate">
                  <DocumentDuplicateIcon className="w-4 h-4" />
                </button>
                <button onClick={() => deleteProposal(p.id)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors" title="Delete">
                  <TrashIcon className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
