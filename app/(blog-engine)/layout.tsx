import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogShell from './BlogShell'
import type { Metadata } from 'next'

export const metadata: Metadata = { robots: { index: false, follow: false } }

export default async function BlogEngineLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  return <BlogShell userId={user.id}>{children}</BlogShell>
}
