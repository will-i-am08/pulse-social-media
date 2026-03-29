'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BoltIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  PlusIcon,
  PlayIcon,
} from '@heroicons/react/16/solid'

interface AutomationRow {
  id: string
  name: string
  trigger_type: string
  is_enabled: boolean
  last_run_at: string | null
  last_run_status: string | null
}

interface RunRow {
  id: string
  automation_id: string
  automationName: string
  status: string
  trigger_source: string
  started_at: string
  completed_at: string | null
  steps_log: Array<{ status: string }>
}

const STATUS_COLOR: Record<string, string> = {
  success: '#22c55e',
  failed: '#ef4444',
  running: '#0ea5e9',
}

export default function AutomationsDashboard() {
  const [automations, setAutomations] = useState<AutomationRow[]>([])
  const [runs, setRuns] = useState<RunRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const [aRes, rRes] = await Promise.all([
        fetch('/api/automations'),
        fetch('/api/automations/history?limit=10'),
      ])
      const aData = await aRes.json()
      const rData = await rRes.json()
      if (Array.isArray(aData)) setAutomations(aData)
      if (Array.isArray(rData)) setRuns(rData)
      setLoading(false)
    }
    load()
  }, [])

  const active = automations.filter(a => a.is_enabled).length
  const todayRuns = runs.filter(r => {
    const d = new Date(r.started_at)
    const now = new Date()
    return d.toDateString() === now.toDateString()
  })
  const successRate = runs.length > 0
    ? Math.round((runs.filter(r => r.status === 'success').length / runs.length) * 100)
    : 0

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[50vh]">
        <ArrowPathIcon className="w-6 h-6 animate-spin text-sky-400" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400">Overview of your automations and recent activity</p>
        </div>
        <Link
          href="/automations/edit/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)' }}
        >
          <PlusIcon className="w-4 h-4" /> Create Automation
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Automations', value: automations.length, icon: BoltIcon },
          { label: 'Active', value: active, icon: PlayIcon },
          { label: 'Runs Today', value: todayRuns.length, icon: ClockIcon },
          { label: 'Success Rate', value: `${successRate}%`, icon: CheckCircleIcon },
        ].map(stat => (
          <div key={stat.label} className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className="w-4 h-4 text-sky-400" />
              <span className="text-xs text-slate-500 uppercase tracking-wider">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Recent Runs */}
      <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-slate-300">Recent Runs</h2>
          <Link href="/automations/history" className="text-xs text-sky-400 hover:underline">View all</Link>
        </div>

        {runs.length === 0 ? (
          <div className="text-center py-10 text-slate-600">
            <ClockIcon className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p>No runs yet. Create and run your first automation!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {runs.map(run => (
              <div key={run.id} className="flex items-center gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                {run.status === 'success' ? (
                  <CheckCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR.success }} />
                ) : run.status === 'failed' ? (
                  <XCircleIcon className="w-4 h-4 flex-shrink-0" style={{ color: STATUS_COLOR.failed }} />
                ) : (
                  <ArrowPathIcon className="w-4 h-4 flex-shrink-0 animate-spin" style={{ color: STATUS_COLOR.running }} />
                )}
                <span className="text-sm text-white flex-1">{run.automationName}</span>
                <span className="text-xs text-slate-500">{run.trigger_source}</span>
                <span className="text-xs text-slate-600">
                  {new Date(run.started_at).toLocaleString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full" style={{
                  background: `${STATUS_COLOR[run.status] || '#64748b'}18`,
                  color: STATUS_COLOR[run.status] || '#64748b',
                }}>{run.steps_log?.length || 0} steps</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
