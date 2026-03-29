import OpenAI from 'openai'

export interface EngineScore {
  engine: string
  cited: boolean
  score: number
  snippet: string
  missing: string[]
}

export interface AuditResult {
  citationHealthScore: number
  overallStatus: 'ai-cited' | 'ai-shadowed' | 'ai-blocked'
  engineScores: Record<string, EngineScore>
  suggestedChanges: Array<{ type: string; priority: 'high' | 'medium' | 'low'; description: string }>
}

const ENGINES = [
  { name: 'perplexity',  weight: 0.30, persona: 'Perplexity AI search' },
  { name: 'chatgpt',     weight: 0.35, persona: 'ChatGPT web search (GPT-4o)' },
  { name: 'gemini',      weight: 0.20, persona: 'Google Gemini AI search' },
  { name: 'searchgpt',   weight: 0.15, persona: 'SearchGPT' },
]

function buildPrompt(engine: { name: string; persona: string }, pageData: PageData): string {
  return `You are simulating how ${engine.persona} would evaluate a webpage for AI citation quality.

Page URL: ${pageData.url}
Title: ${pageData.title}
Meta description: ${pageData.metaDescription}
H1: ${pageData.h1}
Schema markup present: ${pageData.hasSchema ? 'Yes' : 'No'}
Body excerpt: ${pageData.bodyExcerpt}

Evaluate whether this page would be cited by ${engine.persona} when answering user queries about its topic.

Respond in JSON with exactly this shape:
{
  "cited": boolean,
  "score": number (0-100),
  "snippet": "the snippet the AI would show, or empty string",
  "missing": ["list of specific improvements needed"]
}`
}

interface PageData {
  url: string
  title: string
  metaDescription: string
  h1: string
  hasSchema: boolean
  bodyExcerpt: string
}

export async function runAudit(targetUrl: string): Promise<AuditResult> {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  // Fetch and parse the target page
  const pageData = await fetchPageData(targetUrl)

  // Run 4 engine simulations in parallel
  const results = await Promise.all(
    ENGINES.map(async engine => {
      try {
        const response = await client.chat.completions.create({
          model: 'gpt-4o',
          messages: [{ role: 'user', content: buildPrompt(engine, pageData) }],
          response_format: { type: 'json_object' },
          max_tokens: 500,
        })
        const parsed = JSON.parse(response.choices[0].message.content || '{}')
        return {
          engine: engine.name,
          weight: engine.weight,
          cited: !!parsed.cited,
          score: Math.min(100, Math.max(0, Number(parsed.score) || 0)),
          snippet: String(parsed.snippet || ''),
          missing: Array.isArray(parsed.missing) ? parsed.missing : [],
        }
      } catch {
        return { engine: engine.name, weight: engine.weight, cited: false, score: 0, snippet: '', missing: [] }
      }
    })
  )

  // Weighted citation health score
  const citationHealthScore = Math.round(
    results.reduce((sum, r) => sum + r.score * r.weight, 0)
  )

  const overallStatus: AuditResult['overallStatus'] =
    citationHealthScore >= 70 ? 'ai-cited' :
    citationHealthScore >= 40 ? 'ai-shadowed' : 'ai-blocked'

  const engineScores: Record<string, EngineScore> = {}
  const allMissing: string[] = []
  for (const r of results) {
    engineScores[r.engine] = { engine: r.engine, cited: r.cited, score: r.score, snippet: r.snippet, missing: r.missing }
    allMissing.push(...r.missing)
  }

  // Deduplicate and prioritize suggested changes
  const seen = new Set<string>()
  const suggestedChanges: AuditResult['suggestedChanges'] = []
  for (const item of allMissing) {
    const key = item.toLowerCase().slice(0, 40)
    if (!seen.has(key)) {
      seen.add(key)
      const priority = citationHealthScore < 40 ? 'high' : citationHealthScore < 70 ? 'medium' : 'low'
      suggestedChanges.push({ type: 'content', priority, description: item })
    }
  }
  if (!pageData.hasSchema) {
    suggestedChanges.unshift({ type: 'schema', priority: 'high', description: 'Add structured data (JSON-LD schema markup)' })
  }

  return { citationHealthScore, overallStatus, engineScores, suggestedChanges }
}

async function fetchPageData(url: string): Promise<PageData> {
  const res = await fetch(url, { headers: { 'User-Agent': 'GEOBot/1.0' }, signal: AbortSignal.timeout(10000) })
  const html = await res.text()

  const get = (re: RegExp) => (html.match(re)?.[1] || '').replace(/<[^>]+>/g, '').trim()

  return {
    url,
    title: get(/<title[^>]*>([\s\S]*?)<\/title>/i),
    metaDescription: get(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i) ||
                     get(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i),
    h1: get(/<h1[^>]*>([\s\S]*?)<\/h1>/i),
    hasSchema: html.includes('"application/ld+json"'),
    bodyExcerpt: html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 2000),
  }
}
