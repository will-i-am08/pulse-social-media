import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  // Only allow authenticated users to trigger revalidation
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { slug } = await req.json()

  // Revalidate every page that lists or renders blog content
  revalidatePath('/blog')
  revalidatePath('/insights')
  revalidatePath('/')

  // Revalidate the specific blog post page if slug provided
  if (slug) {
    revalidatePath(`/blog/${slug}`)
  }

  return NextResponse.json({ revalidated: true, slug: slug || null })
}
