import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey, getDecryptedBufferToken } from '@/lib/account/getAccountSettings'
import { executeAutomation } from '@/lib/automations/engine'

export const maxDuration = 120

const ANTHROPIC_API = 'https://api.anthropic.com/v1/messages'
const BUFFER_API = 'https://api.buffer.com'

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkspaceContext {
  brands: { id: string; name: string; platforms: string[]; buffer_profile_ids?: string[] }[]
  postCounts: Record<string, number>
  settings: { workspaceName: string; timezone: string }
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Buffer helper ────────────────────────────────────────────────────────────

async function bufferGql(token: string, query: string, variables?: Record<string, unknown>) {
  const res = await fetch(BUFFER_API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ query, variables }),
  })
  return res.json()
}

async function getBufferOrgAndChannels(token: string) {
  const orgRes = await bufferGql(token, `query { account { organizations { id } } }`)
  const orgId = orgRes.data?.account?.organizations?.[0]?.id
  if (!orgId) return { orgId: null, channelMap: {} }
  const chRes = await bufferGql(token, `
    query GetChannels($input: ChannelsInput!) { channels(input: $input) { id service displayName name avatar } }
  `, { input: { organizationId: orgId } })
  const channelMap: Record<string, { service: string; name: string }> = {}
  for (const c of (chRes.data?.channels || [])) channelMap[c.id] = { service: c.service, name: c.displayName || c.name }
  return { orgId, channelMap }
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOLS = [
  // ── BRANDS ──
  {
    name: 'list_brands',
    description: 'List all brands in the workspace with their details (name, tone, platforms, guidelines, posting schedule, etc.)',
    input_schema: {
      type: 'object',
      properties: {
        include_details: { type: 'boolean', description: 'Include full brand details like guidelines and key messages (default false for brevity)' },
      },
      required: [],
    },
  },
  {
    name: 'get_brand',
    description: 'Get full details for a specific brand by ID.',
    input_schema: {
      type: 'object',
      properties: { brand_id: { type: 'string', description: 'Brand ID' } },
      required: ['brand_id'],
    },
  },
  {
    name: 'create_brand',
    description: 'Create a new brand in the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Brand name (required)' },
        tone: { type: 'string', enum: ['professional', 'casual', 'playful', 'luxury', 'inspirational', 'friendly'], description: 'Brand tone' },
        output_length: { type: 'string', enum: ['short', 'medium', 'long'], description: 'Caption output length' },
        website: { type: 'string', description: 'Brand website URL' },
        brand_guidelines: { type: 'string', description: 'Brand voice / guidelines text' },
        posting_instructions: { type: 'string', description: 'Posting instructions / notes for captions' },
        platforms: { type: 'array', items: { type: 'string' }, description: 'Platforms: instagram, facebook, linkedin, tiktok, twitter' },
        include_hashtags: { type: 'boolean', description: 'Whether to include hashtags in captions' },
        include_emojis: { type: 'boolean', description: 'Whether to include emojis in captions' },
        key_messages: { type: 'array', items: { type: 'string' }, description: 'Key messages for the brand' },
        posting_days: { type: 'array', items: { type: 'string' }, description: 'Days to post: mon, tue, wed, thu, fri, sat, sun' },
        posting_time: { type: 'string', description: 'Time to post in 24hr format, e.g. 09:00' },
        primary_color: { type: 'string', description: 'Brand primary color hex, e.g. #ff5733' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_brand',
    description: 'Update an existing brand\'s settings or details.',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Brand ID to update' },
        name: { type: 'string' },
        tone: { type: 'string', enum: ['professional', 'casual', 'playful', 'luxury', 'inspirational', 'friendly'] },
        output_length: { type: 'string', enum: ['short', 'medium', 'long'] },
        website: { type: 'string' },
        brand_guidelines: { type: 'string' },
        posting_instructions: { type: 'string' },
        platforms: { type: 'array', items: { type: 'string' } },
        include_hashtags: { type: 'boolean' },
        include_emojis: { type: 'boolean' },
        key_messages: { type: 'array', items: { type: 'string' } },
        posting_days: { type: 'array', items: { type: 'string' } },
        posting_time: { type: 'string' },
      },
      required: ['brand_id'],
    },
  },
  {
    name: 'delete_brand',
    description: 'Delete a brand from the workspace. This is permanent.',
    input_schema: {
      type: 'object',
      properties: { brand_id: { type: 'string', description: 'Brand ID to delete' } },
      required: ['brand_id'],
    },
  },

  // ── POSTS ──
  {
    name: 'list_posts',
    description: 'List posts from the workspace with optional filters.',
    input_schema: {
      type: 'object',
      properties: {
        status: { type: 'string', enum: ['draft', 'submitted', 'approved', 'scheduled', 'published'], description: 'Filter by post status' },
        brand_id: { type: 'string', description: 'Filter by brand ID' },
        limit: { type: 'number', description: 'Max posts to return (default 20)' },
      },
      required: [],
    },
  },
  {
    name: 'get_post',
    description: 'Get full details of a specific post by ID.',
    input_schema: {
      type: 'object',
      properties: { post_id: { type: 'string', description: 'Post ID' } },
      required: ['post_id'],
    },
  },
  {
    name: 'create_post',
    description: 'Create a new post in the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Brand ID for the post' },
        caption: { type: 'string', description: 'Post caption/text content' },
        platforms: { type: 'array', items: { type: 'string' }, description: 'Platforms: instagram, facebook, linkedin, tiktok, twitter' },
        scheduled_at: { type: 'string', description: 'ISO datetime string for scheduling (optional)' },
        status: { type: 'string', enum: ['draft', 'approved', 'scheduled'], description: 'Initial status (default: draft)' },
        image_url: { type: 'string', description: 'URL of an image to attach (optional)' },
      },
      required: ['brand_id', 'caption', 'platforms'],
    },
  },
  {
    name: 'update_post_status',
    description: 'Change the status of one or more posts.',
    input_schema: {
      type: 'object',
      properties: {
        post_ids: { type: 'array', items: { type: 'string' }, description: 'Post IDs to update' },
        status: { type: 'string', enum: ['draft', 'submitted', 'approved', 'scheduled', 'published'], description: 'New status' },
        scheduled_at: { type: 'string', description: 'ISO datetime for scheduling (required when status is scheduled)' },
      },
      required: ['post_ids', 'status'],
    },
  },
  {
    name: 'delete_post',
    description: 'Delete one or more posts permanently.',
    input_schema: {
      type: 'object',
      properties: {
        post_ids: { type: 'array', items: { type: 'string' }, description: 'Post IDs to delete' },
      },
      required: ['post_ids'],
    },
  },
  {
    name: 'toggle_client_visibility',
    description: 'Show or hide posts from the client portal.',
    input_schema: {
      type: 'object',
      properties: {
        post_ids: { type: 'array', items: { type: 'string' }, description: 'Post IDs to update' },
        client_visible: { type: 'boolean', description: 'true to show in client portal, false to hide' },
      },
      required: ['post_ids', 'client_visible'],
    },
  },
  {
    name: 'generate_caption',
    description: 'Generate a social media caption for a brand using AI.',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Brand ID to generate caption for' },
        prompt: { type: 'string', description: 'What the post should be about' },
        platforms: { type: 'array', items: { type: 'string' }, description: 'Target platforms for tone/length' },
      },
      required: ['brand_id', 'prompt'],
    },
  },
  {
    name: 'send_to_buffer',
    description: 'Send an existing post to the Buffer queue for publishing.',
    input_schema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'ID of the post to send to Buffer' },
      },
      required: ['post_id'],
    },
  },
  {
    name: 'bulk_send_approved_to_buffer',
    description: 'Send all approved and scheduled posts for a brand (or all brands) to Buffer.',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Only send posts for this brand (optional — omit to send all brands)' },
      },
      required: [],
    },
  },

  // ── PHOTOS ──
  {
    name: 'search_photos',
    description: 'Search the photo library by name, tag, or folder.',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search term to match against photo names and tags' },
        folder_id: { type: 'string', description: 'Filter by folder ID (use null string to find unorganised photos)' },
        limit: { type: 'number', description: 'Max results to return (default 20)' },
      },
      required: [],
    },
  },
  {
    name: 'delete_photo',
    description: 'Delete one or more photos from the library permanently.',
    input_schema: {
      type: 'object',
      properties: {
        photo_ids: { type: 'array', items: { type: 'string' }, description: 'Photo IDs to delete' },
      },
      required: ['photo_ids'],
    },
  },
  {
    name: 'update_photo_tags',
    description: 'Add or replace tags on a photo.',
    input_schema: {
      type: 'object',
      properties: {
        photo_id: { type: 'string', description: 'Photo ID' },
        tags: { type: 'array', items: { type: 'string' }, description: 'New tag list (replaces existing tags)' },
      },
      required: ['photo_id', 'tags'],
    },
  },
  {
    name: 'move_photos_to_folder',
    description: 'Move one or more photos into a folder (or remove from folder by passing null).',
    input_schema: {
      type: 'object',
      properties: {
        photo_ids: { type: 'array', items: { type: 'string' }, description: 'Photo IDs to move' },
        folder_id: { type: 'string', description: 'Target folder ID, or null to remove from any folder' },
      },
      required: ['photo_ids'],
    },
  },

  // ── FOLDERS ──
  {
    name: 'list_folders',
    description: 'List all photo folders in the workspace.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_folder',
    description: 'Create a new photo folder.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Folder name' },
        brand_id: { type: 'string', description: 'Associate folder with a brand (optional)' },
      },
      required: ['name'],
    },
  },
  {
    name: 'rename_folder',
    description: 'Rename an existing photo folder.',
    input_schema: {
      type: 'object',
      properties: {
        folder_id: { type: 'string', description: 'Folder ID to rename' },
        name: { type: 'string', description: 'New folder name' },
      },
      required: ['folder_id', 'name'],
    },
  },
  {
    name: 'delete_folder',
    description: 'Delete a folder. Photos in the folder are kept but lose their folder assignment.',
    input_schema: {
      type: 'object',
      properties: { folder_id: { type: 'string', description: 'Folder ID to delete' } },
      required: ['folder_id'],
    },
  },

  // ── CLIENTS ──
  {
    name: 'list_clients',
    description: 'List all clients in the workspace.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'create_client',
    description: 'Create a new client.',
    input_schema: {
      type: 'object',
      properties: {
        name: { type: 'string', description: 'Client name (required)' },
        email: { type: 'string', description: 'Client email address' },
        brand_id: { type: 'string', description: 'Associate client with a brand' },
        notes: { type: 'string', description: 'Notes about the client' },
        portal_password: { type: 'string', description: 'Password for client portal access' },
      },
      required: ['name'],
    },
  },
  {
    name: 'update_client',
    description: 'Update an existing client\'s details.',
    input_schema: {
      type: 'object',
      properties: {
        client_id: { type: 'string', description: 'Client ID to update' },
        name: { type: 'string' },
        email: { type: 'string' },
        brand_id: { type: 'string' },
        notes: { type: 'string' },
        portal_password: { type: 'string' },
      },
      required: ['client_id'],
    },
  },
  {
    name: 'delete_client',
    description: 'Delete a client permanently.',
    input_schema: {
      type: 'object',
      properties: { client_id: { type: 'string', description: 'Client ID to delete' } },
      required: ['client_id'],
    },
  },

  // ── AUTOMATIONS ──
  {
    name: 'list_automations',
    description: 'List all automations in the workspace.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'run_automation',
    description: 'Execute an automation by ID immediately.',
    input_schema: {
      type: 'object',
      properties: { automation_id: { type: 'string', description: 'Automation ID to run' } },
      required: ['automation_id'],
    },
  },
  {
    name: 'toggle_automation',
    description: 'Enable or disable an automation.',
    input_schema: {
      type: 'object',
      properties: {
        automation_id: { type: 'string', description: 'Automation ID' },
        enabled: { type: 'boolean', description: 'true to enable, false to disable' },
      },
      required: ['automation_id', 'enabled'],
    },
  },

  // ── NOTIFICATIONS ──
  {
    name: 'get_notifications',
    description: 'Get unread notifications for the current user.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'send_notification',
    description: 'Send a notification to the workspace.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Notification title (required)' },
        message: { type: 'string', description: 'Notification message body' },
        type: { type: 'string', description: 'Notification type: info, success, warning, error' },
        link: { type: 'string', description: 'Optional link URL for the notification' },
      },
      required: ['title'],
    },
  },
  {
    name: 'mark_notification_read',
    description: 'Mark a notification as read.',
    input_schema: {
      type: 'object',
      properties: { notification_id: { type: 'string', description: 'Notification ID to mark as read' } },
      required: ['notification_id'],
    },
  },

  // ── SETTINGS ──
  {
    name: 'get_settings',
    description: 'Get current workspace settings.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'update_settings',
    description: 'Update workspace settings.',
    input_schema: {
      type: 'object',
      properties: {
        workspace_name: { type: 'string', description: 'Workspace name' },
        timezone: { type: 'string', description: 'Timezone string, e.g. Australia/Melbourne' },
        default_platforms: { type: 'array', items: { type: 'string' }, description: 'Default platforms for new posts' },
        email_notifications: { type: 'boolean', description: 'Enable email notifications' },
        auto_send_on_approve: { type: 'boolean', description: 'Automatically send to Buffer when a post is approved' },
        model: { type: 'string', description: 'Claude model to use: claude-haiku-4-5-20251001, claude-sonnet-4-6, or claude-opus-4-6' },
      },
      required: [],
    },
  },

  // ── BUFFER ──
  {
    name: 'get_buffer_channels',
    description: 'List all connected Buffer social media channels.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },

  // ── PROPOSALS & CONTRACTS ──
  {
    name: 'list_proposals',
    description: 'List proposals and contracts. Can filter by type (proposal, contract, template) and/or status (draft, sent, viewed, signed, expired, cancelled).',
    input_schema: {
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['proposal', 'contract', 'template'], description: 'Filter by document type' },
        status: { type: 'string', enum: ['draft', 'sent', 'viewed', 'signed', 'expired', 'cancelled'], description: 'Filter by status' },
      },
      required: [],
    },
  },
  {
    name: 'get_proposal',
    description: 'Get full details of a specific proposal or contract by ID.',
    input_schema: {
      type: 'object',
      properties: { proposal_id: { type: 'string', description: 'Proposal ID' } },
      required: ['proposal_id'],
    },
  },
  {
    name: 'create_proposal',
    description: 'Create a new proposal or contract.',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Document title' },
        type: { type: 'string', enum: ['proposal', 'contract'], description: 'Document type' },
        client_name: { type: 'string', description: 'Client name' },
        client_email: { type: 'string', description: 'Client email' },
        total_value: { type: 'number', description: 'Total monetary value' },
        brand_id: { type: 'string', description: 'Associated brand ID (optional)' },
      },
      required: ['title'],
    },
  },
  {
    name: 'update_proposal_status',
    description: 'Update the status of a proposal or contract.',
    input_schema: {
      type: 'object',
      properties: {
        proposal_id: { type: 'string', description: 'Proposal ID' },
        status: { type: 'string', enum: ['draft', 'sent', 'viewed', 'signed', 'expired', 'cancelled'], description: 'New status' },
      },
      required: ['proposal_id', 'status'],
    },
  },

  // ── BLOG ENGINE ──
  {
    name: 'list_blog_posts',
    description: 'List blog posts. Can filter by brand ID and/or status (draft, published).',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Filter by brand ID' },
        status: { type: 'string', enum: ['draft', 'published'], description: 'Filter by status' },
      },
      required: [],
    },
  },
  {
    name: 'get_blog_post',
    description: 'Get the full content of a specific blog post by ID.',
    input_schema: {
      type: 'object',
      properties: { post_id: { type: 'string', description: 'Blog post ID' } },
      required: ['post_id'],
    },
  },
  {
    name: 'create_blog_post',
    description: 'Create a new blog post draft.',
    input_schema: {
      type: 'object',
      properties: {
        brand_id: { type: 'string', description: 'Brand ID the post belongs to' },
        title: { type: 'string', description: 'Post title' },
        content: { type: 'string', description: 'Post content (markdown or HTML)' },
        tags: { type: 'string', description: 'Comma-separated tags' },
        author: { type: 'string', description: 'Author name' },
      },
      required: ['brand_id', 'title'],
    },
  },
  {
    name: 'update_blog_post_status',
    description: 'Mark a blog post as published or back to draft.',
    input_schema: {
      type: 'object',
      properties: {
        post_id: { type: 'string', description: 'Blog post ID' },
        status: { type: 'string', enum: ['draft', 'published'], description: 'New status' },
      },
      required: ['post_id', 'status'],
    },
  },

  // ── AUTOMATIONS ──
  {
    name: 'list_automations',
    description: 'List all automations in the workspace with their name, trigger type, enabled state, and last run status.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'toggle_automation',
    description: 'Enable or disable an automation by ID.',
    input_schema: {
      type: 'object',
      properties: {
        automation_id: { type: 'string', description: 'Automation ID' },
        enabled: { type: 'boolean', description: 'true to enable, false to disable' },
      },
      required: ['automation_id', 'enabled'],
    },
  },
  {
    name: 'run_automation',
    description: 'Manually trigger an automation to run immediately.',
    input_schema: {
      type: 'object',
      properties: { automation_id: { type: 'string', description: 'Automation ID to run' } },
      required: ['automation_id'],
    },
  },

  // ── WORKSPACE ──
  {
    name: 'get_workspace_summary',
    description: 'Get an overview of the workspace: post counts by status, number of brands, photos, folders, clients, automations, blog posts, proposals, and contracts.',
    input_schema: { type: 'object', properties: {}, required: [] },
  },
  {
    name: 'navigate',
    description: 'Navigate the user to a specific page in the app.',
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'App path, e.g. /posts, /calendar, /brands, /create-post, /photos, /analytics, /clients, /settings, /automations, /blog-engine, /proposals, /geo, /brand-research, /creative-studio' },
      },
      required: ['path'],
    },
  },
  {
    name: 'call_api',
    description: `Call any internal API route to perform an action not covered by the other tools. Always prefer specific tools when they exist. Use this for anything else.

Key available routes:
- POST /api/claude — general-purpose AI (body: { prompt, systemPrompt?, brandId? })
- POST /api/generate-image — generate an image (body: { prompt, brandId?, aspectRatio? })
- GET /api/buffer — get Buffer profiles
- POST /api/buffer — send a post to Buffer (body: { profileIds, text, media? })
- GET/POST /api/proposals — list or create proposals
- GET/POST/PUT/DELETE /api/proposals/[id] — manage a specific proposal
- POST /api/proposals/generate — AI-generate proposal content (body: { brandId, clientName, services, budget? })
- POST /api/brands/autofill — auto-fill brand details from website (body: { website })
- POST /api/brands/research — deep brand/competitor research (body: { brandId, query })
- POST /api/blog/generate-ideas — generate blog ideas (body: { brandId, count?, focusArea? })
- POST /api/blog/generate-post — write a full blog post (body: { brandId, title, tags?, postType? })
- POST /api/blog/check-draft — review/improve a draft (body: { content, brandId })
- POST /api/blog/brand-polish — polish blog post to match brand voice (body: { content, brandId })
- POST /api/blog/optimize-title — suggest better titles (body: { title, content? })
- GET/POST /api/blog/posts — list or upsert blog posts
- GET/POST /api/automations — list or create automations
- POST /api/automations/[id]/run — run a specific automation
- POST /api/seo-keywords — keyword research (body: { brandId, seed })
- POST /api/seo-onpage — on-page SEO audit (body: { url })
- POST /api/seo-technical — technical SEO audit (body: { url })
- GET /api/notifications — list notifications`,
    input_schema: {
      type: 'object',
      properties: {
        path: { type: 'string', description: 'API route path starting with /api/, e.g. /api/claude. For routes with IDs use the actual ID, e.g. /api/proposals/abc123.' },
        method: { type: 'string', enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'], description: 'HTTP method' },
        body: { type: 'object', description: 'Request body as JSON (for POST/PUT/PATCH)' },
        query_params: { type: 'object', description: 'Query string params as key/value (for GET/DELETE filters)' },
      },
      required: ['path', 'method'],
    },
  },
]

