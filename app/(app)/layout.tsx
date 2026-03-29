import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import AppShell from './AppShell'
import type { Role } from '@/lib/types'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get profile + role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, workspace_id')
    .eq('id', user.id)
    .single()

  const role: Role = (profile?.role as Role) || 'admin'
  const workspaceId: string = role === 'admin' ? user.id : (profile?.workspace_id || user.id)

  return (
    <WorkspaceProvider userId={user.id} role={role} workspaceId={workspaceId}>
      <AppShell role={role}>
        {children}
      </AppShell>
    </WorkspaceProvider>
  )
}
