import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedBufferToken } from '@/lib/account/getAccountSettings'

const BUFFER_API = 'https://api.buffer.com'

async function gql(token: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch(BUFFER_API, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getDecryptedBufferToken(user.id)
  if (!token) return NextResponse.json({ error: 'No Buffer token configured. Add it in Account Settings.' }, { status: 400 })

  try {
    // Step 1: get organization ID
    const orgRes = await gql(token, `query { account { organizations { id } } }`)
    if (orgRes.errors) {
      return NextResponse.json({ error: orgRes.errors[0]?.message || 'Failed to fetch Buffer account' }, { status: 400 })
    }
    const orgId = orgRes.data?.account?.organizations?.[0]?.id
    if (!orgId) return NextResponse.json({ error: 'No Buffer organization found' }, { status: 400 })

    // Step 2: get channels
    const channelsRes = await gql(token, `
      query GetChannels($input: ChannelsInput!) {
        channels(input: $input) {
          id
          service
          name
          displayName
          avatar
        }
      }
    `, { input: { organizationId: orgId } })

    if (channelsRes.errors) {
      return NextResponse.json({ error: channelsRes.errors[0]?.message || 'Failed to fetch Buffer channels' }, { status: 400 })
    }

    const channels = channelsRes.data?.channels || []
    const profiles = channels.map((c: { id: string; service: string; name: string; displayName?: string; avatar: string }) => ({
      id: c.id,
      service: c.service,
      formatted_service: c.service.charAt(0).toUpperCase() + c.service.slice(1),
      formatted_username: c.displayName || c.name,
      avatar_https: c.avatar,
    }))

    return NextResponse.json({ profiles })
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const token = await getDecryptedBufferToken(user.id)
  if (!token) return NextResponse.json({ error: 'No Buffer token configured. Add it in Account Settings.' }, { status: 400 })

  const { profileIds, text, media } = await req.json()

  if (!profileIds?.length) return NextResponse.json({ error: 'Select at least one Buffer channel' }, { status: 400 })
  if (!text?.trim()) return NextResponse.json({ error: 'Post text is required' }, { status: 400 })

  const results = await Promise.all(
    profileIds.map(async (channelId: string) => {
      const input: Record<string, unknown> = {
        channelId,
        text,
      }
      if (media?.photo) {
        input.media = { photo: media.photo }
      }

      try {
        const data = await gql(token, `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              ... on PostActionSuccess {
                post { id }
              }
              ... on MutationError {
                message
              }
            }
          }
        `, { input })

        if (data.errors) {
          const errMsg = data.errors.map((e: { message: string }) => e.message).join(', ')
          return { profileId: channelId, success: false, error: errMsg }
        }
        const result = data.data?.createPost
        if (result?.post) {
          return { profileId: channelId, success: true }
        }
        return { profileId: channelId, success: false, error: result?.message || JSON.stringify(result) || 'Post creation failed' }
      } catch (e: unknown) {
        return { profileId: channelId, success: false, error: e instanceof Error ? e.message : 'Unknown error' }
      }
    })
  )

  const allOk = results.every((r: { success: boolean }) => r.success)
  return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 })
}
