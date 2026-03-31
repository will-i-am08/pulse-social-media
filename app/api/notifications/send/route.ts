import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { type, title, message, link } = await req.json()
  if (!title) return NextResponse.json({ error: 'title required' }, { status: 400 })

  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: user.id,
      type: type || 'info',
      title,
      message: message || '',
      link: link || null,
    })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
