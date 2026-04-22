import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface ResolvedUser {
  userId: string
  supabase: SupabaseClient
  isInternal: boolean
}

export async function resolveAutomationUser(req: NextRequest): Promise<ResolvedUser | NextResponse> {
  const secretHeader = req.headers.get('x-internal-cron-secret')
  const userIdHeader = req.headers.get('x-internal-user-id')
  const cronSecret = process.env.CRON_SECRET

  if (secretHeader && cronSecret && secretHeader === cronSecret && userIdHeader) {
    return { userId: userIdHeader, supabase: createAdminClient(), isInternal: true }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  return { userId: user.id, supabase, isInternal: false }
}
