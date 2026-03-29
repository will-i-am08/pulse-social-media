import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

interface TechCheck {
  name: string
  category: string
  status: 'pass' | 'warning' | 'fail'
  detail: string
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url } = await req.json()
  if (!url) return NextResponse.json({ error: 'URL required' }, { status: 400 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured.' }, { status: 400 })

  let parsedUrl: URL
  try {
    parsedUrl = new URL(url)
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const checks: TechCheck[] = []

  // 1. HTTPS
  checks.push({
    name: 'HTTPS',
    category: 'Security',
    status: parsedUrl.protocol === 'https:' ? 'pass' : 'fail',
    detail: parsedUrl.protocol === 'https:' ? 'Site uses HTTPS' : 'Site is not using HTTPS — critical for SEO and security',
  })

  // 2. Fetch the page
  let html = ''
  let responseHeaders: Headers | null = null
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'PulseSEOBot/1.0' }, redirect: 'follow' })
    html = await res.text()
    responseHeaders = res.headers
  } catch {
    return NextResponse.json({ error: 'Could not fetch the URL' }, { status: 400 })
  }

  // 3. Viewport meta (mobile-friendliness)
  const viewport = html.match(/<meta[^>]*name=["']viewport["'][^>]*>/i)
  checks.push({
    name: 'Viewport Meta',
    category: 'Mobile',
    status: viewport ? 'pass' : 'fail',
    detail: viewport ? 'Viewport meta tag present — mobile-friendly' : 'Missing viewport meta tag — page may not render properly on mobile',
  })

  // 4. Canonical tag
  const canonical = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["'](.*?)["']/i)
  checks.push({
    name: 'Canonical Tag',
    category: 'SEO Tags',
    status: canonical ? 'pass' : 'warning',
    detail: canonical ? `Canonical URL: ${canonical[1]}` : 'No canonical tag found — may cause duplicate content issues',
  })

  // 5. Hreflang
  const hreflang = html.match(/<link[^>]*hreflang/gi) || []
  checks.push({
    name: 'Hreflang Tags',
    category: 'SEO Tags',
    status: hreflang.length > 0 ? 'pass' : 'warning',
    detail: hreflang.length > 0 ? `${hreflang.length} hreflang tags found` : 'No hreflang tags — only needed for multilingual sites',
  })

  // 6. Structured data (JSON-LD)
  const jsonLd = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>/gi) || []
  checks.push({
    name: 'Structured Data',
    category: 'SEO Tags',
    status: jsonLd.length > 0 ? 'pass' : 'warning',
    detail: jsonLd.length > 0 ? `${jsonLd.length} JSON-LD schema block(s) found` : 'No structured data — adding schema markup helps search engines understand your content',
  })

  // 7. robots.txt
  try {
    const robotsUrl = `${parsedUrl.origin}/robots.txt`
    const robotsRes = await fetch(robotsUrl, { headers: { 'User-Agent': 'PulseSEOBot/1.0' } })
    if (robotsRes.ok) {
      const robotsTxt = await robotsRes.text()
      const hasDisallow = robotsTxt.includes('Disallow')
      checks.push({
        name: 'robots.txt',
        category: 'Crawlability',
        status: 'pass',
        detail: `robots.txt found (${robotsTxt.length} bytes)${hasDisallow ? ' — contains Disallow rules' : ''}`,
      })
    } else {
      checks.push({ name: 'robots.txt', category: 'Crawlability', status: 'warning', detail: 'No robots.txt found — search engines will crawl everything by default' })
    }
  } catch {
    checks.push({ name: 'robots.txt', category: 'Crawlability', status: 'warning', detail: 'Could not check robots.txt' })
  }

  // 8. Sitemap
  try {
    const sitemapUrl = `${parsedUrl.origin}/sitemap.xml`
    const sitemapRes = await fetch(sitemapUrl, { headers: { 'User-Agent': 'PulseSEOBot/1.0' } })
    if (sitemapRes.ok) {
      const sitemapTxt = await sitemapRes.text()
      const urlCount = (sitemapTxt.match(/<url>/gi) || []).length
      checks.push({ name: 'Sitemap', category: 'Crawlability', status: 'pass', detail: `sitemap.xml found${urlCount > 0 ? ` — ${urlCount} URLs` : ''}` })
    } else {
      checks.push({ name: 'Sitemap', category: 'Crawlability', status: 'fail', detail: 'No sitemap.xml found — helps search engines discover and index your pages' })
    }
  } catch {
    checks.push({ name: 'Sitemap', category: 'Crawlability', status: 'warning', detail: 'Could not check sitemap.xml' })
  }

  // 9. Resource count
  const scripts = (html.match(/<script[^>]*src=/gi) || []).length
  const styles = (html.match(/<link[^>]*stylesheet/gi) || []).length
  const images = (html.match(/<img[^>]*/gi) || []).length
  const totalResources = scripts + styles + images
  checks.push({
    name: 'Page Resources',
    category: 'Performance',
    status: totalResources > 50 ? 'warning' : 'pass',
    detail: `${scripts} scripts, ${styles} stylesheets, ${images} images (${totalResources} total)`,
  })

  // 10. Content-Security-Policy or X-Frame-Options
  const csp = responseHeaders?.get('content-security-policy')
  const xfo = responseHeaders?.get('x-frame-options')
  checks.push({
    name: 'Security Headers',
    category: 'Security',
    status: csp || xfo ? 'pass' : 'warning',
    detail: csp ? 'Content-Security-Policy header present' : xfo ? 'X-Frame-Options header present' : 'No security headers found — consider adding CSP or X-Frame-Options',
  })

  // Compute overall score
  const scores = { pass: 100, warning: 60, fail: 0 }
  const totalScore = Math.round(checks.reduce((acc, c) => acc + scores[c.status], 0) / checks.length)

  // Get AI recommendations for failed items
  const failingChecks = checks.filter(c => c.status !== 'pass')
  let recommendations: string[] = []
  if (failingChecks.length > 0) {
    try {
      const prompt = `You are a technical SEO expert. A site at "${url}" was audited. Here are the issues:

${failingChecks.map(c => `- [${c.category}] ${c.name}: ${c.status.toUpperCase()} — ${c.detail}`).join('\n')}

Provide 3-5 specific, prioritized fix recommendations. Return as a JSON array of strings. Only the JSON array.`

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-haiku-4-5-20251001', max_tokens: 1024, messages: [{ role: 'user', content: prompt }] }),
      })
      const data = await res.json()
      const text = data.content?.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('')
      const match = text?.match(/\[[\s\S]*\]/)
      if (match) recommendations = JSON.parse(match[0])
    } catch {
      // Optional
    }
  }

  return NextResponse.json({ url, score: totalScore, checks, recommendations })
}
