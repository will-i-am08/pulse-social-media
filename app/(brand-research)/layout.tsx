import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BrandResearchShell from './BrandResearchShell'

export default async function BrandResearchLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <BrandResearchShell>{children}</BrandResearchShell>
}
