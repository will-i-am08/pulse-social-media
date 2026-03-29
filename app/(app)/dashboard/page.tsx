'use client'

import Link from 'next/link'
import { useWorkspace } from '@/context/WorkspaceContext'
import StatusBadge from '@/components/app/StatusBadge'
import { fmtDateTime } from '@/lib/utils'
import {
  PencilSquareIcon,
  TagIcon,
  DocumentTextIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClipboardDocumentIcon,
  PhotoIcon,
} from '@heroicons/react/16/solid'

export default function DashboardPage() {
  const { brands, posts, loading } = useWorkspace()

  const scheduled = posts.filter(p => p.status === 'scheduled')
  const drafts = posts.filter(p => p.status === 'draft')
  const published = posts.filter(p => p.status === 'published')
  const submitted = posts.filter(p => p.status === 'submitted')

  const stats = [
    { label: 'Brands', val: brands.length, Icon: TagIcon, href: '/brands' },
    { label: 'Drafts', val: drafts.length, Icon: DocumentTextIcon, href: '/posts' },
    { label: 'Scheduled', val: scheduled.length, Icon: CalendarIcon, href: '/posts' },
    { label: 'Published', val: published.length, Icon: CheckCircleIcon, href: '/posts' },
  ]

  if (loading) {
    return (
      <div className="p-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-5 skeleton h-24" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Dashboard</h1>
          <p className="text-[#e1bec0] mt-1">Your content at a glance</p>
        </div>
        <Link href="/create-post" className="btn btn-p flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map(s => (
          <Link key={s.label} href={s.href} className="card p-5 cursor-pointer hover:border-[rgba(255,84,115,0.3)] transition-colors block">
            <div className="flex items-center gap-3">
              <s.Icon className="w-6 h-6 text-[#ff5473] flex-shrink-0" />
              <div>
                <p className="text-2xl font-bold text-[#e6e1e1]">{s.val}</p>
                <p className="text-xs text-[#e1bec0]">{s.label}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pending review banner */}
      {submitted.length > 0 && (
        <div className="mb-6 p-4 bg-[rgba(255,84,115,0.08)] border border-[rgba(255,84,115,0.2)] rounded-xl flex items-center gap-3">
          <ClipboardDocumentIcon className="w-5 h-5 text-[#ff5473] flex-shrink-0" />
          <div className="flex-1">
            <p className="font-medium text-[#ffb2b9]">
              {submitted.length} post{submitted.length !== 1 ? 's' : ''} pending review
            </p>
            <p className="text-sm text-[#e1bec0]">Team members have submitted posts for approval.</p>
          </div>
          <Link href="/posts" className="btn btn-p btn-sm">Review Now</Link>
        </div>
      )}

      {/* Getting started */}
      {brands.length === 0 && (
        <div className="card p-6 mb-6 border-dashed border-2 border-[rgba(255,84,115,0.3)] text-center">
          <p className="text-lg font-semibold text-[#e6e1e1] mb-2">Welcome to CaptionCraft!</p>
          <p className="text-[#e1bec0] text-sm mb-4">Start by creating a brand profile, then create your first post.</p>
          <div className="flex gap-3 justify-center">
            <Link href="/brands" className="btn btn-p">Create Brand</Link>
            <Link href="/create-post" className="btn btn-o">Create Post</Link>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Upcoming Scheduled */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-[rgba(90,64,66,0.2)]">
            <h3 className="font-semibold text-[#e6e1e1]">Upcoming Scheduled</h3>
            <Link href="/calendar" className="btn btn-o btn-sm">View Calendar</Link>
          </div>
          <div className="p-4 space-y-3">
            {scheduled.slice(0, 5).length === 0 ? (
              <p className="text-sm text-[#e1bec0]">No scheduled posts yet.</p>
            ) : scheduled.slice(0, 5).map(p => {
              const brand = brands.find(b => b.id === p.brand_profile_id)
              return (
                <div key={p.id} className="flex items-center gap-3">
                  {p.image_url ? (
                    <img src={p.image_url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-[#2b2a29] flex items-center justify-center flex-shrink-0">
                      <PhotoIcon className="w-5 h-5 text-[#5a4042]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate text-[#e6e1e1]">{brand?.name || 'Unknown Brand'}</p>
                    <p className="text-xs text-[#e1bec0]">{fmtDateTime(p.scheduled_at)}</p>
                  </div>
                  <StatusBadge status={p.status} />
                </div>
              )
            })}
          </div>
        </div>

        {/* Brand Profiles */}
        <div className="card">
          <div className="flex items-center justify-between p-4 border-b border-[rgba(90,64,66,0.2)]">
            <h3 className="font-semibold text-[#e6e1e1]">Brand Profiles</h3>
            <Link href="/brands" className="btn btn-o btn-sm">Manage</Link>
          </div>
          <div className="p-4 space-y-3">
            {brands.slice(0, 5).length === 0 ? (
              <p className="text-sm text-[#e1bec0]">No brands yet.</p>
            ) : brands.slice(0, 5).map(b => (
              <div key={b.id} className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
                  style={{ background: b.color || '#ff5473' }}
                >
                  {(b.name || '?')[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-[#e6e1e1]">{b.name}</p>
                  <p className="text-xs text-[#e1bec0] capitalize">{b.tone || 'professional'} · {b.output_length || 'medium'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content by Brand */}
      {brands.length > 0 && (
        <div className="card mt-6">
          <div className="p-4 border-b border-[rgba(90,64,66,0.2)]">
            <h3 className="font-semibold text-[#e6e1e1]">Content by Brand</h3>
          </div>
          <div className="p-4 space-y-4">
            {brands.map(b => {
              const bp = posts.filter(p => p.brand_profile_id === b.id)
              const bpub = bp.filter(p => p.status === 'published').length
              const bsched = bp.filter(p => p.status === 'scheduled').length
              const bdraft = bp.filter(p => p.status === 'draft').length
              return (
                <div key={b.id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ background: b.color || '#ff5473' }}></div>
                      <span className="text-sm font-medium text-[#e6e1e1]">{b.name}</span>
                    </div>
                    <span className="text-xs text-[#e1bec0]">{bp.length} total</span>
                  </div>
                  <div className="flex gap-1 text-xs flex-wrap">
                    <span className="badge bd-pub">{bpub} published</span>
                    <span className="badge bd-sched">{bsched} scheduled</span>
                    <span className="badge bd-draft">{bdraft} draft</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
