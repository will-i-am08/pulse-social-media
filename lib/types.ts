export type Role = 'admin' | 'team' | 'client'

export interface Profile {
  id: string
  display_name: string | null
  email: string | null
  role: Role
  workspace_id: string | null
  brand_id: string | null
}

export interface Brand {
  id: string
  name: string
  color: string
  website?: string
  tone: 'professional' | 'casual' | 'playful' | 'luxury' | 'inspirational' | 'friendly'
  output_length: 'short' | 'medium' | 'long'
  brand_guidelines?: string
  posting_instructions?: string
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

export interface Post {
  id: string
  brand_profile_id: string
  caption: string
  image_url?: string | null
  image_urls?: string[]
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
}

export const POST_CATEGORIES: { id: string; label: string }[] = [
  { id: 'holidays',   label: 'Public Holidays' },
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
  if (/holiday|christmas|easter|anzac|australia day|valentine|halloween|new year|mother'?s day|father'?s day|labour day|king'?s birthday|melbourne cup/.test(t)) return 'holidays'
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
  primaryColor: string
  logoUrl: string
  // Blog config
  authorName: string
  blogPath: string
  // Brand voice & content
  brandVoice: string
  postingInstructions?: string
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
