import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'
import { buildEnhancedPrompt, type CaptionFeedback } from '@/lib/caption-engine'
import { cleanCaption } from '@/lib/cleanCaption'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, platforms, prompt, tone, imageUrl, variationMode } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  // Fetch brand (including custom_rules, brand_voice, etc.)
  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, brand_voice, tone, output_length, include_hashtags, include_emojis, custom_rules, posting_instructions, brand_guidelines, key_messages, target_audience')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  // Fetch recent captions for context awareness
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('data')
    .eq('brand_profile_id', brandId)
    .order('created_at', { ascending: false })
    .limit(15)

  const recentCaptions = (recentPosts || [])
    .map((r: any) => ({
      caption: r.data?.caption || '',
      variationPreset: r.data?.variationPreset || '',
    }))
    .filter((c: any) => c.caption)

  // Fetch feedback for this brand
  const { data: feedbackRows } = await supabase
    .from('caption_feedback')
    .select('*')
    .eq('brand_id', brandId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const feedback: CaptionFeedback[] = (feedbackRows || []).map((r: any) => ({
    id: r.id,
    brandId: r.brand_id,
    postId: r.post_id,
    captionText: r.caption_text,
    rating: r.rating,
    tags: r.tags || [],
    notes: r.notes || '',
    variationPreset: r.variation_preset || '',
    platforms: r.platforms || [],
    createdAt: r.created_at,
  }))

  // Build the enhanced prompt via the caption engine
  const engineOutput = buildEnhancedPrompt({
    brand: {
      ...brand,
      tone: tone || brand.tone,
      key_messages: brand.key_messages || [],
    },
    platforms: platforms || ['instagram'],
    userPrompt: prompt || undefined,
    hasImage: !!imageUrl,
    recentCaptions,
    feedback,
    variationMode: variationMode || 'auto',
  })

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 768,
        system: engineOutput.systemPrompt,
        messages: [{
          role: 'user',
          content: imageUrl
            ? [
                { type: 'image', source: { type: 'url', url: imageUrl } },
                { type: 'text', text: engineOutput.userPrompt },
              ]
            : engineOutput.userPrompt,
        }],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API error')

    const caption = cleanCaption(data.content?.[0]?.text || '')
    return NextResponse.json({
      caption,
      brandName: brand.name,
      platforms,
      preset: engineOutput.selectedPreset,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
