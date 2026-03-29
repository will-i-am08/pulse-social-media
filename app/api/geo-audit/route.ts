import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { runAudit } from '@/lib/geo/llm-auditor'
import { z } from 'zod'

const Schema = z.object({
  targetUrl: z.string().url(),
  connectionId: z.string().uuid().optional(),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { targetUrl, connectionId } = parsed.data

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OPENAI_API_KEY not configured' }, { status: 500 })
  }

  try {
    const result = await runAudit(targetUrl)

    const { data: row, error } = await supabase
      .from('geo_audit_results')
      .insert({
        user_id: user.id,
        site_connection_id: connectionId || null,
        site_url: targetUrl,
        citation_health_score: result.citationHealthScore,
        overall_status: result.overallStatus,
        engine_scores: result.engineScores,
        suggested_changes: result.suggestedChanges,
      })
      .select('id')
      .single()

    if (error) console.error('Failed to save audit result:', error)

    return NextResponse.json({ ...result, auditId: row?.id })
  } catch (err) {
    console.error('Audit error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
