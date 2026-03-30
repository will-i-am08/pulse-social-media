import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, checks } = await req.json()
  if (!url || !checks) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  const failingChecks = checks.filter((c: any) => c.status !== 'pass')
  if (failingChecks.length === 0) return NextResponse.json({ fixes: [] })

  const prompt = `You are a technical SEO expert. Generate fixes for these issues found on "${url}":

${failingChecks.map((c: any) => `- [${c.category}] ${c.name}: ${c.status.toUpperCase()} — ${c.detail}`).join('\n')}

For each failing item, generate the actual code/content to fix it. Return a JSON array of objects:
- "name": the check name
- "category": the category
- "fix": the actual code or content (e.g. the full robots.txt content, the meta tag HTML, the JSON-LD script tag, etc.)
- "instructions": brief instructions on where to add this (1-2 sentences)

Examples of what to generate:
- Missing robots.txt → generate a complete robots.txt file
- Missing sitemap → generate a basic sitemap.xml template
- Missing viewport → generate the <meta name="viewport"> tag
- Missing canonical → generate the <link rel="canonical"> tag
- Missing structured data → generate a basic Organization JSON-LD
- Missing security headers → provide the header configuration

Return ONLY the JSON array.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 3000, messages: [{ role: 'user', content: prompt }] }),
    })

    if (!res.ok) {
      const err = await res.json()
      throw new Error(err.error?.message || 'API error')
    }

    const data = await res.json()
    const text = data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
    const match = text.match(/\[[\s\S]*\]/)
    const fixes = match ? JSON.parse(match[0]) : []

    return NextResponse.json({ fixes })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
