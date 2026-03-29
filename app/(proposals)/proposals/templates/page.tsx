'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  DocumentDuplicateIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
} from '@heroicons/react/16/solid'
import type { ProposalSection } from '@/lib/proposals/types'

interface TemplateRow {
  id: string
  title: string
  content: ProposalSection[]
  created_at: string
}

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<TemplateRow[]>([])
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/proposals?type=template')
    const data = await res.json()
    if (Array.isArray(data)) setTemplates(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function deleteTemplate(id: string) {
    if (!confirm('Delete this template?')) return
    await fetch(`/api/proposals/${id}`, { method: 'DELETE' })
    setTemplates(prev => prev.filter(t => t.id !== id))
    toast.success('Template deleted')
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
          <h1 className="text-3xl font-bold text-white mb-1">Templates</h1>
          <p className="text-slate-400">Reusable document templates</p>
        </div>
        <Link
          href="/proposals/create?asTemplate=true"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
        >
          <PlusIcon className="w-4 h-4" /> New Template
        </Link>
      </div>

      {templates.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <DocumentDuplicateIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2 text-slate-400">No templates yet</p>
          <p className="text-sm mb-6">Create a template to speed up future proposals and contracts</p>
          <Link
            href="/proposals/create?asTemplate=true"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #10b981 0%, #6ee7b7 100%)' }}
          >
            <PlusIcon className="w-4 h-4" /> Create Template
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {templates.map(t => {
            const firstText = t.content?.find(s => s.type === 'text')
            return (
              <div key={t.id} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(16,185,129,0.1)] rounded-xl p-5 hover:border-emerald-500/25 transition-colors">
                <h3 className="text-white font-semibold text-sm mb-2">{t.title}</h3>
                {firstText && (
                  <p className="text-xs text-slate-500 line-clamp-3 mb-4">{firstText.content.slice(0, 150)}…</p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    {new Date(t.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </span>
                  <div className="flex gap-1">
                    <Link
                      href={`/proposals/create?template=${t.id}`}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                    >
                      <DocumentDuplicateIcon className="w-3 h-3" /> Use
                    </Link>
                    <button
                      onClick={() => deleteTemplate(t.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
