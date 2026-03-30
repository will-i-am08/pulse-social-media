import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, checks, pageData } = await req.json()
  if (!url || !checks) return NextResponse.json({ error: 'Missing data' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  const failingChecks = checks.filter((c: any) => c.status !== 'pass')
  if (failingChecks.length === 0) return NextResponse.json({ fixes: [] })

  const prompt = `You are an SEO expert. A page at "${url}" was audited and has these issues:

${failingChecks.map((c: any) => `- ${c.name}: ${c.status.toUpperCase()} — ${c.detail}`).join('\n')}

Current page data:
- Title: "${pageData?.title || ''}"
- Meta description: "${pageData?.metaDesc || ''}"
- Word count: ${pageData?.wordCount || 0}
- H1 count: ${pageData?.h1Count || 0}
- Images: ${pageData?.imgCount || 0}

Generate improved versions for each failing item. Return a JSON array of objects with these fields:
- "name": the check name (e.g. "Title Tag")
- "current": what it currently is
- "improved": your recommended replacement
- "explanation": why this is better (1 sentence)

For Title Tag: provide an improved title (50-60 chars).
For Meta Description: provide an improved description (120-160 chars).
For Heading Structure: provide recommended H1 text.
For Image Alt Text: provide 3 example alt text suggestions.
For Social Tags: provide the full meta tags as HTML.
For Content Length: provide a content outline with 5 sections to expand the page.

Return ONLY the JSON array, nothing else.`

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
        max_tokens: 2048,
        messages: [{ role: 'user', content: prompt }],
      }),
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
