import { createClient } from '@/lib/supabase/server'
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

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, data')
    .eq('data->>type', 'blog')
    .eq('data->>status', 'published')
    .order('data->>published_date', { ascending: false })

  if (error || !data) return []

  return (data as { id: string; data: Record<string, unknown> }[]).map(rowToPost)
}

export async function getPublishedPostBySlug(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()
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
