import { requireInternalUser } from '@/lib/require-internal'
import BlogShell from './BlogShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function BlogEngineLayout({ children }: { children: React.ReactNode }) {
  const { user } = await requireInternalUser()
  return <BlogShell userId={user.id}>{children}</BlogShell>
}
