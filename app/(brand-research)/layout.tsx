import { requireInternalUser } from '@/lib/require-internal'
import BrandResearchShell from './BrandResearchShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function BrandResearchLayout({ children }: { children: React.ReactNode }) {
  await requireInternalUser()
  return <BrandResearchShell>{children}</BrandResearchShell>
}
