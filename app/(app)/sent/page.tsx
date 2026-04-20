'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { TrashIcon, ClipboardDocumentIcon, PencilSquareIcon } from '@heroicons/react/16/solid'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useActiveBrand, filterByActiveBrand } from '@/context/BrandContext'
import PostCard from '@/components/app/PostCard'
import DateGroupHeader, { formatDateGroupLabel } from '@/components/app/DateGroupHeader'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import type { Post } from '@/lib/types'

/**
 * Sent — posts that have been published (sent to Buffer).
 * Groups by day descending for a publication log feel.
 */
export default function SentPage() {
  const { posts, brands, savePosts } = useWorkspace()
  const { activeBrandId, activeBrand } = useActiveBrand()
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)

  const sent = useMemo(() => {
    const scoped = filterByActiveBrand(posts, activeBrandId)
    return scoped.filter(p => p.status === 'published')
  }, [posts, activeBrandId])

  const groups = useMemo(() => {
    const byDay = new Map<string, Post[]>()
    for (const p of sent) {
      const when = p.published_at || p.scheduled_at || p.created_date
      if (!when) continue
      const d = new Date(when)
      const key = new Date(d.getFullYear(), d.getMonth(), d.getDate()).toISOString()
      if (!byDay.has(key)) byDay.set(key, [])
      byDay.get(key)!.push(p)
    }
    const sortedKeys = [...byDay.keys()].sort().reverse() // most recent first
    return sortedKeys.map(k => ({
      date: new Date(k),
      label: formatDateGroupLabel(new Date(k)),
      posts: byDay.get(k)!.sort((a, b) => {
        const at = new Date(a.published_at || a.scheduled_at || a.created_date).getTime()
        const bt = new Date(b.published_at || b.scheduled_at || b.created_date).getTime()
        return bt - at
      }),
    }))
  }, [sent])

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id))
    toast.success('Post deleted')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Sent</h1>
          <p className="text-[#e1bec0] mt-1 text-sm">
            {activeBrand ? `Published posts for ${activeBrand.name}` : 'Published posts across all brands'}
            <span className="text-[#5a4042]"> · {sent.length} post{sent.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Link href="/compose" className="btn btn-p flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" /> New Post
        </Link>
      </div>

      {sent.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">Nothing sent yet</p>
          <p className="text-[#5a4042] text-sm">Published posts will appear here.</p>
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
                      actions={
                        <>
                          <button
                            onClick={() => { navigator.clipboard.writeText(p.caption); toast.success('Copied') }}
                            className="btn btn-o btn-sm"
                            title="Copy caption"
                          >
                            <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                          </button>
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
          description="This will permanently delete this post from CaptionCraft. It won't remove anything from Buffer or the published platform."
          onConfirm={() => { deletePost(confirmDelete!); setConfirmDelete(null) }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
