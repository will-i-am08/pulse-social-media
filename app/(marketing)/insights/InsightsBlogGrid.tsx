'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import BlogImage from '@/components/marketing/BlogImage'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import StaggerChildren from '@/components/marketing/StaggerChildren'
import type { BlogPost } from '@/lib/types'

const POSTS_PER_PAGE = 9

function readTime(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function InsightsBlogGrid({ posts }: { posts: BlogPost[] }) {
  const [search, setSearch] = useState('')
  const [activeTags, setActiveTags] = useState<string[]>([])
  const [visibleCount, setVisibleCount] = useState(POSTS_PER_PAGE)

  const allTags = useMemo(() => {
    const tagSet = new Set<string>()
    posts.forEach(p => p.tags?.split(',').map(t => t.trim()).filter(Boolean).forEach(t => tagSet.add(t)))
    return Array.from(tagSet).sort()
  }, [posts])

  const filtered = useMemo(() => {
    let result = posts
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.meta.toLowerCase().includes(q) ||
        p.tags.toLowerCase().includes(q)
      )
    }
    if (activeTags.length > 0) {
      result = result.filter(p => {
        const postTags = p.tags.split(',').map(t => t.trim().toLowerCase())
        return activeTags.some(tag => postTags.includes(tag.toLowerCase()))
      })
    }
    return result
  }, [posts, search, activeTags])

  const visiblePosts = filtered.slice(0, visibleCount)
  const hasMore = visibleCount < filtered.length
  const isFiltering = search.trim() !== '' || activeTags.length > 0

  function toggleTag(tag: string) {
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])
    setVisibleCount(POSTS_PER_PAGE)
  }

  function handleSearch(value: string) {
    setSearch(value)
    setVisibleCount(POSTS_PER_PAGE)
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-24">
        <p className="text-[#6b7280] text-lg">No published posts yet. Check back soon.</p>
      </div>
    )
  }

  return (
    <div>
      {/* Search Bar */}
      <AnimateOnScroll variant="fade-up">
        <div className="relative max-w-xl mb-10">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#9ca3af] text-xl">search</span>
          <input
            type="text"
            placeholder="Search posts by title, description, or tags..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white text-[#0a0a0a] placeholder:text-[#9ca3af] text-sm focus:outline-none transition-colors"
            style={{
              border: '1px solid rgba(0,0,0,0.1)',
              boxShadow: 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#ff5473' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)' }}
          />
          {search && (
            <button onClick={() => handleSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#0a0a0a] transition-colors">
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          )}
        </div>
      </AnimateOnScroll>

      {/* Tag Cloud */}
      {allTags.length > 0 && (
        <AnimateOnScroll variant="fade-up">
          <div className="flex flex-wrap gap-2 mb-12">
            {allTags.map(tag => {
              const isActive = activeTags.includes(tag)
              return (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    isActive
                      ? 'bg-[#ff5473] text-white border-[#ff5473]'
                      : 'bg-[#fff0f2] text-[#ff5473] border-[#ff5473]/20 hover:border-[#ff5473]/50'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
            {activeTags.length > 0 && (
              <button
                onClick={() => { setActiveTags([]); setVisibleCount(POSTS_PER_PAGE) }}
                className="px-3 py-1.5 text-xs font-medium rounded-full text-[#9ca3af] hover:text-[#0a0a0a] transition-colors"
              >
                Clear filters
              </button>
            )}
          </div>
        </AnimateOnScroll>
      )}

      {/* Section Heading */}
      <AnimateOnScroll variant="fade-up">
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl font-bold tracking-tight text-[#0a0a0a]">
            {isFiltering ? 'Results' : 'All Articles'}
          </h2>
          {isFiltering && (
            <span className="text-sm text-[#9ca3af]">{filtered.length} post{filtered.length !== 1 ? 's' : ''} found</span>
          )}
        </div>
      </AnimateOnScroll>

      {/* Grid */}
      {visiblePosts.length > 0 ? (
        <>
          <StaggerChildren staggerDelay={0.1} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {visiblePosts.map(post => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-xl overflow-hidden flex flex-col hover:shadow-md transition-shadow"
                style={{ border: '1px solid rgba(0,0,0,0.08)' }}
              >
                <div className="relative aspect-[16/9] overflow-hidden flex-shrink-0">
                  <BlogImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-bold tracking-tight mb-2 text-[#0a0a0a] group-hover:text-[#ff5473] transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  {post.meta && (
                    <p className="text-[#6b7280] text-sm leading-relaxed line-clamp-2 mb-4">{post.meta}</p>
                  )}
                  <div className="mt-auto">
                    <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                      <span>{formatDate(post.publishedDate)}</span>
                      <span>{readTime(post.wordCount)} min read</span>
                    </div>
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-[#fff0f2] text-[#ff5473]">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </StaggerChildren>

          {hasMore && (
            <div className="text-center mt-12">
              <button
                onClick={() => setVisibleCount(prev => prev + POSTS_PER_PAGE)}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-full text-white font-medium text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
              >
                Load More
                <span className="material-symbols-outlined text-base">expand_more</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16">
          <span className="material-symbols-outlined text-5xl text-[#9ca3af] mb-4 block">search_off</span>
          <p className="text-[#6b7280] text-lg">No posts match your search.</p>
          <button
            onClick={() => { setSearch(''); setActiveTags([]); setVisibleCount(POSTS_PER_PAGE) }}
            className="mt-4 text-[#ff5473] hover:underline text-sm"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
