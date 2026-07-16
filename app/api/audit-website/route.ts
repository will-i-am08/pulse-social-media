import { type NextRequest, NextResponse } from 'next/server'
import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'
import { rateLimit, clientIp } from '@/lib/rate-limit'

export const runtime = 'nodejs'
export const maxDuration = 30

const FETCH_TIMEOUT_MS = 9_000
const MAX_HTML_BYTES = 400_000
const MAX_TEXT_CHARS = 8_000
const MAX_REDIRECTS = 3

function normaliseUrl(raw: string): string | null {
  const trimmed = raw.trim()
  if (!trimmed) return null
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const u = new URL(withProtocol)
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return null
    if (u.port && u.port !== '80' && u.port !== '443') return null
    return u.toString()
  } catch {
    return null
  }
}

/** True for loopback, link-local, private-range, and other non-public addresses. */
function isPrivateIp(ip: string): boolean {
  if (isIP(ip) === 6) {
    const v6 = ip.toLowerCase()
    // loopback, unspecified, link-local, unique-local, and v4-mapped forms
    if (v6 === '::1' || v6 === '::') return true
    if (v6.startsWith('fe80') || v6.startsWith('fc') || v6.startsWith('fd')) return true
    const v4Mapped = v6.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
    if (v4Mapped) return isPrivateIp(v4Mapped[1])
    return false
  }
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some(n => Number.isNaN(n))) return true
  const [a, b] = parts
  if (a === 10 || a === 127 || a === 0) return true
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 169 && b === 254) return true // link-local / cloud metadata
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  if (a >= 224) return true // multicast / reserved
  return false
}

/** Resolve the hostname and refuse anything that lands on a private address. */
async function assertPublicHost(url: URL): Promise<boolean> {
  const host = url.hostname
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal') || host.endsWith('.local')) return false
  if (isIP(host)) return !isPrivateIp(host)
  try {
    const addrs = await lookup(host, { all: true })
    return addrs.length > 0 && addrs.every(a => !isPrivateIp(a.address))
  } catch {
    return false
  }
}

function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

async function fetchSite(url: string): Promise<{ text: string; title: string } | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  try {
    // Follow redirects manually so every hop is re-validated against private ranges
    let current = new URL(url)
    let res: Response | null = null
    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
      if (!(await assertPublicHost(current))) return null
      res = await fetch(current.toString(), {
        signal: controller.signal,
        redirect: 'manual',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (compatible; PulseAuditBot/1.0; +https://pulsesocialmedia.com.au)',
          Accept: 'text/html,application/xhtml+xml',
        },
      })
      if (res.status >= 300 && res.status < 400) {
        const location = res.headers.get('location')
        if (!location) return null
        const next = new URL(location, current)
        if (next.protocol !== 'http:' && next.protocol !== 'https:') return null
        current = next
        continue
      }
      break
    }
    if (!res || !res.ok) return null
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('html')) return null

    const reader = res.body?.getReader()
    if (!reader) {
      const html = await res.text()
      const text = stripHtml(html).slice(0, MAX_TEXT_CHARS)
      const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim().slice(0, 200)
      return { text, title }
    }

    const chunks: Uint8Array[] = []
    let received = 0
    while (received < MAX_HTML_BYTES) {
      const { done, value } = await reader.read()
      if (done) break
      if (value) {
        chunks.push(value)
        received += value.length
      }
    }
    try { await reader.cancel() } catch {}
    const html = new TextDecoder().decode(Buffer.concat(chunks.map(c => Buffer.from(c))))
    const text = stripHtml(html).slice(0, MAX_TEXT_CHARS)
    const title = (html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim().slice(0, 200)
    return { text, title }
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export async function POST(req: NextRequest) {
  if (!rateLimit(`audit:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests — try again shortly' }, { status: 429 })
  }

  const { url, bizName, industry, score, answers } = await req.json().catch(() => ({}))

  const normalised = typeof url === 'string' ? normaliseUrl(url) : null
  if (!normalised) {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  const site = await fetchSite(normalised)
  if (!site || !site.text) {
    return NextResponse.json({
      reachable: false,
      snapshot: '',
      recommendations: [],
    })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  if (!ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'AI not configured' }, { status: 500 })
  }

  const auditSummary = answers && typeof answers === 'object'
    ? Object.entries(answers).map(([k, v]) => `- ${k}: ${v}`).join('\n')
    : '(no audit answers provided)'

  const prompt = `You are a senior social media strategist writing a personalised section of an audit report for a small business.

You've been given the text content of the business's website. Use it to understand what they actually sell, their voice, their audience, and what makes them distinctive. Then write recommendations tailored to THEIR business — not generic social media tips.

BUSINESS CONTEXT
- Name: ${typeof bizName === 'string' ? bizName.slice(0, 120) : '(not provided)'}
- Industry: ${typeof industry === 'string' ? industry.slice(0, 120) : '(not provided)'}
- Page title: ${site.title || '(none)'}
- Overall audit score (out of 100): ${typeof score === 'number' ? score : 'n/a'}

THEIR SELF-REPORTED AUDIT ANSWERS
${auditSummary}

WEBSITE CONTENT (trimmed)
"""
${site.text}
"""

IMPORTANT RULES
- Do NOT reference, recommend, or mention any third-party agencies, tools, products, or services — including (but not limited to) Pulse Social Media, CaptionCraft, or anything else that might appear on the site itself. The advice must be for the business to execute themselves.
- Do NOT use bullet points, dashes, arrows, numbering, or any list markers inside the text. Write each recommendation as a single clean sentence of flowing prose.
- Do NOT use em-dashes or hyphens to join clauses. Use full stops or commas instead.

Write a JSON object with EXACTLY this shape — no commentary, no markdown fences:
{
  "snapshot": "One or two sentences describing what this business actually does and who it's for. Specific, not generic. Reference something real from the site.",
  "recommendations": [
    "Five short, specific, actionable social media recommendations tailored to THIS business. Each one should reference something concrete you learned from the site (a product, service, location, audience, tone, offer). Each recommendation max 220 characters. Plain sentence only, no markers of any kind."
  ]
}

Return EXACTLY 5 recommendations. Make them feel like a human strategist wrote them after reading the site, not a template. Australian English spelling.`

  try {
    const aiRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 900,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!aiRes.ok) {
      console.error('Claude audit-website error:', await aiRes.text())
      return NextResponse.json({ reachable: true, snapshot: '', recommendations: [] })
    }

    const aiData = await aiRes.json()
    const raw = aiData.content?.[0]?.text ?? ''
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return NextResponse.json({ reachable: true, snapshot: '', recommendations: [] })
    }
    const parsed = JSON.parse(jsonMatch[0])
    const snapshot = typeof parsed.snapshot === 'string' ? parsed.snapshot.trim() : ''
    const recs = Array.isArray(parsed.recommendations)
      ? parsed.recommendations
          .filter((r: unknown): r is string => typeof r === 'string' && r.trim().length > 0)
          .map((r: string) => r.trim())
          .slice(0, 5)
      : []

    return NextResponse.json({ reachable: true, snapshot, recommendations: recs })
  } catch (e) {
    console.error('audit-website fetch error:', e)
    return NextResponse.json({ reachable: true, snapshot: '', recommendations: [] })
  }
}
