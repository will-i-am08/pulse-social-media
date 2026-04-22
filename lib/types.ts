export type Role = 'admin' | 'team' | 'client'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  role: Role
  workspace_id: string | null
  brand_id: string | null
}

/**
 * A single custom prompt rule that gets injected into AI generation.
 * Multiple rules can be added per brand and they all stack on top of postingInstructions.
 * `appliesTo` lets you target captions, blog posts, or both.
 */
export interface BrandRule {
  id: string
  label: string
  prompt: string
  enabled: boolean
  appliesTo: 'caption' | 'blog' | 'both'
}

/**
 * Build a single combined instruction string for a brand, merging
 * legacy postingInstructions + every enabled custom rule that matches the scope.
 * Accepts either the WorkspaceBrand (camelCase) or legacy Brand (snake_case) shape.
 */
export function buildBrandInstructions(
  brand: { postingInstructions?: string; posting_instructions?: string; customRules?: BrandRule[]; custom_rules?: BrandRule[] } | null | undefined,
  scope: 'caption' | 'blog' = 'caption'
): string {
  if (!brand) return ''
  const base = (brand.postingInstructions || brand.posting_instructions || '').trim()
  const rules = (brand.customRules || brand.custom_rules || []).filter(r =>
    r.enabled && (r.appliesTo === 'both' || r.appliesTo === scope) && r.prompt.trim()
  )
  const ruleLines = rules.map(r => `- ${r.label ? r.label + ': ' : ''}${r.prompt.trim()}`)
  if (!base && !ruleLines.length) return ''
  const parts: string[] = []
  if (base) parts.push(base)
  if (ruleLines.length) parts.push(ruleLines.join('\n'))
  return parts.join('\n')
}

export interface Brand {
  id: string
  name: string
  color: string
  website?: string
  phone?: string
  address?: string
  tone: 'professional' | 'casual' | 'playful' | 'luxury' | 'inspirational' | 'friendly'
  output_length: 'short' | 'medium' | 'long'
  brand_guidelines?: string
  posting_instructions?: string
  custom_rules?: BrandRule[]
  include_hashtags: boolean
  include_emojis: boolean
  social_handles?: {
    instagram?: string | null
    facebook?: string | null
    linkedin?: string | null
    tiktok?: string | null
    twitter?: string | null
  }
  platforms?: string[]
  buffer_channels?: string[]
  posting_days?: string[]      // ['mon','wed','fri']
  posting_time?: string        // '09:00' (24hr)
  buffer_profile_ids?: string[] // Selected Buffer profiles for this brand
  report?: string
  key_messages?: string[]
  content_recommendations?: string[]
  report_date?: string
  replicateModelVersion?: string
  trainingStatus?: 'idle' | 'training' | 'succeeded' | 'failed'
  trainingId?: string
  triggerWord?: string
  default_aspect_ratio?: string
  created_date: string
}

export type PostStatus = 'draft' | 'submitted' | 'approved' | 'scheduled' | 'published'
export type PostType = 'post' | 'story' | 'reel'

export interface Post {
  id: string
  brand_profile_id: string
  caption: string
  image_url?: string | null
  image_urls?: string[]
  video_url?: string | null
  post_type?: PostType
  platforms: string[]
  status: PostStatus
  scheduled_at?: string | null
  published_at?: string | null
  created_date: string
  batch_id?: string | null
  batch_label?: string | null
  client_visible: boolean
  client_approved: boolean
  rejection_reason?: string
  buffer_sent?: boolean
  buffer_sent_at?: string
  aspect_ratio?: string | null
  category?: string | null
  quality_checked?: boolean
}

// Note: "Public Holidays" is intentionally NOT a category here — it's owned by
// the dedicated /holidays page and should not pollute the regular pillar mix.
export const POST_CATEGORIES: { id: string; label: string }[] = [
  { id: 'happenings', label: 'About / Happenings' },
  { id: 'repairs',    label: 'Repair Types' },
  { id: 'phones',     label: 'Phone Sales' },
  { id: 'laptops',    label: 'Laptop Sales' },
  { id: 'team',       label: 'Team' },
  { id: 'refurb',     label: 'Refurb Stock' },
  { id: 'blog',       label: 'Blog Companion' },
]
export const POST_CATEGORY_LABELS: Record<string, string> =
  POST_CATEGORIES.reduce((acc, c) => { acc[c.id] = c.label; return acc }, {} as Record<string, string>)

/**
 * Lightweight keyword classifier — returns a category id or null.
 * Order matters: more specific matches first.
 */
