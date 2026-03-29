'use client'

import { useState, useCallback } from 'react'
import toast from 'react-hot-toast'
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  ChartBarIcon,
  SparklesIcon,
  PlusIcon,
} from '@heroicons/react/16/solid'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts'

interface EngineScore {
  engine: string
  cited: boolean
  score: number
  snippet: string
  missing: string[]
}

interface AuditResult {
  citationHealthScore: number
  overallStatus: 'ai-cited' | 'ai-shadowed' | 'ai-blocked'
  engineScores: Record<string, EngineScore>
  suggestedChanges: Array<{ type: string; priority: 'high' | 'medium' | 'low'; description: string }>
  auditId?: string
}

const ENGINE_LABELS: Record<string, string> = {
  perplexity: 'Perplexity',
  chatgpt: 'ChatGPT',
  gemini: 'Gemini',
  searchgpt: 'SearchGPT',
}

const STATUS_CONFIG = {
  'ai-cited': { label: 'AI Cited', color: '#22c55e', cls: 'geo-cited', icon: CheckCircleIcon },
  'ai-shadowed': { label: 'AI Shadowed', color: '#eab308', cls: 'geo-shadowed', icon: ExclamationTriangleIcon },
  'ai-blocked': { label: 'AI Blocked', color: '#ef4444', cls: 'geo-blocked', icon: XCircleIcon },
}

const PRIORITY_COLOR = { high: '#ef4444', medium: '#eab308', low: '#6366f1' }

