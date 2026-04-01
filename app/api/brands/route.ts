import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { WorkspaceBrand } from '@/lib/types'

function rowToBrand(row: Record<string, unknown>): WorkspaceBrand {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: (row.name as string) || '',
    tagline: (row.tagline as string) || '',
    businessName: (row.business_name as string) || '',
    industry: (row.industry as string) || '',
    location: (row.location as string) || '',
    website: (row.website as string) || '',
    primaryColor: (row.primary_color as string) || '#8b5cf6',
    logoUrl: (row.logo_url as string) || '',
    authorName: (row.author_name as string) || '',
    blogPath: (row.blog_path as string) || '/blog',
    brandVoice: (row.brand_voice as string) || '',
    postingInstructions: (row.posting_instructions as string) || '',
    tone: ((row.tone as string) || 'professional') as WorkspaceBrand['tone'],
    outputLength: ((row.output_length as string) || 'medium') as WorkspaceBrand['outputLength'],
    focusAreas: (row.focus_areas as string[]) || [],
    includeHashtags: (row.include_hashtags as boolean) ?? true,
    includeEmojis: (row.include_emojis as boolean) ?? false,
    socialHandles: (row.social_handles as WorkspaceBrand['socialHandles']) || {},
    platforms: (row.platforms as string[]) || [],
    bufferChannels: (row.buffer_channels as string[]) || [],
    postingDays: (row.posting_days as string[]) || [],
    postingTime: (row.posting_time as string) || '09:00',
    bufferProfileIds: (row.buffer_profile_ids as string[]) || [],
    mission: (row.mission as string) || '',
    values: (row.values as string) || '',
    targetAudience: (row.target_audience as string) || '',
    uniqueValueProp: (row.unique_value_prop as string) || '',
    competitors: (row.competitors as string) || '',
    keyMessages: (row.key_messages as string[]) || [],
    replicateModelVersion: (row.replicate_model_version as string) || '',
    trainingStatus: ((row.training_status as string) || 'idle') as WorkspaceBrand['trainingStatus'],
    trainingId: (row.training_id as string) || '',
    triggerWord: (row.trigger_word as string) || '',
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const { data, error } = await supabase
    .from('workspace_brands')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data || []).map(rowToBrand))
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const row = {
    user_id: user.id,
    name: body.name || 'New Brand',
    tagline: body.tagline || '',
    business_name: body.businessName || '',
    industry: body.industry || '',
    location: body.location || '',
    website: body.website || '',
    primary_color: body.primaryColor || '#8b5cf6',
    logo_url: body.logoUrl || '',
    author_name: body.authorName || '',
    blog_path: body.blogPath || '/blog',
    brand_voice: body.brandVoice || '',
    posting_instructions: body.postingInstructions || '',
    tone: body.tone || 'professional',
    output_length: body.outputLength || 'medium',
    focus_areas: body.focusAreas || [],
    include_hashtags: body.includeHashtags ?? true,
    include_emojis: body.includeEmojis ?? false,
    social_handles: body.socialHandles || {},
    platforms: body.platforms || [],
    buffer_channels: body.bufferChannels || [],
    posting_days: body.postingDays || [],
    posting_time: body.postingTime || '09:00',
    buffer_profile_ids: body.bufferProfileIds || [],
    mission: body.mission || '',
    values: body.values || '',
    target_audience: body.targetAudience || '',
    unique_value_prop: body.uniqueValueProp || '',
    competitors: body.competitors || '',
    key_messages: body.keyMessages || [],
    replicate_model_version: body.replicateModelVersion || '',
    training_status: body.trainingStatus || 'idle',
    training_id: body.trainingId || '',
    trigger_word: body.triggerWord || '',
  }

  const { data, error } = await supabase
    .from('workspace_brands')
    .insert(row)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToBrand(data))
}

export async function PUT(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...rest } = body
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const update: Record<string, unknown> = { updated_at: new Date().toISOString() }
  const fieldMap: Record<string, string> = {
    name: 'name', tagline: 'tagline', businessName: 'business_name',
    industry: 'industry', location: 'location', website: 'website',
    primaryColor: 'primary_color', logoUrl: 'logo_url',
    authorName: 'author_name', blogPath: 'blog_path',
    brandVoice: 'brand_voice', postingInstructions: 'posting_instructions', tone: 'tone', outputLength: 'output_length',
    focusAreas: 'focus_areas', includeHashtags: 'include_hashtags', includeEmojis: 'include_emojis',
    socialHandles: 'social_handles', platforms: 'platforms', bufferChannels: 'buffer_channels',
    postingDays: 'posting_days', postingTime: 'posting_time', bufferProfileIds: 'buffer_profile_ids',
    mission: 'mission', values: 'values', targetAudience: 'target_audience',
    uniqueValueProp: 'unique_value_prop', competitors: 'competitors', keyMessages: 'key_messages',
    replicateModelVersion: 'replicate_model_version', trainingStatus: 'training_status',
    trainingId: 'training_id', triggerWord: 'trigger_word',
  }
  for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
    if (rest[jsKey] !== undefined) update[dbKey] = rest[jsKey]
  }

  const { data, error } = await supabase
    .from('workspace_brands')
    .update(update)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(rowToBrand(data))
}

export async function DELETE(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await supabase
    .from('workspace_brands')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
