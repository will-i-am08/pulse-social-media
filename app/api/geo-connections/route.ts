import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/geo/encrypt'
import { z } from 'zod'

const CreateSchema = z.object({
  displayName: z.string().min(1),
  siteUrl: z.string().url(),
  platform: z.enum(['wordpress', 'shopify', 'github', 'static']),
  apiKey: z.string().optional(),
  wpUsername: z.string().optional(),
  shopifyShop: z.string().optional(),
  githubOwner: z.string().optional(),
  githubRepo: z.string().optional(),
  githubBranch: z.string().optional().default('main'),
})

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('geo_site_connections')
    .select('id, display_name, site_url, platform, wp_username, shopify_shop, github_owner, github_repo, github_branch, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ connections: data })
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = CreateSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { displayName, siteUrl, platform, apiKey, wpUsername, shopifyShop, githubOwner, githubRepo, githubBranch } = parsed.data

  let encryptedKey = {}
  if (apiKey) {
    const { enc, iv, tag } = encrypt(apiKey)
    encryptedKey = { api_key_enc: enc, api_key_iv: iv, api_key_tag: tag }
  }

  const { data, error } = await supabase
    .from('geo_site_connections')
    .insert({
      user_id: user.id,
      display_name: displayName,
      site_url: siteUrl,
      platform,
      ...encryptedKey,
      wp_username: wpUsername || null,
      shopify_shop: shopifyShop || null,
      github_owner: githubOwner || null,
      github_repo: githubRepo || null,
      github_branch: githubBranch || 'main',
    })
    .select('id, display_name, site_url, platform, created_at')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ connection: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('geo_site_connections')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