export function detectCategory(text: string): string | null {
  if (!text) return null
  const t = text.toLowerCase()
  if (/refurb|in ?stock|stock drop|current stock/.test(t)) return 'refurb'
  if (/\bblog\b|read more|article|on the blog|new post/.test(t)) return 'blog'
  if (/\b(repair|fix|cracked|battery|screen|water damage|data recovery)\b/.test(t)) return 'repairs'
  if (/\b(macbook|laptop|dell|lenovo|surface|chromebook)\b/.test(t)) return 'laptops'
  if (/\b(iphone|samsung|pixel|android|phone)\b/.test(t)) return 'phones'
  if (/\b(team|crew|staff|day in the life|behind the scenes|meet )/.test(t)) return 'team'
  if (/\b(open|closed|today|this week|busy|new arrival|just in|shop|store)\b/.test(t)) return 'happenings'
  return null
}

export interface Photo {
  id: string
  url: string
  name: string
  tags: string[]
  folder_id?: string | null
  processed?: boolean
  created_date: string
}

export interface Folder {
  id: string
  name: string
  brand_id?: string | null
}

export interface Client {
  id: string
  name: string
  brand_profile_id?: string
  email?: string
  notes?: string
  portal_password?: string
  created_date: string
}

export interface Settings {
  timezone: string
  defaultPlatforms: string[]
  emailNotifications: boolean
  workspaceName: string
  autoSendOnApprove: boolean
  model: string
}

// ==================== UNIFIED WORKSPACE BRANDS ====================

export interface WorkspaceBrand {
  id: string
  userId: string
  // Core identity
  name: string
  tagline: string
  businessName: string
  industry: string
  location: string
  website: string
  phone: string
  address: string
  primaryColor: string
  logoUrl: string
  // Blog config
  authorName: string
  blogPath: string
  // Brand voice & content
  brandVoice: string
  postingInstructions?: string
  customRules?: BrandRule[]
  tone: 'professional' | 'casual' | 'playful' | 'luxury' | 'inspirational' | 'friendly'
  outputLength: 'short' | 'medium' | 'long'
  focusAreas: string[]
  // Social media
  includeHashtags: boolean
  includeEmojis: boolean
  socialHandles: {
    instagram?: string | null
    facebook?: string | null
    linkedin?: string | null
    tiktok?: string | null
    twitter?: string | null
  }
  platforms: string[]
  bufferChannels: string[]
  // Research & positioning
  mission: string
  values: string
  targetAudience: string
  uniqueValueProp: string
  competitors: string
  keyMessages: string[]
  // Posting schedule
  postingDays: string[]    // ['mon','wed','fri']
  postingTime: string      // '09:00'
  bufferProfileIds: string[] // Selected Buffer profile IDs for this brand
  // Replicate image model
  replicateModelVersion: string
  trainingStatus: 'idle' | 'training' | 'succeeded' | 'failed'
  trainingId: string
  triggerWord: string
  defaultAspectRatio?: string
  createdAt: string
  updatedAt: string
}

export interface BrandGoal {
  id: string
  brandId: string
  title: string
  description: string
  period: 'weekly' | 'monthly' | 'quarterly' | 'yearly'
  startDate: string
  endDate: string
  isActive: boolean
  createdAt: string
}

export interface BrandReport {
  id: string
  brandId: string
  userId: string
  title: string
  reportType: 'ai_research' | 'competitor' | 'audience' | 'market' | 'manual'
  content: string
  summary: string
  createdAt: string
}

/** @deprecated Use WorkspaceBrand instead */
export interface BlogBrand {
  id: string
  userId: string
  name: string
  tagline: string
  businessName: string
  location: string
  website: string
  industry: string
  primaryColor: string
  brandVoice: string
  focusAreas: string[]
  authorName: string
  blogPath: string
  createdAt: string
}

export interface BlogPost {
  id: string
  brandId: string
  slug: string
  title: string
  meta: string
  author: string
  content: string
  tags: string
  featuredImage?: string
  status: 'draft' | 'published'
  publishedDate?: string
  wordCount: number
  createdAt: string
  updatedAt: string
}

export const FOCUS_AREA_LABELS: Record<string, string> = {
  'repair-tips': 'Repair Tips & Guides',
  'tech-education': 'Tech Education',
  'business': 'Business & B2B',
  'community': 'Community & Local',
  'product': 'Products & Reviews',
  'behind-scenes': 'Behind the Scenes',
  'seasonal': 'Seasonal & Timely',
  'tutorials': 'Tutorials & How-Tos',
  'news': 'News & Updates',
  'case-studies': 'Case Studies',
  'opinions': 'Opinions & Thought Leadership',
}

export const DEFAULT_SETTINGS: Settings = {
  timezone: 'UTC',
  defaultPlatforms: ['instagram'],
  emailNotifications: true,
  workspaceName: 'My Agency',
  autoSendOnApprove: false,
  model: 'claude-sonnet-4-6',
}
