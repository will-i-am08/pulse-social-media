'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CurrencyDollarIcon,
  ArrowPathIcon,
  PlusIcon,
  ClockIcon,
} from '@heroicons/react/16/solid'
import { STATUS_COLORS, STATUS_LABELS } from '@/lib/proposals/types'
import type { ProposalStatus } from '@/lib/proposals/types'

interface ProposalRow {
  id: string
  title: string
  type: string
  client_name: string
  status: ProposalStatus
  total_value: number
  end_date: string | null
  renewal_date: string | null
  updated_at: string
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function expiryColor(days: number): string {
  if (days <= 7) return '#ef4444'
  if (days <= 30) return '#eab308'
  return '#22c55e'
}

export default function ProposalsDashboard() {
  const [proposals, setProposals] = useState<ProposalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/proposals')
      const data = await res.json()
      if (Array.isArray(data)) setProposals(data)
      setLoading(false)
    }
    load()
  }, [])

  const docs = proposals.filter(p => p.type !== 'template')
  const activeContracts = docs.filter(p => p.type === 'contract' && ['sent', 'viewed', 'signed'].includes(p.status))
  const totalValue = docs.filter(p => !['cancelled', 'expired'].includes(p.status)).reduce((s, p) => s + (p.total_value || 0), 0)

  const expiringSoon = docs.filter(p => {
    const days = daysUntil(p.end_date) ?? daysUntil(p.renewal_date)
    return days !== null && days > 0 && days <= 30 && !['cancelled', 'expired'].includes(p.status)
  }).sort((a, b) => {
    const da = daysUntil(a.end_date) ?? daysUntil(a.renewal_date) ?? 999
    const db = daysUntil(b.end_date) ?? daysUntil(b.renewal_date) ?? 999
    return da - db
  })

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
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400">Proposals, contracts, and expiry tracking</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/proposals/create?type=proposal"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
          >
            <PlusIcon className="w-4 h-4" /> New Proposal
          </Link>
          <Link
            href="/proposals/create?type=contract"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10 transition-colors"
          >
            <PlusIcon className="w-4 h-4" /> New Contract
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Documents', value: docs.length, icon: DocumentTextIcon },
          { label: 'Active Contracts', value: activeContracts.length, icon: CheckCircleIcon },
          { label: 'Expiring Soon', value: expiringSoon.length, icon: ExclamationTriangleIcon },
          { label: 'Total Value', value: `$${totalValue.toLocaleString()}`, icon: CurrencyDollarIcon },
        ].map(stat => (
          <div key={stat.label} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-emerald-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Expiring Soon */}
      {expiringSoon.length > 0 && (
        <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-6 mb-6">
          <h2 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-400" /> Expiring Soon
          </h2>
          <div className="space-y-2">
            {expiringSoon.map(p => {
              const days = daysUntil(p.end_date) ?? daysUntil(p.renewal_date) ?? 0
              const isRenewal = !p.end_date && p.renewal_date
              return (
                <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(16,185,129,0.03)] rounded transition-colors px-2 -mx-2">
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: expiryColor(days) }} />
                  <span className="text-sm text-white flex-1">{p.title}</span>
                  <span className="text-xs text-slate-500">{p.client_name}</span>
                  <span className="text-xs font-medium" style={{ color: expiryColor(days) }}>
                    {isRenewal ? 'Renews' : 'Expires'} in {days} day{days !== 1 ? 's' : ''}
                  </span>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Documents */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Recent Documents</h2>
          <Link href="/proposals/list" className="text-xs text-emerald-400 hover:underline">View all</Link>
        </div>

        {docs.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <DocumentTextIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No documents yet. Create your first proposal or contract!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {docs.slice(0, 10).map(p => (
              <Link key={p.id} href={`/proposals/${p.id}`} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0 hover:bg-[rgba(16,185,129,0.03)] rounded transition-colors px-2 -mx-2">
                <span className="text-sm text-white flex-1">{p.title}</span>
                <span className="text-xs text-slate-500">{p.client_name}</span>
                <span className="text-xs px-2 py-0.5 rounded-full capitalize" style={{
                  background: `${STATUS_COLORS[p.status]}18`,
                  color: STATUS_COLORS[p.status],
                }}>{STATUS_LABELS[p.status]}</span>
                <span className="text-xs text-slate-600">
                  {new Date(p.updated_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
