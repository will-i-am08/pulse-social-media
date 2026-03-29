import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

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

  const prompt = `You are a brand voice editor for ${businessName}.

${brandVoice ? `BRAND VOICE RULES:\n${brandVoice}\n\n` : ''}Rewrite this blog post to perfectly match the brand voice above.

RULES:
- Keep the EXACT same structure, all ## headings, all facts, all CTAs, and all contact details
- Keep the EXACT same Frequently Asked Questions section — do not alter questions or answers
- Replace overly formal or corporate phrases with conversational, warm language
- Short paragraphs (2-4 sentences)
- Remove em dashes (—) in the middle of sentences; use a comma, full stop, or rewrite instead
- Do NOT add new sections, change headings, alter prices/specs, or invent new facts
- Preserve all markdown formatting (## headings, bullet points, bold **text**)

Return ONLY the rewritten blog post. No preamble, no labels, no explanation.

BLOG POST TO REWRITE:
${content}`

  const anthropicRes = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      stream: true,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!anthropicRes.ok) {
    const err = await anthropicRes.json()
    return NextResponse.json({ error: err.error?.message || `API error ${anthropicRes.status}` }, { status: 500 })
  }

  return new NextResponse(anthropicRes.body, {
    headers: { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
  })
}
