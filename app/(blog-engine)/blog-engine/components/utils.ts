import type { BlogPost, BlogBrand } from '@/lib/types'

// ===================== CONSTANTS =====================
export const SLUG_STOP = new Set([
  'the','a','an','is','are','was','how','to','for','your','in','on','at','of',
  'and','or','it','with','do','we','you','get','can','i','my','this','that',
  'from','by','up','what','why','when','where','will','would','not','no','but',
  'just','all','more','has','have',
])

// ===================== UTILITIES =====================
export function slugify(title: string, existing: string[] = []): string {
  const words = title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(w => w && !SLUG_STOP.has(w))
  const padded = [...words]
  while (padded.length < 3) padded.push(['guide','tips','blog'][padded.length % 3])
  const base = padded.slice(0, 3).join('-')
  if (!existing.includes(base)) return base
  for (let i = 2; i < 100; i++) { const c = `${base}-${i}`; if (!existing.includes(c)) return c }
  return `draft-${Date.now()}`
}

export function wordCount(text: string): number {
  return text.trim() ? text.trim().split(/\s+/).length : 0
}

export function computeGeoScore(post: Partial<BlogPost>, brand: BlogBrand | null): number {
  let score = 0
  const content = (post.content || '').toLowerCase()
  if (/frequently asked|## faq/i.test(content)) score += 2
  if (content.length > 200) score += 1
  const loc = brand?.location?.split(',')[0]?.toLowerCase()
  if (loc && content.includes(loc)) score += 1
  const tags = (post.tags || '').toLowerCase().split(',').map(t => t.trim()).filter(Boolean)
  if (tags.some(t => t.length > 3 && content.includes(t))) score += 1
  return Math.min(5, Math.max(1, score))
}

export function buildSchemaMarkup(post: Partial<BlogPost>, brand: BlogBrand | null): string {
  const isHowTo = /how[- ]to|guide|step.by.step|checklist/i.test(post.title || '')
  const graph = [
    isHowTo ? {
      '@type': 'HowTo',
      name: post.title,
      description: post.meta || '',
      author: { '@type': 'Person', name: post.author || brand?.authorName || '' },
      publisher: { '@type': 'Organization', name: brand?.businessName || brand?.name || '' },
      datePublished: post.publishedDate || new Date().toISOString().split('T')[0],
    } : {
      '@type': 'Article',
      headline: post.title,
      description: post.meta || '',
      author: { '@type': 'Person', name: post.author || brand?.authorName || '' },
      publisher: { '@type': 'Organization', name: brand?.businessName || brand?.name || '', url: brand?.website || '' },
      datePublished: post.publishedDate || new Date().toISOString().split('T')[0],
      wordCount: post.wordCount || 0,
    },
    {
      '@type': 'LocalBusiness',
      name: brand?.businessName || brand?.name || '',
      url: brand?.website || '',
      address: { '@type': 'PostalAddress', addressLocality: brand?.location || '' },
    },
  ]
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': graph }, null, 2)
}

// ===================== GEO SCORE DESCRIPTIONS =====================
export const GEO_SCORE_CRITERIA = [
  { label: 'FAQ Section', desc: 'Contains a "Frequently Asked" or "## FAQ" section (+2)' },
  { label: 'Content Length', desc: 'Content exceeds 200 characters (+1)' },
  { label: 'Location Mentions', desc: 'Mentions the brand\'s primary city/location (+1)' },
  { label: 'Keyword Coverage', desc: 'At least one tag keyword appears in the content (+1)' },
]
