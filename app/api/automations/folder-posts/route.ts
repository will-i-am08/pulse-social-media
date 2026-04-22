import { NextRequest, NextResponse } from 'next/server'
import { resolveAutomationUser } from '@/lib/automations/auth'
import type { Photo } from '@/lib/types'

export async function POST(req: NextRequest) {
  const resolved = await resolveAutomationUser(req)
  if (resolved instanceof NextResponse) return resolved
  const { userId, supabase } = resolved

  const { folderId, brandId, platforms, status, count, prompt } = await req.json()
  if (!folderId || !brandId) return NextResponse.json({ error: 'folderId and brandId required' }, { status: 400 })

  // Load all photos in this folder
  const { data: photoRows, error: photoErr } = await supabase
    .from('photos')
    .select('data')
    .eq('workspace_id', userId)

  if (photoErr) return NextResponse.json({ error: photoErr.message }, { status: 500 })

  const allPhotos: Photo[] = (photoRows || []).map((r: { data: Photo }) => r.data)
  const folderPhotos = allPhotos.filter(p => p.folder_id === folderId)

  if (folderPhotos.length === 0) {
    return NextResponse.json({ error: 'No photos found in this folder' }, { status: 400 })
  }

  // Build set of all image URLs already used in existing posts
  const { data: postRows } = await supabase
    .from('posts')
    .select('data')
    .eq('workspace_id', userId)

  const usedUrls = new Set<string>()
  for (const row of (postRows || [])) {
    if (row.data?.image_url) usedUrls.add(row.data.image_url)
    if (Array.isArray(row.data?.image_urls)) {
      row.data.image_urls.forEach((u: string) => usedUrls.add(u))
    }
  }

  // Only pick photos not already used in any post
  const unusedPhotos = folderPhotos.filter(p => !usedUrls.has(p.url))

  if (unusedPhotos.length === 0) {
    return NextResponse.json({ error: 'All photos in this folder have already been used in posts. Upload new photos to continue.' }, { status: 400 })
  }

  // Load brand for caption context
  const { data: brandRows } = await supabase
    .from('workspace_brands')
    .select('*')
    .eq('workspace_id', userId)
    .eq('id', brandId)
    .single()

  const brand = brandRows as Record<string, unknown> | null

  // Pick `count` random photos from unused ones only (shuffle and slice)
  const shuffled = [...unusedPhotos].sort(() => Math.random() - 0.5)
  const selected = shuffled.slice(0, Math.min(count || 1, unusedPhotos.length))

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not set' }, { status: 500 })

  const postsCreated: string[] = []

  for (const photo of selected) {
    // Generate caption via Claude
    const brandContext = brand ? `Brand: ${brand.name}. Tone: ${brand.tone || 'professional'}. ${brand.brand_guidelines ? `Guidelines: ${brand.brand_guidelines}` : ''}` : ''
    const userPrompt = prompt
      ? `${prompt}\n\nPhoto: ${photo.name}${photo.tags?.length ? `. Tags: ${photo.tags.join(', ')}` : ''}`
      : `Write a social media caption for a photo called "${photo.name}"${photo.tags?.length ? ` with tags: ${photo.tags.join(', ')}` : ''}. Keep it engaging and on-brand.`

    let caption = `Post featuring: ${photo.name}`

    try {
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 300,
          system: `You are a social media copywriter. Write concise, engaging captions. Output only the caption text, no quotes, no preamble. ${brandContext}`,
          messages: [{ role: 'user', content: userPrompt }],
        }),
      })

      if (claudeRes.ok) {
        const claudeData = await claudeRes.json()
        caption = claudeData.content?.[0]?.text?.trim() || caption
      }
    } catch {
      // fall through with default caption
    }

    // Create the post
    const postData = {
      brand_profile_id: brandId,
      caption,
      image_url: photo.url,
      image_urls: [photo.url],
      platforms: platforms || ['instagram'],
      status: status || 'draft',
      scheduled_at: null,
      batch_id: `folder-${folderId}`,
      batch_label: `Folder Automation`,
      published_at: status === 'published' ? new Date().toISOString() : null,
      created_date: new Date().toISOString(),
      client_visible: false,
      client_approved: false,
    }

    const postId = `post-${crypto.randomUUID()}`
    const { error: insertErr } = await supabase
      .from('posts')
      .insert({
        id: postId,
        workspace_id: userId,
        brand_profile_id: brandId,
        client_visible: false,
        data: postData,
      })

    if (!insertErr) postsCreated.push(postId)
  }

  return NextResponse.json({
    postsCreated: postsCreated.length,
    postIds: postsCreated,
    fromFolder: folderId,
    status: status || 'draft',
    unusedRemaining: unusedPhotos.length - selected.length,
  })
}
