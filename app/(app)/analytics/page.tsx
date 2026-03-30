'use client'

import { useWorkspace } from '@/context/WorkspaceContext'
import {
  DocumentTextIcon,
  CheckCircleIcon,
  CalendarIcon,
  HandThumbUpIcon,
} from '@heroicons/react/16/solid'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'

const COLORS = ['#ff5473', '#ffb2b9', '#e8405f', '#5a4042', '#f4b7c0', '#ffb59e']

export default function AnalyticsPage() {
  const { posts, brands } = useWorkspace()

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
      Published: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'published' && d >= m && d <= mEnd }).length,
      Scheduled: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'scheduled' && d >= m && d <= mEnd }).length,
      Drafts: posts.filter(p => { const d = new Date(p.created_date || ''); return p.status === 'draft' && d >= m && d <= mEnd }).length,
    }
  })

  const platformCounts: Record<string, number> = {}
  posts.forEach(p => (p.platforms || []).forEach(pl => { platformCounts[pl] = (platformCounts[pl] || 0) + 1 }))
  const platformData = Object.entries(platformCounts).map(([name, value]) => ({
    name: name[0].toUpperCase() + name.slice(1),
    value,
  }))

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
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={months}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(90,64,66,0.2)" />
              <XAxis dataKey="label" tick={{ fill: '#e1bec0', fontSize: 11 }} />
              <YAxis tick={{ fill: '#e1bec0', fontSize: 11 }} allowDecimals={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1a1919', border: '1px solid rgba(90,64,66,0.3)', borderRadius: 8, color: '#e6e1e1' }}
              />
              <Legend wrapperStyle={{ fontSize: 11, color: '#e1bec0' }} />
              <Bar dataKey="Published" fill="#ff5473" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Scheduled" fill="#ffb2b9" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Drafts" fill="#5a4042" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card p-4">
          <h3 className="font-semibold text-[#e6e1e1] mb-4">Platform Breakdown</h3>
          {platformData.length === 0 ? (
            <p className="text-[#e1bec0] text-sm text-center py-16">No platform data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={platformData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {platformData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1a1919', border: '1px solid rgba(90,64,66,0.3)', borderRadius: 8, color: '#e6e1e1' }}
                />
              </PieChart>
            </ResponsiveContainer>
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
