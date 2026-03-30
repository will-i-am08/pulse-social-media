import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, content } = await req.json()
  if (!brandId || !content) return NextResponse.json({ error: 'brandId and content required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, business_name, brand_voice')
    .eq('id', brandId).eq('user_id', user.id).single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const businessName = brand.business_name || brand.name
  const brandVoice = brand.brand_voice || ''

  const prompt = `You are an editor reviewing a blog post for ${businessName}.

${brandVoice ? `BRAND VOICE RULES:\n${brandVoice}\n\n` : ''}Analyze this blog post. Check for:
1. Grammar errors
2. Readability issues (aim for accessible, plain language)
3. Brand voice violations — flag anything too formal, too salesy, jargon without explanation, or corporate-speak
4. Structure issues — missing sections, poor flow

Return ONLY valid JSON, no markdown:
{
  "score": 0-100,
  "summary": "one sentence overall verdict",
  "issues": [
    {
      "type": "grammar" | "readability" | "voice" | "structure",
      "text": "the exact problematic text from the post (max 80 chars)",
      "suggestion": "the corrected or improved version"
    }
  ]
}

Limit to 8 most important issues. If the post is good, return a high score with an empty issues array.

BLOG POST:
${content.substring(0, 3000)}`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
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
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Check failed' }, { status: 500 })
  }
}
