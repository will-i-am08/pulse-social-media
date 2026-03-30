import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedBufferToken } from '@/lib/account/getAccountSettings'

const BUFFER_API = 'https://api.bufferapp.com/1'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getDecryptedBufferToken(user.id)
  if (!token) return NextResponse.json({ error: 'No Buffer token configured. Add it in Account Settings.' }, { status: 400 })

  try {
    const res = await fetch(`${BUFFER_API}/profiles.json?access_token=${token}`)
    if (!res.ok) {
      const err = await res.text()
      return NextResponse.json({ error: `Buffer API error: ${err}` }, { status: res.status })
    }
    const profiles = await res.json()
    return NextResponse.json({ profiles })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getDecryptedBufferToken(user.id)
  if (!token) return NextResponse.json({ error: 'No Buffer token configured. Add it in Account Settings.' }, { status: 400 })

  const { profileIds, text, media, scheduledAt } = await req.json()

  if (!profileIds?.length) return NextResponse.json({ error: 'Select at least one Buffer profile' }, { status: 400 })
  if (!text?.trim()) return NextResponse.json({ error: 'Post text is required' }, { status: 400 })

  const results = await Promise.all(
    profileIds.map(async (profileId: string) => {
      const params = new URLSearchParams()
      params.append('access_token', token)
      params.append('profile_ids[]', profileId)
      params.append('text', text)
      if (media?.link) params.append('media[link]', media.link)
      if (media?.photo) params.append('media[photo]', media.photo)
      if (scheduledAt) {
        params.append('scheduled_at', scheduledAt)
      } else {
        params.append('now', 'true')
      }

      try {
        const res = await fetch(`${BUFFER_API}/updates/create.json`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: params.toString(),
        })
        const data = await res.json()
        if (data.success) {
          return { profileId, success: true }
        } else {
          return { profileId, success: false, error: data.message || 'Unknown error' }
        }
      } catch (e: any) {
        return { profileId, success: false, error: e.message }
      }
    })
  )

  const allOk = results.every(r => r.success)
  return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 })
}
