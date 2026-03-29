import { type NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'

// Service-role client — bypasses RLS
function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!
  )
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}
export async function POST(request: NextRequest) {
  return handleRequest(request)
}

async function handleRequest(request: NextRequest) {
  // Verify caller is authenticated
  const supabase = await createServerClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Verify caller is admin
  const sb = getServiceClient()
  const { data: profile } = await sb
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden — admin only' }, { status: 403 })
  }

  const { searchParams } = new URL(request.url)
  const action = searchParams.get('action')

  let body: Record<string, unknown> = {}
  if (request.method === 'POST') {
    try { body = await request.json() } catch {}
  }

  try {
    if (action === 'list') {
      const { data, error } = await sb
        .from('profiles')
        .select('id, display_name, email, role, brand_id')
        .eq('workspace_id', user.id)
        .neq('id', user.id)
      if (error) throw error
      return NextResponse.json(data || [])
    }

    if (action === 'invite') {
      const { email, role, brand_id } = body as { email: string; role: string; brand_id?: string }
      if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })
      if (!['team', 'client'].includes(role)) {
        return NextResponse.json({ error: 'role must be team or client' }, { status: 400 })
      }
      const { data, error } = await sb.auth.admin.inviteUserByEmail(email, {
        data: {
          role,
          workspace_id: user.id,
          brand_id: role === 'client' && brand_id ? brand_id : null,
        },
      })
      if (error) throw error
      return NextResponse.json({ ok: true, user: data.user })
    }

    if (action === 'update') {
      const { userId, role, brand_id } = body as { userId: string; role: string; brand_id?: string }
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      const { error } = await sb
        .from('profiles')
        .update({ role, brand_id: brand_id || null })
        .eq('id', userId)
        .eq('workspace_id', user.id)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    if (action === 'remove') {
      const { userId } = body as { userId: string }
      if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })
      const { data: memberProfile } = await sb
        .from('profiles')
        .select('workspace_id')
        .eq('id', userId)
        .single()
      if (memberProfile?.workspace_id !== user.id) {
        return NextResponse.json({ error: 'Cannot remove user from another workspace' }, { status: 403 })
      }
      const { error } = await sb.auth.admin.deleteUser(userId)
      if (error) throw error
      return NextResponse.json({ ok: true })
    }

    return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('admin-users error:', msg)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
