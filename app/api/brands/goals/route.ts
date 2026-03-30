import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { BrandGoal } from '@/lib/types'

function rowToGoal(row: Record<string, unknown>): BrandGoal {
  return {
    id: row.id as string,
    brandId: row.brand_id as string,
    title: (row.title as string) || '',
    description: (row.description as string) || '',
    period: ((row.period as string) || 'monthly') as BrandGoal['period'],
    startDate: row.start_date as string,
    endDate: row.end_date as string,
    isActive: (row.is_active as boolean) ?? true,
    createdAt: row.created_at as string,
  }
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const brandId = req.nextUrl.searchParams.get('brandId')
  let query = supabase.from('brand_goals').select('*').eq('user_id', user.id)
  if (brandId) query = query.eq('brand_id', brandId)
  const { data, error } = await query.order('start_date', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data || []).map(rowToGoal))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, title, description, period, startDate, endDate } = await req.json()
  if (!brandId || !title || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('brand_goals')
    .insert({
      brand_id: brandId,
      user_id: user.id,
      title,
      description: description || '',
      period: period || 'monthly',
      start_date: startDate,
      end_date: endDate,
      is_active: true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToGoal(data))
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const update: Record<string, unknown> = {}
  if (rest.title !== undefined) update.title = rest.title
  if (rest.description !== undefined) update.description = rest.description
  if (rest.isActive !== undefined) update.is_active = rest.isActive
  if (rest.startDate !== undefined) update.start_date = rest.startDate
  if (rest.endDate !== undefined) update.end_date = rest.endDate
  if (rest.period !== undefined) update.period = rest.period

  const { data, error } = await supabase
    .from('brand_goals')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToGoal(data))
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('brand_goals')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
