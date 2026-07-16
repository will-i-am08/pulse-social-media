import { requireInternalUser } from '@/lib/require-internal'
import AutomationsShell from './AutomationsShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AutomationsLayout({ children }: { children: React.ReactNode }) {
  await requireInternalUser()
  return <AutomationsShell>{children}</AutomationsShell>
}
