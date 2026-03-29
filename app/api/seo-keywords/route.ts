import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

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
  return data.content.filter(b => b.type === 'text').map(b => b.text).join('').trim()
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { seedKeyword, brandId } = await req.json()
  if (!seedKeyword) return NextResponse.json({ error: 'Seed keyword required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  // Fetch brand context if provided
  let brandContext = ''
  if (brandId) {
    const { data: brand } = await supabase
      .from('workspace_brands')
      .select('name, business_name, location, industry')
      .eq('id', brandId).eq('user_id', user.id).single()
    if (brand) {
      brandContext = `Business: ${brand.business_name || brand.name}${brand.location ? `, based in ${brand.location}` : ''}${brand.industry ? ` (${brand.industry})` : ''}`
    }
  }

  // Phase 1: Research with web search
  let researchData = null
  try {
    const research = await callClaude(apiKey, 'claude-sonnet-4-6', 1024, [{
      role: 'user',
      content: `Research keyword opportunities for: "${seedKeyword}"${brandContext ? `\n${brandContext}` : ''}

Search for what people actually type into Google, YouTube, Reddit, and AI tools related to this topic. Find real search trends, autocomplete suggestions, and related queries.

Return ONLY a valid JSON object:
{
  "topQueries": ["exact search phrase people type"],
  "relatedTopics": ["broader related topic"],
  "questions": ["full question people ask"],
  "longtail": ["longer, more specific search phrase"]
}

Requirements: topQueries: 8, relatedTopics: 5, questions: 6, longtail: 6.`
    }], [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }])

    let text = extractText(research).replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    researchData = JSON.parse(text)
  } catch {
    // Continue without research
  }

  // Phase 2: Generate structured keyword list
  const researchSection = researchData ? `
SEARCH RESEARCH DATA — use this to inform your keyword suggestions:
Top queries found: ${researchData.topQueries?.join(', ') || 'none'}
Related topics: ${researchData.relatedTopics?.join(', ') || 'none'}
Questions people ask: ${researchData.questions?.join(' | ') || 'none'}
Long-tail variations found: ${researchData.longtail?.join(', ') || 'none'}
` : ''

  const prompt = `You are an SEO keyword research expert.${brandContext ? ` ${brandContext}.` : ''}

Seed keyword: "${seedKeyword}"
${researchSection}
Generate a comprehensive keyword research report. Return ONLY a valid JSON object with these fields:

{
  "related": [
    { "keyword": "exact keyword phrase", "difficulty": "low|medium|high", "volume": "low|medium|high", "intent": "informational|transactional|navigational|commercial" }
  ],
  "longtail": [
    { "keyword": "longer specific phrase", "difficulty": "low|medium|high", "volume": "low|medium" }
  ],
  "questions": [
    { "keyword": "full question phrasing", "type": "what|how|why|where|when|which" }
  ],
  "contentGaps": [
    { "topic": "underserved topic area", "opportunity": "why this is a gap", "suggestedTitle": "suggested blog title targeting this gap" }
  ]
}

Requirements:
- related: 10-12 keywords, sorted by estimated volume (high first)
- longtail: 8 keywords
- questions: 8 questions covering different question types
- contentGaps: 4 opportunities
- Use the research data to provide realistic difficulty and volume estimates
- Keywords must be real phrases people actually search for

Return ONLY the JSON, no explanation or markdown.`

  try {
    const result = await callClaude(apiKey, 'claude-sonnet-4-6', 3000, [{
      role: 'user', content: prompt
    }])

    let text = extractText(result).replace(/^```json?\s*/i, '').replace(/\s*```$/, '')
    const match = text.match(/\{[\s\S]*\}/)
    if (!match) throw new Error('Invalid response format')
    const keywords = JSON.parse(match[0])

    return NextResponse.json({ seedKeyword, brandId, ...keywords })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
