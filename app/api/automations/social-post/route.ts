import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, caption, platforms, status, scheduledAt, imageUrl } = await req.json()
  if (!brandId || !caption) return NextResponse.json({ error: 'brandId and caption required' }, { status: 400 })

  const postData = {
    brand_profile_id: brandId,
    caption,
    image_url: imageUrl || null,
    image_urls: imageUrl ? [imageUrl] : [],
    platforms: platforms || ['instagram'],
    status: status || 'draft',
    scheduled_at: scheduledAt || null,
    published_at: status === 'published' ? new Date().toISOString() : null,
    created_date: new Date().toISOString(),
    client_visible: false,
    client_approved: false,
  }

  // Insert into the posts table using the shared data column pattern
  const postId = `post-${crypto.randomUUID()}`
  const { data, error } = await supabase
    .from('posts')
    .insert({
      id: postId,
      workspace_id: user.id,
      brand_profile_id: brandId,
      client_visible: false,
      data: postData,
    })
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    postId: data.id,
    caption,
    platforms,
    status: status || 'draft',
  })
}
