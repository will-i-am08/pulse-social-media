import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ProposalsShell from './ProposalsShell'

export default async function ProposalsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <ProposalsShell>{children}</ProposalsShell>
}
