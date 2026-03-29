import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data, error } = await supabase
    .from('automations')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, name, description, steps, triggerType, triggerConfig, isEnabled } = body

  if (!name) return NextResponse.json({ error: 'Name required' }, { status: 400 })

  const now = new Date().toISOString()

  if (id) {
    // Update
    const { data, error } = await supabase
      .from('automations')
      .update({
        name,
        description: description || '',
        steps: steps || [],
        trigger_type: triggerType || 'manual',
        trigger_config: triggerConfig || {},
        is_enabled: isEnabled ?? true,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    // Create
    const { data, error } = await supabase
      .from('automations')
      .insert({
        user_id: user.id,
        name,
        description: description || '',
        steps: steps || [],
        trigger_type: triggerType || 'manual',
        trigger_config: triggerConfig || {},
        is_enabled: isEnabled ?? true,
      })
      .select('*')
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}
