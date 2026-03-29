import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'
import { z } from 'zod'

const Schema = z.object({
  content: z.string().min(50),
  targetQuery: z.string().min(3),
  style: z.enum(['answer-first', 'list', 'narrative']).optional().default('answer-first'),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }

  const { content, targetQuery, style } = parsed.data
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

  const systemPrompt = style === 'answer-first'
    ? `You are an expert at optimising web content for AI citation. Rewrite the provided content using the Answer-First format:
1. Open with a direct, concise answer to the target query (1-2 sentences)
2. Follow with supporting context and evidence
3. Add a clear heading structure (H2/H3)
4. End with actionable takeaways
Return ONLY the rewritten content as markdown.`
    : style === 'list'
    ? `Rewrite the content as a structured list format optimised for AI citation. Use numbered or bulleted lists, clear headings. Return only markdown.`
    : `Rewrite the content as a clear narrative optimised for AI citation. Flowing paragraphs, clear topic sentences. Return only markdown.`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Target query: "${targetQuery}"\n\nOriginal content:\n${content}` },
      ],
      max_tokens: 2000,
    })

    const rewritten = response.choices[0].message.content || ''
    return NextResponse.json({ rewritten })
  } catch (err) {
    console.error('Rewrite error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
