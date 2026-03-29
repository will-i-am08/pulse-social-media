import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const automationId = req.nextUrl.searchParams.get('automationId')
  const limit = parseInt(req.nextUrl.searchParams.get('limit') || '50')
  const offset = parseInt(req.nextUrl.searchParams.get('offset') || '0')

  let query = supabase
    .from('automation_runs')
    .select('*, automations(name)')
    .eq('user_id', user.id)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (automationId) query = query.eq('automation_id', automationId)

  const { data, error } = await query

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const runs = (data || []).map((r: any) => ({
    ...r,
    automationName: r.automations?.name || 'Unknown',
    automations: undefined,
  }))

  return NextResponse.json(runs)
}
