import { NextRequest, NextResponse } from 'next/server'
import { resolveAutomationUser } from '@/lib/automations/auth'

export async function POST(req: NextRequest) {
  const resolved = await resolveAutomationUser(req)
  if (resolved instanceof NextResponse) return resolved
  const { userId, supabase } = resolved

  const { brandId, caption, platforms, status, scheduledAt, imageUrl, imageUrls, batchId, batchLabel } = await req.json()
  if (!brandId || !caption) return NextResponse.json({ error: 'brandId and caption required' }, { status: 400 })

  const resolvedUrls: string[] = imageUrls?.length ? imageUrls : (imageUrl ? [imageUrl] : [])

  const postData = {
    brand_profile_id: brandId,
    caption,
    image_url: resolvedUrls[0] || null,
    image_urls: resolvedUrls,
    platforms: platforms || ['instagram'],
    status: status || 'draft',
    scheduled_at: scheduledAt || null,
    batch_id: batchId || null,
    batch_label: batchLabel || null,
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
      workspace_id: userId,
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
