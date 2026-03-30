'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { useWorkspace } from '@/context/WorkspaceContext'
import StatusBadge from '@/components/app/StatusBadge'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import { fmtDate, bufferServiceIcon } from '@/lib/utils'
import type { Post } from '@/lib/types'
import {
  PencilSquareIcon,
  PhotoIcon,
  EyeIcon,
  HandThumbUpIcon,
  ClipboardDocumentIcon,
  PaperAirplaneIcon,
  TrashIcon,
  ArrowPathIcon,
  CalendarDaysIcon,
} from '@heroicons/react/16/solid'

interface BufferProfile {
  id: string
  service: string
  formatted_service: string
  formatted_username: string
  avatar_https: string
}

const STATUS_OPTIONS = ['all', 'draft', 'submitted', 'approved', 'scheduled', 'published']
const PLATFORM_ICONS: Record<string, string> = { instagram: 'IG', facebook: 'FB', linkedin: 'LI' }

const DAY_MAP: Record<number, string> = { 0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat' }

export default function PostsPage() {
  const { brands, posts, savePosts } = useWorkspace()
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [bulkSending, setBulkSending] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [schedStart, setSchedStart] = useState('')
  const [schedEnd, setSchedEnd] = useState('')
  const [schedulingDrafts, setSchedulingDrafts] = useState(false)
  const [bufferProfiles, setBufferProfiles] = useState<BufferProfile[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetch('/api/buffer')
      .then(r => r.json())
      .then(data => {
        if (data.profiles) {
          setBufferProfiles(data.profiles)
          setSelectedProfiles(new Set(data.profiles.map((p: BufferProfile) => p.id)))
        }
      })
      .catch(() => {})
  }, [])

  const filtered = posts.filter(p => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false
    if (brandFilter !== 'all' && p.brand_profile_id !== brandFilter) return false
    return true
  })

  function changeStatus(id: string, status: Post['status']) {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p)
    savePosts(updated)
    toast.success(`Post marked as ${status}`)
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id))
    toast.success('Post deleted')
  }

  async function sendToBuffer(post: Post) {
    if (bufferProfiles.length === 0) { toast.error('Connect Buffer in Account Settings first'); return }
    const profileIds = Array.from(selectedProfiles)
    if (profileIds.length === 0) { toast.error('Select at least one Buffer profile'); return }
    setSendingId(post.id)
    try {
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds,
          text: post.caption,
          media: post.image_url ? { photo: post.image_url } : undefined,
          scheduledAt: post.scheduled_at || undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        changeStatus(post.id, 'published')
        toast.success('Sent to Buffer!')
      } else {
        toast.error(data.results?.find((r: any) => !r.success)?.error || 'Failed to send to Buffer')
      }
    } catch {
      toast.error('Failed to send to Buffer')
    } finally {
      setSendingId(null)
    }
  }

  async function sendAllApproved() {
    const approved = posts.filter(p => p.status === 'approved' || p.status === 'scheduled')
    if (approved.length === 0) { toast.error('No approved/scheduled posts to send'); return }
    if (bufferProfiles.length === 0) { toast.error('Connect Buffer in Account Settings first'); return }
    const profileIds = Array.from(selectedProfiles)
    if (profileIds.length === 0) { toast.error('Select at least one Buffer profile'); return }

    setBulkSending(true)
    let sent = 0
    let failed = 0

    for (const post of approved) {
      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileIds,
            text: post.caption,
            media: post.image_url ? { photo: post.image_url } : undefined,
            scheduledAt: post.scheduled_at || undefined,
          }),
        })
        const data = await res.json()
        if (data.success) {
          sent++
          changeStatus(post.id, 'published')
        } else {
          failed++
        }
      } catch {
        failed++
      }
    }

    setBulkSending(false)
    if (sent > 0) toast.success(`${sent} post${sent !== 1 ? 's' : ''} sent to Buffer!`)
    if (failed > 0) toast.error(`${failed} post${failed !== 1 ? 's' : ''} failed to send`)
  }

  async function scheduleDrafts() {
    const drafts = posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter))
    if (drafts.length === 0) { toast.error('No drafts to schedule'); return }
    if (!schedStart || !schedEnd) { toast.error('Pick a date range'); return }

    // Group drafts by brand
    const byBrand: Record<string, typeof drafts> = {}
    for (const d of drafts) {
      if (!byBrand[d.brand_profile_id]) byBrand[d.brand_profile_id] = []
      byBrand[d.brand_profile_id].push(d)
    }

    setSchedulingDrafts(true)
    let totalScheduled = 0
    let totalBuffered = 0

    for (const [bid, brandDrafts] of Object.entries(byBrand)) {
      const brand = brands.find(b => b.id === bid)
      if (!brand?.posting_days?.length) continue
      const time = brand.posting_time || '09:00'
      const existingDates = new Set(
        posts.filter(p => p.scheduled_at && p.brand_profile_id === bid && p.status !== 'draft')
          .map(p => p.scheduled_at!.slice(0, 10))
      )

      const slots: string[] = []
      const start = new Date(schedStart)
      const end = new Date(schedEnd)
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dayName = DAY_MAP[d.getDay()]
        if (brand.posting_days.includes(dayName)) {
          const dateStr = d.toISOString().slice(0, 10)
          if (!existingDates.has(dateStr)) slots.push(`${dateStr}T${time}`)
        }
      }

      const profileIds = brand.buffer_profile_ids || []
      for (let i = 0; i < brandDrafts.length && i < slots.length; i++) {
        brandDrafts[i].scheduled_at = slots[i]
        brandDrafts[i].status = profileIds.length > 0 ? 'published' : 'scheduled'
        totalScheduled++

        if (profileIds.length > 0) {
          try {
            const res = await fetch('/api/buffer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                profileIds,
                text: brandDrafts[i].caption,
                media: brandDrafts[i].image_url ? { photo: brandDrafts[i].image_url } : undefined,
                scheduledAt: slots[i],
              }),
            })
            const data = await res.json()
            if (data.success) totalBuffered++
          } catch { /* continue */ }
        }
      }
    }

    savePosts([...posts])
    setSchedulingDrafts(false)
    setShowScheduler(false)
    if (totalScheduled > 0) {
      toast.success(`${totalScheduled} post${totalScheduled !== 1 ? 's' : ''} scheduled${totalBuffered > 0 ? ` (${totalBuffered} sent to Buffer)` : ''}!`)
    } else {
      toast.error('No brands have posting days configured. Set them in Settings.')
    }
  }

  function toggleProfile(id: string) {
    setSelectedProfiles(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Posts</h1>
          <p className="text-[#e1bec0] mt-1">{filtered.length} of {posts.length} posts</p>
        </div>
        <div className="flex gap-2">
          {posts.some(p => p.status === 'draft') && (
            <button onClick={() => setShowScheduler(true)} className="btn btn-o flex items-center gap-2">
              <CalendarDaysIcon className="w-4 h-4" /> Schedule Drafts
            </button>
          )}
          {bufferProfiles.length > 0 && posts.some(p => p.status === 'approved' || p.status === 'scheduled') && (
            <button
              onClick={sendAllApproved}
              disabled={bulkSending || selectedProfiles.size === 0}
              className="btn btn-o flex items-center gap-2"
            >
              {bulkSending
                ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...</>
                : <><PaperAirplaneIcon className="w-4 h-4" /> Send All Approved</>
              }
            </button>
          )}
          <Link href="/create-post" className="btn btn-p flex items-center gap-2">
            <PencilSquareIcon className="w-4 h-4" /> New Post
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select className="sel" style={{ width: 'auto' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s === 'all' ? 'All Statuses' : s}</option>)}
        </select>
        <select className="sel" style={{ width: 'auto' }} value={brandFilter} onChange={e => setBrandFilter(e.target.value)}>
          <option value="all">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
      </div>

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">No posts found</p>
          <Link href="/create-post" className="btn btn-p">Create your first post</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(post => {
            const brand = brands.find(b => b.id === post.brand_profile_id)
            const isExpanded = expandedId === post.id
            return (
              <div key={post.id} className="card overflow-hidden">
                <div
                  className="flex items-center gap-3 p-4 cursor-pointer hover:bg-[rgba(255,84,115,0.04)] transition-colors"
                  onClick={() => setExpandedId(isExpanded ? null : post.id)}
                >
                  {post.image_url ? (
                    <img src={post.image_url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-[#2b2a29] flex items-center justify-center flex-shrink-0">
                      <PhotoIcon className="w-6 h-6 text-[#5a4042]" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      {brand && (
                        <div className="w-5 h-5 rounded-full flex items-center justify-center text-white text-[10px] font-bold"
                          style={{ background: brand.color || '#ff5473' }}>
                          {brand.name[0]}
                        </div>
                      )}
                      <span className="text-sm font-medium text-[#e6e1e1]">{brand?.name || 'Unknown'}</span>
                      <StatusBadge status={post.status} />
                    </div>
                    <p className="text-sm text-[#e1bec0] truncate">{post.caption || '(No caption)'}</p>
                    <p className="text-xs text-[#5a4042] mt-0.5">{fmtDate(post.created_date)}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {post.client_visible && <EyeIcon className="w-4 h-4 text-[#e1bec0]" title="Visible to client" />}
                    {post.client_approved && <HandThumbUpIcon className="w-4 h-4 text-emerald-400" title="Client approved" />}
                    {(post.platforms || []).map(p => (
                      <span key={p} className="text-[9px] font-bold text-[#e1bec0] bg-[#2b2a29] px-1.5 py-0.5 rounded" title={p}>
                        {PLATFORM_ICONS[p] || p}
                      </span>
                    ))}
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-[rgba(90,64,66,0.2)] p-4 space-y-4">
                    <div className="relative">
                      <p className="text-sm text-[#e6e1e1] whitespace-pre-wrap pr-16">{post.caption}</p>
                      <button
                        className="absolute top-0 right-0 btn btn-o btn-sm flex items-center gap-1"
                        onClick={() => { navigator.clipboard.writeText(post.caption); toast.success('Copied!') }}
                      >
                        <ClipboardDocumentIcon className="w-3 h-3" /> Copy
                      </button>
                    </div>
                    {post.image_urls && post.image_urls.length > 1 && (
                      <div className="flex gap-2 flex-wrap">
                        {post.image_urls.map((url, i) => (
                          <img key={i} src={url} alt="" className="h-20 w-20 object-cover rounded-lg" />
                        ))}
                      </div>
                    )}
                    {/* Client visibility */}
                    <div className="flex items-center gap-3 p-3 bg-[#211f1f] rounded-lg">
                      <label className="flex items-center gap-2 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[#ff5473]"
                          checked={post.client_visible || false}
                          onChange={e => {
                            const updated = posts.map(p => p.id === post.id ? { ...p, client_visible: e.target.checked } : p)
                            savePosts(updated)
                          }}
                        />
                        <span className="text-sm text-[#e6e1e1] flex items-center gap-1">
                          <EyeIcon className="w-4 h-4" /> Visible to client
                        </span>
                      </label>
                      {post.client_approved && (
                        <span className="badge bd-app flex items-center gap-1">
                          <HandThumbUpIcon className="w-3 h-3" /> Client Approved
                        </span>
                      )}
                    </div>
                    {/* Status buttons */}
                    <div className="flex flex-wrap gap-2">
                      {(['draft', 'submitted', 'approved', 'scheduled', 'published'] as Post['status'][]).map(s => (
                        <button key={s} onClick={() => changeStatus(post.id, s)}
                          className={`btn btn-sm ${post.status === s ? 'btn-p' : 'btn-o'}`}>
                          {s}
                        </button>
                      ))}
                    </div>
                    {/* Buffer profile selector */}
                    {(post.status === 'approved' || post.status === 'scheduled') && bufferProfiles.length > 0 && (
                      <div className="p-3 bg-[#211f1f] rounded-lg">
                        <label className="text-xs font-medium text-[#e1bec0] mb-1.5 block">Send to Buffer profiles:</label>
                        <div className="flex flex-wrap gap-2">
                          {bufferProfiles.map(p => (
                            <label key={p.id} className="flex items-center gap-1.5 cursor-pointer text-sm">
                              <input
                                type="checkbox"
                                className="w-3.5 h-3.5 accent-[#ff5473]"
                                checked={selectedProfiles.has(p.id)}
                                onChange={() => toggleProfile(p.id)}
                              />
                              <span className="text-[#e6e1e1]">
                                {bufferServiceIcon(p.service)} {p.formatted_username || p.formatted_service}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {(post.status === 'approved' || post.status === 'scheduled') && (
                        <button
                          onClick={() => sendToBuffer(post)}
                          disabled={sendingId === post.id || selectedProfiles.size === 0}
                          className="btn btn-p btn-sm flex items-center gap-1"
                        >
                          {sendingId === post.id
                            ? <><ArrowPathIcon className="w-3 h-3 animate-spin" /> Sending...</>
                            : <><PaperAirplaneIcon className="w-3 h-3" /> Send to Buffer</>
                          }
                        </button>
                      )}
                      <button onClick={() => setConfirmDelete(post.id)} className="btn btn-d btn-sm flex items-center gap-1">
                        <TrashIcon className="w-3 h-3" /> Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Post"
          description="This will permanently delete this post."
          onConfirm={() => { deletePost(confirmDelete!); setConfirmDelete(null) }}
          onClose={() => setConfirmDelete(null)}
        />
      )}

      {/* Schedule Drafts Modal */}
      {showScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowScheduler(false)}>
          <div className="card p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#e6e1e1] mb-1 flex items-center gap-2">
              <CalendarDaysIcon className="w-5 h-5 text-[#ff5473]" /> Schedule Drafts
            </h3>
            <p className="text-xs text-[#e1bec0] mb-4">
              Assigns dates to draft posts using each brand&apos;s posting schedule. Posts with Buffer profiles configured will be sent automatically.
            </p>
            <div className="space-y-3 mb-4">
              <div>
                <label className="text-xs text-[#e1bec0] mb-1 block">Start Date</label>
                <input type="date" className="inp" value={schedStart} onChange={e => setSchedStart(e.target.value)} />
              </div>
              <div>
                <label className="text-xs text-[#e1bec0] mb-1 block">End Date</label>
                <input type="date" className="inp" value={schedEnd} onChange={e => setSchedEnd(e.target.value)} />
              </div>
            </div>
            <p className="text-xs text-[#e1bec0] mb-4">
              {posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter)).length} draft{posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter)).length !== 1 ? 's' : ''} will be scheduled
              {brandFilter !== 'all' ? ` for ${brands.find(b => b.id === brandFilter)?.name || 'selected brand'}` : ' across all brands'}
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn btn-o" onClick={() => setShowScheduler(false)}>Cancel</button>
              <button className="btn btn-p flex items-center gap-2" disabled={schedulingDrafts || !schedStart || !schedEnd} onClick={scheduleDrafts}>
                {schedulingDrafts ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Scheduling...</> : <><CalendarDaysIcon className="w-4 h-4" /> Schedule & Send</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
