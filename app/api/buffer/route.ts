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

  const { profileIds, text, media, shareNow, scheduledAt, postType } = await req.json()

  if (!profileIds?.length) return NextResponse.json({ error: 'Select at least one Buffer channel' }, { status: 400 })
  if (!text?.trim()) return NextResponse.json({ error: 'Post text is required' }, { status: 400 })

  const pType: 'post' | 'story' | 'reel' = postType === 'story' || postType === 'reel' ? postType : 'post'
  if (pType === 'reel' && !media?.video) {
    return NextResponse.json({ error: 'Reels require a video' }, { status: 400 })
  }

  // Normalize scheduledAt to ISO; reject past times
  let scheduledIso: string | null = null
  if (scheduledAt) {
    const d = new Date(scheduledAt)
    if (isNaN(d.getTime())) return NextResponse.json({ error: 'Invalid scheduledAt' }, { status: 400 })
    if (d.getTime() <= Date.now()) return NextResponse.json({ error: 'scheduledAt must be in the future' }, { status: 400 })
    scheduledIso = d.toISOString()
  }

  // Fetch channel service info so we can build per-platform metadata
  const channelServiceMap: Record<string, string> = {}
  try {
    const orgRes = await gql(token, `query { account { organizations { id } } }`)
    const orgId = orgRes.data?.account?.organizations?.[0]?.id
    if (orgId) {
      const channelsRes = await gql(token, `
        query GetChannels($input: ChannelsInput!) {
          channels(input: $input) { id service }
        }
      `, { input: { organizationId: orgId } })
      const channels: Array<{ id: string; service: string }> = channelsRes.data?.channels || []
      for (const c of channels) {
        channelServiceMap[c.id] = c.service
      }
    }
  } catch (e) {
    console.error('Failed to fetch channel services:', e)
  }

  const photoUrl: string | null = media?.photo || null
  const videoUrl: string | null = media?.video || null
  const videoThumb: string | null = media?.videoThumbnail || null

  // Platforms that understand story/reel metadata
  const SUPPORTS_STORY_REEL = new Set(['instagram', 'facebook'])

  // Send sequentially with delay to avoid Buffer rate limits
  const results: { profileId: string; success: boolean; error?: string }[] = []
  for (const channelId of profileIds as string[]) {
    if (results.length > 0) await new Promise(r => setTimeout(r, 800))
    const result = await (async () => {
      const service = (channelServiceMap[channelId] || '').toLowerCase()

      // Effective type per service: LinkedIn/TikTok/etc. fall back to 'post'
      const effectiveType = SUPPORTS_STORY_REEL.has(service) ? pType : 'post'

      // Build per-platform metadata
      const metadata: Record<string, unknown> = {}
      if (service === 'facebook') {
        metadata.facebook = { type: effectiveType }
      } else if (service === 'instagram') {
        metadata.instagram = effectiveType === 'post'
          ? { type: 'post', shouldShareToFeed: true }
          : { type: effectiveType }
      }

      // Priority: custom scheduledAt > shareNow > queue
      const input: Record<string, unknown> = scheduledIso
        ? { channelId, text, schedulingType: 'custom', scheduledAt: scheduledIso }
        : shareNow
          ? { channelId, text, shareNow: true }
          : { channelId, text, schedulingType: 'automatic', mode: 'addToQueue' }

      if (Object.keys(metadata).length > 0) {
        input.metadata = metadata
      }

      // Reels require a video; stories accept either; regular posts use images
      if (effectiveType === 'reel' && videoUrl) {
        input.assets = { videos: [{ url: videoUrl, ...(videoThumb ? { thumbnail: videoThumb } : {}) }] }
      } else if (effectiveType === 'story' && videoUrl) {
        input.assets = { videos: [{ url: videoUrl, ...(videoThumb ? { thumbnail: videoThumb } : {}) }] }
      } else if (photoUrl) {
        input.assets = { images: [{ url: photoUrl }] }
      }

      // Retry once on rate limit
      for (let attempt = 0; attempt < 2; attempt++) {
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
            if (errMsg.toLowerCase().includes('too many requests') && attempt === 0) {
              await new Promise(r => setTimeout(r, 3000))
              continue
            }
            return { profileId: channelId, success: false, error: errMsg }
          }
          const result = data.data?.createPost
          if (result?.post) {
            return { profileId: channelId, success: true }
          }
          return { profileId: channelId, success: false, error: result?.message || JSON.stringify(result) || 'Post creation failed' }
        } catch (e: unknown) {
          if (attempt === 0) {
            await new Promise(r => setTimeout(r, 3000))
            continue
          }
          return { profileId: channelId, success: false, error: e instanceof Error ? e.message : 'Unknown error' }
        }
      }
      return { profileId: channelId, success: false, error: 'Max retries exceeded' }
    })()
    results.push(result)
  }

  const allOk = results.every((r: { success: boolean }) => r.success)
  return NextResponse.json({ success: allOk, results }, { status: allOk ? 200 : 207 })
}
