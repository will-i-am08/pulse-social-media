import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BrandReport } from '@/lib/types'

function rowToReport(row: Record<string, unknown>): BrandReport {
  return {
    id: row.id as string,
    brandId: row.brand_id as string,
    userId: row.user_id as string,
    title: (row.title as string) || 'Research Report',
    reportType: ((row.report_type as string) || 'ai_research') as BrandReport['reportType'],
    content: (row.content as string) || '',
    summary: (row.summary as string) || '',
    createdAt: row.created_at as string,
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const brandId = req.nextUrl.searchParams.get('brandId')
  let query = supabase.from('brand_reports').select('*').eq('user_id', user.id)
  if (brandId) query = query.eq('brand_id', brandId)
  const { data, error } = await query.order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data || []).map(rowToReport))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { brandId, title, reportType, content, summary } = body
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const { data, error } = await supabase
    .from('brand_reports')
    .insert({
      brand_id: brandId,
      user_id: user.id,
      title: title || 'Research Report',
      report_type: reportType || 'ai_research',
      content: content || '',
      summary: summary || '',
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToReport(data))
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, title, content, summary } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (title !== undefined) update.title = title
  if (content !== undefined) update.content = content
  if (summary !== undefined) update.summary = summary

  const { data, error } = await supabase
    .from('brand_reports')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToReport(data))
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('brand_reports')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
