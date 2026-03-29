import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import GeoShell from './GeoShell'

export default async function GeoLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <GeoShell userId={user.id}>{children}</GeoShell>
}
