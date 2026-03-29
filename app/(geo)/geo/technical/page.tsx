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

interface TechCheck {
  name: string
  category: string
  status: 'pass' | 'warning' | 'fail'
  detail: string
}

interface TechFix {
  name: string
  category: string
  fix: string
  instructions: string
}

interface TechResult {
  url: string
  score: number
  checks: TechCheck[]
  recommendations: string[]
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

export default function TechnicalAuditPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<TechResult | null>(null)
  const [fixing, setFixing] = useState(false)
  const [fixes, setFixes] = useState<TechFix[]>([])

  async function runAudit() {
    if (!url.trim()) { toast.error('Enter a URL to audit'); return }
    setLoading(true)
    setResult(null)
    setFixes([])
    try {
      const res = await fetch('/api/seo-technical', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')
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
      const res = await fetch('/api/seo-technical/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: result.url, checks: result.checks }),
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

  // Group checks by category
  const categories = result
    ? [...new Set(result.checks.map(c => c.category))]
    : []

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Technical SEO Audit</h1>
        <p className="text-slate-400">Check HTTPS, robots.txt, sitemap, mobile-friendliness, structured data, and more</p>
      </div>

      {/* URL input */}
      <div className="geo-glass p-4 mb-6 flex gap-3">
        <div className="flex-1 flex items-center gap-2 bg-[rgba(255,255,255,0.04)] rounded-lg px-3 border border-[rgba(255,255,255,0.08)]">
          <GlobeAltIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
          <input
            className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder-slate-600"
            placeholder="https://example.com"
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
      {result && (
        <div className="space-y-5">
          {/* Score + AI Fix */}
          <div className="geo-glass p-6 flex flex-col sm:flex-row items-center gap-6">
            <ScoreCircle score={result.score} />
            <div className="flex-1 text-center sm:text-left">
              <div className="text-lg font-bold text-white mb-1">
                {result.score >= 80 ? 'Healthy Site' : result.score >= 50 ? 'Some Issues Found' : 'Needs Attention'}
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

          {/* Checklist grouped by category */}
          {categories.map(cat => (
            <div key={cat} className="geo-glass p-6">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">{cat}</h3>
              <div className="space-y-2">
                {result.checks.filter(c => c.category === cat).map(check => {
                  const Icon = STATUS_ICON[check.status]
                  return (
                    <div key={check.name} className="flex items-start gap-3 py-2 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: STATUS_COLOR[check.status] }} />
                      <div className="flex-1">
                        <span className="text-sm font-medium text-white">{check.name}</span>
                        <p className="text-xs text-slate-500 mt-0.5">{check.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Recommendations */}
          {result.recommendations.length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-indigo-400" /> AI Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((r, i) => (
                  <li key={i} className="text-sm text-slate-300 flex gap-2">
                    <span className="text-indigo-400 flex-shrink-0">•</span>
                    <span>{r}</span>
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
                      <div>
                        <span className="text-sm font-semibold text-white">{fix.name}</span>
                        <span className="text-xs text-slate-600 ml-2">{fix.category}</span>
                      </div>
                      <button
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        onClick={() => { navigator.clipboard.writeText(fix.fix); toast.success('Copied!') }}
                      >
                        <ClipboardIcon className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    <pre className="text-xs text-emerald-400/80 bg-emerald-500/5 rounded px-3 py-2 overflow-x-auto font-mono whitespace-pre-wrap mb-2">{fix.fix}</pre>
                    <p className="text-xs text-slate-500 italic">{fix.instructions}</p>
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
          <p className="text-lg">Enter a URL to run a technical SEO audit</p>
          <p className="text-sm mt-1">Checks security, crawlability, mobile, performance, and more</p>
        </div>
      )}
    </div>
  )
}
