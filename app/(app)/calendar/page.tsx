'use client'

import { useMemo, useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'
import { POST_CATEGORIES } from '@/lib/types'

const WEEKLY_TARGET = 7

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-yellow-500',
  submitted: 'bg-violet-500',
  approved: 'bg-emerald-500',
  scheduled: 'bg-[#ffb2b9]',
  published: 'bg-[#ff5473]',
}

export default function CalendarPage() {
  const { posts, brands } = useWorkspace()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())
  const [categoryFilter, setCategoryFilter] = useState<string>('')

  // ----- Weekly pillar tracker (this calendar week, Mon-Sun) -----
  const weekStats = useMemo(() => {
    const today = new Date()
    const dow = today.getDay() // 0 Sun..6 Sat
    const mondayOffset = dow === 0 ? -6 : 1 - dow
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() + mondayOffset)
    const end = new Date(start); end.setDate(start.getDate() + 7)
    const weekPosts = posts.filter(p => {
      const d = p.scheduled_at || p.created_date
      if (!d) return false
      const dt = new Date(d)
      return dt >= start && dt < end
    })
    const byCat = new Map<string, number>()
    for (const p of weekPosts) {
      const k = (p as { category?: string | null }).category || 'uncategorised'
      byCat.set(k, (byCat.get(k) || 0) + 1)
    }
    const covered = POST_CATEGORIES.filter(c => byCat.get(c.id))
    const missing = POST_CATEGORIES.filter(c => !byCat.get(c.id))
    return { count: weekPosts.length, byCat, covered, missing, start, end }
  }, [posts])

  const monthName = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  function prevMonth() {
    if (month === 0) { setMonth(11); setYear(y => y - 1) } else setMonth(m => m - 1)
  }
  function nextMonth() {
    if (month === 11) { setMonth(0); setYear(y => y + 1) } else setMonth(m => m + 1)
  }

  function getPostsForDay(day: number) {
    return posts.filter(p => {
      const d = p.scheduled_at || p.created_date
      if (!d) return false
      const date = new Date(d)
      if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) return false
      if (categoryFilter && (p as { category?: string | null }).category !== categoryFilter) return false
      return true
    })
  }

  const cells: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Calendar</h1>
          <p className="text-[#e1bec0] mt-1">Content schedule overview</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn btn-o"><ChevronLeftIcon className="w-4 h-4" /></button>
          <span className="font-semibold text-[#e6e1e1] min-w-[160px] text-center">{monthName}</span>
          <button onClick={nextMonth} className="btn btn-o"><ChevronRightIcon className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Weekly pillar tracker */}
      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
          <div>
            <p className="text-xs text-[#e1bec0] uppercase tracking-wide">This week</p>
            <p className="text-lg font-semibold text-[#e6e1e1]">
              {weekStats.count}/{WEEKLY_TARGET} posts
              <span className="ml-2 text-xs font-normal text-[#5a4042]">
                {weekStats.start.toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })} – {new Date(weekStats.end.getTime() - 1).toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}
              </span>
            </p>
          </div>
          <div className="text-xs text-[#e1bec0]">
            Pillars covered: <span className="text-emerald-400">{weekStats.covered.length}</span> / {POST_CATEGORIES.length}
          </div>
        </div>
        <div className="w-full h-2 bg-[#211f1f] rounded-full overflow-hidden mb-3">
          <div className="h-full bg-[#ff5473] transition-all"
            style={{ width: `${Math.min(100, (weekStats.count / WEEKLY_TARGET) * 100)}%` }} />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {POST_CATEGORIES.map(c => {
            const n = weekStats.byCat.get(c.id) || 0
            return (
              <span key={c.id}
                className={`px-2 py-0.5 rounded-full text-[10px] border ${n > 0 ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' : 'bg-white/5 text-[#5a4042] border-transparent'}`}>
                {c.label}{n > 0 ? ` ×${n}` : ''}
              </span>
            )
          })}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <span className="text-xs text-[#5a4042]">Filter:</span>
        <button onClick={() => setCategoryFilter('')}
          className={`px-2.5 py-1 rounded-full text-[11px] border ${!categoryFilter ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 border-transparent'}`}>
          All
        </button>
        {POST_CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setCategoryFilter(categoryFilter === c.id ? '' : c.id)}
            className={`px-2.5 py-1 rounded-full text-[11px] border ${categoryFilter === c.id ? 'bg-[rgba(255,84,115,0.15)] text-[#ff5473] border-[#ff5473]/40' : 'bg-white/5 text-white/60 border-transparent'}`}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mb-4">
        {Object.entries(STATUS_COLORS).map(([s, cls]) => (
          <div key={s} className="flex items-center gap-1.5 text-xs text-[#e1bec0]">
            <div className={`w-2.5 h-2.5 rounded-full ${cls}`}></div>
            <span className="capitalize">{s}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="card overflow-hidden">
        <div className="grid grid-cols-7 border-b border-[rgba(90,64,66,0.2)]">
          {DAYS.map(d => (
            <div key={d} className="p-3 text-center text-xs font-bold text-[#e1bec0] uppercase">
              {d}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="cal-day opacity-30" />
            const dayPosts = getPostsForDay(day)
            const isToday = year === now.getFullYear() && month === now.getMonth() && day === now.getDate()
            return (
              <div key={i} className="cal-day">
                <div className={`text-xs font-semibold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-[#ff5473] text-white' : 'text-[#e6e1e1]'}`}>
                  {day}
                </div>
                {dayPosts.slice(0, 3).map(p => {
                  const b = brands.find(b => b.id === p.brand_profile_id)
                  return (
                    <div key={p.id} className={`cal-pill ${STATUS_COLORS[p.status] || 'bg-[#5a4042]'}`}
                      title={`${b?.name || 'Unknown'}: ${p.caption?.slice(0, 60) || '(no caption)'}`}>
                      {b?.name || '?'}
                    </div>
                  )
                })}
                {dayPosts.length > 3 && (
                  <div className="text-[9px] text-[#e1bec0]">+{dayPosts.length - 3} more</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
