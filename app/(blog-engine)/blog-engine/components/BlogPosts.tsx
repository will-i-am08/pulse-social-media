'use client'

import { useState } from 'react'
import { useBlog } from '@/context/BlogContext'
import { BlogPost, BlogBrand, FOCUS_AREA_LABELS } from '@/lib/types'
import { computeGeoScore, buildSchemaMarkup } from './utils'
import GeoStars from './GeoStars'
import toast from 'react-hot-toast'
import {
  PencilIcon,
  TrashIcon,
  CheckIcon,
  ClipboardDocumentIcon,
  DocumentDuplicateIcon,
  PaperAirplaneIcon,
} from '@heroicons/react/16/solid'
import { useRouter } from 'next/navigation'
import { callClaude } from '@/lib/claude'

// ===================== SORT OPTIONS =====================
type SortKey = 'newest' | 'oldest' | 'most-words' | 'highest-geo'

function sortPosts(posts: BlogPost[], key: SortKey, brand: BlogBrand | null): BlogPost[] {
  const sorted = [...posts]
  switch (key) {
    case 'newest':
      return sorted.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    case 'oldest':
      return sorted.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime())
    case 'most-words':
      return sorted.sort((a, b) => b.wordCount - a.wordCount)
    case 'highest-geo':
      return sorted.sort((a, b) => computeGeoScore(b, brand) - computeGeoScore(a, brand))
    default:
      return sorted
  }
}

