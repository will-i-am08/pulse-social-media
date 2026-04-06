import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AutomationsShell from './AutomationsShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function AutomationsLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <AutomationsShell>{children}</AutomationsShell>
}
