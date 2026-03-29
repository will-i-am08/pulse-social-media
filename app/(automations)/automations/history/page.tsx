'use client'

import { useState, useEffect } from 'react'
import {
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/16/solid'
import { ACTION_LABELS } from '@/lib/automations/types'
import type { ActionType } from '@/lib/automations/types'

interface StepLog {
  stepIndex: number
  actionType: ActionType
  label: string
  status: string
  output?: unknown
  error?: string
  durationMs: number
}

interface RunRow {
  id: string
  automation_id: string
  automationName: string
  status: string
  trigger_source: string
  steps_log: StepLog[]
  started_at: string
  completed_at: string | null
  error_message: string | null
}

const STATUS_COLOR: Record<string, string> = {
  success: '#22c55e',
  failed: '#ef4444',
  running: '#0ea5e9',
}

function duration(start: string, end: string | null) {
  if (!end) return '—'
  const ms = new Date(end).getTime() - new Date(start).getTime()
  if (ms < 1000) return `${ms}ms`
  return `${(ms / 1000).toFixed(1)}s`
}

export default function HistoryPage() {
  const [runs, setRuns] = useState<RunRow[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [filter, setFilter] = useState('')

  useEffect(() => {
    async function load() {
      const res = await fetch('/api/automations/history?limit=100')
      const data = await res.json()
      if (Array.isArray(data)) setRuns(data)
      setLoading(false)
    }
    load()
  }, [])

  const filtered = filter
    ? runs.filter(r => r.status === filter)
    : runs

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Run History</h1>
        <p className="text-slate-400">{runs.length} total runs</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['', 'success', 'failed', 'running'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filter === f
                ? 'bg-sky-500/20 text-sky-400'
                : 'bg-[rgba(255,255,255,0.04)] text-slate-400 hover:text-white'
            }`}
          >
            {f ? f.charAt(0).toUpperCase() + f.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <ClockIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">No runs found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(run => {
            const isExpanded = expanded === run.id
            return (
              <div
                key={run.id}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl overflow-hidden"
              >
                <button
                  className="w-full flex items-center gap-3 p-4 text-left hover:bg-[rgba(14,165,233,0.03)] transition-colors"
                  onClick={() => setExpanded(isExpanded ? null : run.id)}
                >
                  {run.status === 'success' ? (
                    <CheckCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR.success }} />
                  ) : run.status === 'failed' ? (
                    <XCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR.failed }} />
                  ) : (
                    <ArrowPathIcon className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: STATUS_COLOR.running }} />
                  )}
                  <span className="text-sm text-white flex-1 font-medium">{run.automationName}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(255,255,255,0.05)] text-slate-400">{run.trigger_source}</span>
                  <span className="text-xs text-slate-500">
                    {duration(run.started_at, run.completed_at)}
                  </span>
                  <span className="text-xs text-slate-600">
                    {new Date(run.started_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="text-xs text-slate-600">{run.steps_log?.length || 0} steps</span>
                  {isExpanded ? <ChevronUpIcon className="w-4 h-4 text-slate-500" /> : <ChevronDownIcon className="w-4 h-4 text-slate-500" />}
                </button>

                {isExpanded && (
                  <div className="border-t border-[rgba(255,255,255,0.05)] p-4">
                    {run.error_message && (
                      <div className="bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2 mb-4">
                        <p className="text-xs text-red-400">{run.error_message}</p>
                      </div>
                    )}
                    <div className="space-y-2">
                      {(run.steps_log || []).map((step, i) => (
                        <div key={i} className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                          <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold mt-0.5 flex-shrink-0" style={{
                            background: `${STATUS_COLOR[step.status] || '#64748b'}20`,
                            color: STATUS_COLOR[step.status] || '#64748b',
                          }}>
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-white font-medium">{step.label || ACTION_LABELS[step.actionType]}</span>
                              <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(255,255,255,0.05)] text-slate-500">{step.actionType}</span>
                              <span className="text-xs text-slate-600">{step.durationMs}ms</span>
                            </div>
                            {step.error ? (
                              <p className="text-xs text-red-400 mt-1">{String(step.error)}</p>
                            ) : null}
                            {step.output != null && (
                              <details className="mt-1">
                                <summary className="text-xs text-sky-400 cursor-pointer hover:underline">View output</summary>
                                <pre className="text-xs text-slate-500 bg-[rgba(255,255,255,0.03)] rounded p-2 mt-1 overflow-x-auto max-h-40 overflow-y-auto">
                                  {JSON.stringify(step.output, null, 2).slice(0, 2000)}
                                </pre>
                              </details>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
