import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GeoShell from './GeoShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function GeoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <GeoShell userId={user.id}>{children}</GeoShell>
}
