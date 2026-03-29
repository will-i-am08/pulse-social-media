import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/geo/encrypt'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('account_settings')
    .select('claude_key_enc')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    hasClaudeKey: !!data?.claude_key_enc,
  })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { claudeKey } = body

  const row: Record<string, unknown> = { user_id: user.id, updated_at: new Date().toISOString() }

  if (claudeKey) {
    const { enc, iv, tag } = encrypt(claudeKey)
    row.claude_key_enc = enc
    row.claude_key_iv = iv
    row.claude_key_tag = tag
  }

  const { error } = await supabase
    .from('account_settings')
    .upsert(row, { onConflict: 'user_id' })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const field = req.nextUrl.searchParams.get('field')

  const clear: Record<string, null> = {}
  if (field === 'claude') {
    clear.claude_key_enc = null
    clear.claude_key_iv = null
    clear.claude_key_tag = null
  }

  const { error } = await supabase
    .from('account_settings')
    .update({ ...clear, updated_at: new Date().toISOString() })
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
