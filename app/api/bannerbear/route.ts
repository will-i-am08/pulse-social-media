import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedBannerbearKey } from '@/lib/account/getAccountSettings'

const BB_API = 'https://api.bannerbear.com/v2'

// GET — list templates
export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getDecryptedBannerbearKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'Bannerbear API key not configured. Add it in Account Settings.' }, { status: 400 })

  const res = await fetch(`${BB_API}/templates`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err || 'Failed to fetch templates' }, { status: res.status })
  }

  const templates = await res.json()
  return NextResponse.json({ templates })
}

// POST — render an image from a template
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getDecryptedBannerbearKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'Bannerbear API key not configured. Add it in Account Settings.' }, { status: 400 })

  const { template_uid, modifications, webhook_url } = await request.json()
  if (!template_uid || !modifications) {
    return NextResponse.json({ error: 'template_uid and modifications required' }, { status: 400 })
  }

  const body: Record<string, unknown> = { modifications }
  if (webhook_url) body.webhook_url = webhook_url

  // Use synchronous endpoint (waits for render) — images usually render in 2-4s
  const res = await fetch(`${BB_API}/images?synchronous=true`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ template_uid, ...body }),
  })

  if (!res.ok) {
    const err = await res.text()
    return NextResponse.json({ error: err || 'Failed to render image' }, { status: res.status })
  }

  const image = await res.json()
  return NextResponse.json({ imageUrl: image.image_url, uid: image.uid, status: image.status })
}
