import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title } = await req.json()
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

  const prompt = `You are an SEO specialist for ${businessName}${location ? ` in ${location}` : ''}.

Given this blog post title: "${title}"

Generate exactly 5 alternative title variations optimized for search engines and AI search (Google AI Overviews, ChatGPT, Perplexity). Each should use a different strategy.

Return ONLY a valid JSON array, no markdown:
[{ "title": "...", "reason": "Short reason why this works (10 words max)" }]

Strategies to use across the 5:
1. Question format (triggers featured snippets)
2. "How to" format (matches procedural search intent)
3. Cost/value angle (high commercial intent)
4. ${location ? `Local SEO (includes "${location.split(',')[0].trim()}" or "near me")` : 'Specificity angle (includes exact numbers or timeframes)'}
5. List/number format (e.g. "5 Signs..." or "3 Ways...")`

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
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      }),
    })
    if (!res.ok) {
      const err = await res.json()
      return NextResponse.json({ error: err.error?.message || `API error ${res.status}` }, { status: 500 })
    }
    const data = await res.json()
    const text = (data.content?.[0]?.text ?? '').trim().replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    if (!text) return NextResponse.json({ error: 'Empty response from AI' }, { status: 500 })
    return NextResponse.json(JSON.parse(text))
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Optimization failed' }, { status: 500 })
  }
}
