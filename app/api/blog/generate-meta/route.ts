import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, content } = await req.json()
  if (!brandId || !title) return NextResponse.json({ error: 'brandId and title required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, business_name, location')
    .eq('id', brandId).eq('user_id', user.id).single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const businessName = brand.business_name || brand.name
  const location = brand.location || ''

  const prompt = `Write a single SEO meta description for this blog post. It must be 140-155 characters, include the primary keyword, and match a warm, approachable brand voice.${location ? ` Include "${location.split(',')[0].trim()}" or "${businessName}" if it fits naturally.` : ` Include "${businessName}" if it fits naturally.`}

Title: ${title}

Post content (first 500 chars):
${(content || '').substring(0, 500)}

Return ONLY the meta description text, nothing else. No quotes, no labels.`

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
        max_tokens: 200,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message || `API error ${res.status}` }, { status: 500 })
    }
    const data = await res.json()
    const meta = (data.content?.[0]?.text ?? '').trim().replace(/^["']|["']$/g, '')
    return NextResponse.json({ meta })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Meta generation failed' }, { status: 500 })
  }
}
