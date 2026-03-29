'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import {
  BoltIcon,
  PlusIcon,
  PlayIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ClockIcon,
  CalendarDaysIcon,
  CursorArrowRaysIcon,
} from '@heroicons/react/16/solid'

interface AutomationRow {
  id: string
  name: string
  description: string
  steps: Array<{ actionType: string; label: string }>
  trigger_type: string
  trigger_config: Record<string, string>
  is_enabled: boolean
  last_run_at: string | null
  last_run_status: string | null
  created_at: string
}

const TRIGGER_ICONS: Record<string, React.ElementType> = {
  manual: CursorArrowRaysIcon,
  schedule: CalendarDaysIcon,
  event: BoltIcon,
}

const STATUS_COLOR: Record<string, string> = {
  success: '#22c55e',
  failed: '#ef4444',
  running: '#0ea5e9',
}

export default function AutomationsListPage() {
  const [automations, setAutomations] = useState<AutomationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState<string | null>(null)

  async function load() {
    const res = await fetch('/api/automations')
    const data = await res.json()
    if (Array.isArray(data)) setAutomations(data)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  async function runAutomation(id: string) {
    setRunning(id)
    try {
      const res = await fetch(`/api/automations/${id}/run`, { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Run failed')
      toast.success(`Run ${data.status}: ${data.stepsLog?.length || 0} steps completed`)
      load()
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setRunning(null)
    }
  }

  async function toggleEnabled(id: string, currentState: boolean) {
    const auto = automations.find(a => a.id === id)
    if (!auto) return
    await fetch('/api/automations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, name: auto.name, isEnabled: !currentState }),
    })
    setAutomations(prev => prev.map(a => a.id === id ? { ...a, is_enabled: !currentState } : a))
  }

  async function deleteAutomation(id: string) {
    if (!confirm('Delete this automation?')) return
    await fetch(`/api/automations/${id}`, { method: 'DELETE' })
    setAutomations(prev => prev.filter(a => a.id !== id))
    toast.success('Deleted')
  }

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
          <h1 className="text-3xl font-bold text-white mb-1">My Automations</h1>
          <p className="text-slate-400">{automations.length} automation{automations.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/automations/edit/new"
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
          style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)' }}
        >
          <PlusIcon className="w-4 h-4" /> New Automation
        </Link>
      </div>

      {automations.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <BoltIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg mb-2 text-slate-400">No automations yet</p>
          <p className="text-sm mb-6">Create your first automation to start saving time</p>
          <Link
            href="/automations/edit/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #0ea5e9 0%, #7dd3fc 100%)' }}
          >
            <PlusIcon className="w-4 h-4" /> Create Automation
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {automations.map(auto => {
            const TriggerIcon = TRIGGER_ICONS[auto.trigger_type] || BoltIcon
            const isRunning = running === auto.id
            return (
              <div
                key={auto.id}
                className="bg-[rgba(255,255,255,0.03)] border border-[rgba(14,165,233,0.1)] rounded-xl p-5 hover:border-[rgba(14,165,233,0.25)] transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-semibold">{auto.name}</h3>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-[rgba(14,165,233,0.1)] text-sky-400 flex items-center gap-1">
                        <TriggerIcon className="w-3 h-3" /> {auto.trigger_type}
                      </span>
                      {auto.trigger_type === 'schedule' && auto.trigger_config?.cron && (
                        <span className="text-xs text-slate-600 font-mono">{auto.trigger_config.cron}</span>
                      )}
                    </div>
                    {auto.description && <p className="text-xs text-slate-500 mb-2">{auto.description}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-600">
                      <span>{auto.steps?.length || 0} steps</span>
                      {auto.last_run_at && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            {auto.last_run_status === 'success' ? (
                              <CheckCircleIcon className="w-3 h-3" style={{ color: STATUS_COLOR.success }} />
                            ) : auto.last_run_status === 'failed' ? (
                              <XCircleIcon className="w-3 h-3" style={{ color: STATUS_COLOR.failed }} />
                            ) : null}
                            Last run {new Date(auto.last_run_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Enable toggle */}
                    <button
                      onClick={() => toggleEnabled(auto.id, auto.is_enabled)}
                      className={`w-10 h-5 rounded-full relative transition-colors ${auto.is_enabled ? 'bg-sky-500' : 'bg-slate-700'}`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all ${auto.is_enabled ? 'left-5.5 left-[22px]' : 'left-0.5'}`} />
                    </button>
                    {/* Run */}
                    <button
                      onClick={() => runAutomation(auto.id)}
                      disabled={isRunning}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-[rgba(14,165,233,0.1)] transition-colors"
                      title="Run now"
                    >
                      {isRunning ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <PlayIcon className="w-4 h-4" />}
                    </button>
                    {/* Edit */}
                    <Link
                      href={`/automations/edit/${auto.id}`}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-[rgba(14,165,233,0.1)] transition-colors"
                      title="Edit"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </Link>
                    {/* Delete */}
                    <button
                      onClick={() => deleteAutomation(auto.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      <TrashIcon className="w-4 h-4" />
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
