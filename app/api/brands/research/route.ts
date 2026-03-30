import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

const RESEARCH_PROMPTS: Record<string, (b: Record<string, unknown>) => string> = {
  market: (b) => `You are a market research analyst. Conduct a thorough market research analysis for the following brand.

Brand: ${b.name}
Business: ${b.business_name || b.name}
Industry: ${b.industry}
Location: ${b.location}
Website: ${b.website}
Tagline: ${b.tagline}
Target Audience: ${b.target_audience}

Write a detailed markdown market research report covering:
## Market Overview
## Target Market Analysis
## Customer Segments & Personas
## Market Trends
## Market Size & Opportunity
## Key Success Factors

Be specific, data-driven where possible, and actionable.`,

  competitor: (b) => `You are a competitive intelligence analyst. Analyse the competitive landscape for this brand.

Brand: ${b.name}
Industry: ${b.industry}
Location: ${b.location}
Website: ${b.website}
Known Competitors: ${b.competitors || 'unknown'}
Unique Value Proposition: ${b.unique_value_prop}

Write a detailed markdown competitive analysis covering:
## Competitive Landscape Overview
## Key Competitors Analysis
## Competitor Strengths & Weaknesses
## Our Competitive Advantages
## Gaps & Opportunities
## Differentiation Strategy

Be specific and actionable.`,

  audience: (b) => `You are an audience research specialist. Create a detailed audience analysis for this brand.

Brand: ${b.name}
Industry: ${b.industry}
Location: ${b.location}
Target Audience: ${b.target_audience}
Brand Voice: ${b.brand_voice}
Mission: ${b.mission}

Write a detailed markdown audience analysis covering:
## Primary Audience Profiles
## Psychographics & Motivations
## Pain Points & Challenges
## Content Preferences
## Communication Style Recommendations
## Audience Engagement Strategy

Be specific and create vivid, realistic personas.`,

  voice: (b) => `You are a brand strategist. Create a comprehensive brand voice and guidelines document.

Brand: ${b.name}
Industry: ${b.industry}
Tone: ${b.tone}
Current Brand Voice Notes: ${b.brand_voice}
Mission: ${b.mission}
Values: ${b.values}
Target Audience: ${b.target_audience}
Key Messages: ${(b.key_messages as string[])?.join(', ') || 'not defined'}

Write a detailed markdown brand voice guide covering:
## Brand Personality
## Voice & Tone Principles
## Writing Style Guide
## Do's and Don'ts
## Example Copy (before/after)
## Platform-Specific Adaptations

Make it practical and easy for a content team to follow.`,
}

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

  const { brandId, researchType } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('*')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .single()

  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  const promptFn = RESEARCH_PROMPTS[researchType as string]
  if (!promptFn) return NextResponse.json({ error: 'Invalid researchType' }, { status: 400 })

  const prompt = promptFn(brand as Record<string, unknown>)

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 3000,
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!upstream.ok) {
    const err = await upstream.text()
    return NextResponse.json({ error: err }, { status: upstream.status })
  }

  const data = await upstream.json()
  const text = data.content?.[0]?.text || ''
  return NextResponse.json({ text })
}
