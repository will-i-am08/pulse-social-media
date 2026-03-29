import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

async function callClaude(apiKey: string, prompt: string) {
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
    throw new Error(err.error?.message || `API error ${res.status}`)
  }
  const data = await res.json()
  return data.content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
}

interface CheckResult {
  name: string
  status: 'pass' | 'warning' | 'fail'
  value: string
  detail: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  // Fetch and parse the target page
  let html: string
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'PulseSEOBot/1.0' },
      redirect: 'follow',
    })
    html = await res.text()
  } catch {
    return NextResponse.json({ error: 'Could not fetch the URL' }, { status: 400 })
  }

  const checks: CheckResult[] = []

  // Title tag
  const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/is)
  const title = titleMatch ? titleMatch[1].trim() : ''
  if (!title) {
    checks.push({ name: 'Title Tag', status: 'fail', value: 'Missing', detail: 'No <title> tag found' })
  } else if (title.length < 30) {
    checks.push({ name: 'Title Tag', status: 'warning', value: `${title.length} chars`, detail: `"${title}" — too short, aim for 50-60 characters` })
  } else if (title.length > 65) {
    checks.push({ name: 'Title Tag', status: 'warning', value: `${title.length} chars`, detail: `"${title.slice(0, 60)}…" — may be truncated in search results` })
  } else {
    checks.push({ name: 'Title Tag', status: 'pass', value: `${title.length} chars`, detail: `"${title}"` })
  }

  // Meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["'](.*?)["']/is)
    || html.match(/<meta[^>]*content=["'](.*?)["'][^>]*name=["']description["']/is)
  const metaDesc = metaDescMatch ? metaDescMatch[1].trim() : ''
  if (!metaDesc) {
    checks.push({ name: 'Meta Description', status: 'fail', value: 'Missing', detail: 'No meta description found' })
  } else if (metaDesc.length < 70) {
    checks.push({ name: 'Meta Description', status: 'warning', value: `${metaDesc.length} chars`, detail: 'Too short — aim for 120-160 characters' })
  } else if (metaDesc.length > 165) {
    checks.push({ name: 'Meta Description', status: 'warning', value: `${metaDesc.length} chars`, detail: 'May be truncated — aim for 120-160 characters' })
  } else {
    checks.push({ name: 'Meta Description', status: 'pass', value: `${metaDesc.length} chars`, detail: metaDesc.slice(0, 80) + '…' })
  }

  // Heading structure
  const h1Matches = html.match(/<h1[^>]*>(.*?)<\/h1>/gis) || []
  const h2Matches = html.match(/<h2[^>]*>(.*?)<\/h2>/gis) || []
  const h3Matches = html.match(/<h3[^>]*>(.*?)<\/h3>/gis) || []
  if (h1Matches.length === 0) {
    checks.push({ name: 'Heading Structure', status: 'fail', value: 'No H1', detail: 'Every page should have exactly one H1 tag' })
  } else if (h1Matches.length > 1) {
    checks.push({ name: 'Heading Structure', status: 'warning', value: `${h1Matches.length} H1s`, detail: 'Multiple H1 tags found — use only one per page' })
  } else {
    checks.push({ name: 'Heading Structure', status: 'pass', value: `H1:1 H2:${h2Matches.length} H3:${h3Matches.length}`, detail: 'Good heading hierarchy' })
  }

  // Image alt text
  const imgMatches = html.match(/<img[^>]*>/gis) || []
  const imgsWithoutAlt = imgMatches.filter(img => !img.match(/alt=["'][^"']+["']/i))
  if (imgMatches.length === 0) {
    checks.push({ name: 'Image Alt Text', status: 'pass', value: 'No images', detail: 'No images found on page' })
  } else if (imgsWithoutAlt.length === 0) {
    checks.push({ name: 'Image Alt Text', status: 'pass', value: `${imgMatches.length} images`, detail: 'All images have alt text' })
  } else {
    const pct = Math.round(((imgMatches.length - imgsWithoutAlt.length) / imgMatches.length) * 100)
    checks.push({ name: 'Image Alt Text', status: imgsWithoutAlt.length > imgMatches.length / 2 ? 'fail' : 'warning', value: `${pct}% coverage`, detail: `${imgsWithoutAlt.length} of ${imgMatches.length} images missing alt text` })
  }

  // Internal & external links
  const linkMatches = html.match(/<a[^>]*href=["']([^"']*?)["'][^>]*>/gis) || []
  const parsedUrl = new URL(url)
  let internal = 0, external = 0, nofollow = 0
  for (const link of linkMatches) {
    const hrefMatch = link.match(/href=["']([^"']*?)["']/i)
    if (!hrefMatch) continue
    const href = hrefMatch[1]
    if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue
    try {
      const linkUrl = new URL(href, url)
      if (linkUrl.hostname === parsedUrl.hostname) internal++
      else external++
    } catch {
      internal++
    }
    if (link.match(/rel=["'][^"']*nofollow/i)) nofollow++
  }
  checks.push({ name: 'Links', status: internal + external > 0 ? 'pass' : 'warning', value: `${internal} internal, ${external} external`, detail: nofollow > 0 ? `${nofollow} nofollow links` : 'Link profile looks good' })

  // Content length
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  const bodyText = bodyMatch ? bodyMatch[1].replace(/<script[\s\S]*?<\/script>/gi, '').replace(/<style[\s\S]*?<\/style>/gi, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : ''
  const wordCount = bodyText.split(/\s+/).filter(Boolean).length
  if (wordCount < 300) {
    checks.push({ name: 'Content Length', status: 'fail', value: `${wordCount} words`, detail: 'Thin content — aim for 800+ words for better ranking' })
  } else if (wordCount < 800) {
    checks.push({ name: 'Content Length', status: 'warning', value: `${wordCount} words`, detail: 'Could be longer — 800-2000 words performs best' })
  } else {
    checks.push({ name: 'Content Length', status: 'pass', value: `${wordCount} words`, detail: 'Good content length' })
  }

  // Open Graph tags
  const ogTitle = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["'](.*?)["']/i)
  const ogDesc = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["'](.*?)["']/i)
  const ogImage = html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["'](.*?)["']/i)
  const twitterCard = html.match(/<meta[^>]*name=["']twitter:card["'][^>]*content=["'](.*?)["']/i)
  const ogCount = [ogTitle, ogDesc, ogImage, twitterCard].filter(Boolean).length
  if (ogCount === 0) {
    checks.push({ name: 'Social Tags', status: 'fail', value: 'Missing', detail: 'No Open Graph or Twitter Card tags found' })
  } else if (ogCount < 3) {
    checks.push({ name: 'Social Tags', status: 'warning', value: `${ogCount}/4 tags`, detail: `Missing: ${[!ogTitle && 'og:title', !ogDesc && 'og:description', !ogImage && 'og:image', !twitterCard && 'twitter:card'].filter(Boolean).join(', ')}` })
  } else {
    checks.push({ name: 'Social Tags', status: 'pass', value: `${ogCount}/4 tags`, detail: 'Good social meta coverage' })
  }

  // Compute overall score
  const scores = { pass: 100, warning: 60, fail: 0 }
  const totalScore = Math.round(checks.reduce((acc, c) => acc + scores[c.status], 0) / checks.length)

  // Get AI suggestions for failing items
  const failingItems = checks.filter(c => c.status !== 'pass')
  let suggestions: string[] = []
  if (failingItems.length > 0) {
    try {
      const prompt = `You are an SEO expert. A page at "${url}" was audited. Here are the issues found:

${failingItems.map(c => `- ${c.name}: ${c.status.toUpperCase()} — ${c.detail}`).join('\n')}

Page title: "${title}"
Meta description: "${metaDesc}"
Word count: ${wordCount}

Provide 3-5 specific, actionable improvement suggestions. Return as a JSON array of strings. Only return the JSON array, nothing else.`

      const text = await callClaude(apiKey, prompt)
      const match = text.match(/\[[\s\S]*\]/)
      if (match) suggestions = JSON.parse(match[0])
    } catch {
      // AI suggestions are optional
    }
  }

  return NextResponse.json({
    url,
    score: totalScore,
    checks,
    suggestions,
    pageData: { title, metaDesc, wordCount, h1Count: h1Matches.length, h2Count: h2Matches.length, imgCount: imgMatches.length, internalLinks: internal, externalLinks: external },
  })
}
