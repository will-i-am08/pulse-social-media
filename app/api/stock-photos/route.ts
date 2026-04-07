import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const PEXELS_API = 'https://api.pexels.com/v1/search'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.PEXELS_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Pexels API key not configured. Add PEXELS_API_KEY to your environment variables.' },
      { status: 500 }
    )
  }

  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const page = searchParams.get('page') || '1'
  const per_page = searchParams.get('per_page') || '20'
  const color = searchParams.get('color') || ''

  if (!q.trim()) {
    return NextResponse.json({ photos: [], totalResults: 0, page: 1 })
  }

  const params = new URLSearchParams({
    query: q,
    per_page,
    page,
    ...(color ? { color } : {}),
  })

  const res = await fetch(`${PEXELS_API}?${params}`, {
    headers: { Authorization: apiKey },
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err || 'Pexels search failed' }, { status: res.status })
  }

  const data = await res.json()

  const photos = (data.photos || []).map((p: {
    id: number
    src: { medium: string; original: string }
    photographer: string
    alt: string
    width: number
    height: number
  }) => ({
    id: p.id,
    thumbUrl: p.src.medium,
    fullUrl: p.src.original,
    photographer: p.photographer,
    alt: p.alt || '',
    width: p.width,
    height: p.height,
  }))

  return NextResponse.json({
    photos,
    totalResults: data.total_results,
    page: data.page,
  })
}
