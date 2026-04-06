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
  CheckIcon,
  XMarkIcon,
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

export default function PostsPage() {
  const { brands, posts, savePosts } = useWorkspace()
  const [statusFilter, setStatusFilter] = useState('all')
  const [brandFilter, setBrandFilter] = useState('all')
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [bulkSending, setBulkSending] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [showScheduler, setShowScheduler] = useState(false)
  const [schedulingDrafts, setSchedulingDrafts] = useState(false)
  const [bufferProfiles, setBufferProfiles] = useState<BufferProfile[]>([])
  const [selectedProfiles, setSelectedProfiles] = useState<Set<string>>(new Set())
  const [selectedPosts, setSelectedPosts] = useState<Set<string>>(new Set())

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

  async function changeStatus(id: string, status: Post['status']) {
    const updated = posts.map(p => p.id === id ? { ...p, status } : p)
    savePosts(updated)

    // Auto-send to Buffer when approving
    if (status === 'approved') {
      const post = posts.find(p => p.id === id)
      if (post) {
        const brand = brands.find(b => b.id === post.brand_profile_id)
        const profileIds = brand?.buffer_profile_ids || []
        if (profileIds.length > 0) {
          try {
            const res = await fetch('/api/buffer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileIds, text: post.caption, media: post.image_url ? { photo: post.image_url } : undefined }),
            })
            const data = await res.json()
            if (data.success) {
              savePosts(posts.map(p => p.id === id ? { ...p, status: 'published' } : p))
              toast.success('Approved and added to Buffer queue!')
              return
            }
          } catch { /* fall through */ }
        }
      }
    }
    toast.success(`Post marked as ${status}`)
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id))
    toast.success('Post deleted')
  }

  async function sendToBuffer(post: Post) {
    const brand = brands.find(b => b.id === post.brand_profile_id)
    const profileIds = brand?.buffer_profile_ids?.length
      ? brand.buffer_profile_ids
      : Array.from(selectedProfiles)
    if (profileIds.length === 0) {
      toast.error('No Buffer profiles configured for this brand. Go to Settings to set them up.')
      return
    }
    setSendingId(post.id)
    try {
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profileIds,
          text: post.caption,
          media: post.image_url ? { photo: post.image_url } : undefined,
        }),
      })
      const data = await res.json()
      if (data.success) {
        changeStatus(post.id, 'published')
        toast.success('Added to Buffer queue!')
      } else {
        toast.error(data.results?.find((r: { success: boolean; error?: string }) => !r.success)?.error || 'Failed to send to Buffer')
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

    setBulkSending(true)
    let sent = 0
    let failed = 0
    let lastError = ''

    const results = await Promise.all(approved.map(async (post) => {
      const brand = brands.find(b => b.id === post.brand_profile_id)
      const profileIds = brand?.buffer_profile_ids?.length
        ? brand.buffer_profile_ids
        : Array.from(selectedProfiles)
      if (profileIds.length === 0) {
        return { post, success: false, error: `No Buffer profiles configured for brand "${brand?.name || 'Unknown'}"` }
      }
      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profileIds,
            text: post.caption,
            media: post.image_url ? { photo: post.image_url } : undefined,
          }),
        })
        const data = await res.json()
        const anySuccess = data.success || data.results?.some((r: { success: boolean }) => r.success)
        if (anySuccess) {
          return { post, success: true }
        } else {
          return { post, success: false, error: data.results?.find((r: { success: boolean; error?: string }) => r.error)?.error || data.error || 'Unknown error' }
        }
      } catch (e: unknown) {
        return { post, success: false, error: e instanceof Error ? e.message : 'Request failed' }
      }
    }))

    for (const result of results) {
      if (result.success) {
        sent++
        changeStatus(result.post.id, 'published')
      } else {
        failed++
        lastError = result.error || 'Unknown error'
      }
    }

    setBulkSending(false)
    if (sent > 0) toast.success(`${sent} post${sent !== 1 ? 's' : ''} added to Buffer queue!`)
    if (failed > 0) toast.error(`${failed} post${failed !== 1 ? 's' : ''} failed: ${lastError}`)
  }

  async function scheduleDrafts() {
    const drafts = posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter))
    if (drafts.length === 0) { toast.error('No drafts to send'); return }

    // Group drafts by brand
    const byBrand: Record<string, typeof drafts> = {}
    for (const d of drafts) {
      if (!byBrand[d.brand_profile_id]) byBrand[d.brand_profile_id] = []
      byBrand[d.brand_profile_id].push(d)
    }

    setSchedulingDrafts(true)
    let totalSent = 0

    for (const [bid, brandDrafts] of Object.entries(byBrand)) {
      const brand = brands.find(b => b.id === bid)
      const profileIds = brand?.buffer_profile_ids || []
      if (!profileIds.length) continue

      for (const draft of brandDrafts) {
        try {
          const res = await fetch('/api/buffer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileIds,
              text: draft.caption,
              media: draft.image_url ? { photo: draft.image_url } : undefined,
            }),
          })
          const data = await res.json()
          if (data.success) {
            draft.status = 'published'
            totalSent++
          }
        } catch { /* continue */ }
      }
    }

    savePosts([...posts])
    setSchedulingDrafts(false)
    setShowScheduler(false)
    if (totalSent > 0) {
      toast.success(`${totalSent} post${totalSent !== 1 ? 's' : ''} added to Buffer queue!`)
    } else {
      toast.error('No brands have Buffer profiles configured. Set them in Settings.')
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

  function togglePostSelect(id: string) {
    setSelectedPosts(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function selectAllFiltered() {
    setSelectedPosts(new Set(filtered.map(p => p.id)))
  }

  function clearSelection() {
    setSelectedPosts(new Set())
  }

  async function bulkChangeStatus(status: Post['status']) {
    const selected = posts.filter(p => selectedPosts.has(p.id))
    const updated = posts.map(p => selectedPosts.has(p.id) ? { ...p, status } : p)
    savePosts(updated)

    // Auto-send to Buffer when bulk approving
    if (status === 'approved') {
      let sent = 0
      const publishedIds = new Set<string>()
      for (const post of selected) {
        const brand = brands.find(b => b.id === post.brand_profile_id)
        const profileIds = brand?.buffer_profile_ids || []
        if (profileIds.length > 0) {
          try {
            const res = await fetch('/api/buffer', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ profileIds, text: post.caption, media: post.image_url ? { photo: post.image_url } : undefined }),
            })
            const data = await res.json()
            if (data.success) { sent++; publishedIds.add(post.id) }
          } catch { /* continue */ }
        }
      }
      if (sent > 0) {
        savePosts(posts.map(p => publishedIds.has(p.id) ? { ...p, status: 'published' } : selectedPosts.has(p.id) ? { ...p, status: 'approved' } : p))
        toast.success(`${selectedPosts.size} approved, ${sent} added to Buffer queue!`)
        setSelectedPosts(new Set())
        return
      }
    }

    toast.success(`${selectedPosts.size} post${selectedPosts.size !== 1 ? 's' : ''} marked as ${status}`)
    setSelectedPosts(new Set())
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
              <PaperAirplaneIcon className="w-4 h-4" /> Send Drafts to Buffer
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

      {/* Bulk action bar */}
      {selectedPosts.size > 0 && (
        <div className="mb-4 p-3 bg-[rgba(255,84,115,0.08)] border border-[rgba(255,84,115,0.2)] rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-[#ffb2b9]">{selectedPosts.size} selected</span>
          <button onClick={() => bulkChangeStatus('approved')} className="btn btn-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
            <CheckIcon className="w-3 h-3" /> Approve
          </button>
          <button onClick={() => bulkChangeStatus('draft')} className="btn btn-sm btn-o flex items-center gap-1">
            <XMarkIcon className="w-3 h-3" /> Reject to Draft
          </button>
          <button onClick={() => bulkChangeStatus('scheduled')} className="btn btn-sm btn-o">Schedule</button>
          <button onClick={() => bulkChangeStatus('published')} className="btn btn-sm btn-o">Publish</button>
          <div className="flex-1" />
          <button onClick={selectAllFiltered} className="btn btn-sm btn-o">Select All ({filtered.length})</button>
          <button onClick={clearSelection} className="text-xs text-[#e1bec0] hover:text-[#ffb2b9]">Clear</button>
        </div>
      )}

      {/* Posts list */}
      {filtered.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">No posts found</p>
          <Link href="/create-post" className="btn btn-p">Create your first post</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {(() => {
            // Group posts by batch_id, preserving order
            const batches: { batchId: string | null; label: string | null; posts: typeof filtered }[] = []
            const seen = new Set<string>()
            for (const post of filtered) {
              if (post.batch_id && !seen.has(post.batch_id)) {
                seen.add(post.batch_id)
                batches.push({ batchId: post.batch_id, label: post.batch_label || 'Batch', posts: filtered.filter(p => p.batch_id === post.batch_id) })
              } else if (!post.batch_id) {
                batches.push({ batchId: null, label: null, posts: [post] })
              }
            }
            return batches.map((batch, bi) => {
              if (batch.batchId && batch.posts.length > 1) {
                // Render grouped batch
                const allBatchSelected = batch.posts.every(p => selectedPosts.has(p.id))
                return (
                  <div key={batch.batchId} className="card overflow-hidden border-l-4 border-l-sky-500/50">
                    <div className="flex items-center gap-3 px-4 py-2.5 bg-[rgba(14,165,233,0.06)] border-b border-[rgba(90,64,66,0.2)]">
                      <input type="checkbox" className="w-4 h-4 accent-[#0ea5e9] flex-shrink-0"
                        checked={allBatchSelected}
                        onChange={() => {
                          if (allBatchSelected) setSelectedPosts(prev => { const n = new Set(prev); batch.posts.forEach(p => n.delete(p.id)); return n })
                          else setSelectedPosts(prev => { const n = new Set(prev); batch.posts.forEach(p => n.add(p.id)); return n })
                        }}
                      />
                      <span className="text-xs font-medium text-sky-400">{batch.label}</span>
                      <span className="text-[10px] text-[#5a4042]">{batch.posts.length} posts</span>
                    </div>
                    {batch.posts.map(post => renderPostRow(post))}
                  </div>
                )
              }
              // Single post (no batch or batch of 1)
              return batch.posts.map(post => (
                <div key={post.id} className="card overflow-hidden">
                  {renderPostRow(post)}
                </div>
              ))
            })
          })()}
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

      {showScheduler && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowScheduler(false)}>
          <div className="card p-6 max-w-md w-full mx-4" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-[#e6e1e1] mb-1 flex items-center gap-2">
              <PaperAirplaneIcon className="w-5 h-5 text-[#ff5473]" /> Send Drafts to Buffer
            </h3>
            <p className="text-xs text-[#e1bec0] mb-4">
              Sends draft posts to each brand&apos;s Buffer queue. Buffer&apos;s auto-schedule handles the timing.
            </p>
            <p className="text-xs text-[#e1bec0] mb-4">
              {posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter)).length} draft{posts.filter(p => p.status === 'draft' && (brandFilter === 'all' || p.brand_profile_id === brandFilter)).length !== 1 ? 's' : ''} will be sent
              {brandFilter !== 'all' ? ` for ${brands.find(b => b.id === brandFilter)?.name || 'selected brand'}` : ' across all brands'}
            </p>
            <div className="flex gap-3 justify-end">
              <button className="btn btn-o" onClick={() => setShowScheduler(false)}>Cancel</button>
              <button className="btn btn-p flex items-center gap-2" disabled={schedulingDrafts} onClick={scheduleDrafts}>
                {schedulingDrafts ? <><ArrowPathIcon className="w-4 h-4 animate-spin" /> Sending...</> : <><PaperAirplaneIcon className="w-4 h-4" /> Send to Buffer</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  function renderPostRow(post: Post) {
    const brand = brands.find(b => b.id === post.brand_profile_id)
    const isExpanded = expandedId === post.id
    return (
      <div key={post.id}>
        <div
          className="group flex items-center gap-3 p-4 cursor-pointer hover:bg-[rgba(255,84,115,0.04)] transition-colors"
          onClick={() => setExpandedId(isExpanded ? null : post.id)}
        >
          <input
            type="checkbox"
            className="w-4 h-4 accent-[#ff5473] flex-shrink-0"
            checked={selectedPosts.has(post.id)}
            onClick={e => e.stopPropagation()}
            onChange={() => togglePostSelect(post.id)}
          />
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
                    <button
                      onClick={e => { e.stopPropagation(); setConfirmDelete(post.id) }}
                      className="btn btn-d btn-sm flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete post"
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>
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
                    <div className="flex gap-2 flex-wrap">
                      {(post.status === 'approved' || post.status === 'scheduled') && (
                        <button
                          onClick={() => sendToBuffer(post)}
                          disabled={sendingId === post.id}
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
          }
}
