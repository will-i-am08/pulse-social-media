import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rowToPost } from '@/lib/blog'

// Blog posts are stored in the shared `posts` table using a JSONB data field.
// Identified by data->>'type' = 'blog' and workspace_id = auth.users.id (1:1 with user).

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const brandId = req.nextUrl.searchParams.get('brandId')

  let query = supabase
    .from('posts')
    .select('id, data')
    .eq('workspace_id', user.id)
    .eq('data->>type', 'blog')

  if (brandId) query = query.eq('data->>brand_id', brandId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const posts = (data as { id: string; data: Record<string, unknown> }[] || [])
    .map(rowToPost)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return NextResponse.json(posts)
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, brandId, ...rest } = body
  const now = new Date().toISOString()

  if (id) {
    // Update: fetch existing data, merge changes
    const { data: existing } = await supabase
      .from('posts')
      .select('id, data')
      .eq('id', id)
      .eq('workspace_id', user.id)
      .single()

    if (!existing) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const merged: Record<string, unknown> = { ...(existing.data as Record<string, unknown>), updated_at: now }
    if (rest.title !== undefined) merged.title = rest.title
    if (rest.meta !== undefined) merged.meta = rest.meta
    if (rest.author !== undefined) merged.author = rest.author
    if (rest.content !== undefined) merged.content = rest.content
    if (rest.tags !== undefined) merged.tags = rest.tags
    if (rest.featuredImage !== undefined) merged.featured_image = rest.featuredImage
    if (rest.status !== undefined) merged.status = rest.status
    if (rest.publishedDate !== undefined) merged.published_date = rest.publishedDate
    if (rest.wordCount !== undefined) merged.word_count = rest.wordCount
    if (rest.slug !== undefined) merged.slug = rest.slug

    const { data: updated, error } = await supabase
      .from('posts')
      .update({ data: merged })
      .eq('id', id)
      .eq('workspace_id', user.id)
      .select('id, data')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(rowToPost(updated as { id: string; data: Record<string, unknown> }))
  } else {
    // Create new blog post row
    const slug = rest.slug || `draft-${Date.now()}`
    const postData = {
      type: 'blog',
      brand_id: brandId || '',
      slug,
      title: rest.title || 'Untitled Draft',
      meta: rest.meta || '',
      author: rest.author || '',
      content: rest.content || '',
      tags: rest.tags || '',
      featured_image: rest.featuredImage || null,
      status: rest.status || 'draft',
      published_date: rest.publishedDate || null,
      word_count: rest.wordCount || 0,
      created_at: now,
      updated_at: now,
    }

    const { data, error } = await supabase
      .from('posts')
      .insert({
        id: `blog-${crypto.randomUUID()}`,
        workspace_id: user.id,
        brand_profile_id: null,
        client_visible: false,
        data: postData,
      })
      .select('id, data')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(rowToPost(data as { id: string; data: Record<string, unknown> }))
  }
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id)
    .eq('workspace_id', user.id)
    .eq('data->>type', 'blog')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