// ─── Tool executor ────────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  input: Record<string, unknown>,
  userId: string,
  workspaceId: string,
  apiKey: string,
  origin: string,
  cookieHeader: string,
): Promise<{ result: unknown; workspaceChanged: boolean; clientActions: { type: string; path?: string }[] }> {
  const supabase = await createClient()
  let workspaceChanged = false
  const clientActions: { type: string; path?: string }[] = []

  // ── Helper: load all posts from workspace ──────────────────────────────────
  async function loadPosts() {
    const { data } = await supabase.from('posts').select('id, data, client_visible').eq('workspace_id', workspaceId)
    return (data || []).map((r: { id: string; data: Record<string, unknown>; client_visible: boolean }) => ({
      ...r.data,
      id: r.id,
      client_visible: r.client_visible,
    }))
  }

  // ── Helper: load all photos ────────────────────────────────────────────────
  async function loadPhotos() {
    const { data } = await supabase.from('photos').select('id, data').eq('workspace_id', workspaceId)
    return (data || []).map((r: { id: string; data: Record<string, unknown> }) => ({ ...r.data, id: r.id }))
  }

  // ── Helper: load all folders ───────────────────────────────────────────────
  async function loadFolders() {
    const { data } = await supabase.from('folders').select('id, data').eq('workspace_id', workspaceId)
    return (data || []).map((r: { id: string; data: Record<string, unknown> }) => ({ ...r.data, id: r.id }))
  }

  // ── Helper: load all clients ───────────────────────────────────────────────
  async function loadClients() {
    const { data } = await supabase.from('clients').select('id, data').eq('workspace_id', workspaceId)
    return (data || []).map((r: { id: string; data: Record<string, unknown> }) => ({ ...r.data, id: r.id }))
  }

  switch (name) {

    // ──────────────────────────────────────────────────────────── BRANDS ──────

    case 'list_brands': {
      const { include_details = false } = input as { include_details?: boolean }
      const { data } = await supabase
        .from('workspace_brands')
        .select(include_details
          ? 'id, name, tone, output_length, platforms, brand_voice, posting_instructions, include_hashtags, include_emojis, buffer_profile_ids, posting_days, posting_time, key_messages, website, primary_color'
          : 'id, name, tone, output_length, platforms, posting_days, posting_time')
        .eq('user_id', workspaceId)
      return { result: data || [], workspaceChanged, clientActions }
    }

    case 'get_brand': {
      const { brand_id } = input as { brand_id: string }
      const { data } = await supabase
        .from('workspace_brands')
        .select('*')
        .eq('id', brand_id)
        .eq('user_id', workspaceId)
        .single()
      return { result: data || { error: 'Brand not found' }, workspaceChanged, clientActions }
    }

    case 'create_brand': {
      const b = input as {
        name: string; tone?: string; output_length?: string; website?: string
        brand_guidelines?: string; posting_instructions?: string; platforms?: string[]
        include_hashtags?: boolean; include_emojis?: boolean; key_messages?: string[]
        posting_days?: string[]; posting_time?: string; primary_color?: string
      }
      const { data, error } = await supabase
        .from('workspace_brands')
        .insert({
          user_id: workspaceId,
          name: b.name,
          tone: b.tone || 'professional',
          output_length: b.output_length || 'medium',
          website: b.website || '',
          brand_voice: b.brand_guidelines || '',
          posting_instructions: b.posting_instructions || '',
          platforms: b.platforms || [],
          include_hashtags: b.include_hashtags ?? true,
          include_emojis: b.include_emojis ?? true,
          key_messages: b.key_messages || [],
          posting_days: b.posting_days || [],
          posting_time: b.posting_time || '',
          primary_color: b.primary_color || '#ffb2b9',
          buffer_profile_ids: [],
        })
        .select('id, name, tone, platforms')
        .single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: data, workspaceChanged, clientActions }
    }

    case 'update_brand': {
      const { brand_id, ...rest } = input as {
        brand_id: string; name?: string; tone?: string; output_length?: string
        website?: string; brand_guidelines?: string; posting_instructions?: string
        platforms?: string[]; include_hashtags?: boolean; include_emojis?: boolean
        key_messages?: string[]; posting_days?: string[]; posting_time?: string
      }
      const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (rest.name !== undefined) update.name = rest.name
      if (rest.tone !== undefined) update.tone = rest.tone
      if (rest.output_length !== undefined) update.output_length = rest.output_length
      if (rest.website !== undefined) update.website = rest.website
      if (rest.brand_guidelines !== undefined) update.brand_voice = rest.brand_guidelines
      if (rest.posting_instructions !== undefined) update.posting_instructions = rest.posting_instructions
      if (rest.platforms !== undefined) update.platforms = rest.platforms
      if (rest.include_hashtags !== undefined) update.include_hashtags = rest.include_hashtags
      if (rest.include_emojis !== undefined) update.include_emojis = rest.include_emojis
      if (rest.key_messages !== undefined) update.key_messages = rest.key_messages
      if (rest.posting_days !== undefined) update.posting_days = rest.posting_days
      if (rest.posting_time !== undefined) update.posting_time = rest.posting_time
      const { error } = await supabase.from('workspace_brands').update(update).eq('id', brand_id).eq('user_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { updated: brand_id, fields: Object.keys(rest) }, workspaceChanged, clientActions }
    }

    case 'delete_brand': {
      const { brand_id } = input as { brand_id: string }
      const { error } = await supabase.from('workspace_brands').delete().eq('id', brand_id).eq('user_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { deleted: brand_id }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── POSTS ───────

    case 'list_posts': {
      const { status, brand_id, limit = 20 } = input as { status?: string; brand_id?: string; limit?: number }
      let posts = await loadPosts()
      if (status) posts = posts.filter((p: Record<string, unknown>) => p.status === status)
      if (brand_id) posts = posts.filter((p: Record<string, unknown>) => p.brand_profile_id === brand_id)
      const trimmed: unknown[] = posts
        .sort((a: Record<string, unknown>, b: Record<string, unknown>) => String(b.created_date || '').localeCompare(String(a.created_date || '')))
        .slice(0, limit)
        .map((p: Record<string, unknown>) => ({
          id: p.id, brand_profile_id: p.brand_profile_id, caption: String(p.caption || '').slice(0, 120) + (String(p.caption || '').length > 120 ? '…' : ''),
          platforms: p.platforms, status: p.status, scheduled_at: p.scheduled_at, created_date: p.created_date, buffer_sent: p.buffer_sent,
        }))
      return { result: trimmed, workspaceChanged, clientActions }
    }

    case 'get_post': {
      const { post_id } = input as { post_id: string }
      const { data: row } = await supabase.from('posts').select('id, data, client_visible').eq('id', post_id).eq('workspace_id', workspaceId).single()
      if (!row) return { result: { error: 'Post not found' }, workspaceChanged, clientActions }
      return { result: { ...row.data, id: row.id, client_visible: row.client_visible }, workspaceChanged, clientActions }
    }

    case 'create_post': {
      const { brand_id, caption, platforms, scheduled_at, status = 'draft', image_url } = input as {
        brand_id: string; caption: string; platforms: string[]; scheduled_at?: string; status?: string; image_url?: string
      }
      const now = new Date().toISOString().split('T')[0]
      const newId = crypto.randomUUID()
      const postData = {
        id: newId, brand_profile_id: brand_id, caption, platforms, status,
        scheduled_at: scheduled_at || null, image_url: image_url || null,
        created_date: now, client_visible: false, client_approved: false,
      }
      const { error } = await supabase.from('posts').insert({
        id: newId, workspace_id: workspaceId,
        data: postData, brand_profile_id: brand_id, client_visible: false,
      })
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { id: newId, caption: caption.slice(0, 100), platforms, status }, workspaceChanged, clientActions }
    }

    case 'update_post_status': {
      const { post_ids, status, scheduled_at } = input as { post_ids: string[]; status: string; scheduled_at?: string }
      let successCount = 0
      for (const postId of post_ids) {
        const { data: row } = await supabase.from('posts').select('data').eq('id', postId).eq('workspace_id', workspaceId).single()
        if (!row) continue
        const updated = { ...row.data, status, ...(scheduled_at ? { scheduled_at } : {}) }
        const { error } = await supabase.from('posts').update({ data: updated }).eq('id', postId).eq('workspace_id', workspaceId)
        if (!error) successCount++
      }
      workspaceChanged = true
      return { result: { updated: successCount, status }, workspaceChanged, clientActions }
    }

    case 'delete_post': {
      const { post_ids } = input as { post_ids: string[] }
      const { error } = await supabase.from('posts').delete().in('id', post_ids).eq('workspace_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { deleted: post_ids.length }, workspaceChanged, clientActions }
    }

    case 'toggle_client_visibility': {
      const { post_ids, client_visible } = input as { post_ids: string[]; client_visible: boolean }
      let successCount = 0
      for (const postId of post_ids) {
        const { data: row } = await supabase.from('posts').select('data').eq('id', postId).eq('workspace_id', workspaceId).single()
        if (!row) continue
        const updated = { ...row.data, client_visible }
        const { error } = await supabase.from('posts').update({ data: updated, client_visible }).eq('id', postId)
        if (!error) successCount++
      }
      workspaceChanged = true
      return { result: { updated: successCount, client_visible }, workspaceChanged, clientActions }
    }

    case 'generate_caption': {
      const { brand_id, prompt, platforms = [] } = input as { brand_id: string; prompt: string; platforms?: string[] }
      const { data: brand } = await supabase
        .from('workspace_brands')
        .select('name, tone, brand_voice, posting_instructions, include_hashtags, include_emojis, output_length')
        .eq('id', brand_id).single()
      if (!brand) return { result: { error: 'Brand not found' }, workspaceChanged, clientActions }
      const platformStr = platforms.length > 0 ? platforms.join(', ') : 'social media'
      const systemPrompt = `You are a social media copywriter for the brand "${brand.name}".
Tone: ${brand.tone}. Output length: ${brand.output_length}.
${brand.brand_voice ? `Brand voice/guidelines: ${brand.brand_voice}` : ''}
${brand.posting_instructions ? `Posting instructions: ${brand.posting_instructions}` : ''}
${brand.include_hashtags ? 'Include relevant hashtags.' : 'Do not include hashtags.'}
${brand.include_emojis ? 'Include emojis.' : 'Do not include emojis.'}
Write a caption for ${platformStr}. Return only the caption text.`
      const anthropicRes = await fetch(ANTHROPIC_API, {
        method: 'POST',
        headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
        body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 512, system: systemPrompt, messages: [{ role: 'user', content: prompt }] }),
      })
      const captionData = await anthropicRes.json()
      const caption = captionData.content?.[0]?.text || ''
      return { result: { caption }, workspaceChanged, clientActions }
    }

    case 'send_to_buffer': {
      const { post_id } = input as { post_id: string }
      const { data: row } = await supabase.from('posts').select('id, data, brand_profile_id').eq('id', post_id).eq('workspace_id', workspaceId).single()
      if (!row) return { result: { error: 'Post not found' }, workspaceChanged, clientActions }
      const post = row.data as Record<string, unknown>
      const { data: brand } = await supabase.from('workspace_brands').select('buffer_profile_ids').eq('id', row.brand_profile_id).single()
      const profileIds: string[] = brand?.buffer_profile_ids || []
      if (!profileIds.length) return { result: { error: 'No Buffer channels configured for this brand' }, workspaceChanged, clientActions }
      const bufferToken = await getDecryptedBufferToken(userId)
      if (!bufferToken) return { result: { error: 'No Buffer token configured. Add it in Account Settings.' }, workspaceChanged, clientActions }
      const { channelMap } = await getBufferOrgAndChannels(bufferToken)
      const results = await Promise.all(profileIds.map(async (channelId: string) => {
        const service = (channelMap[channelId]?.service || '').toLowerCase()
        const metadata: Record<string, unknown> = {}
        if (service === 'facebook') metadata.facebook = { type: 'post' }
        if (service === 'instagram') metadata.instagram = { type: 'post', shouldShareToFeed: true }
        const bufInput: Record<string, unknown> = { channelId, text: post.caption, schedulingType: 'automatic', mode: 'addToQueue' }
        if (Object.keys(metadata).length > 0) bufInput.metadata = metadata
        if (post.image_url) bufInput.assets = { images: [{ url: post.image_url }] }
        const data = await bufferGql(bufferToken, `
          mutation CreatePost($input: CreatePostInput!) {
            createPost(input: $input) {
              ... on PostActionSuccess { post { id } }
              ... on MutationError { message }
            }
          }
        `, { input: bufInput })
        if (data.errors) return { channelId, success: false, error: data.errors[0]?.message }
        return data.data?.createPost?.post ? { channelId, success: true } : { channelId, success: false, error: data.data?.createPost?.message }
      }))
      // Mark post as buffer_sent
      const updatedPost = { ...post, buffer_sent: true, buffer_sent_at: new Date().toISOString() }
      await supabase.from('posts').update({ data: updatedPost }).eq('id', post_id)
      workspaceChanged = true
      const sent = results.filter(r => r.success).length
      return { result: { sent, total: results.length, success: sent === results.length }, workspaceChanged, clientActions }
    }

    case 'bulk_send_approved_to_buffer': {
      const { brand_id } = input as { brand_id?: string }
      const bufferToken = await getDecryptedBufferToken(userId)
      if (!bufferToken) return { result: { error: 'No Buffer token configured.' }, workspaceChanged, clientActions }
      let posts = await loadPosts()
      posts = posts.filter((p: Record<string, unknown>) => p.status === 'approved' || p.status === 'scheduled')
      if (brand_id) posts = posts.filter((p: Record<string, unknown>) => p.brand_profile_id === brand_id)
      if (!posts.length) return { result: { message: 'No approved/scheduled posts to send' }, workspaceChanged, clientActions }
      const { channelMap } = await getBufferOrgAndChannels(bufferToken)
      let sent = 0; let failed = 0
      for (const post of posts as Record<string, unknown>[]) {
        const { data: brand } = await supabase.from('workspace_brands').select('buffer_profile_ids').eq('id', post.brand_profile_id).single()
        const profileIds: string[] = brand?.buffer_profile_ids || []
        if (!profileIds.length) { failed++; continue }
        for (const channelId of profileIds) {
          const service = (channelMap[channelId]?.service || '').toLowerCase()
          const metadata: Record<string, unknown> = {}
          if (service === 'facebook') metadata.facebook = { type: 'post' }
          if (service === 'instagram') metadata.instagram = { type: 'post', shouldShareToFeed: true }
          const bufInput: Record<string, unknown> = { channelId, text: post.caption, schedulingType: 'automatic', mode: 'addToQueue' }
          if (Object.keys(metadata).length > 0) bufInput.metadata = metadata
          if (post.image_url) bufInput.assets = { images: [{ url: post.image_url }] }
          try {
            const res = await bufferGql(bufferToken, `
              mutation CreatePost($input: CreatePostInput!) {
                createPost(input: $input) {
                  ... on PostActionSuccess { post { id } }
                  ... on MutationError { message }
                }
              }
            `, { input: bufInput })
            if (res.data?.createPost?.post) sent++
            else failed++
          } catch { failed++ }
          await new Promise(r => setTimeout(r, 1500)) // rate limit buffer
        }
        const updatedPost = { ...post, buffer_sent: true, buffer_sent_at: new Date().toISOString() }
        await supabase.from('posts').update({ data: updatedPost }).eq('id', post.id)
      }
      workspaceChanged = true
      return { result: { sent, failed, total: posts.length }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── PHOTOS ──────

    case 'search_photos': {
      const { query, folder_id, limit = 20 } = input as { query?: string; folder_id?: string; limit?: number }
      let photos = await loadPhotos()
      if (folder_id === 'null' || folder_id === '') {
        photos = photos.filter((p: Record<string, unknown>) => !p.folder_id)
      } else if (folder_id) {
        photos = photos.filter((p: Record<string, unknown>) => p.folder_id === folder_id)
      }
      if (query) {
        const q = query.toLowerCase()
        photos = photos.filter((p: Record<string, unknown>) =>
          String(p.name || '').toLowerCase().includes(q) ||
          (Array.isArray(p.tags) && p.tags.some((t: string) => t.toLowerCase().includes(q)))
        )
      }
      return { result: photos.slice(0, limit).map((p: Record<string, unknown>) => ({ id: p.id, name: p.name, tags: p.tags, folder_id: p.folder_id, url: p.url })), workspaceChanged, clientActions }
    }

    case 'delete_photo': {
      const { photo_ids } = input as { photo_ids: string[] }
      const { error } = await supabase.from('photos').delete().in('id', photo_ids).eq('workspace_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { deleted: photo_ids.length }, workspaceChanged, clientActions }
    }

    case 'update_photo_tags': {
      const { photo_id, tags } = input as { photo_id: string; tags: string[] }
      const { data: row } = await supabase.from('photos').select('data').eq('id', photo_id).eq('workspace_id', workspaceId).single()
      if (!row) return { result: { error: 'Photo not found' }, workspaceChanged, clientActions }
      const updated = { ...row.data, tags }
      const { error } = await supabase.from('photos').update({ data: updated }).eq('id', photo_id)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { updated: photo_id, tags }, workspaceChanged, clientActions }
    }

    case 'move_photos_to_folder': {
      const { photo_ids, folder_id } = input as { photo_ids: string[]; folder_id?: string | null }
      const fid = folder_id && folder_id !== 'null' ? folder_id : null
      let successCount = 0
      for (const photoId of photo_ids) {
        const { data: row } = await supabase.from('photos').select('data').eq('id', photoId).eq('workspace_id', workspaceId).single()
        if (!row) continue
        const updated = { ...row.data, folder_id: fid }
        const { error } = await supabase.from('photos').update({ data: updated }).eq('id', photoId)
        if (!error) successCount++
      }
      workspaceChanged = true
      return { result: { moved: successCount, folder_id: fid }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── FOLDERS ─────

    case 'list_folders': {
      const folders = await loadFolders()
      return { result: folders, workspaceChanged, clientActions }
    }

    case 'create_folder': {
      const { name, brand_id } = input as { name: string; brand_id?: string }
      const newId = crypto.randomUUID()
      const folderData = { id: newId, name, brand_id: brand_id || null }
      const { error } = await supabase.from('folders').insert({ id: newId, workspace_id: workspaceId, data: folderData })
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: folderData, workspaceChanged, clientActions }
    }

    case 'rename_folder': {
      const { folder_id, name } = input as { folder_id: string; name: string }
      const { data: row } = await supabase.from('folders').select('data').eq('id', folder_id).eq('workspace_id', workspaceId).single()
      if (!row) return { result: { error: 'Folder not found' }, workspaceChanged, clientActions }
      const updated = { ...row.data, name }
      const { error } = await supabase.from('folders').update({ data: updated }).eq('id', folder_id)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { id: folder_id, name }, workspaceChanged, clientActions }
    }

    case 'delete_folder': {
      const { folder_id } = input as { folder_id: string }
      // Remove folder_id from all photos in this folder
      const photos = await loadPhotos()
      const inFolder = photos.filter((p: Record<string, unknown>) => p.folder_id === folder_id)
      for (const photo of inFolder as Record<string, unknown>[]) {
        const { data: row } = await supabase.from('photos').select('data').eq('id', photo.id).single()
        if (row) await supabase.from('photos').update({ data: { ...row.data, folder_id: null } }).eq('id', photo.id)
      }
      const { error } = await supabase.from('folders').delete().eq('id', folder_id).eq('workspace_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { deleted: folder_id, photosUnassigned: inFolder.length }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── CLIENTS ─────

    case 'list_clients': {
      const clients = await loadClients()
      return { result: clients, workspaceChanged, clientActions }
    }

    case 'create_client': {
      const { name, email, brand_id, notes, portal_password } = input as {
        name: string; email?: string; brand_id?: string; notes?: string; portal_password?: string
      }
      const newId = crypto.randomUUID()
      const now = new Date().toISOString().split('T')[0]
      const clientData = { id: newId, name, email: email || '', brand_profile_id: brand_id || null, notes: notes || '', portal_password: portal_password || '', created_date: now }
      const { error } = await supabase.from('clients').insert({ id: newId, workspace_id: workspaceId, data: clientData })
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { id: newId, name, email }, workspaceChanged, clientActions }
    }

    case 'update_client': {
      const { client_id, ...rest } = input as { client_id: string; name?: string; email?: string; brand_id?: string; notes?: string; portal_password?: string }
      const { data: row } = await supabase.from('clients').select('data').eq('id', client_id).eq('workspace_id', workspaceId).single()
      if (!row) return { result: { error: 'Client not found' }, workspaceChanged, clientActions }
      const updated = {
        ...row.data,
        ...(rest.name !== undefined ? { name: rest.name } : {}),
        ...(rest.email !== undefined ? { email: rest.email } : {}),
        ...(rest.brand_id !== undefined ? { brand_profile_id: rest.brand_id } : {}),
        ...(rest.notes !== undefined ? { notes: rest.notes } : {}),
        ...(rest.portal_password !== undefined ? { portal_password: rest.portal_password } : {}),
      }
      const { error } = await supabase.from('clients').update({ data: updated }).eq('id', client_id)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { updated: client_id }, workspaceChanged, clientActions }
    }

    case 'delete_client': {
      const { client_id } = input as { client_id: string }
      const { error } = await supabase.from('clients').delete().eq('id', client_id).eq('workspace_id', workspaceId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { deleted: client_id }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────── AUTOMATIONS ─────

    case 'list_automations': {
      const { data } = await supabase
        .from('automations')
        .select('id, name, description, trigger_type, is_enabled, last_run_at, last_run_status, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false })
      return { result: data || [], workspaceChanged, clientActions }
    }

    case 'run_automation': {
      const { automation_id } = input as { automation_id: string }
      try {
        const result = await executeAutomation(automation_id, userId, 'manual', '')
        return { result, workspaceChanged: false, clientActions }
      } catch (e) {
        return { result: { error: e instanceof Error ? e.message : 'Automation execution failed' }, workspaceChanged: false, clientActions }
      }
    }

    case 'toggle_automation': {
      const { automation_id, enabled } = input as { automation_id: string; enabled: boolean }
      const { error } = await supabase
        .from('automations')
        .update({ is_enabled: enabled, updated_at: new Date().toISOString() })
        .eq('id', automation_id)
        .eq('user_id', userId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      return { result: { automation_id, enabled }, workspaceChanged, clientActions }
    }

    // ─────────────────────────────────────────────────────── NOTIFICATIONS ────

    case 'get_notifications': {
      const { data } = await supabase
        .from('notifications')
        .select('id, type, title, message, link, created_at')
        .eq('user_id', userId)
        .eq('read', false)
        .order('created_at', { ascending: false })
        .limit(20)
      return { result: data || [], workspaceChanged, clientActions }
    }

    case 'send_notification': {
      const { title, message = '', type = 'info', link } = input as { title: string; message?: string; type?: string; link?: string }
      const { data, error } = await supabase
        .from('notifications')
        .insert({ user_id: userId, title, message, type, link: link || null, read: false })
        .select('id')
        .single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      return { result: { id: data.id, title }, workspaceChanged, clientActions }
    }

    case 'mark_notification_read': {
      const { notification_id } = input as { notification_id: string }
      const { error } = await supabase.from('notifications').update({ read: true }).eq('id', notification_id).eq('user_id', userId)
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      return { result: { marked_read: notification_id }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── SETTINGS ────

    case 'get_settings': {
      const { data } = await supabase.from('settings').select('data').eq('workspace_id', workspaceId).single()
      return { result: data?.data || {}, workspaceChanged, clientActions }
    }

    case 'update_settings': {
      const { workspace_name, timezone, default_platforms, email_notifications, auto_send_on_approve, model } = input as {
        workspace_name?: string; timezone?: string; default_platforms?: string[]
        email_notifications?: boolean; auto_send_on_approve?: boolean; model?: string
      }
      const { data: existing } = await supabase.from('settings').select('data').eq('workspace_id', workspaceId).single()
      const current = existing?.data || {}
      const updated = {
        ...current,
        ...(workspace_name !== undefined ? { workspaceName: workspace_name } : {}),
        ...(timezone !== undefined ? { timezone } : {}),
        ...(default_platforms !== undefined ? { defaultPlatforms: default_platforms } : {}),
        ...(email_notifications !== undefined ? { emailNotifications: email_notifications } : {}),
        ...(auto_send_on_approve !== undefined ? { autoSendOnApprove: auto_send_on_approve } : {}),
        ...(model !== undefined ? { model } : {}),
      }
      const { error } = await supabase.from('settings').upsert({ workspace_id: workspaceId, data: updated })
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { updated: true, settings: updated }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────────────── BUFFER ──────

    case 'get_buffer_channels': {
      const bufferToken = await getDecryptedBufferToken(userId)
      if (!bufferToken) return { result: { error: 'No Buffer token configured. Add it in Account Settings.' }, workspaceChanged, clientActions }
      try {
        const { orgId, channelMap } = await getBufferOrgAndChannels(bufferToken)
        if (!orgId) return { result: { error: 'No Buffer organization found' }, workspaceChanged, clientActions }
        const channels = Object.entries(channelMap).map(([id, c]) => ({ id, service: c.service, name: c.name }))
        return { result: { channels }, workspaceChanged, clientActions }
      } catch (e) {
        return { result: { error: e instanceof Error ? e.message : 'Buffer API error' }, workspaceChanged, clientActions }
      }
    }

    // ──────────────────────────────────────────────────────────── SUMMARY ─────

    case 'get_workspace_summary': {
      const [brandsRes, postsData, photosRes, foldersRes, clientsRes, autoRes, proposalsRes] = await Promise.all([
        supabase.from('workspace_brands').select('id', { count: 'exact', head: true }).eq('user_id', workspaceId),
        supabase.from('posts').select('data').eq('workspace_id', workspaceId),
        supabase.from('photos').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('folders').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('clients').select('id', { count: 'exact', head: true }).eq('workspace_id', workspaceId),
        supabase.from('automations').select('id', { count: 'exact', head: true }).eq('user_id', userId),
        supabase.from('proposals').select('id, type, status').eq('user_id', userId),
      ])
      const posts = (postsData.data || []).map((r: { data: Record<string, unknown> }) => r.data)
      const socialPosts = posts.filter(p => String(p.type || '') !== 'blog')
      const blogPosts = posts.filter(p => String(p.type || '') === 'blog')
      const postCounts = socialPosts.reduce((acc: Record<string, number>, p: Record<string, unknown>) => {
        const s = String(p.status || 'unknown')
        acc[s] = (acc[s] || 0) + 1
        return acc
      }, {})
      const allProposals = proposalsRes.data || []
      const proposalCounts = allProposals.reduce((acc: Record<string, number>, p: { type: string; status: string }) => {
        const key = `${p.type}_${p.status}`
        acc[key] = (acc[key] || 0) + 1
        return acc
      }, {})
      return {
        result: {
          brands: brandsRes.count || 0,
          social_posts: { total: socialPosts.length, ...postCounts },
          blog_posts: { total: blogPosts.length, draft: blogPosts.filter(p => p.status === 'draft').length, published: blogPosts.filter(p => p.status === 'published').length },
          photos: photosRes.count || 0,
          folders: foldersRes.count || 0,
          clients: clientsRes.count || 0,
          automations: autoRes.count || 0,
          proposals: { total: allProposals.length, ...proposalCounts },
        },
        workspaceChanged,
        clientActions,
      }
    }

    case 'navigate': {
      const { path } = input as { path: string }
      clientActions.push({ type: 'navigate', path })
      return { result: { navigating: path }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────── PROPOSALS ──────

    case 'list_proposals': {
      const { type, status } = input as { type?: string; status?: string }
      let q = supabase.from('proposals').select('id, title, type, client_name, status, total_value, end_date, renewal_date, updated_at').eq('user_id', userId).order('updated_at', { ascending: false })
      if (type) q = q.eq('type', type)
      if (status) q = q.eq('status', status)
      const { data } = await q
      return { result: data || [], workspaceChanged, clientActions }
    }

    case 'get_proposal': {
      const { proposal_id } = input as { proposal_id: string }
      const { data } = await supabase.from('proposals').select('*').eq('id', proposal_id).eq('user_id', userId).single()
      return { result: data || { error: 'Not found' }, workspaceChanged, clientActions }
    }

    case 'create_proposal': {
      const p = input as { title: string; type?: string; client_name?: string; client_email?: string; total_value?: number; brand_id?: string }
      const { data, error } = await supabase.from('proposals').insert({
        user_id: userId,
        title: p.title || 'Untitled',
        type: p.type || 'proposal',
        client_name: p.client_name || '',
        client_email: p.client_email || '',
        total_value: p.total_value || 0,
        brand_id: p.brand_id || null,
        status: 'draft',
        content: [],
        updated_at: new Date().toISOString(),
      }).select('id, title, type, client_name, status').single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: data, workspaceChanged, clientActions }
    }

    case 'update_proposal_status': {
      const { proposal_id, status } = input as { proposal_id: string; status: string }
      const { data, error } = await supabase.from('proposals').update({ status, updated_at: new Date().toISOString() }).eq('id', proposal_id).eq('user_id', userId).select('id, title, status').single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: data, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────── BLOG ──────────

    case 'list_blog_posts': {
      const { brand_id, status } = input as { brand_id?: string; status?: string }
      let q = supabase.from('posts').select('id, data').eq('workspace_id', workspaceId).eq('data->>type', 'blog')
      if (brand_id) q = q.eq('data->>brand_id', brand_id)
      if (status) q = q.eq('data->>status', status)
      const { data } = await q
      const posts = (data || []).map((r: { id: string; data: Record<string, unknown> }) => ({
        id: r.id,
        title: r.data.title,
        status: r.data.status,
        brand_id: r.data.brand_id,
        tags: r.data.tags,
        word_count: r.data.word_count,
        updated_at: r.data.updated_at,
      }))
      return { result: posts, workspaceChanged, clientActions }
    }

    case 'get_blog_post': {
      const { post_id } = input as { post_id: string }
      const { data } = await supabase.from('posts').select('id, data').eq('id', post_id).eq('workspace_id', workspaceId).single()
      if (!data) return { result: { error: 'Not found' }, workspaceChanged, clientActions }
      return { result: { id: data.id, ...(data.data as Record<string, unknown>) }, workspaceChanged, clientActions }
    }

    case 'create_blog_post': {
      const p = input as { brand_id: string; title: string; content?: string; tags?: string; author?: string }
      const now = new Date().toISOString()
      const postData = { type: 'blog', brand_id: p.brand_id, title: p.title, content: p.content || '', tags: p.tags || '', author: p.author || '', status: 'draft', word_count: 0, created_at: now, updated_at: now }
      const { data, error } = await supabase.from('posts').insert({ workspace_id: workspaceId, data: postData }).select('id, data').single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      workspaceChanged = true
      return { result: { id: data.id, title: p.title, status: 'draft' }, workspaceChanged, clientActions }
    }

    case 'update_blog_post_status': {
      const { post_id, status } = input as { post_id: string; status: string }
      const { data: existing } = await supabase.from('posts').select('id, data').eq('id', post_id).eq('workspace_id', workspaceId).single()
      if (!existing) return { result: { error: 'Post not found' }, workspaceChanged, clientActions }
      const updated = { ...(existing.data as Record<string, unknown>), status, updated_at: new Date().toISOString() }
      await supabase.from('posts').update({ data: updated }).eq('id', post_id)
      workspaceChanged = true
      return { result: { id: post_id, status }, workspaceChanged, clientActions }
    }

    // ──────────────────────────────────────────────────── AUTOMATIONS ──

    case 'list_automations': {
      const { data } = await supabase.from('automations').select('id, name, description, trigger_type, is_enabled, last_run_at, last_run_status').eq('user_id', userId).order('updated_at', { ascending: false })
      return { result: data || [], workspaceChanged, clientActions }
    }

    case 'toggle_automation': {
      const { automation_id, enabled } = input as { automation_id: string; enabled: boolean }
      const { data, error } = await supabase.from('automations').update({ is_enabled: enabled, updated_at: new Date().toISOString() }).eq('id', automation_id).eq('user_id', userId).select('id, name, is_enabled').single()
      if (error) return { result: { error: error.message }, workspaceChanged, clientActions }
      return { result: data, workspaceChanged, clientActions }
    }

    case 'run_automation': {
      const { automation_id } = input as { automation_id: string }
      const { data: auto } = await supabase.from('automations').select('*').eq('id', automation_id).eq('user_id', userId).single()
      if (!auto) return { result: { error: 'Automation not found' }, workspaceChanged, clientActions }
      try {
        const result = await executeAutomation(automation_id, userId, 'manual', '')
        return { result: { success: true, automation: auto.name, result }, workspaceChanged, clientActions }
      } catch (e) {
        return { result: { error: String(e) }, workspaceChanged, clientActions }
      }
    }

    case 'call_api': {
      const { path, method, body, query_params } = input as { path: string; method: string; body?: Record<string, unknown>; query_params?: Record<string, string> }
      if (!path.startsWith('/api/') || path.startsWith('/api/agent')) {
        return { result: { error: 'Only /api/ routes (excluding /api/agent) are callable' }, workspaceChanged, clientActions }
      }
      let url = `${origin}${path}`
      if (query_params && Object.keys(query_params).length) {
        url += '?' + new URLSearchParams(query_params).toString()
      }
      const apiRes = await fetch(url, {
        method,
        headers: { 'content-type': 'application/json', 'cookie': cookieHeader },
        body: body ? JSON.stringify(body) : undefined,
      })
      let apiResult: unknown
      try { apiResult = await apiRes.json() } catch { apiResult = { status: apiRes.status, ok: apiRes.ok } }
      if (apiRes.ok && method !== 'GET') workspaceChanged = true
      return { result: apiResult, workspaceChanged, clientActions }
    }

    default:
      return { result: { error: `Unknown tool: ${name}` }, workspaceChanged, clientActions }
  }
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('role, workspace_id').eq('id', user.id).single()
  const workspaceId = profile?.role === 'admin' ? user.id : (profile?.workspace_id || user.id)

  let body: { messages: ChatMessage[]; workspaceContext: WorkspaceContext }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }) }

  const { messages, workspaceContext } = body
  const brandNames = workspaceContext.brands.map(b => b.name).join(', ') || 'none'
  const postCountStr = Object.entries(workspaceContext.postCounts).map(([k, v]) => `${k}: ${v}`).join(', ') || 'none'

  const systemPrompt = `You are Paul, an AI co-worker built into Pulse — a full-service social media agency platform. Your name is Paul.

## The Agency Platform — What Pulse Does
Pulse is an all-in-one platform used by social media agencies and their teams to manage multiple client brands. It has seven integrated apps:

1. **CaptionCraft** (Social Media Manager) — The core app. Manage brands, create and approve social media posts, schedule to Buffer, track content by status (draft → submitted → approved → scheduled → published). Supports Instagram, Facebook, LinkedIn, TikTok, Pinterest. Access at /posts, /calendar, /brands.

2. **Blog Engine** — Write and manage long-form blog content for client brands. Create ideas, draft full blog posts with AI, manage the publishing pipeline. Access at /blog.

3. **Creative Studio** — AI image generation and photo library management. Generate branded images using fine-tuned models (Replicate/Flux), organise photos into folders, tag and search media assets. Access at /creative-studio.

4. **Automations** — Build and run multi-step automations that chain AI actions together (generate caption → post to social, auto-respond to events, scheduled batch workflows). Access at /automations.

5. **Brand Research** — Deep research tool for competitor analysis, market positioning, audience insights, and building brand strategy documents. Access at /brand-research.

6. **SEO Command Center** (Geo) — Keyword research, local SEO tracking, content gap analysis, and search performance monitoring for client brands. Access at /geo.

7. **Proposals & Contracts** — Create, send, and manage client proposals and contracts. AI-assisted proposal generation, e-signature workflow, and client approval tracking. Access at /proposals.

## Your Role
You are a full co-worker for the agency team — not just an assistant. You can take real actions across all seven apps: create content, move posts through approval workflows, send to Buffer, manage the photo library, run automations, navigate the user to any part of the platform, and answer any question about the workspace.

## Current Workspace
Workspace: ${workspaceContext.settings.workspaceName || 'My Workspace'}
Timezone: ${workspaceContext.settings.timezone || 'UTC'}
Brands: ${brandNames}
Posts: ${postCountStr}

## How to behave
- When asked to do something, do it — don't explain how. Confirm what you did after.
- When listing items, use clean readable formatting (markdown lists/tables).
- If an action is destructive (delete, overwrite), confirm what you're about to do first.
- Be concise and direct. You're a co-worker, not a chatbot.
- You can navigate the user to any part of the app using the navigate tool.`

  const origin = new URL(request.url).origin
  const cookieHeader = request.headers.get('cookie') || ''

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let anthropicMessages: any[] = messages.map(m => ({ role: m.role, content: m.content }))
  let workspaceChanged = false
  const allClientActions: { type: string; path?: string }[] = []
  const toolActivityLog: string[] = []

  for (let i = 0; i < 15; i++) {
    const res = await fetch(ANTHROPIC_API, {
      method: 'POST',
      headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify({ model: 'claude-sonnet-4-6', max_tokens: 2048, system: systemPrompt, tools: TOOLS, messages: anthropicMessages }),
    })
    const data = await res.json()
    if (!res.ok) return NextResponse.json({ error: data.error?.message || 'Claude API error' }, { status: res.status })

    if (data.stop_reason === 'end_turn') {
      const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
      return NextResponse.json({ reply: textBlock?.text || '', workspaceChanged, clientActions: allClientActions, toolActivity: toolActivityLog })
    }

    if (data.stop_reason === 'tool_use') {
      anthropicMessages.push({ role: 'assistant', content: data.content })
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolResults: any[] = []
      for (const block of data.content) {
        if (block.type !== 'tool_use') continue
        toolActivityLog.push(block.name)
        const { result, workspaceChanged: wc, clientActions } = await executeTool(block.name, block.input, user.id, workspaceId, apiKey, origin, cookieHeader)
        if (wc) workspaceChanged = true
        allClientActions.push(...clientActions)
        toolResults.push({ type: 'tool_result', tool_use_id: block.id, content: JSON.stringify(result) })
      }
      anthropicMessages.push({ role: 'user', content: toolResults })
      continue
    }

    const textBlock = data.content?.find((b: { type: string }) => b.type === 'text')
    return NextResponse.json({ reply: textBlock?.text || '', workspaceChanged, clientActions: allClientActions, toolActivity: toolActivityLog })
  }

  return NextResponse.json({ reply: 'Hit the tool loop limit — please try rephrasing your request.', workspaceChanged, clientActions: allClientActions, toolActivity: toolActivityLog })
}
