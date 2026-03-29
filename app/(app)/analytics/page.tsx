'use client'

import { useEffect, useRef } from 'react'
import { useWorkspace } from '@/context/WorkspaceContext'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  CalendarIcon,
  HandThumbUpIcon,
} from '@heroicons/react/16/solid'

export default function AnalyticsPage() {
  const { posts, brands } = useWorkspace()
  const monthlyChartRef = useRef<HTMLCanvasElement>(null)
  const platformChartRef = useRef<HTMLCanvasElement>(null)

  const published = posts.filter(p => p.status === 'published')
  const scheduled = posts.filter(p => p.status === 'scheduled')
  const approvedByClient = posts.filter(p => p.client_approved)
  const clientVisible = posts.filter(p => p.client_visible)
  const approvalRate = clientVisible.length > 0 ? Math.round(approvedByClient.length / clientVisible.length * 100) : 0

  // Monthly data (last 6 months)
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const m = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    const mEnd = new Date(now.getFullYear(), now.getMonth() - (5 - i) + 1, 0)
    return {
      label: m.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      published: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'published' && d >= m && d <= mEnd }).length,
      scheduled: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'scheduled' && d >= m && d <= mEnd }).length,
      drafts: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'draft' && d >= m && d <= mEnd }).length,
    }
  })

  const platformCounts: Record<string, number> = {}
  posts.forEach(p => (p.platforms || []).forEach(pl => { platformCounts[pl] = (platformCounts[pl] || 0) + 1 }))

  useEffect(() => {
    let mc: any = null
    let pc: any = null
    async function initCharts() {
      const Chart = (await import('chart.js/auto')).default
      const gridColor = 'rgba(90,64,66,0.2)'
      const textColor = '#e1bec0'

      if (monthlyChartRef.current) {
        mc = new Chart(monthlyChartRef.current, {
          type: 'bar',
          data: {
            labels: months.map(m => m.label),
            datasets: [
              { label: 'Published', data: months.map(m => m.published), backgroundColor: '#ff5473' },
              { label: 'Scheduled', data: months.map(m => m.scheduled), backgroundColor: '#ffb2b9' },
              { label: 'Drafts', data: months.map(m => m.drafts), backgroundColor: '#5a4042' },
            ]
          },
          options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { labels: { color: textColor, font: { size: 11 } } } },
            scales: {
              x: { grid: { color: gridColor }, ticks: { color: textColor } },
              y: { grid: { color: gridColor }, ticks: { color: textColor, stepSize: 1 }, beginAtZero: true },
            }
          }
        })
      }

      if (platformChartRef.current && Object.keys(platformCounts).length > 0) {
        const labels = Object.keys(platformCounts)
        pc = new Chart(platformChartRef.current, {
          type: 'doughnut',
          data: {
            labels: labels.map(l => l[0].toUpperCase() + l.slice(1)),
            datasets: [{ data: labels.map(l => platformCounts[l]), backgroundColor: ['#ff5473', '#ffb2b9', '#e8405f', '#5a4042'] }]
          },
          options: {
            responsive: true, maintainAspectRatio: true,
            plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 } } } }
          }
        })
      }
    }
    initCharts()
    return () => { mc?.destroy(); pc?.destroy() }
  }, [posts])

  const stats = [
    { label: 'Total Posts', val: posts.length, Icon: DocumentTextIcon },
    { label: 'Published', val: published.length, Icon: CheckCircleIcon },
    { label: 'Scheduled', val: scheduled.length, Icon: CalendarIcon },
    { label: 'Client Approval Rate', val: `${approvalRate}%`, Icon: HandThumbUpIcon },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Analytics</h1>
          <p className="text-[#e1bec0] mt-1">Content performance across your brands</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <div key={s.label} className="card p-4 flex items-center gap-3">
            <s.Icon className="w-6 h-6 text-[#ff5473] flex-shrink-0" />
            <div>
              <p className="text-2xl font-bold text-[#e6e1e1]">{s.val}</p>
              <p className="text-xs text-[#e1bec0]">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-6">
        <div className="card p-4">
          <h3 className="font-semibold text-[#e6e1e1] mb-4">Posts Over Time</h3>
          <canvas ref={monthlyChartRef} height={200} />
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-[#e6e1e1] mb-4">Platform Breakdown</h3>
          {Object.keys(platformCounts).length === 0 ? (
            <p className="text-[#e1bec0] text-sm text-center py-16">No platform data yet</p>
          ) : (
            <canvas ref={platformChartRef} height={200} />
          )}
        </div>
      </div>

      {/* Brand breakdown */}
      <div className="card">
        <div className="p-4 border-b border-[rgba(90,64,66,0.2)]">
          <h3 className="font-semibold text-[#e6e1e1]">By Brand</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[rgba(90,64,66,0.2)]">
                <th className="text-left p-3 text-[#e1bec0] font-medium">Brand</th>
                <th className="text-center p-3 text-[#e1bec0] font-medium">Total</th>
                <th className="text-center p-3 text-[#e1bec0] font-medium">Published</th>
                <th className="text-center p-3 text-[#e1bec0] font-medium">Scheduled</th>
                <th className="text-center p-3 text-[#e1bec0] font-medium">Drafts</th>
              </tr>
            </thead>
            <tbody>
              {brands.length === 0 ? (
                <tr><td colSpan={5} className="text-center p-6 text-[#e1bec0]">No brands yet</td></tr>
              ) : brands.map(b => {
                const bp = posts.filter(p => p.brand_profile_id === b.id)
                return (
                  <tr key={b.id} className="border-b border-[rgba(90,64,66,0.1)] hover:bg-[rgba(255,84,115,0.04)]">
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ background: b.color || '#ff5473' }}></div>
                        <span className="font-medium text-[#e6e1e1]">{b.name}</span>
                      </div>
                    </td>
                    <td className="text-center p-3 text-[#e6e1e1]">{bp.length}</td>
                    <td className="text-center p-3"><span className="badge bd-pub">{bp.filter(p => p.status === 'published').length}</span></td>
                    <td className="text-center p-3"><span className="badge bd-sched">{bp.filter(p => p.status === 'scheduled').length}</span></td>
                    <td className="text-center p-3"><span className="badge bd-draft">{bp.filter(p => p.status === 'draft').length}</span></td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
