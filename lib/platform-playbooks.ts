/**
 * Platform playbooks — platform-native best practices injected into the system prompt.
 * Covers length, hook style, formatting, CTA, hashtags, and things to avoid per platform.
 */

export type PlatformKey = 'instagram' | 'facebook' | 'linkedin'

export interface PlatformPlaybook {
  key: PlatformKey
  name: string
  idealLength: string
  hookStyle: string
  formatting: string
  ctaStyle: string
  hashtags: string
  avoid: string[]
}

export const PLATFORM_PLAYBOOKS: Record<PlatformKey, PlatformPlaybook> = {
  instagram: {
    key: 'instagram',
    name: 'Instagram',
    idealLength:
      '125–300 characters for feed posts works best; the first line before the "more" cut-off must stand on its own.',
    hookStyle:
      'Scroll-stopping opener — specific, emotional, or a pattern interrupt. Lead with the payoff or tension, not preamble.',
    formatting:
      'Short paragraphs (1–3 lines). Strategic line breaks for scannability. Emojis OK in moderation — at natural pauses, not decoration.',
    ctaStyle:
      'Prompt saves, shares, DMs, or a specific action ("save this for later", "send this to someone who…"). Avoid generic "link in bio".',
    hashtags:
      '3–8 targeted hashtags max, placed at the end or in first comment. No walls of 30 tags. Mix niche + mid-size, no mega-broad (#love, #instagood).',
    avoid: [
      'Walls of text with no line breaks',
      'Hashtag stuffing (30-tag blocks)',
      'Over-polished corporate tone',
      'Generic openers ("Hey guys!", "We\'re excited to…")',
    ],
  },
  facebook: {
    key: 'facebook',
    name: 'Facebook',
    idealLength:
      '50–150 characters consistently outperform longer posts. Keep it tight, conversational.',
    hookStyle:
      'Relatable moment, community-oriented observation, or a genuine question. Feels like a neighbour talking, not a brand broadcasting.',
    formatting:
      'Conversational paragraphs, minimal line breaks. Emojis sparingly — one or two at most, where they earn it.',
    ctaStyle:
      'Community engagement — "tag a friend who…", "drop a comment if…", simple opinions/polls. Local/community framing works well.',
    hashtags:
      '0–2 hashtags only, often zero. Facebook is not a hashtag platform — tags look out of place.',
    avoid: [
      'Overly polished corporate-speak',
      'Hashtag stacks (they feel foreign here)',
      'External-link-first framing (FB deprioritises it)',
      'Long-form posts that belong on LinkedIn',
    ],
  },
  linkedin: {
    key: 'linkedin',
    name: 'LinkedIn',
    idealLength:
      '1,300–2,000 characters get the best reach. The first 2 lines (before "see more") must earn the click — pattern interrupt or curiosity gap.',
    hookStyle:
      'Contrarian observation, specific insight, or a before/after moment. Avoid "I\'m thrilled" — open with the idea, not the emotion.',
    formatting:
      'Short paragraphs — often single sentences on their own line, separated by blank lines. White space is your friend. Minimal emojis (0–2).',
    ctaStyle:
      'Invite discussion — "what\'s your take?", "curious how others handle this". Repost-worthy framing. Comments > likes on LinkedIn.',
    hashtags:
      '3–5 hashtags max, placed at the very end. Industry and topic tags, not brand tags.',
    avoid: [
      '"I\'m excited/thrilled/humbled to announce…"',
      'Humblebrag wrapped in false modesty',
      'Hashtag walls',
      'Emoji-heavy openers',
      'Pure self-promotion with no insight',
    ],
  },
}

const ALIAS_MAP: Record<string, PlatformKey> = {
  instagram: 'instagram',
  ig: 'instagram',
  insta: 'instagram',
  facebook: 'facebook',
  fb: 'facebook',
  meta: 'facebook',
  linkedin: 'linkedin',
  'linked-in': 'linkedin',
  li: 'linkedin',
}

function normalisePlatform(p: string): PlatformKey | null {
  const key = p.trim().toLowerCase()
  return ALIAS_MAP[key] || null
}

/**
 * Build the platform guidance block for injection into the system prompt.
 * Returns an empty string if no recognised platforms are provided.
 *
 * When multiple platforms are selected, the output defers to the most constrained
 * norms (e.g. if LinkedIn is in the mix, emoji guidance tightens).
 */
export function buildPlatformGuidance(platforms: string[]): string {
  const keys = Array.from(
    new Set(
      (platforms || [])
        .map(normalisePlatform)
        .filter((k): k is PlatformKey => !!k)
    )
  )

  if (keys.length === 0) return ''

  const books = keys.map(k => PLATFORM_PLAYBOOKS[k])
  const parts: string[] = []

  parts.push(`═══ PLATFORM PLAYBOOK${books.length > 1 ? 'S' : ''} ═══`)

  if (books.length === 1) {
    const b = books[0]
    parts.push(`Writing for ${b.name}. This caption must feel platform-native.`)
    parts.push(`\n• Length: ${b.idealLength}`)
    parts.push(`• Hook: ${b.hookStyle}`)
    parts.push(`• Format: ${b.formatting}`)
    parts.push(`• CTA: ${b.ctaStyle}`)
    parts.push(`• Hashtags: ${b.hashtags}`)
    parts.push(`• Avoid on ${b.name}: ${b.avoid.map(a => `"${a}"`).join('; ')}`)
  } else {
    parts.push(
      `Writing for ${books.map(b => b.name).join(' + ')}. The caption must read naturally across all selected platforms — defer to the most constrained norms where they conflict.`
    )
    for (const b of books) {
      parts.push(`\n— ${b.name} —`)
      parts.push(`Length: ${b.idealLength}`)
      parts.push(`Hook: ${b.hookStyle}`)
      parts.push(`Format: ${b.formatting}`)
      parts.push(`CTA: ${b.ctaStyle}`)
      parts.push(`Hashtags: ${b.hashtags}`)
    }

    // Cross-platform guardrails when mixing
    const combinedAvoid = new Set<string>()
    for (const b of books) for (const a of b.avoid) combinedAvoid.add(a)
    parts.push(`\nAvoid across the set: ${[...combinedAvoid].map(a => `"${a}"`).join('; ')}`)

    if (keys.includes('linkedin')) {
      parts.push(`\nNote: LinkedIn is in the mix — lean professional, minimise emojis, and keep any hashtags at the end.`)
    }
    if (keys.includes('facebook') && !keys.includes('linkedin')) {
      parts.push(`\nNote: Facebook is in the mix — keep hashtags minimal (0–2) and the tone conversational.`)
    }
  }

  return parts.join('\n')
}
