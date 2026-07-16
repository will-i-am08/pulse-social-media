import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { Role } from '@/lib/types'

/**
 * Auth guard for internal agency modules (blog engine, GEO, creative studio,
 * automations, brand research). Admin and team pass; the client role is
 * redirected to the app hub — these tools are not part of the client product.
 */
export async function requireInternalUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, workspace_id')
    .eq('id', user.id)
    .single()

  const role: Role = (profile?.role as Role) || 'admin'
  if (role === 'client') redirect('/apps')

  const workspaceId = role === 'admin' ? user.id : (profile?.workspace_id || user.id)
  return { user, role, workspaceId }
}
