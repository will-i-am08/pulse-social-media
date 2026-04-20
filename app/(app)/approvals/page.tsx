'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { CheckIcon, XMarkIcon, PencilSquareIcon, ArrowPathIcon } from '@heroicons/react/16/solid'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useActiveBrand, filterByActiveBrand } from '@/context/BrandContext'
import PostCard from '@/components/app/PostCard'
import type { Post } from '@/lib/types'

/**
 * Approvals — posts submitted for review.
 * Approve = change to 'approved' AND auto-send to Buffer if the brand has profiles.
 * Request changes = send back to draft.
 */
export default function ApprovalsPage() {
  const { posts, brands, savePosts } = useWorkspace()
  const { activeBrandId, activeBrand } = useActiveBrand()
  const [actingId, setActingId] = useState<string | null>(null)

  const submitted = useMemo(() => {
    const scoped = filterByActiveBrand(posts, activeBrandId)
    return scoped
      .filter(p => p.status === 'submitted')
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
  }, [posts, activeBrandId])

  async function approve(post: Post) {
    setActingId(post.id)
    const brand = brands.find(b => b.id === post.brand_profile_id)
    const profileIds = brand?.buffer_profile_ids || []
    // Mark approved first
    savePosts(posts.map(p => p.id === post.id ? { ...p, status: 'approved' } : p))
    // Auto-send if possible
    if (profileIds.length > 0) {
      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileIds, text: post.caption, media: post.image_url ? { photo: post.image_url } : undefined }),
        })
        const data = await res.json()
        if (data.success) {
          savePosts(posts.map(p => p.id === post.id ? { ...p, status: 'published' } : p))
          toast.success('Approved and added to Buffer queue')
          setActingId(null)
          return
        }
      } catch { /* fall through */ }
    }
    toast.success('Post approved')
    setActingId(null)
  }

  function reject(post: Post) {
    savePosts(posts.map(p => p.id === post.id ? { ...p, status: 'draft' } : p))
    toast.success('Sent back to drafts')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Approvals</h1>
          <p className="text-[#e1bec0] mt-1 text-sm">
            {activeBrand ? `Waiting on review for ${activeBrand.name}` : 'Posts waiting on review'}
            <span className="text-[#5a4042]"> · {submitted.length} pending</span>
          </p>
        </div>
        <Link href="/compose" className="btn btn-p flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" /> New Post
        </Link>
      </div>

      {submitted.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">Nothing to review</p>
          <p className="text-[#5a4042] text-sm">Submitted posts will appear here for approval.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {submitted.map(p => {
            const brand = brands.find(b => b.id === p.brand_profile_id)
            const busy = actingId === p.id
            return (
              <PostCard
                key={p.id}
                post={p}
                brand={brand}
                actions={
                  <>
                    <button
                      onClick={() => reject(p)}
                      disabled={busy}
                      className="btn btn-sm btn-o flex items-center gap-1"
                      title="Request changes"
                    >
                      <XMarkIcon className="w-3.5 h-3.5" />
                      <span className="hidden md:inline">Changes</span>
                    </button>
                    <button
                      onClick={() => approve(p)}
                      disabled={busy}
                      className="btn btn-sm bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1"
                      title="Approve and send to Buffer"
                    >
                      {busy
                        ? <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                        : <CheckIcon className="w-3.5 h-3.5" />
                      }
                      <span className="hidden md:inline">Approve</span>
                    </button>
                  </>
                }
              />
            )
          })}
        </div>
      )}
    </div>
  )
}
