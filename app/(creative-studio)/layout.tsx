import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import CreativeStudioShell from './CreativeStudioShell'
import type { Role } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CreativeStudioLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, workspace_id')
    .eq('id', user.id)
    .single()

  const role: Role = (profile?.role as Role) || 'admin'
  const workspaceId = role === 'admin' ? user.id : (profile?.workspace_id || user.id)

  return (
    <WorkspaceProvider userId={user.id} role={role} workspaceId={workspaceId}>
      <CreativeStudioShell>{children}</CreativeStudioShell>
    </WorkspaceProvider>
  )
}
