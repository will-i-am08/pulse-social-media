'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import { PencilSquareIcon, TrashIcon, PaperAirplaneIcon, CheckIcon, ArrowPathIcon } from '@heroicons/react/16/solid'
import { useWorkspace } from '@/context/WorkspaceContext'
import { useActiveBrand, filterByActiveBrand } from '@/context/BrandContext'
import PostCard from '@/components/app/PostCard'
import ConfirmDialog from '@/components/app/ConfirmDialog'
import type { Post } from '@/lib/types'

/**
 * Drafts — posts with status='draft'.
 * Bulk selection + actions (Submit for Approval / Delete / Send to Buffer).
 */
export default function DraftsPage() {
  const { posts, brands, savePosts } = useWorkspace()
  const { activeBrandId, activeBrand } = useActiveBrand()
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [bulkSending, setBulkSending] = useState(false)

  const drafts = useMemo(() => {
    const scoped = filterByActiveBrand(posts, activeBrandId)
    return scoped
      .filter(p => p.status === 'draft')
      .sort((a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime())
  }, [posts, activeBrandId])

  function toggle(id: string) {
    setSelected(prev => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id); else n.add(id)
      return n
    })
  }

  function bulkStatus(status: Post['status']) {
    const updated = posts.map(p => selected.has(p.id) ? { ...p, status } : p)
    savePosts(updated)
    toast.success(`${selected.size} post${selected.size !== 1 ? 's' : ''} moved to ${status}`)
    setSelected(new Set())
  }

  async function bulkSendToBuffer() {
    const chosen = drafts.filter(p => selected.has(p.id))
    if (chosen.length === 0) return
    setBulkSending(true)
    let sent = 0
    for (const post of chosen) {
      const brand = brands.find(b => b.id === post.brand_profile_id)
      const profileIds = brand?.buffer_profile_ids || []
      if (!profileIds.length) continue
      try {
        const res = await fetch('/api/buffer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profileIds, text: post.caption, media: post.image_url ? { photo: post.image_url } : undefined }),
        })
        const data = await res.json()
        if (data.success) {
          savePosts(posts.map(p => p.id === post.id ? { ...p, status: 'published' } : p))
          sent++
        }
      } catch { /* continue */ }
    }
    setBulkSending(false)
    setSelected(new Set())
    if (sent > 0) toast.success(`${sent} post${sent !== 1 ? 's' : ''} added to Buffer queue`)
    else toast.error('No brands have Buffer profiles configured. Check Settings.')
  }

  function deletePost(id: string) {
    savePosts(posts.filter(p => p.id !== id))
    toast.success('Draft deleted')
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold text-[#e6e1e1]">Drafts</h1>
          <p className="text-[#e1bec0] mt-1 text-sm">
            {activeBrand ? `Unfinished posts for ${activeBrand.name}` : 'Unfinished posts across all brands'}
            <span className="text-[#5a4042]"> · {drafts.length} draft{drafts.length !== 1 ? 's' : ''}</span>
          </p>
        </div>
        <Link href="/compose" className="btn btn-p flex items-center gap-2">
          <PencilSquareIcon className="w-4 h-4" /> New Post
        </Link>
      </div>

      {selected.size > 0 && (
        <div className="mb-4 p-3 bg-[rgba(255,84,115,0.08)] border border-[rgba(255,84,115,0.2)] rounded-xl flex items-center gap-3 flex-wrap">
          <span className="text-sm font-medium text-[#ffb2b9]">{selected.size} selected</span>
          <button onClick={() => bulkStatus('submitted')} className="btn btn-sm bg-violet-500/20 text-violet-300 border border-violet-500/30 flex items-center gap-1">
            <CheckIcon className="w-3 h-3" /> Submit for Approval
          </button>
          <button onClick={bulkSendToBuffer} disabled={bulkSending} className="btn btn-sm btn-o flex items-center gap-1">
            {bulkSending ? <ArrowPathIcon className="w-3 h-3 animate-spin" /> : <PaperAirplaneIcon className="w-3 h-3" />}
            Send to Buffer
          </button>
          <div className="flex-1" />
          <button onClick={() => setSelected(new Set(drafts.map(p => p.id)))} className="btn btn-sm btn-o">Select All</button>
          <button onClick={() => setSelected(new Set())} className="text-xs text-[#e1bec0] hover:text-[#ffb2b9]">Clear</button>
        </div>
      )}

      {drafts.length === 0 ? (
        <div className="card p-12 text-center">
          <p className="text-[#e1bec0] text-lg mb-2">No drafts</p>
          <p className="text-[#5a4042] text-sm mb-4">Write something and save it as a draft to work on later.</p>
          <Link href="/compose" className="btn btn-p">Create a draft</Link>
        </div>
      ) : (
        <div className="space-y-2">
          {drafts.map(p => {
            const brand = brands.find(b => b.id === p.brand_profile_id)
            return (
              <PostCard
                key={p.id}
                post={p}
                brand={brand}
                selected={selected.has(p.id)}
                onSelect={() => toggle(p.id)}
                actions={
                  <button
                    onClick={() => setConfirmDelete(p.id)}
                    className="btn btn-d btn-sm opacity-60 hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                }
              />
            )
          })}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          title="Delete Draft"
          description="This will permanently delete this draft."
          onConfirm={() => { deletePost(confirmDelete!); setConfirmDelete(null) }}
          onClose={() => setConfirmDelete(null)}
        />
      )}
    </div>
  )
}
