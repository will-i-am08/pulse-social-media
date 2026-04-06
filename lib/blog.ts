import { createAdminClient } from '@/lib/supabase/admin'
import type { BlogPost } from '@/lib/types'

export function rowToPost(row: { id: string; data: Record<string, unknown> }): BlogPost {
  const d = row.data
  return {
    id: row.id,
    brandId: (d.brand_id as string) || '',
    slug: (d.slug as string) || '',
    title: (d.title as string) || '',
    meta: (d.meta as string) || '',
    author: (d.author as string) || '',
    content: (d.content as string) || '',
    tags: (d.tags as string) || '',
    featuredImage: (d.featured_image as string) || undefined,
    status: ((d.status as string) || 'draft') as 'draft' | 'published',
    publishedDate: (d.published_date as string) || undefined,
    wordCount: (d.word_count as number) || 0,
    createdAt: (d.created_at as string) || new Date().toISOString(),
    updatedAt: (d.updated_at as string) || new Date().toISOString(),
  }
}

// All public-facing functions use the admin (service role) client so they can
// read published posts regardless of Supabase RLS policies.

export async function getPublishedPosts(limit?: number, offset = 0): Promise<BlogPost[]> {
  const supabase = createAdminClient()
  let query = supabase
    .from('posts')
    .select('id, data')
    .eq('data->>type', 'blog')
    .eq('data->>status', 'published')
    .order('data->>published_date', { ascending: false })

  if (limit) {
    query = query.range(offset, offset + limit - 1)
  }

  const { data, error } = await query

  if (error || !data) return []

  return (data as { id: string; data: Record<string, unknown> }[]).map(rowToPost)
}

export async function getRelatedPosts(currentSlug: string, tags: string, limit = 3): Promise<BlogPost[]> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, data')
    .eq('data->>type', 'blog')
    .eq('data->>status', 'published')
    .neq('data->>slug', currentSlug)
    .order('data->>published_date', { ascending: false })
    .limit(limit * 3)

  if (error || !data) return []

  const posts = (data as { id: string; data: Record<string, unknown> }[]).map(rowToPost)
  const currentTags = tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)

  if (currentTags.length === 0) return posts.slice(0, limit)

  const scored = posts
    .map(post => {
      const postTags = post.tags.split(',').map(t => t.trim().toLowerCase()).filter(Boolean)
      const score = currentTags.reduce((acc, tag) => acc + (postTags.includes(tag) ? 1 : 0), 0)
      return { post, score }
    })
    .sort((a, b) => b.score - a.score)

  return scored.slice(0, limit).map(s => s.post)
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, data')
    .eq('data->>type', 'blog')
    .eq('data->>status', 'published')
    .eq('data->>slug', slug)
    .limit(1)

  if (error || !data || data.length === 0) return null

  return rowToPost(data[0] as { id: string; data: Record<string, unknown> })
}
