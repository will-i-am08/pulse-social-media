import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'
import { buildEnhancedPrompt, type CaptionFeedback } from '@/lib/caption-engine'
import { cleanCaption } from '@/lib/cleanCaption'

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
    .select('name, brand_voice, tone, output_length, include_hashtags, include_emojis, custom_rules, posting_instructions, brand_guidelines, key_messages, target_audience')
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

  const platformList = (platforms && platforms.length ? platforms : ['instagram'])

  // Pull recent captions for anti-repetition context
  const { data: recentPosts } = await supabase
    .from('posts')
    .select('data')
    .eq('brand_profile_id', brandId)
    .order('created_at', { ascending: false })
    .limit(15)

  const recentCaptions = (recentPosts || [])
    .map((r: any) => ({
      caption: r.data?.caption || '',
      variationPreset: r.data?.variationPreset || '',
    }))
    .filter((c: any) => c.caption)

  // Pull feedback to apply learned preferences
  const { data: feedbackRows } = await supabase
    .from('caption_feedback')
    .select('*')
    .eq('brand_id', brandId)
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const feedback: CaptionFeedback[] = (feedbackRows || []).map((r: any) => ({
    id: r.id,
    brandId: r.brand_id,
    postId: r.post_id,
    captionText: r.caption_text,
    rating: r.rating,
    tags: r.tags || [],
    notes: r.notes || '',
    variationPreset: r.variation_preset || '',
    platforms: r.platforms || [],
    createdAt: r.created_at,
  }))

  // Topic block — blog context + hard constraints (length, URL placement)
  const topicParts: string[] = []
  topicParts.push(`Promote this blog post. The caption must be SHORT — 2–4 tight sentences max.`)
  topicParts.push(`End the caption with the full blog URL on its own line (use exactly: ${url}).`)
  if (customPrompt) topicParts.push(`Additional instructions: ${customPrompt}`)
  topicParts.push(``)
  topicParts.push(`Source blog:`)
  topicParts.push(`Title: ${article.title || '(unknown)'}`)
  if (article.description) topicParts.push(`Description: ${article.description}`)
  topicParts.push(`URL: ${url}`)
  topicParts.push(`Excerpt:`)
  topicParts.push(article.body)

  // Build engine prompt — scope='blog' filters rules marked for blogs
  const engineOutput = buildEnhancedPrompt({
    brand: {
      ...brand,
      // Force short output for blog promo captions regardless of brand default
      output_length: 'short',
      key_messages: brand.key_messages || [],
    },
    platforms: platformList,
    userPrompt: topicParts.join('\n'),
    hasImage: false,
    recentCaptions,
    feedback,
    variationMode: 'auto',
    scope: 'blog',
  })

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
        system: engineOutput.systemPrompt,
        messages: [{ role: 'user', content: engineOutput.userPrompt }],
      }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'Claude API error')
    let caption = cleanCaption((data.content?.[0]?.text || '').trim())
    // Guarantee the blog URL is in every caption (cleanCaption could strip a line break — re-check)
    if (caption && !caption.includes(url)) {
      caption = `${caption}\n\n${url}`
    }
    return NextResponse.json({
      caption,
      title: article.title,
      image: article.image || null,
      sourceUrl: url,
      preset: engineOutput.selectedPreset,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