// ===================== POSTS TAB =====================
export default function PostsTab({ onEdit }: { onEdit: (post: BlogPost) => void }) {
  const router = useRouter()
  const { activeBrand, drafts, deleteDraft, markPublished, saveDraft } = useBlog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published'>('all')
  const [sortKey, setSortKey] = useState<SortKey>('newest')
  const [clusterView, setClusterView] = useState(false)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const pc = activeBrand?.primaryColor || '#0d9488'

  const filtered = drafts.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || d.status === statusFilter
    return matchSearch && matchStatus
  })

  const sorted = sortPosts(filtered, sortKey, activeBrand)

  // Cluster by focus area
  const clusters: Record<string, BlogPost[]> = {}
  const unclustered: BlogPost[] = []
  if (clusterView && activeBrand) {
    sorted.forEach(post => {
      const matchArea = (activeBrand.focusAreas || []).find(a =>
        post.tags.toLowerCase().includes(a.replace(/-/g, ' ')) || post.tags.toLowerCase().includes(a)
      )
      if (matchArea) {
        if (!clusters[matchArea]) clusters[matchArea] = []
        clusters[matchArea].push(post)
      } else {
        unclustered.push(post)
      }
    })
  }

  // Bulk selection helpers
  function toggleSelect(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  function toggleSelectAll() {
    if (selectedIds.size === sorted.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(sorted.map(p => p.id)))
    }
  }

  async function bulkPublish() {
    const toPublish = Array.from(selectedIds)
    let count = 0
    for (const id of toPublish) {
      try { await markPublished(id); count++ }
      catch { /* continue */ }
    }
    toast.success(`Published ${count} post${count !== 1 ? 's' : ''}`)
    setSelectedIds(new Set())
  }

  async function bulkDelete() {
    if (!confirm(`Delete ${selectedIds.size} selected post${selectedIds.size !== 1 ? 's' : ''}?`)) return
    const toDelete = Array.from(selectedIds)
    let count = 0
    for (const id of toDelete) {
      try { await deleteDraft(id); count++ }
      catch { /* continue */ }
    }
    toast.success(`Deleted ${count} post${count !== 1 ? 's' : ''}`)
    setSelectedIds(new Set())
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this draft?')) return
    try { await deleteDraft(id); toast.success('Deleted') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Delete failed') }
  }

  async function handlePublish(id: string) {
    try { await markPublished(id); toast.success('Marked as published!') }
    catch (e) { toast.error(e instanceof Error ? e.message : 'Failed') }
  }

  async function handleCreateSocialPost(post: BlogPost) {
    if (!activeBrand) { toast.error('No active brand'); return }
    const tid = toast.loading('Generating companion caption...')
    try {
      // Build blog URL
      const site = (activeBrand.website || '').replace(/\/$/, '')
      const path = ((activeBrand as unknown as { blogPath?: string }).blogPath || '/blog').replace(/^\/?/, '/')
      const url = `${site}${path}/${post.slug}`

      const sys = 'You are a social media copywriter. Write ONLY the caption text — no commentary, no quotation marks.'
      const prompt = `Write a short, punchy Instagram/Facebook caption to promote this blog post for "${activeBrand.name}".
Brand voice: ${activeBrand.brandVoice || 'warm, casual, local'}
Title: ${post.title}
Meta: ${post.meta}
Tags: ${post.tags}

Lead with a hook. 2-4 sentences max. Mention there's a full article and direct readers to the link in bio (or the URL). End with 3-5 relevant hashtags. Do NOT include the URL in the caption itself — it will be appended.`
      const generated = await callClaude(sys, prompt, 400)
      const caption = `${(generated || post.meta).trim()}\n\nRead more: ${url}`

      const params = new URLSearchParams({
        caption,
        category: 'blog',
        aspect: '4/5',
      })
      if (post.featuredImage) params.set('image', post.featuredImage)
      toast.success('Caption ready!', { id: tid })
      router.push(`/create-post?${params.toString()}`)
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed', { id: tid })
    }
  }

  async function handleClone(post: BlogPost) {
    try {
      await saveDraft({
        slug: post.slug + '-copy',
        title: post.title + ' (Copy)',
        meta: post.meta,
        author: post.author,
        content: post.content,
        tags: post.tags,
        featuredImage: post.featuredImage,
        wordCount: post.wordCount,
      })
      toast.success('Post cloned!')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Clone failed')
    }
  }

  function copySchema(post: BlogPost) {
    const schema = buildSchemaMarkup(post, activeBrand)
    const html = `<script type="application/ld+json">\n${schema}\n</script>`
    navigator.clipboard.writeText(html).then(() => toast.success('Schema copied!'))
  }

  function PostCard({ post }: { post: BlogPost }) {
    const geo = computeGeoScore(post, activeBrand)
    const isSelected = selectedIds.has(post.id)

    return (
      <div className={`card hover:border-white/20 transition-all ${isSelected ? 'ring-1 ring-teal-500/50' : ''}`}>
        <div className="flex items-start gap-3 mb-2">
          {/* Checkbox for bulk select */}
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(post.id)}
            className="mt-1 w-4 h-4 rounded accent-teal-400 flex-shrink-0 cursor-pointer"
          />

          {/* Featured image thumbnail */}
          {post.featuredImage && (
            <img
              src={post.featuredImage}
              alt=""
              className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
            />
          )}

          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-white truncate">{post.title || 'Untitled'}</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {post.status === 'published' ? `Published ${post.publishedDate}` : `Saved ${new Date(post.updatedAt).toLocaleDateString('en-AU')}`} &middot; {post.wordCount} words
            </p>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === 'published' ? 'bg-green-500/15 text-green-400' : 'bg-white/10 text-slate-400'}`}>{post.status}</span>
            <GeoStars score={geo} />
          </div>
        </div>
        {post.tags && (
          <div className="flex flex-wrap gap-1 mb-3 ml-7">
            {post.tags.split(',').slice(0, 4).map((t, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-slate-500">{t.trim()}</span>
            ))}
          </div>
        )}
        <div className="flex flex-wrap gap-2 ml-7">
          <button onClick={() => onEdit(post)} className="btn btn-sm flex items-center gap-1"><PencilIcon className="w-3 h-3" /> Edit</button>
          {post.status !== 'published' && (
            <button onClick={() => handlePublish(post.id)} className="btn btn-sm flex items-center gap-1 text-green-400 border-green-500/30">
              <CheckIcon className="w-3 h-3" /> Publish
            </button>
          )}
          {post.status === 'published' && (
            <button onClick={() => handleCreateSocialPost(post)} className="btn btn-sm flex items-center gap-1 text-pink-400 border-pink-500/30">
              <PaperAirplaneIcon className="w-3 h-3" /> Create Social Post
            </button>
          )}
          <button onClick={() => handleClone(post)} className="btn btn-sm flex items-center gap-1 text-blue-400 border-blue-500/30">
            <DocumentDuplicateIcon className="w-3 h-3" /> Clone
          </button>
          <button onClick={() => copySchema(post)} className="btn btn-sm flex items-center gap-1 text-slate-400" title="Copy Schema.org markup">
            <ClipboardDocumentIcon className="w-3 h-3" /> Schema
          </button>
          <button onClick={() => handleDelete(post.id)} className="btn btn-sm flex items-center gap-1 text-red-400 border-red-500/20 ml-auto">
            <TrashIcon className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <h2 className="text-lg font-bold text-white">Blog Posts <span className="text-slate-500 text-base font-normal">({filtered.length})</span></h2>
        <div className="flex items-center gap-2 flex-wrap">
          <input className="inp w-48 text-sm" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
          <select className="sel text-sm" value={statusFilter} onChange={e => setStatusFilter(e.target.value as 'all' | 'draft' | 'published')}>
            <option value="all">All</option>
            <option value="draft">Drafts</option>
            <option value="published">Published</option>
          </select>
          <select className="sel text-sm" value={sortKey} onChange={e => setSortKey(e.target.value as SortKey)}>
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="most-words">Most Words</option>
            <option value="highest-geo">Highest GEO</option>
          </select>
          <button
            onClick={() => setClusterView(v => !v)}
            className={`btn btn-sm text-xs ${clusterView ? 'text-white' : 'text-slate-500'}`}
            style={clusterView ? { background: `${pc}20`, borderColor: `${pc}40`, color: pc } : {}}
          >
            Content Hub
          </button>
          {sorted.length > 0 && (
            <button
              onClick={toggleSelectAll}
              className="btn btn-sm text-xs text-slate-400"
            >
              {selectedIds.size === sorted.length ? 'Deselect All' : 'Select All'}
            </button>
          )}
        </div>
      </div>

      {/* Bulk action bar */}
      {selectedIds.size > 0 && (
        <div className="sticky top-0 z-30 mb-4 p-3 rounded-xl bg-[#14141e] border border-white/10 flex items-center gap-3 shadow-xl">
          <span className="text-sm text-white font-medium">{selectedIds.size} selected</span>
          <div className="flex-1" />
          <button
            onClick={bulkPublish}
            className="btn btn-sm flex items-center gap-1 text-green-400 border-green-500/30"
          >
            <CheckIcon className="w-3 h-3" /> Publish Selected
          </button>
          <button
            onClick={bulkDelete}
            className="btn btn-sm flex items-center gap-1 text-red-400 border-red-500/30"
          >
            <TrashIcon className="w-3 h-3" /> Delete Selected
          </button>
          <button
            onClick={() => setSelectedIds(new Set())}
            className="btn btn-sm text-xs text-slate-400"
          >
            Cancel
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-3">&#128221;</div>
          <h3 className="text-base font-semibold text-slate-300 mb-1">No posts yet</h3>
          <p className="text-sm text-slate-500">{activeBrand ? 'Generate ideas and write your first post' : 'Create a brand first'}</p>
        </div>
      ) : clusterView && activeBrand ? (
        <div className="space-y-6">
          {Object.entries(clusters).map(([area, posts]) => (
            <div key={area}>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 flex items-center gap-2" style={{ color: pc }}>
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: pc }} />
                {FOCUS_AREA_LABELS[area] || area}
                <span className="text-slate-600 normal-case font-normal">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {posts.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </div>
          ))}
          {unclustered.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-slate-500">Other</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unclustered.map(p => <PostCard key={p.id} post={p} />)}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map(p => <PostCard key={p.id} post={p} />)}
        </div>
      )}
    </div>
  )
}
