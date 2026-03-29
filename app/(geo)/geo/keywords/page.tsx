'use client'

import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase/client'
import {
  MagnifyingGlassIcon,
  ArrowPathIcon,
  SparklesIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/16/solid'

interface Keyword {
  keyword: string
  difficulty: 'low' | 'medium' | 'high'
  volume: 'low' | 'medium' | 'high'
  intent?: string
}

interface LongtailKeyword {
  keyword: string
  difficulty: 'low' | 'medium' | 'high'
  volume: 'low' | 'medium'
}

interface Question {
  keyword: string
  type: string
}

interface ContentGap {
  topic: string
  opportunity: string
  suggestedTitle: string
}

interface KeywordResult {
  seedKeyword: string
  related: Keyword[]
  longtail: LongtailKeyword[]
  questions: Question[]
  contentGaps: ContentGap[]
}

interface Brand {
  id: string
  name: string
  business_name: string | null
  location: string | null
  industry: string | null
}

const DIFF_COLORS = { low: '#22c55e', medium: '#eab308', high: '#ef4444' }
const VOL_COLORS = { low: '#64748b', medium: '#6366f1', high: '#22c55e' }

export default function KeywordResearchPage() {
  const [seedKeyword, setSeedKeyword] = useState('')
  const [brandId, setBrandId] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<KeywordResult | null>(null)

  useEffect(() => {
    async function loadBrands() {
      const sb = createClient()
      const { data: { user } } = await sb.auth.getUser()
      if (!user) return
      const { data } = await sb.from('workspace_brands').select('id, name, business_name, location, industry').eq('user_id', user.id)
      if (data) setBrands(data)
    }
    loadBrands()
  }, [])

  async function runResearch() {
    if (!seedKeyword.trim()) { toast.error('Enter a seed keyword'); return }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/seo-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seedKeyword, brandId: brandId || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Research failed')
      setResult(data)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Keyword Research</h1>
        <p className="text-slate-400">Find keyword opportunities with AI-powered research and real search data</p>
      </div>

      {/* Input */}
      <div className="geo-glass p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 bg-[rgba(255,255,255,0.04)] rounded-lg px-3 border border-[rgba(255,255,255,0.08)]">
            <MagnifyingGlassIcon className="w-4 h-4 text-slate-500 flex-shrink-0" />
            <input
              className="flex-1 bg-transparent text-white text-sm py-2.5 outline-none placeholder-slate-600"
              placeholder="Enter a seed keyword or topic…"
              value={seedKeyword}
              onChange={e => setSeedKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && runResearch()}
            />
          </div>
          {brands.length > 0 && (
            <select
              className="bg-[rgba(255,255,255,0.04)] border border-[rgba(255,255,255,0.08)] rounded-lg text-sm text-slate-300 px-3 py-2.5 outline-none"
              value={brandId}
              onChange={e => setBrandId(e.target.value)}
            >
              <option value="">All brands</option>
              {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          )}
          <button
            onClick={runResearch}
            disabled={loading}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold text-white transition-all whitespace-nowrap"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #818cf8 100%)', opacity: loading ? 0.7 : 1 }}
          >
            {loading ? <ArrowPathIcon className="w-4 h-4 animate-spin" /> : <SparklesIcon className="w-4 h-4" />}
            {loading ? 'Researching…' : 'Research'}
          </button>
        </div>
        {loading && <p className="text-xs text-slate-500 mt-2">Searching the web and analyzing keyword opportunities… this takes 15-30 seconds.</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5">
          {/* Related Keywords */}
          <div className="geo-glass p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-4 h-4 text-indigo-400" /> Related Keywords
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(255,255,255,0.08)]">
                    <th className="text-left py-2 text-slate-500 font-medium">Keyword</th>
                    <th className="text-center py-2 text-slate-500 font-medium w-24">Difficulty</th>
                    <th className="text-center py-2 text-slate-500 font-medium w-24">Volume</th>
                    <th className="text-center py-2 text-slate-500 font-medium w-28">Intent</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.related || []).map((kw, i) => (
                    <tr key={i} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(99,102,241,0.05)]">
                      <td className="py-2 text-white">{kw.keyword}</td>
                      <td className="py-2 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: `${DIFF_COLORS[kw.difficulty]}18`,
                          color: DIFF_COLORS[kw.difficulty],
                        }}>{kw.difficulty}</span>
                      </td>
                      <td className="py-2 text-center">
                        <span className="text-xs px-2 py-0.5 rounded-full" style={{
                          background: `${VOL_COLORS[kw.volume]}18`,
                          color: VOL_COLORS[kw.volume],
                        }}>{kw.volume}</span>
                      </td>
                      <td className="py-2 text-center text-xs text-slate-400">{kw.intent || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Long-tail + Questions side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Long-tail */}
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <MagnifyingGlassIcon className="w-4 h-4 text-indigo-400" /> Long-Tail Variations
              </h3>
              <div className="space-y-2">
                {(result.longtail || []).map((kw, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="text-sm text-slate-300">{kw.keyword}</span>
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0 ml-2" style={{
                      background: `${DIFF_COLORS[kw.difficulty]}18`,
                      color: DIFF_COLORS[kw.difficulty],
                    }}>{kw.difficulty}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Questions */}
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <ChatBubbleLeftRightIcon className="w-4 h-4 text-indigo-400" /> Question Keywords
              </h3>
              <div className="space-y-2">
                {(result.questions || []).map((q, i) => (
                  <div key={i} className="flex items-start gap-2 py-1.5 border-b border-[rgba(255,255,255,0.04)] last:border-0">
                    <span className="text-xs px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-400 flex-shrink-0 mt-0.5 uppercase font-mono">{q.type}</span>
                    <span className="text-sm text-slate-300">{q.keyword}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Content Gaps */}
          {(result.contentGaps || []).length > 0 && (
            <div className="geo-glass p-6">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <LightBulbIcon className="w-4 h-4 text-indigo-400" /> Content Gap Opportunities
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {result.contentGaps.map((gap, i) => (
                  <div key={i} className="bg-[rgba(255,255,255,0.03)] rounded-lg p-4 border border-[rgba(99,102,241,0.1)]">
                    <h4 className="text-sm font-semibold text-white mb-1">{gap.topic}</h4>
                    <p className="text-xs text-slate-500 mb-2">{gap.opportunity}</p>
                    <div className="text-xs text-indigo-400 bg-indigo-500/10 rounded px-2 py-1">
                      Suggested: {gap.suggestedTitle}
                    </div>
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
          <p className="text-lg">Enter a seed keyword to start researching</p>
          <p className="text-sm mt-1">Uses AI + web search to find real keyword opportunities</p>
        </div>
      )}
    </div>
  )
}
