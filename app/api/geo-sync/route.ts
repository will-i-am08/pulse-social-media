import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { WordPressClient } from '@/lib/geo/wordpress'
import { ShopifyClient } from '@/lib/geo/shopify'
import { GitHubClient } from '@/lib/geo/github'
import { decrypt } from '@/lib/geo/encrypt'
import { z } from 'zod'

const ChangeSchema = z.object({
  type: z.enum(['content', 'schema', 'llms-txt', 'llms-full-txt', 'product']),
  target: z.string(),      // post ID, product GID, or file path
  content: z.string(),
  commitMessage: z.string().optional(),
})

const Schema = z.object({
  connectionId: z.string().uuid(),
  changeSet: z.array(ChangeSchema).min(1),
  openPR: z.boolean().optional().default(false),
})

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const { connectionId, changeSet, openPR } = parsed.data

  const { data: conn } = await supabase
    .from('geo_site_connections')
    .select('*')
    .eq('id', connectionId)
    .eq('user_id', user.id)
    .single()

  if (!conn) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

  const apiKey = (conn.api_key_enc && conn.api_key_iv && conn.api_key_tag)
    ? decrypt(conn.api_key_enc, conn.api_key_iv, conn.api_key_tag)
    : ''

  try {
    const results: Array<{ type: string; target: string; ok: boolean; error?: string }> = []
    let prUrl: string | undefined

    if (conn.platform === 'wordpress') {
      const wp = new WordPressClient(conn.site_url, conn.wp_username, apiKey)
      for (const change of changeSet) {
        try {
          if (change.type === 'content') {
            await wp.updatePost(Number(change.target), change.content)
          } else if (change.type === 'schema') {
            await wp.injectSchema(Number(change.target), JSON.parse(change.content))
          } else if (change.type === 'llms-txt') {
            await wp.uploadFile('llms.txt', change.content)
          } else if (change.type === 'llms-full-txt') {
            await wp.uploadFile('llms-full.txt', change.content)
          }
          results.push({ type: change.type, target: change.target, ok: true })
        } catch (err) {
          results.push({ type: change.type, target: change.target, ok: false, error: String(err) })
        }
      }
    } else if (conn.platform === 'shopify') {
      const shopify = new ShopifyClient(conn.shopify_shop, apiKey)
      for (const change of changeSet) {
        try {
          if (change.type === 'product') {
            await shopify.updateProductDescription(change.target, change.content)
          } else if (change.type === 'schema') {
            await shopify.injectProductSchema(change.target, JSON.parse(change.content))
          }
          results.push({ type: change.type, target: change.target, ok: true })
        } catch (err) {
          results.push({ type: change.type, target: change.target, ok: false, error: String(err) })
        }
      }
    } else if (conn.platform === 'github') {
      const gh = new GitHubClient(apiKey, conn.github_owner, conn.github_repo, conn.github_branch)
      const typeToPath: Record<string, string> = {
        'llms-txt': 'public/llms.txt',
        'llms-full-txt': 'public/llms-full.txt',
        'schema': 'public/schema.json',
      }

      let workBranch = conn.github_branch
      if (openPR) {
        workBranch = `geo-update/${Date.now()}`
        await gh.createBranch(workBranch)
      }

      for (const change of changeSet) {
        const path = change.type === 'content' ? (change.target || 'content/page.md') : (typeToPath[change.type] || change.target)
        try {
          await gh.upsertFile(
            path,
            change.content,
            change.commitMessage || `GEO: update ${change.type}`,
            workBranch
          )
          results.push({ type: change.type, target: path, ok: true })
        } catch (err) {
          results.push({ type: change.type, target: path, ok: false, error: String(err) })
        }
      }

      if (openPR && workBranch !== conn.github_branch) {
        prUrl = await gh.openPR(
          workBranch,
          `GEO Update: ${changeSet.map(c => c.type).join(', ')}`,
          `Automated GEO improvement from Pulse GEO Command Center.\n\nChanges: ${changeSet.map(c => `- ${c.type}: ${c.target}`).join('\n')}`
        )
      }
    } else {
      return NextResponse.json({ error: 'Unsupported platform for sync' }, { status: 400 })
    }

    return NextResponse.json({ success: true, platform: conn.platform, results, prUrl })
  } catch (err) {
    console.error('Sync error:', err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
