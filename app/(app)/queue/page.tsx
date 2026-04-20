'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PaperAirplaneIcon, ArrowPathIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/16/solid'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useActiveBrand, filterByActiveBrand } from '@/context/BrandContext'
import PostCard from '@/components/app/PostCard'
import DateGroupHeader, { formatDateGroupLabel } from '@/components/app/DateGroupHeader'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import type { Post } from '@/lib/types'

/**
 * Queue — default landing page.
 *
 * Shows scheduled/approved posts grouped by day, in chronological order.
 * This is the Buffer-style "what's going out next" view.
 */
export default function QueuePage() {
  const { posts, brands, savePosts } = useWorkspace()
  const { activeBrandId, activeBrand } = useActiveBrand()
  const [sendingId, setSendingId] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const visible = useMemo(() => {
    const scoped = filterByActiveBrand(posts, activeBrandId)
    return scoped.filter(p => p.status === 'scheduled' || p.status === 'approved')
  }, [posts, activeBrandId])

  // Group by calendar day using scheduled_at (falls back to created_date)
  const groups = useMemo(() => {
    const byDay = new Map<string, Post[]>()
    for (const p of visible) {
      const when = p.scheduled_at || p.created_date
      if (!when) continue
      const d = new Date(when)
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key)!.push(p)
    }
    const sortedKeys = [...byDay.keys()].sort()
    return sortedKeys.map(k => ({
      date: new Date(k),
      label: formatDateGroupLabel(new Date(k)),
      posts: byDay.get(k)!.sort((a, b) => {
        const at = new Date(a.scheduled_at || a.created_date).getTime()
        const bt = new Date(b.scheduled_at || b.created_date).getTime()
        return at - bt
      }),
    }))
  }, [visible])

  async function sendToBuffer(post: Post) {
    const brand = brands.find(b => b.id === post.brand_profile_id)
    const profileIds = brand?.buffer_profile_ids || []
    if (profileIds.length === 0) {
      toast.error('No Buffer profiles set for this brand. Configure them in Settings.')
      return
    }
    setSendingId(post.id)
    try {
      const res = await fetch('/api/buffer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profileIds, text: post.caption, media: post.image_url ? { photo: post.image_url } : undefined }),
      })
      const data = await res.json()
      if (data.success) {
        savePosts(posts.map(p => p.id === post.id ? { ...p, status: 'published' } : p))
        toast.success('Added to Buffer queue')
      } else {
        toast.error(data.results?.find((r: { success: boolean; error?: string }) => !r.success)?.error || 'Failed to send to Buffer')
      }
    } catch {
      toast.error('Failed to send to Buffer')
    } finally {
      setSendingId(null)
    }
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id))
    toast.success('Post deleted')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Queue</h1>
          <p className="text-[#e1bec0] mt-1 text-sm">
            {activeBrand ? `Scheduled posts for ${activeBrand.name}` : 'Scheduled posts across all brands'}
            <span className="text-[#5a4042]"> · {visible.length} post{visible.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Link href="/compose" className="btn btn-p flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" /> New Post
        </Link>
      </div>

      {visible.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">Queue is empty</p>
          <p className="text-[#5a4042] text-sm mb-4">
            {activeBrand
              ? `Nothing scheduled for ${activeBrand.name}. Create a post to get started.`
              : 'Nothing scheduled across your brands. Create a post to get started.'}
          </p>
          <Link href="/compose" className="btn btn-p">Create a post</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {groups.map(g => (
            <div key={g.date.toISOString()}>
              <DateGroupHeader label={g.label} count={g.posts.length} />
              <div className="space-y-2">
                {g.posts.map(p => {
                  const brand = brands.find(b => b.id === p.brand_profile_id)
                  return (
                    <PostCard
                      key={p.id}
                      post={p}
                      brand={brand}
                      showScheduledTime
                      actions={
                        <>
                          {p.status !== 'published' && (
                            <button
                              onClick={() => sendToBuffer(p)}
                              disabled={sendingId === p.id}
                              className="btn btn-o btn-sm flex items-center gap-1"
                              title="Send to Buffer now"
                            >
                              {sendingId === p.id
                                ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                                : <PaperAirplaneIcon className="w-3.5 h-3.5" />
                              }
                            </button>
                          )}
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="btn btn-d btn-sm opacity-60 hover:opacity-100 transition-opacity"
                            title="Delete"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                          </button>
                        </>
                      }
                    />
                  )
                })}
              </div>
            </div>
          ))}
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
    </div>
  )
}
