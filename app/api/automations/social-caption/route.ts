import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, platforms, prompt, tone } = await req.json()
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

  const length = brand.output_length || 'medium'
  const hashtags = brand.include_hashtags !== false ? 'Include relevant hashtags.' : 'Do not include hashtags.'
  const emojis = brand.include_emojis !== false ? 'Use emojis where appropriate.' : 'Do not use emojis.'
  const platformList = (platforms || ['instagram']).join(', ')

  const userPrompt = `Write a ${length} social media caption for the brand "${brand.name}".
Brand tone: ${tone || brand.tone || 'professional'}
${brand.brand_voice ? `Brand voice: ${brand.brand_voice}` : ''}
Platforms: ${platformList}
${hashtags}
${emojis}
${prompt ? `Topic/instructions: ${prompt}` : 'Write an engaging caption that reflects the brand voice.'}`

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
        max_tokens: 512,
        system: 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations, no quotation marks, nothing else.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API error')

    const caption = data.content?.[0]?.text || ''
    return NextResponse.json({ caption, brandName: brand.name, platforms })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