function ScoreCircle({ score, status }: { score: number; status: AuditResult['overallStatus'] }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = STATUS_CONFIG[status].color

  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`}
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{score}</div>
        <div className="text-xs text-slate-400">/ 100</div>
      </div>
    </div>
  )
}

export default function GeoAuditPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [rewriteTarget, setRewriteTarget] = useState('')
  const [rewriting, setRewriting] = useState(false)

  const runAudit = useCallback(async () => {
    if (!url.trim()) { toast.error('Enter a URL to audit'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/geo-audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')
      setResult(data)
    } catch (err) {
      toast.error(String(err))
    } finally {
      setLoading(false)
    }
  }, [url])

  const radarData = result
    ? Object.entries(result.engineScores).map(([key, val]) => ({
        engine: ENGINE_LABELS[key] || key,
        score: val.score,
      }))
    : []

  const status = result ? STATUS_CONFIG[result.overallStatus] : null

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">AI Audit</h1>
        <p className="text-slate-400">Simulate how Perplexity, ChatGPT, Gemini, and SearchGPT cite your page</p>
      </div>

      {/* URL input */}
      <div className="geo-glass p-4 mb-6 flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[rgba(255,255,255,0.04)] rounded-lg px-3 border border-[rgba(255,255,255,0.08)]">
          <GlobeAltIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder-slate-600"
            placeholder="https://example.com/your-page"
            value={url}
            onChange={e => setUrl(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && runAudit()}
          />
        </div>
        <button
          onClick={runAudit}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', opacity: loading ? 0.7 : 1 }}
        >
          {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <MagnifyingGlassIcon className="w-4 h-4" />}
          {loading ? 'Auditing…' : 'Run Audit'}
        </button>
      </div>

      {/* Results */}
      {result && status && (
        <div className="space-y-5">
          {/* Score + status */}
          <div className={`geo-glass border ${status.cls} p-6 flex flex-col sm:flex-row items-center gap-6`}>
            <ScoreCircle score={result.citationHealthScore} status={result.overallStatus} />
            <div className="flex-1 text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start mb-2">
                <status.icon className="w-5 h-5" style={{ color: status.color }} />
                <span className="font-bold text-lg text-white">{status.label}</span>
              </div>
              <p className="text-slate-400 text-sm mb-4">
                Citation health score based on weighted simulation across 4 AI engines.
              </p>
              <div className="flex gap-2 flex-wrap justify-center sm:justify-start">
                {Object.entries(result.engineScores).map(([key, val]) => (
                  <span key={key} className="text-xs px-2.5 py-1 rounded-full border" style={{
                    background: `${val.cited ? '#22c55e' : '#ef4444'}18`,
                    borderColor: `${val.cited ? '#22c55e' : '#ef4444'}40`,
                    color: val.cited ? '#86efac' : '#fca5a5',
                  }}>
                    {ENGINE_LABELS[key]}: {val.score}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Radar chart */}
          {radarData.length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ChartBarIcon className="w-4 h-4 text-indigo-400" /> Engine Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="rgba(255,255,255,0.06)" />
                  <PolarAngleAxis dataKey="engine" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{ background: '#1e1e2e', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 8, color: '#e2e8f0' }}
                    formatter={(v: number) => [`${v} / 100`, 'Score']}
                  />
                  <Radar dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.25} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Suggested changes */}
          {result.suggestedChanges.length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-400" /> Suggested Improvements
              </h3>
              <div className="space-y-2">
                {result.suggestedChanges.map((c, i) => (
                  <div key={i} className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium mt-0.5" style={{
                      background: `${PRIORITY_COLOR[c.priority]}20`,
                      color: PRIORITY_COLOR[c.priority],
                    }}>
                      {c.priority}
                    </span>
                    <span className="text-sm text-slate-300 flex-1">{c.description}</span>
                    <span className="text-xs text-slate-600 bg-[rgba(255,255,255,0.04)] px-2 py-0.5 rounded">{c.type}</span>
                  </div>
                ))}
              </div>

              {/* Content rewriter */}
              <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.06)]">
                <p className="text-xs text-slate-500 mb-2">Paste content to rewrite for AI citation:</p>
                <textarea
                  className="w-full bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2 outline-none resize-none"
                  rows={4}
                  placeholder="Paste your page content here…"
                  value={rewriteTarget}
                  onChange={e => setRewriteTarget(e.target.value)}
                />
                <button
                  disabled={rewriting || !rewriteTarget.trim()}
                  onClick={async () => {
                    setRewriting(true)
                    try {
                      const res = await fetch('/api/geo-rewrite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ content: rewriteTarget, targetQuery: url, style: 'answer-first' }),
                      })
                      const data = await res.json()
                      if (!res.ok) throw new Error(data.error)
                      setRewriteTarget(data.rewritten)
                      toast.success('Content rewritten!')
                    } catch (err) {
                      toast.error(String(err))
                    } finally {
                      setRewriting(false)
                    }
                  }}
                  className="mt-2 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white transition-all"
                  style={{ background: 'rgba(99,102,241,0.3)', opacity: rewriting ? 0.6 : 1 }}
                >
                  {rewriting ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" /> : <SparklesIcon className="w-3.5 h-3.5" />}
                  {rewriting ? 'Rewriting…' : 'Rewrite Answer-First'}
                </button>
              </div>
            </div>
          )}

          {/* Engine snippets */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(result.engineScores).map(([key, val]) => (
              <div key={key} className="geo-glass p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm text-white">{ENGINE_LABELS[key]}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${val.cited ? 'bg-emerald-900/40 text-emerald-400' : 'bg-red-900/40 text-red-400'}`}>
                    {val.cited ? 'Would cite' : 'Would skip'}
                  </span>
                </div>
                {val.snippet && <p className="text-xs text-slate-400 italic mb-2">"{val.snippet}"</p>}
                {val.missing.length > 0 && (
                  <ul className="text-xs text-slate-500 space-y-0.5">
                    {val.missing.slice(0, 2).map((m, i) => <li key={i}>• {m}</li>)}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-20 text-slate-600">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Enter a URL above to run your first AI visibility audit</p>
          <p className="text-sm mt-1">Requires <code className="text-indigo-400">OPENAI_API_KEY</code> in .env.local</p>
        </div>
      )}
    </div>
  )
}
