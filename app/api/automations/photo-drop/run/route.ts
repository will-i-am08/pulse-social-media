import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, batchSize, platforms, prompt } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  // Fetch brand
  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, brand_voice, tone, output_length, include_hashtags, include_emojis')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  // Fetch unprocessed photos from brand folders
  // Photos are stored in supabase 'photos' table with data column
  const { data: photoRows } = await supabase
    .from('photos')
    .select('id, data')
    .eq('workspace_id', user.id)

  if (!photoRows?.length) return NextResponse.json({ created: 0, message: 'No photos found' })

  // Get folders from photo data to find brand-linked ones
  // Note: folders are in localStorage on client side, but photo.folder_id is stored in the photo data
  // We need to check photo data for folder_id and processed flag
  type PhotoData = { url: string; processed?: boolean; folder_id?: string; [key: string]: unknown }
  const photos = photoRows
    .map(r => ({ dbId: r.id as string, ...(r.data as PhotoData) }))
    .filter(p => !p.processed)
    .slice(0, batchSize || 5)

  if (photos.length === 0) return NextResponse.json({ created: 0, message: 'No unprocessed photos' })

  let created = 0
  const processedIds: string[] = []
  const batchId = crypto.randomUUID()
  const batchLabel = `Auto Photo Drop — ${brand.name} — ${new Date().toLocaleDateString('en-AU', { day: 'numeric', month: 'short' })}`

  for (const photo of photos) {
    try {
      // Generate caption
      const length = brand.output_length || 'medium'
      const hashtags = brand.include_hashtags !== false ? 'Include relevant hashtags.' : 'Do not include hashtags.'
      const emojis = brand.include_emojis !== false ? 'Use emojis where appropriate.' : 'Do not use emojis.'
      const platformList = (platforms || ['instagram']).join(', ')

      const userPrompt = `Write a ${length} social media caption for the brand "${brand.name}".
Brand tone: ${brand.tone || 'professional'}
${brand.brand_voice ? `Brand voice: ${brand.brand_voice}` : ''}
Platforms: ${platformList}
${hashtags}
${emojis}
${prompt ? `Topic/instructions: ${prompt}` : 'Write an engaging caption that reflects the brand voice.'}
Describe what you see in the image and use it as context for the caption.`

      const captionRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 512,
          system: 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations, no quotation marks, nothing else.',
          messages: [{
            role: 'user',
            content: [
              { type: 'image', source: { type: 'url', url: photo.url as string } },
              { type: 'text', text: userPrompt },
            ],
          }],
        }),
      })
      const captionData = await captionRes.json()
      if (!captionRes.ok) continue
      const caption = captionData.content?.[0]?.text || ''
      if (!caption) continue

      // Create post
      const postId = `post-${crypto.randomUUID()}`
      await supabase.from('posts').insert({
        id: postId,
        workspace_id: user.id,
        brand_profile_id: brandId,
        client_visible: false,
        data: {
          brand_profile_id: brandId,
          caption,
          image_url: photo.url,
          image_urls: [photo.url],
          platforms: platforms || ['instagram'],
          status: 'submitted',
          scheduled_at: null,
          published_at: null,
          batch_id: batchId,
          batch_label: batchLabel,
          created_date: new Date().toISOString(),
          client_visible: false,
          client_approved: false,
        },
      })

      // Mark photo as processed
      const photoData = photoRows.find(r => r.id === photo.dbId)
      if (photoData) {
        await supabase.from('photos').update({ data: { ...photoData.data as object, processed: true } }).eq('id', photo.dbId)
      }

      processedIds.push(photo.dbId as string)
      created++
    } catch { /* continue */ }
  }

  // Send notification
  if (created > 0) {
    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'approval',
      title: `${created} new post${created !== 1 ? 's' : ''} ready for approval`,
      message: `Auto Photo Drop processed ${created} photo${created !== 1 ? 's' : ''} for ${brand.name}. Review and approve to send to Buffer.`,
      link: '/posts',
    })
  }

  return NextResponse.json({ created, processed: processedIds.length })
}
