import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function calcNextRun(frequency: string, dayOfWeek: number): string {
  const now = new Date()
  const target = new Date(now)
  // Find the next occurrence of dayOfWeek
  const diff = (dayOfWeek - now.getDay() + 7) % 7 || 7
  target.setDate(now.getDate() + diff)
  target.setHours(9, 0, 0, 0) // 9am

  if (frequency === 'fortnightly') {
    // If less than 7 days away, push to next week
    if (diff <= 7) target.setDate(target.getDate() + 7)
  } else if (frequency === 'monthly') {
    target.setMonth(target.getMonth() + 1)
    // Set to same day of week in next month
    const monthTarget = new Date(target.getFullYear(), target.getMonth(), 1)
    while (monthTarget.getDay() !== dayOfWeek) monthTarget.setDate(monthTarget.getDate() + 1)
    return monthTarget.toISOString()
  }

  return target.toISOString()
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const brandId = req.nextUrl.searchParams.get('brandId')
  let query = supabase.from('photo_drop_schedules').select('*').eq('user_id', user.id)
  if (brandId) query = query.eq('brand_id', brandId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { brandId, frequency, dayOfWeek, batchSize, platforms, prompt } = await req.json()
  if (!brandId) return NextResponse.json({ error: 'brandId required' }, { status: 400 })

  const nextRun = calcNextRun(frequency || 'weekly', dayOfWeek ?? 1)

  // Upsert: one schedule per brand per user
  const { data: existing } = await supabase
    .from('photo_drop_schedules')
    .select('id')
    .eq('user_id', user.id)
    .eq('brand_id', brandId)
    .single()

  if (existing) {
    const { data, error } = await supabase
      .from('photo_drop_schedules')
      .update({ frequency, day_of_week: dayOfWeek ?? 1, batch_size: batchSize || 5, platforms: platforms || ['instagram'], prompt: prompt || '', next_run_at: nextRun, enabled: true })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }

  const { data, error } = await supabase
    .from('photo_drop_schedules')
    .insert({ user_id: user.id, brand_id: brandId, frequency, day_of_week: dayOfWeek ?? 1, batch_size: batchSize || 5, platforms: platforms || ['instagram'], prompt: prompt || '', next_run_at: nextRun })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  await supabase.from('photo_drop_schedules').delete().eq('id', id).eq('user_id', user.id)
  return NextResponse.json({ ok: true })
}
