import type { ActionType } from './types'

interface ActionDef {
  endpoint: string
  method: 'POST' | 'GET'
  buildBody: (config: Record<string, unknown>) => Record<string, unknown>
}

export const ACTION_REGISTRY: Record<ActionType, ActionDef> = {
  'generate-blog-ideas': {
    endpoint: '/api/blog/generate-ideas',
    method: 'POST',
    buildBody: (c) => ({ brandId: c.brandId, count: c.count || 5, focusArea: c.focusArea || 'all' }),
  },
  'generate-blog-post': {
    endpoint: '/api/blog/generate-post',
    method: 'POST',
    buildBody: (c) => ({ brandId: c.brandId, title: c.title, tags: c.tags || '', postType: c.postType || 'blog' }),
  },
  'publish-blog-post': {
    endpoint: '/api/blog/posts',
    method: 'POST',
    buildBody: (c) => ({ id: c.postId, status: 'published', publishedDate: new Date().toISOString() }),
  },
  'seo-audit-onpage': {
    endpoint: '/api/seo-onpage',
    method: 'POST',
    buildBody: (c) => ({ url: c.url }),
  },
  'seo-audit-technical': {
    endpoint: '/api/seo-technical',
    method: 'POST',
    buildBody: (c) => ({ url: c.url }),
  },
  'keyword-research': {
    endpoint: '/api/seo-keywords',
    method: 'POST',
    buildBody: (c) => ({ seedKeyword: c.seedKeyword, brandId: c.brandId }),
  },
  'ai-visibility-audit': {
    endpoint: '/api/geo-audit',
    method: 'POST',
    buildBody: (c) => ({ targetUrl: c.url }),
  },
  'generate-image': {
    endpoint: '/api/generate-image',
    method: 'POST',
    buildBody: (c) => ({ modelVersion: c.modelVersion, prompt: c.prompt, width: c.width || 1024, height: c.height || 1024 }),
  },
  'generate-social-caption': {
    endpoint: '/api/automations/social-caption',
    method: 'POST',
    buildBody: (c) => ({ brandId: c.brandId, platforms: c.platforms || ['instagram'], prompt: c.prompt || '', tone: c.tone || '' }),
  },
  'create-social-post': {
    endpoint: '/api/automations/social-post',
    method: 'POST',
    buildBody: (c) => ({ brandId: c.brandId, caption: c.caption || '', platforms: c.platforms || ['instagram'], status: c.status || 'draft', scheduledAt: c.scheduledAt || null }),
  },
  'create-posts-from-folder': {
    endpoint: '/api/automations/folder-posts',
    method: 'POST',
    buildBody: (c) => ({ folderId: c.folderId, brandId: c.brandId, platforms: c.platforms || ['instagram'], status: c.status || 'draft', count: c.count || 1, prompt: c.prompt || '' }),
  },
  'send-notification': {
    endpoint: '__internal__',
    method: 'POST',
    buildBody: (c) => ({ message: c.message }),
  },
  'ai-prompt': {
    endpoint: '/api/claude',
    method: 'POST',
    buildBody: (c) => ({ systemPrompt: c.systemPrompt || '', userContent: c.userContent || c.prompt || '', maxTokens: 2048, model: 'claude-haiku-4-5-20251001' }),
  },
}
