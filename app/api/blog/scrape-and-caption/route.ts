import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
}

function pickMeta(html: string, patterns: RegExp[]): string {
  for (const re of patterns) {
    const m = html.match(re)
    if (m && m[1]) return decodeEntities(m[1].trim())
  }
  return ''
}

function extractArticle(html: string): { title: string; description: string; image: string; body: string } {
  const title = pickMeta(html, [
    /<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:title["'][^>]+content=["']([^"']+)["']/i,
    /<title[^>]*>([^<]+)<\/title>/i,
  ])
  const description = pickMeta(html, [
    /<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:description["'][^>]+content=["']([^"']+)["']/i,
  ])
  const image = pickMeta(html, [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i,
  ])

  // Body: prefer <article>, then <main>, else <body>
  let region = ''
  const articleMatch = html.match(/<article[\s\S]*?<\/article>/i)
  if (articleMatch) region = articleMatch[0]
  else {
    const mainMatch = html.match(/<main[\s\S]*?<\/main>/i)
    if (mainMatch) region = mainMatch[0]
    else {
      const bodyMatch = html.match(/<body[\s\S]*?<\/body>/i)
      region = bodyMatch ? bodyMatch[0] : html
    }
  }

  const body = decodeEntities(
    region
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
  )
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 6000)

  return { title, description, image, body }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let payload: { url?: string; brandId?: string; platforms?: string[]; customPrompt?: string }
  try {
    payload = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }
  const { url, brandId, platforms, customPrompt } = payload
  if (!url || !/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: 'Valid http(s) URL required' }, { status: 400 })
  }
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  const { data: brand } = await supabase
    .from('workspace_brands')
    .select('name, brand_voice, tone, output_length, include_hashtags, include_emojis, brand_guidelines')
    .eq('id', brandId)
    .eq('user_id', user.id)
    .single()
  if (!brand) return NextResponse.json({ error: 'Brand not found' }, { status: 404 })

  // Fetch the blog HTML
  let html = ''
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PulseSocialBot/1.0; +https://pulsesocial.app)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })
    if (!res.ok) {
      return NextResponse.json({ error: `Blog fetch failed (${res.status})` }, { status: 502 })
    }
    const ct = res.headers.get('content-type') || ''
    if (!ct.includes('html')) {
      return NextResponse.json({ error: 'URL did not return HTML' }, { status: 415 })
    }
    html = await res.text()
  } catch (e: any) {
    return NextResponse.json({ error: 'Could not fetch URL: ' + (e?.message || 'unknown') }, { status: 502 })
  }

  const article = extractArticle(html)
  if (!article.body && !article.title) {
    return NextResponse.json({ error: 'Could not extract article content' }, { status: 422 })
  }

  const length = brand.output_length || 'medium'
  const hashtags = brand.include_hashtags !== false ? 'Include relevant hashtags.' : 'Do not include hashtags.'
  const emojis = brand.include_emojis !== false ? 'Use emojis where appropriate.' : 'Do not use emojis.'
  const platformList = (platforms && platforms.length ? platforms : ['instagram']).join(', ')

  const userPrompt = `Write a ${length} social media caption for the brand "${brand.name}" promoting the blog post below.
Brand tone: ${brand.tone || 'professional'}
${brand.brand_voice ? `Brand voice: ${brand.brand_voice}` : ''}
${brand.brand_guidelines ? `Brand guidelines: ${brand.brand_guidelines}` : ''}
Platforms: ${platformList}
${hashtags}
${emojis}
${customPrompt ? `Additional instructions: ${customPrompt}` : ''}

Source blog:
Title: ${article.title || '(unknown)'}
${article.description ? `Description: ${article.description}` : ''}
URL: ${url}
Excerpt:
${article.body}

Write a caption that entices readers to click through and read the full post. Do not include the URL in the caption.`

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
        max_tokens: 512,
        system: 'You are a social media copywriter. Write ONLY the caption text — no commentary, no explanations, no quotation marks, nothing else.',
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Claude API error')
    const caption = data.content?.[0]?.text || ''
    return NextResponse.json({
      caption,
      title: article.title,
      image: article.image || null,
      sourceUrl: url,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
