'use client'

import { useState } from 'react'
import toast from 'react-hot-toast'
import {
  GlobeAltIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  SparklesIcon,
  ClipboardIcon,
} from '@heroicons/react/16/solid'

interface CheckResult {
  name: string
  status: 'pass' | 'warning' | 'fail'
  value: string
  detail: string
}

interface Fix {
  name: string
  current: string
  improved: string
  explanation: string
}

interface AuditResult {
  url: string
  score: number
  checks: CheckResult[]
  suggestions: string[]
  pageData: Record<string, unknown>
}

const STATUS_ICON = {
  pass: CheckCircleIcon,
  warning: ExclamationTriangleIcon,
  fail: XCircleIcon,
}
const STATUS_COLOR = {
  pass: '#22c55e',
  warning: '#eab308',
  fail: '#ef4444',
}

function ScoreCircle({ score }: { score: number }) {
  const r = 54
  const circ = 2 * Math.PI * r
  const dash = (score / 100) * circ
  const color = score >= 80 ? '#22c55e' : score >= 50 ? '#eab308' : '#ef4444'
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" />
        <circle cx="72" cy="72" r={r} fill="none" stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${dash} ${circ}`} style={{ transition: 'stroke-dasharray 0.8s ease' }} />
      </svg>
      <div className="text-center">
        <div className="text-3xl font-bold text-white">{score}</div>
        <div className="text-xs text-slate-400">/ 100</div>
      </div>
    </div>
  )
}

export default function OnPageCheckerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AuditResult | null>(null)
  const [fixing, setFixing] = useState(false)
  const [fixes, setFixes] = useState<Fix[]>([])

  async function runAudit() {
    if (!url.trim()) { toast.error('Enter a URL to analyze'); return }
    setLoading(true)
    setResult(null)
    setFixes([])
    try {
      const res = await fetch('/api/seo-onpage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setResult(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function runFix() {
    if (!result) return
    setFixing(true)
    try {
      const res = await fetch('/api/seo-onpage/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.url, checks: result.checks, pageData: result.pageData }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fix generation failed')
      setFixes(data.fixes || [])
      toast.success('AI fixes generated!')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setFixing(false)
    }
  }

  const failCount = result?.checks.filter(c => c.status !== 'pass').length || 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">On-Page SEO Checker</h1>
        <p className="text-slate-400">Analyze any page for title, meta, headings, images, links, and social tags</p>
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
          {loading ? 'Analyzing…' : 'Analyze'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Score + AI Fix button */}
          <div className="geo-glass p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreCircle score={result.score} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-lg font-bold text-white mb-1">
                {result.score >= 80 ? 'Great SEO!' : result.score >= 50 ? 'Needs Improvement' : 'Critical Issues Found'}
              </div>
              <p className="text-slate-400 text-sm mb-4">
                {result.checks.filter(c => c.status === 'pass').length}/{result.checks.length} checks passed
              </p>
              {failCount > 0 && (
                <button
                  onClick={runFix}
                  disabled={fixing}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', opacity: fixing ? 0.7 : 1 }}
                >
                  {fixing ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
                  {fixing ? 'Generating Fixes…' : `AI Fix All (${failCount} issues)`}
                </button>
              )}
            </div>
          </div>

          {/* Checklist */}
          <div className="geo-glass p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4">Audit Checklist</h3>
            <div className="space-y-2">
              {result.checks.map(check => {
                const Icon = STATUS_ICON[check.status]
                return (
                  <div key={check.name} className="flex items-start gap-3 py-2.5 border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: STATUS_COLOR[check.status] }} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-white">{check.name}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: `${STATUS_COLOR[check.status]}18`,
                          color: STATUS_COLOR[check.status],
                        }}>{check.value}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{check.detail}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* AI Suggestions */}
          {result.suggestions.length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-400" /> AI Suggestions
              </h3>
              <ul className="space-y-2">
                {result.suggestions.map((s, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-indigo-400 flex-shrink-0">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* AI Fixes */}
          {fixes.length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-400" /> AI-Generated Fixes
              </h3>
              <div className="space-y-4">
                {fixes.map((fix, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 border border-[rgba(99,102,241,0.15)]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-white">{fix.name}</span>
                      <button
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        onClick={() => { navigator.clipboard.writeText(fix.improved); toast.success('Copied!') }}
                      >
                        <ClipboardIcon className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    {fix.current && (
                      <div className="mb-2">
                        <span className="text-[10px] uppercase tracking-wider text-slate-600">Current</span>
                        <p className="text-xs text-red-400/80 bg-red-500/5 rounded px-2 py-1 mt-0.5 font-mono break-all">{fix.current}</p>
                      </div>
                    )}
                    <div className="mb-2">
                      <span className="text-[10px] uppercase tracking-wider text-slate-600">Improved</span>
                      <p className="text-xs text-emerald-400/80 bg-emerald-500/5 rounded px-2 py-1 mt-0.5 font-mono break-all">{fix.improved}</p>
                    </div>
                    <p className="text-xs text-slate-500 italic">{fix.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!result && !loading && (
        <div className="text-center py-20 text-slate-600">
          <MagnifyingGlassIcon className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p className="text-lg">Enter a URL to analyze its on-page SEO</p>
          <p className="text-sm mt-1">Checks title, meta, headings, images, links, and social tags</p>
        </div>
      )}
    </div>
  )
}
