import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { url, name } = await request.json()
  if (!url) return NextResponse.json({ error: 'url is required' }, { status: 400 })

  // Download the photo server-side (avoids browser CORS against Pexels)
  const imageRes = await fetch(url)
  if (!imageRes.ok) {
    return NextResponse.json({ error: 'Failed to download photo from Pexels' }, { status: 502 })
  }

  const contentType = imageRes.headers.get('content-type') || 'image/jpeg'
  const ext = contentType.includes('png') ? 'png' : contentType.includes('webp') ? 'webp' : 'jpg'
  const buffer = await imageRes.arrayBuffer()

  // Upload to Supabase Storage using admin client (bypasses RLS)
  const sb = createAdminClient()
  const path = `${crypto.randomUUID()}.${ext}`

  const { error } = await sb.storage
    .from('photos')
    .upload(path, buffer, { contentType })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const { data } = sb.storage.from('photos').getPublicUrl(path)

  return NextResponse.json({ publicUrl: data.publicUrl })
}
