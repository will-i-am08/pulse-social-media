import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AgentChat from '@/components/app/AgentChat'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function HubLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return (
    <>
      {children}
      <AgentChat />
    </>
  )
}
