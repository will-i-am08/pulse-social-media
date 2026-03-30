'use client'

import { useState } from 'react'
import { useBlog } from '@/context/BlogContext'
import { FOCUS_AREA_LABELS } from '@/lib/types'
import toast from 'react-hot-toast'
import { SparklesIcon } from '@heroicons/react/16/solid'

// ===================== TYPES =====================
export interface IdeaItem {
  title: string; primaryQuery: string; desc: string
  keywords: string[]; readTime: string; postType: string; category: string
}

// ===================== IDEAS TAB =====================
export default function IdeasTab({ onSelectIdea }: { onSelectIdea: (idea: IdeaItem) => void }) {
  const { activeBrand } = useBlog()
  const [count, setCount] = useState(5)
  const [focusArea, setFocusArea] = useState('all')
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<IdeaItem[]>([])
  const [trendData, setTrendData] = useState<Record<string, unknown> | null>(null)
  const [selected, setSelected] = useState<number | null>(null)

  const focusOptions = [
    { value: 'all', label: 'All topics' },
    ...((activeBrand?.focusAreas || []).map(a => ({ value: a, label: FOCUS_AREA_LABELS[a] || a }))),
  ]

  async function generate() {
    if (!activeBrand) { toast.error('Select or create a brand first'); return }
    setLoading(true); setIdeas([]); setTrendData(null)
    try {
      const res = await fetch('/api/blog/generate-ideas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brandId: activeBrand.id, count, focusArea }),
      })
      const data = await res.json()
      if (!res.ok) { toast.error(data.error || 'Generation failed'); return }
      setIdeas(data.ideas || [])
      setTrendData(data.trendData || null)
    } finally {
      setLoading(false)
    }
  }

  const pc = activeBrand?.primaryColor || '#0d9488'

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="card mb-6">
        <h2 className="text-lg font-bold text-white mb-1">Idea Generator</h2>
        <p className="text-sm text-slate-500 mb-5">Generate search-optimised blog ideas based on real search trends.</p>

        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="lbl mb-2">Number of ideas</label>
            <div className="flex items-center gap-3">
              <input type="range" min={3} max={15} value={count} onChange={e => setCount(+e.target.value)}
                className="w-32 accent-teal-400 h-1" />
              <span className="text-2xl font-bold" style={{ color: pc }}>{count}</span>
            </div>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="lbl mb-1">Focus area</label>
            <select className="sel" value={focusArea} onChange={e => setFocusArea(e.target.value)}>
              {focusOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
          <button
            onClick={generate} disabled={loading || !activeBrand}
            className="btn btn-p flex items-center gap-2 disabled:opacity-50"
            style={{ background: pc, boxShadow: `0 0 18px ${pc}44` }}
          >
            <SparklesIcon className="w-4 h-4" />
            {loading ? 'Researching...' : 'Generate Ideas'}
          </button>
        </div>
      </div>

      {loading && (
        <div className="card flex flex-col items-center gap-3 py-16">
          <div className="w-10 h-10 border-2 border-white/10 rounded-full animate-spin" style={{ borderTopColor: pc }} />
          <p className="text-sm text-slate-400">Researching search trends and generating ideas...</p>
        </div>
      )}

      {trendData && !loading && (
        <div className="card mb-5" style={{ borderColor: `${pc}30` }}>
          <h3 className="text-sm font-semibold text-white mb-3">Search Research</h3>
          <div className="flex flex-wrap gap-2">
            {((trendData as { topQueries?: Array<{ query: string }> }).topQueries || []).slice(0, 5).map((q: { query: string }, i: number) => (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300">&ldquo;{q.query}&rdquo;</span>
            ))}
          </div>
        </div>
      )}

      {ideas.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ideas.map((idea, i) => (
            <div
              key={i}
              onClick={() => setSelected(i)}
              className={`card cursor-pointer transition-all hover:-translate-y-0.5 ${selected === i ? 'ring-1' : ''}`}
              style={selected === i ? { borderColor: pc, boxShadow: `0 0 20px ${pc}30, 0 0 0 1px ${pc}` } : {}}
            >
              <div className="flex items-start justify-between gap-2 mb-1">
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: pc }}>{idea.category || idea.postType}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${idea.postType === 'How-To Guide' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-slate-400'}`}>{idea.postType}</span>
              </div>
              <h3 className="text-sm font-semibold text-white mb-2 leading-snug">{idea.title}</h3>
              <p className="text-xs text-slate-400 mb-3">{idea.desc}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {idea.keywords?.slice(0, 3).map((k, j) => <span key={j} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-400">{k}</span>)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">{idea.readTime}</span>
                <button
                  onClick={e => { e.stopPropagation(); onSelectIdea(idea) }}
                  className="text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-colors"
                  style={{ background: pc }}
                >
                  Write This &rarr;
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && ideas.length === 0 && (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">&#128161;</div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">No ideas yet</h3>
          <p className="text-sm text-slate-500">{activeBrand ? 'Click "Generate Ideas" to get started' : 'Create a brand first to generate ideas'}</p>
        </div>
      )}
    </div>
  )
}
