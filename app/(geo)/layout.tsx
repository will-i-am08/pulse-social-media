import { requireInternalUser } from '@/lib/require-internal'
import GeoShell from './GeoShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function GeoLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireInternalUser()
  return <GeoShell userId={user.id}>{children}</GeoShell>
}
