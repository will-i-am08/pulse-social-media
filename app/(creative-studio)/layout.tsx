import { requireInternalUser } from '@/lib/require-internal'
import { WorkspaceProvider } from '@/context/WorkspaceContext'
import CreativeStudioShell from './CreativeStudioShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function CreativeStudioLayout({ children }: { children: React.ReactNode }) {
  const { user, role, workspaceId } = await requireInternalUser()
  return (
    <WorkspaceProvider userId={user.id} role={role} workspaceId={workspaceId}>
      <CreativeStudioShell>{children}</CreativeStudioShell>
    </WorkspaceProvider>
  )
}
