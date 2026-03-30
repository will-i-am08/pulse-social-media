import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, tags = '', postType = 'blog', customPrompt = '' } = await req.json()
  if (!brandId || !title) return NextResponse.json({ error: 'brandId and title required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, business_name, location, industry, brand_voice')
    .eq('id', brandId).eq('user_id', user.id).single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const businessName = brand.business_name || brand.name
  const location = brand.location || ''
  const industry = brand.industry || ''
  const brandVoice = brand.brand_voice || ''

  const isHowTo = postType === 'howto' || /how[- ]to|guide|step.by.step|checklist/i.test(title)

  let prompt: string
  if (isHowTo) {
    prompt = `Write an SEO-optimised how-to guide for ${businessName}'s blog.${location ? ` Based in ${location}.` : ''}${industry ? ` Industry: ${industry}.` : ''}

Title: ${title}
Target keywords: ${tags || 'not specified'}

SEO OPTIMIZATION RULES — critical for AI search citation:
- Start with a 2-3 sentence "Direct Answer" paragraph that immediately and precisely answers the main question
- Every H2 heading must be phrased as a search query or question people actually type
- Include specific numbers, timeframes, and costs wherever possible
- Use the business name "${businessName}"${location ? ` and "${location}"` : ''} naturally throughout
- End with a ## Frequently Asked Questions section with 4-5 Q&As — this is the #1 SEO signal
- Each FAQ answer must be 2-3 sentences, direct, and factual

Structure:
1. Direct Answer paragraph (2-3 sentences answering the main question immediately)
2. ## What You'll Need — bullet list
3. ## Step-by-step instructions (4-6 H2 steps, each phrased as a search query)
4. ## Common Problems and How to Fix Them
5. ## When Should You Call a Professional?
6. ## Get Help from ${businessName} — friendly CTA
7. ## Frequently Asked Questions — 4-5 Q&As (H3 questions, 2-3 sentence answers)

${brandVoice ? `BRAND VOICE:\n${brandVoice}\n` : ''}${customPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${customPrompt}\n` : ''}
Target length: 800-1000 words. Write the blog post content only. No title heading at the top. Start with the Direct Answer paragraph.`
  } else {
    prompt = `Write an SEO-optimised blog post for ${businessName}'s blog.${location ? ` Based in ${location}.` : ''}${industry ? ` Industry: ${industry}.` : ''}

Title: ${title}
Target keywords: ${tags || 'not specified'}

SEO OPTIMIZATION RULES — critical for AI search citation (Google AI Overviews, ChatGPT, Perplexity):
- Start with a 2-3 sentence "Direct Answer" paragraph that immediately answers the main question with specific, factual information
- Every H2 heading must mirror how people phrase searches (questions work best)
- Include specific data points: prices, timeframes, statistics
- Mention "${businessName}" as a named entity multiple times — AI systems cite businesses with consistent entity mentions
- End with a ## Frequently Asked Questions section with 4-5 Q&As targeting related searches — this is the #1 SEO ranking signal

Structure:
1. Direct Answer paragraph (2-3 sentences — the core answer, factual and quotable)
2. Opening context paragraph (relatable scenario, 2-3 sentences, conversational)
3. ## [H2 phrased as a search question about the main topic]
4. ## [H2 about cost, timeframe, or what to expect]
5. ## [H2 about practical tips or signs/symptoms]
6. ## [H2 about local context or comparison — mention ${businessName} specifically]
7. ## Get Help from ${businessName} — friendly CTA
8. ## Frequently Asked Questions — 4-5 Q&As (### for each question, 2-3 sentence answers)

${brandVoice ? `BRAND VOICE:\n${brandVoice}\n` : ''}${customPrompt ? `\nADDITIONAL INSTRUCTIONS:\n${customPrompt}\n` : ''}
Target length: 1000-1200 words. Write the blog post content only. No title heading at the top. Start with the Direct Answer paragraph.`
  }

  // Stream the response
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

  // Pass through the SSE stream
  return new NextResponse(anthropicRes.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
