'use client'

import { useState } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/16/solid'

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
      return date.getFullYear() === year && date.getMonth() === month && date.getDate() === day
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
