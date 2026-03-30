import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'
import { getActiveGoals, goalsToPromptSection } from '@/lib/brands/getActiveGoals'

async function callClaude(apiKey: string, model: string, maxTokens: number, messages: unknown[], tools?: unknown[]) {
  const body: Record<string, unknown> = { model, max_tokens: maxTokens, messages }
  if (tools) body.tools = tools
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  return res.json()
}

function extractText(data: { content: Array<{ type: string; text?: string }> }): string {
  const blocks = data.content.filter(b => b.type === 'text')
  return blocks.map(b => b.text).join('').trim()
}

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, count = 5, focusArea = 'all' } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  // Fetch brand for context
  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, business_name, location, industry, brand_voice, focus_areas')
    .eq('id', brandId).eq('user_id', user.id).single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const businessDesc = `${brand.business_name || brand.name}${brand.location ? `, ${brand.location}` : ''}${brand.industry ? ` (${brand.industry})` : ''}`
  const focusLabel = focusArea === 'all' ? 'all relevant topics' : focusArea.replace(/-/g, ' ')

  // Phase 1: research trends (web search if available, otherwise best-effort)
  let trendData = null
  try {
    const researchData = await callClaude(apiKey, 'claude-sonnet-4-6', 1024, [{
      role: 'user',
      content: `Research what people are actively searching for related to: ${focusLabel} — for a business like ${businessDesc}.

Identify the real, high-volume search queries people type into Google, ask via voice search, and query in AI tools like ChatGPT and Perplexity.

Return ONLY a valid JSON object, no markdown, no explanation:
{
  "topQueries": [{ "query": "exact search phrase", "intent": "informational|transactional|local", "volume": "high|medium" }],
  "questionsAsked": ["Full question people type or ask aloud?"],
  "contentGaps": ["A type of content commonly searched but rarely well-answered"]
}

Requirements: topQueries: exactly 5, questionsAsked: exactly 4, contentGaps: exactly 2.`
    }], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }])

    let text = extractText(researchData).replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    trendData = JSON.parse(text)
  } catch {
    // Continue without trend data
  }

  const trendSection = trendData ? `
SEARCH RESEARCH FINDINGS — use these to shape every idea:
Top searches: ${trendData.topQueries?.map((q: { query: string; volume: string }) => `"${q.query}" (${q.volume})`).join(', ') || ''}
Questions people ask: ${trendData.questionsAsked?.join(' | ') || ''}
Content gaps: ${trendData.contentGaps?.join(' | ') || ''}

INSTRUCTIONS: Each idea MUST directly target one of the searches or questions above.
` : ''

  const focusAreas: string[] = brand.focus_areas || []
  const focusConstraint = focusArea !== 'all' ? `Focus area: ${focusLabel}` : `Available focus areas: ${focusAreas.length > 0 ? focusAreas.join(', ') : 'all topics'}`

  const goals = await getActiveGoals(brandId, user.id)
  const goalsSection = goalsToPromptSection(goals)

  const prompt = `You are an SEO and AI visibility content strategist for ${businessDesc}.

Generate exactly ${count} blog post ideas based on HIGH-VOLUME, REAL search queries — the exact phrases people type into Google, ChatGPT, and Perplexity.

${focusConstraint}
${trendSection}${goalsSection}

CRITICAL requirements:
- Titles must be phrased as actual search queries or questions (e.g. "How much does X cost?" not "Guide to X")
- Include question-based titles (How much, Can you, Is it worth, Why is my, How do I) — these get featured snippets
- Each post must have a clear "primary search query" that the post directly answers
- Mix "Blog Post" (informational) and "How-To Guide" (procedural) types

Return ONLY a valid JSON array with exactly ${count} objects, no markdown:
[{
  "title": "string — phrased as a real search query",
  "primaryQuery": "the exact search phrase this post targets",
  "desc": "2 sentence description of the post",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "readTime": "X min",
  "postType": "Blog Post" or "How-To Guide",
  "category": "one of the focus areas"
}]`

  try {
    const data = await callClaude(apiKey, 'claude-haiku-4-5-20251001', 2048, [{ role: 'user', content: prompt }])
    let text = extractText(data).replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    const ideas = JSON.parse(text)
    return NextResponse.json({ ideas, trendData })
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Generation failed' }, { status: 500 })
  }
}
