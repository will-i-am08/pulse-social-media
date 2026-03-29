import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) {
    return NextResponse.json(
      { error: 'No Claude API key configured. Add it in Account Settings.' },
      { status: 400 }
    )
  }

  const { website } = await req.json()
  if (!website) return NextResponse.json({ error: 'website required' }, { status: 400 })

  // Fetch website HTML
  let html = ''
  try {
    const res = await fetch(website, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; PulseBot/1.0)' },
      signal: AbortSignal.timeout(8000),
    })
    html = await res.text()
    // Truncate to first 15k chars to stay within token limits
    html = html.slice(0, 15000)
  } catch {
    return NextResponse.json({ error: 'Could not fetch website' }, { status: 400 })
  }

  const prompt = `Analyse this website HTML and extract brand information. Return a JSON object with these exact keys:
{
  "name": "brand/business name",
  "tagline": "their tagline or slogan",
  "businessName": "full legal or trading name",
  "industry": "industry category",
  "location": "city, state/country",
  "brandVoice": "description of their writing style and tone",
  "tone": one of: professional|casual|playful|luxury|inspirational|friendly,
  "targetAudience": "who they serve",
  "mission": "their mission statement or purpose",
  "uniqueValueProp": "what makes them different",
  "keyMessages": ["message1", "message2", "message3"]
}

Return ONLY the JSON object, no other text.

Website HTML:
${html}`

  const response = await fetch('https://api.anthropic.com/v1/messages', {
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

  const data = await response.json()
  if (!response.ok) {
    return NextResponse.json({ error: data.error?.message || 'Claude error' }, { status: 500 })
  }

  try {
    const text = data.content?.[0]?.text || '{}'
    const json = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
    return NextResponse.json(json)
  } catch {
    return NextResponse.json({ error: 'Failed to parse brand data' }, { status: 500 })
  }
}
