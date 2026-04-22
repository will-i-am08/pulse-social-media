/**
 * CaptionCraft Caption Engine v2
 * ==============================
 * A context-aware, variation-driven caption generation engine.
 *
 * Key capabilities:
 * 1. Context awareness — analyses recent captions to prevent repetition
 * 2. Structured rules — categories, priorities, platform conditions, frequency
 * 3. Variation presets — automatic or manual structural variety
 * 4. Feedback loop — learns from rated captions to improve over time
 */

import type { BrandRule } from './types'
import { buildPlatformGuidance } from './platform-playbooks'
import { buildHumanRules } from './human-rules'

// ─── Enhanced Rule Types ─────────────────────────────────────────────

export type RuleCategory = 'tone' | 'structure' | 'content' | 'formatting' | 'cta' | 'hook' | 'general'
export type RulePriority = 'must' | 'should' | 'nice-to-have'
export type RuleFrequency = 'always' | 'often' | 'sometimes' | 'rarely'

export interface EnhancedBrandRule extends BrandRule {
  category: RuleCategory
  priority: RulePriority
  platforms: string[]       // empty array = all platforms
  frequency: RuleFrequency
}

/** Upgrade a legacy BrandRule to an EnhancedBrandRule with sensible defaults */
export function upgradeRule(rule: BrandRule): EnhancedBrandRule {
  const r = rule as Partial<EnhancedBrandRule> & BrandRule
  return {
    ...rule,
    category: r.category || 'general',
    priority: r.priority || 'must',
    platforms: r.platforms || [],
    frequency: r.frequency || 'always',
  }
}

// ─── Rule Metadata (for UI) ─────────────────────────────────────────

export const RULE_CATEGORIES: { id: RuleCategory; label: string; description: string }[] = [
  { id: 'hook', label: 'Hook / Opening', description: 'How the caption starts — first line that stops the scroll' },
  { id: 'tone', label: 'Tone & Voice', description: 'The feel, attitude, and personality of the writing' },
  { id: 'structure', label: 'Structure & Format', description: 'How the caption is organised — length, paragraphs, line breaks' },
  { id: 'content', label: 'Content & Topics', description: 'What to include or exclude in the actual message' },
  { id: 'cta', label: 'Call to Action', description: 'How the caption ends — what you want the reader to do' },
  { id: 'formatting', label: 'Formatting & Style', description: 'Hashtags, emojis, capitalisation, punctuation rules' },
  { id: 'general', label: 'General', description: 'Catch-all for rules that don\'t fit elsewhere' },
]

export const RULE_PRIORITIES: { id: RulePriority; label: string; description: string }[] = [
  { id: 'must', label: 'Must Follow', description: 'Non-negotiable — the AI must always follow this rule' },
  { id: 'should', label: 'Should Follow', description: 'Important but can be bent if it conflicts with other rules' },
  { id: 'nice-to-have', label: 'Nice to Have', description: 'Apply when it fits naturally — don\'t force it' },
]

export const RULE_FREQUENCIES: { id: RuleFrequency; label: string; description: string }[] = [
  { id: 'always', label: 'Always', description: 'Apply to every caption' },
  { id: 'often', label: 'Often', description: 'Apply to most captions (~80%)' },
  { id: 'sometimes', label: 'Sometimes', description: 'Apply to some captions (~40%)' },
  { id: 'rarely', label: 'Rarely', description: 'Occasional use for variety (~15%)' },
]

// ─── Variation Presets ──────────────────────────────────────────────

export interface VariationPreset {
  id: string
  name: string
  emoji: string
  description: string
  instructions: string
}

export const VARIATION_PRESETS: VariationPreset[] = [
  {
    id: 'storytelling',
    name: 'Storytelling',
    emoji: '📖',
    description: 'Narrative arc with an emotional hook',
    instructions: `CAPTION STRUCTURE — Storytelling:
1. Open with a vivid, specific moment or scene (not a generic statement)
2. Build a brief narrative — what happened, what changed, what was felt
3. Land on a key insight or lesson drawn from the story
4. Close with a soft CTA that ties back to the narrative

Voice: First person or "we". Conversational, warm, human. Paint a picture with sensory details.
DO: Name specific people, places, times — "Tuesday morning", "a 2012 Hilux", "the third coffee". Anchor the scene.
DON'T: Start with "We" or "I" as the very first word. Generic openers like "Ever wondered..." or "Picture this:".`
  },
  {
    id: 'question-led',
    name: 'Question Led',
    emoji: '❓',
    description: 'Opens with a provocative question',
    instructions: `CAPTION STRUCTURE — Question Led:
1. Open with a thought-provoking, specific question (not yes/no)
2. Add 1–2 sentences that build tension or challenge assumptions
3. Deliver an unexpected answer or perspective shift
4. Close with an engagement prompt — ask the audience to share their take

Voice: Curious, slightly provocative, inviting debate. Like you're genuinely asking.
Avoid: Rhetorical questions with obvious answers. Questions that feel like clickbait.`
  },
  {
    id: 'bold-statement',
    name: 'Bold Statement',
    emoji: '💥',
    description: 'Leads with a strong claim or opinion',
    instructions: `CAPTION STRUCTURE — Bold Statement:
1. Open with a confident, possibly contrarian claim (pattern interrupt)
2. Back it up with 2–3 sentences of reasoning or evidence
3. Acknowledge the nuance or counterpoint briefly
4. Close with a direct, action-oriented CTA

Voice: Confident, authoritative, slightly edgy. Like a LinkedIn thought leader who actually knows their stuff.
Avoid: Being reckless or offensive. Empty hot takes without substance.`
  },
  {
    id: 'list-tips',
    name: 'Quick Tips',
    emoji: '📋',
    description: 'Numbered tips or key takeaways',
    instructions: `CAPTION STRUCTURE — Quick Tips:
1. Open with a hook that promises specific value (e.g., "3 things we learned from...")
2. Deliver 3–5 concise, actionable points — each on its own line
3. End with a summary sentence or engagement prompt
4. CTA should relate to the tips (save this, share with someone who needs it)

Voice: Clear, direct, generous with knowledge. Teacher energy.
Avoid: More than 5 tips (keep it digestible). Vague or obvious advice.`
  },
  {
    id: 'behind-the-scenes',
    name: 'Behind the Scenes',
    emoji: '🎬',
    description: 'Casual, authentic peek behind the curtain',
    instructions: `CAPTION STRUCTURE — Behind the Scenes:
1. Open with a candid, casual hook (like you're letting them in on a secret)
2. Share a specific moment, process detail, or honest reflection
3. Connect it to why it matters — for the brand, team, or customer
4. Close with a warm, low-pressure engagement ask

Voice: Authentic, relaxed, unpolished-on-purpose. Like a voice memo to a friend.
Avoid: Sounding performative about being "real". Corporate-speak disguised as casual.`
  },
  {
    id: 'social-proof',
    name: 'Social Proof',
    emoji: '⭐',
    description: 'Testimonial, result, or case study',
    instructions: `CAPTION STRUCTURE — Social Proof:
1. Open with a specific result, quote, or transformation (the payoff first)
2. Briefly tell the backstory — who, what problem, what happened
3. Highlight what made the difference
4. Close with a CTA that invites the reader to get the same result

Voice: Proud but not boastful. Let the result speak for itself. Specific numbers and details.
Avoid: Fake-sounding testimonials. Vague claims like "our clients love us".`
  },
  {
    id: 'educational',
    name: 'Educational',
    emoji: '🧠',
    description: 'Teach something valuable, lead with insight',
    instructions: `CAPTION STRUCTURE — Educational:
1. Open with a specific misconception or a counterintuitive fact (skip "Did you know…?" framing — state the fact directly)
2. Explain the concept clearly in 2–3 sentences, no jargon — like you\'d explain it to a friend over coffee
3. Give a practical takeaway — one concrete thing the reader should do differently
4. Close with a save/share CTA or an engagement question

Voice: Knowledgeable but approachable. Think "smart friend explains" not "textbook".
DO: Use a number, a before/after, or a concrete example. "Most people think X. Actually, Y."
DON'T: Lecture. Oversimplify to the point of being wrong. Open with "Did you know…" (too tired).`
  },
  {
    id: 'conversational',
    name: 'Conversational',
    emoji: '💬',
    description: 'Casual, like talking to a friend',
    instructions: `CAPTION STRUCTURE — Conversational:
1. Open like you're mid-conversation — sentence fragment OK, mid-thought OK (no formal intro)
2. Share a thought, observation, or experience in plain spoken language
3. Make it relatable on a specific moment, not a generic concept — the reader should think "same"
4. Close with a casual question that invites a quick reply (not "what do you think?" — be more specific)

Voice: Warm, relatable, slightly stream-of-consciousness. Contractions, natural rhythm, line breaks at speech-pause points.
DO: Use asides in parentheses or on their own line. Sentence fragments. The occasional "honestly,".
DON'T: Try-hard slang. Generic "What do you think?" closers. Opening with "Okay, so…" — it's become a tell.`
  },
  {
    id: 'hot-take',
    name: 'Hot Take',
    emoji: '🔥',
    description: 'Bold opinion to spark engagement',
    instructions: `CAPTION STRUCTURE — Hot Take:
1. Open with a polarising opinion or unpopular perspective
2. Explain your reasoning in 2–3 punchy sentences
3. Invite disagreement — make it safe to push back
4. Close with "agree or disagree?" or similar engagement driver

Voice: Opinionated but thoughtful. Provocative, not aggressive. Willing to be wrong.
Avoid: Being genuinely offensive. Taking positions the brand can't defend.`
  },
  {
    id: 'minimal',
    name: 'Minimal / Poetic',
    emoji: '✨',
    description: 'Short, impactful, lots of white space',
    instructions: `CAPTION STRUCTURE — Minimal:
1. Keep it to 1–3 short lines max — often just one
2. Every word must earn its place — if you can cut it, cut it
3. Line breaks only where they change meaning or pace
4. CTA can be a single word, a question fragment, or implied

Voice: Intentional, atmospheric, confident in the silence. Let the image do heavy lifting.
DO: Concrete nouns. Verbs that do real work. One striking image or idea per line.
DON'T: Vague poetry, one-word philosophy ("Growth."), or cryptic-for-the-sake-of-cryptic. Avoid emojis entirely in this style.`
  },
  {
    id: 'pas',
    name: 'Problem-Agitate-Solution',
    emoji: '📉',
    description: 'Classic direct-response framework — name the pain, sting it, offer the fix',
    instructions: `CAPTION STRUCTURE — Problem-Agitate-Solution (PAS):
1. PROBLEM — Name a specific, real pain the audience feels (not vague — exact)
2. AGITATE — Make it sting. Describe what it costs them: time, money, stress, missed chances
3. SOLUTION — Offer the fix with confidence. What you do, what changes, what they get
4. CTA — A direct next step (book, DM, walk in, click, reply)

Voice: Empathic about the pain, confident about the fix. Not preachy — you've been there too.
DO: Use specifics — "waiting 3 weeks for a repair", "paying $200 for what takes 20 minutes". Make the problem concrete.
DON'T: Exaggerate into scare-tactics. Skip the agitate step (it's what makes PAS work). Pivot too fast.`
  },
  {
    id: 'bab',
    name: 'Before-After-Bridge',
    emoji: '🌉',
    description: 'Paint the old reality, the new reality, and the bridge between them',
    instructions: `CAPTION STRUCTURE — Before-After-Bridge (BAB):
1. BEFORE — Paint the old reality vividly. What life/work/the problem looked like
2. AFTER — Paint the new reality just as vividly. What it looks like now
3. BRIDGE — The specific thing that got them from A to B (your product, service, approach)
4. CTA — Invite them to cross the bridge themselves

Voice: Visual, grounded, results-focused. The contrast does the heavy lifting.
DO: Use sensory or concrete details in both the before AND after — "cracked screen you kept apologising for" → "back to looking new".
DON'T: Make the before too bleak or the after too glossy — credibility matters. Skip the bridge (it's the whole point).`
  },
  {
    id: 'curiosity-gap',
    name: 'Curiosity Gap',
    emoji: '🔍',
    description: 'Tease something surprising, hold the answer, pay off at the end',
    instructions: `CAPTION STRUCTURE — Curiosity Gap (Open Loop):
1. HOOK — Tease a surprising outcome, fact, or question that demands an answer. No spoilers
2. BUILD — 2–3 sentences that deepen the intrigue — stakes, context, what's at play
3. PAYOFF — Resolve the loop with the actual insight or reveal. Make it worth the wait
4. CTA — Natural next step that rides the reveal's momentum

Voice: Confident, a little mysterious, earns the reveal. Never clickbait-cheap.
DO: Make the hook specific ("The $15 part that stops 80% of iPhone 12 screen issues" beats "This changes everything"). Pay off fully at the end.
DON'T: Tease and fail to deliver — that kills trust. Use hollow teases like "You won't believe what happened next".`
  },
  {
    id: 'natural-speech',
    name: 'Natural Speech',
    emoji: '🗣️',
    description: 'Write it like you\'d say it out loud — the hardest-leaning anti-AI preset',
    instructions: `CAPTION STRUCTURE — Natural Speech:
1. Open the way you'd actually talk — not the way you'd write. Fragment is fine. Mid-thought is fine.
2. Use contractions, asides, the occasional "honestly" or "look," — the verbal tics of real speech
3. Let the rhythm break. Short line. Then a longer one that runs a bit because that's how you'd say it.
4. Close the way a voice memo would end — a thought, not a marketing CTA. Or a specific, low-pressure ask.

Voice: You, talking to a mate. Unpolished on purpose. Resist the urge to smooth it.
DO: Sentence fragments. Parenthetical asides. Starting sentences with "and" or "but". The occasional "yeah".
DON'T: Use any AI filler ("In today's…", "Here's the thing", "Let me tell you"). No triple-parallel cadence. No forced casualness ("hey fam!"). Skip hashtags unless required — they break the voice.`
  },
]

// ─── Feedback Types ─────────────────────────────────────────────────

export interface CaptionFeedback {
  id: string
  brandId: string
  postId: string
  captionText: string
  rating: number          // 1–5
  tags: string[]
  notes: string
  variationPreset: string
  platforms: string[]
  createdAt: string
}

export const FEEDBACK_TAGS = {
  positive: [
    { id: 'great-hook', label: 'Great Hook', description: 'Opening line is engaging' },
    { id: 'strong-cta', label: 'Strong CTA', description: 'Call to action is compelling' },
    { id: 'on-brand', label: 'On Brand', description: 'Matches the brand voice well' },
    { id: 'creative', label: 'Creative', description: 'Original and fresh approach' },
    { id: 'good-length', label: 'Good Length', description: 'Perfect length for the platform' },
    { id: 'engaging', label: 'Engaging', description: 'Makes you want to interact' },
    { id: 'human-sounding', label: 'Human Sounding', description: 'Reads like a real person wrote it' },
    { id: 'good-rhythm', label: 'Good Rhythm', description: 'Sentence flow and cadence feel natural' },
    { id: 'specific-detail', label: 'Specific Detail', description: 'Concrete names, numbers, moments — not vague' },
    { id: 'platform-native', label: 'Platform Native', description: 'Feels at home on the chosen platform' },
  ],
  negative: [
    { id: 'weak-hook', label: 'Weak Hook', description: 'Opening doesn\'t grab attention' },
    { id: 'weak-cta', label: 'Weak CTA', description: 'CTA is generic or missing' },
    { id: 'off-brand', label: 'Off Brand', description: 'Doesn\'t match the brand voice' },
    { id: 'too-generic', label: 'Too Generic', description: 'Could be for any brand' },
    { id: 'too-long', label: 'Too Long', description: 'Needs to be shorter' },
    { id: 'too-short', label: 'Too Short', description: 'Needs more substance' },
    { id: 'repetitive', label: 'Repetitive', description: 'Too similar to recent captions' },
    { id: 'wrong-tone', label: 'Wrong Tone', description: 'Tone doesn\'t fit' },
    { id: 'sounds-ai', label: 'Sounds AI', description: 'Reads like ChatGPT defaults — filler phrases, stilted' },
    { id: 'too-formal', label: 'Too Formal', description: 'Overly polished, lacks a human voice' },
    { id: 'too-vague', label: 'Too Vague', description: 'No concrete detail — could be about anything' },
    { id: 'wrong-platform-feel', label: 'Wrong Platform Feel', description: 'Doesn\'t match how the platform actually reads' },
    { id: 'parallel-cadence', label: 'Parallel Cadence', description: 'Triple-parallel "Not X. Not Y. But Z." AI pattern' },
  ],
}

// ─── Caption Context Analysis ───────────────────────────────────────

interface CaptionAnalysis {
  recentHooks: string[]
  recentCTAs: string[]
  recentPhrases: string[]
  structurePatterns: string[]
  presetHistory: string[]
}

/** Analyse recent captions to extract patterns for anti-repetition context */
export function analyseRecentCaptions(
  captions: { caption: string; variationPreset?: string }[],
  count = 10
): CaptionAnalysis {
  const recent = captions.slice(0, count)

  const recentHooks = recent
    .map(c => {
      const firstLine = c.caption.split('\n').find(l => l.trim())
      return firstLine?.trim().slice(0, 100) || ''
    })
    .filter(Boolean)

  const recentCTAs = recent
    .map(c => {
      const lines = c.caption.split('\n').filter(l => l.trim())
      const last = lines[lines.length - 1]?.trim() || ''
      // Skip if it's just hashtags
      if (last.startsWith('#') && !last.includes(' ')) return ''
      return last.slice(0, 100)
    })
    .filter(Boolean)

  // Extract frequently used phrases (3+ word sequences that appear 2+ times)
  const phraseMap = new Map<string, number>()
  for (const c of recent) {
    const words = c.caption.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/)
    for (let i = 0; i <= words.length - 3; i++) {
      const phrase = words.slice(i, i + 3).join(' ')
      phraseMap.set(phrase, (phraseMap.get(phrase) || 0) + 1)
    }
  }
  const recentPhrases = [...phraseMap.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([phrase]) => phrase)

  // Detect structural patterns
  const structurePatterns: string[] = []
  const questionOpeners = recent.filter(c => c.caption.trim().split('\n')[0]?.includes('?')).length
  const listPosts = recent.filter(c => /^\d[\.\)]/m.test(c.caption)).length
  const shortPosts = recent.filter(c => c.caption.length < 100).length

  if (questionOpeners > recent.length * 0.4) structurePatterns.push('Too many question openers recently')
  if (listPosts > recent.length * 0.3) structurePatterns.push('Too many list-format posts recently')
  if (shortPosts > recent.length * 0.5) structurePatterns.push('Too many short posts recently')

  const presetHistory = recent
    .map(c => c.variationPreset || '')
    .filter(Boolean)

  return { recentHooks, recentCTAs, recentPhrases, structurePatterns, presetHistory }
}

// ─── Variation Preset Selection ─────────────────────────────────────

/** Select a preset that hasn't been used recently, or the manually chosen one */
export function selectVariationPreset(
  mode: 'auto' | string,
  recentPresets: string[] = []
): VariationPreset {
  // Manual selection
  if (mode !== 'auto') {
    const preset = VARIATION_PRESETS.find(p => p.id === mode)
    if (preset) return preset
  }

  // Auto: pick the least-recently-used preset
  const recentSet = new Set(recentPresets.slice(0, 5))
  const unused = VARIATION_PRESETS.filter(p => !recentSet.has(p.id))

  if (unused.length > 0) {
    // Pick randomly from unused presets for additional variety
    return unused[Math.floor(Math.random() * unused.length)]
  }

  // All used recently — pick the one used longest ago
  for (const preset of VARIATION_PRESETS) {
    const lastUsed = recentPresets.indexOf(preset.id)
    if (lastUsed === -1 || lastUsed >= recentPresets.length - 3) {
      return preset
    }
  }

  // Fallback: random
  return VARIATION_PRESETS[Math.floor(Math.random() * VARIATION_PRESETS.length)]
}

// ─── Rule Processing ────────────────────────────────────────────────

interface ProcessedRules {
  mandatory: string[]
  preferred: string[]
  optional: string[]
}

/** Filter and sort rules by priority, platform, and frequency */
export function processRules(
  rules: (BrandRule | EnhancedBrandRule)[],
  platform: string,
  scope: 'caption' | 'blog' = 'caption'
): ProcessedRules {
  const enhanced = rules.map(upgradeRule)

  const applicable = enhanced.filter(r => {
    if (!r.enabled) return false
    if (r.appliesTo !== 'both' && r.appliesTo !== scope) return false
    if (!r.prompt.trim()) return false
    if (r.platforms.length > 0 && !r.platforms.includes(platform)) return false
    return true
  })

  // Apply frequency filtering for non-"always" rules
  const active = applicable.filter(r => {
    if (r.frequency === 'always') return true
    const roll = Math.random()
    if (r.frequency === 'often') return roll < 0.8
    if (r.frequency === 'sometimes') return roll < 0.4
    if (r.frequency === 'rarely') return roll < 0.15
    return true
  })

  const mandatory = active
    .filter(r => r.priority === 'must')
    .map(r => formatRule(r))

  const preferred = active
    .filter(r => r.priority === 'should')
    .map(r => formatRule(r))

  const optional = active
    .filter(r => r.priority === 'nice-to-have')
    .map(r => formatRule(r))

  return { mandatory, preferred, optional }
}

function formatRule(r: EnhancedBrandRule): string {
  const category = RULE_CATEGORIES.find(c => c.id === r.category)
  const prefix = category && r.category !== 'general' ? `[${category.label}] ` : ''
  return `${prefix}${r.label ? r.label + ': ' : ''}${r.prompt.trim()}`
}

// ─── Feedback Context Builder ───────────────────────────────────────

interface FeedbackSummary {
  likedPatterns: string[]
  dislikedPatterns: string[]
  preferredPresets: string[]
  avoidedPresets: string[]
}

/** Summarise feedback data into generation context */
export function summariseFeedback(feedback: CaptionFeedback[]): FeedbackSummary {
  if (!feedback.length) return { likedPatterns: [], dislikedPatterns: [], preferredPresets: [], avoidedPresets: [] }

  const liked = feedback.filter(f => f.rating >= 4)
  const disliked = feedback.filter(f => f.rating <= 2)

  // Count tags
  const likedTagCounts = new Map<string, number>()
  const dislikedTagCounts = new Map<string, number>()

  for (const f of liked) {
    for (const tag of f.tags) likedTagCounts.set(tag, (likedTagCounts.get(tag) || 0) + 1)
  }
  for (const f of disliked) {
    for (const tag of f.tags) dislikedTagCounts.set(tag, (dislikedTagCounts.get(tag) || 0) + 1)
  }

  const likedPatterns = [...likedTagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => {
      const meta = [...FEEDBACK_TAGS.positive, ...FEEDBACK_TAGS.negative].find(t => t.id === tag)
      return `${meta?.label || tag} (rated positively ${count}x)`
    })

  const dislikedPatterns = [...dislikedTagCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tag, count]) => {
      const meta = [...FEEDBACK_TAGS.positive, ...FEEDBACK_TAGS.negative].find(t => t.id === tag)
      return `${meta?.label || tag} (rated negatively ${count}x)`
    })

  // Preferred / avoided presets
  const presetRatings = new Map<string, { total: number; count: number }>()
  for (const f of feedback) {
    if (!f.variationPreset) continue
    const entry = presetRatings.get(f.variationPreset) || { total: 0, count: 0 }
    entry.total += f.rating
    entry.count++
    presetRatings.set(f.variationPreset, entry)
  }

  const preferredPresets = [...presetRatings.entries()]
    .filter(([, v]) => v.count >= 2 && v.total / v.count >= 4)
    .map(([id]) => VARIATION_PRESETS.find(p => p.id === id)?.name || id)

  const avoidedPresets = [...presetRatings.entries()]
    .filter(([, v]) => v.count >= 2 && v.total / v.count <= 2)
    .map(([id]) => VARIATION_PRESETS.find(p => p.id === id)?.name || id)

  return { likedPatterns, dislikedPatterns, preferredPresets, avoidedPresets }
}

// ─── Master Prompt Builder ──────────────────────────────────────────

export interface CaptionEngineInput {
  // Brand data
  brand: {
    name: string
    brand_voice?: string
    brandVoice?: string
    tone?: string
    output_length?: string
    outputLength?: string
    include_hashtags?: boolean
    includeHashtags?: boolean
    include_emojis?: boolean
    includeEmojis?: boolean
    brand_guidelines?: string
    brandGuidelines?: string
    posting_instructions?: string
    postingInstructions?: string
    custom_rules?: BrandRule[]
    customRules?: BrandRule[]
    key_messages?: string[]
    keyMessages?: string[]
    target_audience?: string
    targetAudience?: string
    website?: string
    phone?: string
    address?: string
  }
  // Generation params
  platforms: string[]
  userPrompt?: string
  hasImage: boolean
  hasMultipleImages?: boolean
  // Context
  recentCaptions: { caption: string; variationPreset?: string }[]
  feedback: CaptionFeedback[]
  // Variation
  variationMode: 'auto' | string
  // Goals
  goals?: { period: string; title: string; description?: string }[]
  // Rule scope — 'caption' for feed posts, 'blog' for blog-promo captions
  scope?: 'caption' | 'blog'
}

export interface CaptionEngineOutput {
  systemPrompt: string
  userPrompt: string
  selectedPreset: VariationPreset
}

/** Build the full enhanced prompt for caption generation */
export function buildEnhancedPrompt(input: CaptionEngineInput): CaptionEngineOutput {
  const {
    brand,
    platforms,
    userPrompt: rawPrompt,
    hasImage,
    hasMultipleImages,
    recentCaptions,
    feedback,
    variationMode,
    goals,
    scope,
  } = input

  // Normalise brand fields (handle both camelCase and snake_case)
  const brandVoice = brand.brand_voice || brand.brandVoice || ''
  const tone = brand.tone || 'professional'
  const length = brand.output_length || brand.outputLength || 'medium'
  const includeHashtags = brand.include_hashtags ?? brand.includeHashtags ?? true
  const includeEmojis = brand.include_emojis ?? brand.includeEmojis ?? false
  const brandGuidelines = brand.brand_guidelines || brand.brandGuidelines || ''
  const postingInstructions = brand.posting_instructions || brand.postingInstructions || ''
  const rules = brand.custom_rules || brand.customRules || []
  const keyMessages = brand.key_messages || brand.keyMessages || []
  const targetAudience = brand.target_audience || brand.targetAudience || ''
  const website = (brand.website || '').trim()
  const phone = (brand.phone || '').trim()
  const address = (brand.address || '').trim()

  // 1. Analyse recent captions for context
  const analysis = analyseRecentCaptions(recentCaptions)

  // 2. Select variation preset
  const preset = selectVariationPreset(variationMode, analysis.presetHistory)

  // 3. Process rules for primary platform
  const primaryPlatform = platforms[0] || 'instagram'
  const processedRules = processRules(rules, primaryPlatform, scope || 'caption')

  // 4. Summarise feedback
  const feedbackSummary = summariseFeedback(feedback)

  // ─── Build System Prompt ────────────────────────────────────────

  const systemParts: string[] = []

  // Core identity
  systemParts.push(`You are an expert social media copywriter for "${brand.name}". You write platform-native, engaging content that feels human — never generic, never templated.`)
  systemParts.push(`Write ONLY the caption text. No commentary, explanations, labels, or quotation marks.`)

  // Precedence directive — brand section below is authoritative over every default that follows
  const hasBrandRules = processedRules.mandatory.length > 0 || processedRules.preferred.length > 0 || processedRules.optional.length > 0
  const hasBrandContent = hasBrandRules || !!brandVoice || !!brandGuidelines || !!postingInstructions
  if (hasBrandContent) {
    systemParts.push(`\n═══ PRECEDENCE ═══\nThe BRAND section below defines this client's voice and non-negotiable rules. It overrides every default that follows — including the human voice rules, today's caption style, and the platform playbook. When anything downstream conflicts with a brand rule, the brand rule wins.`)
  }

  // ─── BRAND SECTION (highest priority) ─────────────────────────────

  // Brand voice
  if (brandVoice) {
    systemParts.push(`\nBRAND VOICE:\n${brandVoice}`)
  }

  // Structured brand rules — grouped by priority
  if (hasBrandRules) {
    systemParts.push(`\n═══ BRAND RULES ═══`)
    if (processedRules.mandatory.length) {
      systemParts.push(`MUST FOLLOW (non-negotiable):\n${processedRules.mandatory.map(r => `• ${r}`).join('\n')}`)
    }
    if (processedRules.preferred.length) {
      systemParts.push(`SHOULD FOLLOW (strongly preferred):\n${processedRules.preferred.map(r => `• ${r}`).join('\n')}`)
    }
    if (processedRules.optional.length) {
      systemParts.push(`NICE TO HAVE (use when it fits naturally):\n${processedRules.optional.map(r => `• ${r}`).join('\n')}`)
    }
  }

  // Legacy posting instructions
  if (postingInstructions) {
    systemParts.push(`\nADDITIONAL BRAND INSTRUCTIONS:\n${postingInstructions}`)
  }

  // Brand guidelines
  if (brandGuidelines) {
    systemParts.push(`\nBRAND GUIDELINES:\n${brandGuidelines}`)
  }

  // Target audience
  if (targetAudience) {
    systemParts.push(`\nTARGET AUDIENCE:\n${targetAudience}`)
  }

  // Key messages
  if (keyMessages.length > 0) {
    systemParts.push(`\nKEY BRAND MESSAGES:\n${keyMessages.map(m => `- ${m}`).join('\n')}`)
  }

  // Contact rotation — stop every caption defaulting to the website.
  // Pick one of the configured contact details (or none) per generation so
  // posts rotate between website / phone / address naturally.
  const contactPool: { kind: 'website' | 'phone' | 'address'; value: string }[] = []
  if (website) contactPool.push({ kind: 'website', value: website })
  if (phone) contactPool.push({ kind: 'phone', value: phone })
  if (address) contactPool.push({ kind: 'address', value: address })

  if (contactPool.length > 0) {
    // Weight the contact options 3x against a single "none" slot so only
    // ~1 in (3N+1) captions skip contact details entirely (roughly 10%
    // with three contacts configured). Most posts should have a CTA.
    const options: (typeof contactPool[number] | null)[] = [
      ...contactPool,
      ...contactPool,
      ...contactPool,
      null,
    ]
    const chosen = options[Math.floor(Math.random() * options.length)]
    systemParts.push(`\n═══ CONTACT DETAIL FOR THIS POST ═══`)
    if (chosen) {
      const label = chosen.kind === 'website' ? 'website URL' : chosen.kind === 'phone' ? 'phone number' : 'address'
      systemParts.push(`If the caption calls for a contact detail or CTA, use ONLY this ${label}: ${chosen.value}`)
      systemParts.push(`Do NOT mention any other contact detail (website, phone, or address). Rotate naturally — do not force it if the caption reads better without one.`)

      // CRITICAL: match the CTA verb to the contact type. Mixing them creates
      // nonsense like "drop it off at example.com" or "call us at 123 Main St".
      if (chosen.kind === 'website') {
        systemParts.push(`CTA LANGUAGE RULE: Because the contact detail is a website URL, the CTA verbs must match a URL — "visit", "book online", "head to", "check out", "learn more at", "details at". NEVER use physical-visit verbs ("walk in", "drop in", "drop it off", "pop in", "come by") with a URL — you cannot walk into a website. NEVER use call verbs ("call", "ring", "phone") with a URL. Even if the brand guidelines suggest walk-in or call CTAs, swap them for website-appropriate language for this post.`)
      } else if (chosen.kind === 'phone') {
        systemParts.push(`CTA LANGUAGE RULE: Because the contact detail is a phone number, the CTA verbs must match a phone — "call", "ring", "give us a call", "phone us", "text". NEVER use website verbs ("visit", "click", "head to") or physical-visit verbs ("walk in", "drop in") with a phone number. Even if the brand guidelines suggest walk-in or website CTAs, swap them for phone-appropriate language for this post.`)
      } else {
        systemParts.push(`CTA LANGUAGE RULE: Because the contact detail is a physical address, the CTA verbs must match a location — "visit us at", "come by", "walk in", "drop in", "pop in", "find us at". NEVER use website verbs ("click", "visit [url]", "book online") or phone verbs ("call", "ring") with an address. Even if the brand guidelines suggest website or call CTAs, swap them for location-appropriate language for this post.`)
      }
    } else {
      systemParts.push(`Do NOT include any contact details (website, phone, or address) in this caption. Keep the CTA copy-only — an idea, a question, or a soft next step.`)
    }
  }

  // ─── DEFAULTS (subject to the brand section above) ────────────────

  // Human voice rules — proactive anti-AI guidance, tone-aware
  systemParts.push(`\n${buildHumanRules(tone)}`)

  // Variation preset (the structural DNA of this caption)
  systemParts.push(`\n═══ TODAY'S CAPTION STYLE ═══\n${preset.instructions}`)

  // Platform playbook — how this platform actually reads
  const platformGuidance = buildPlatformGuidance(platforms)
  if (platformGuidance) {
    systemParts.push(`\n${platformGuidance}`)
  }

  // Anti-repetition context
  if (analysis.recentHooks.length > 0) {
    const antiRepParts: string[] = []
    antiRepParts.push(`═══ AVOID REPETITION ═══`)
    antiRepParts.push(`These are opening lines from recent captions. You MUST use a completely DIFFERENT opening approach:`)
    antiRepParts.push(analysis.recentHooks.slice(0, 6).map(h => `✗ "${h}"`).join('\n'))

    if (analysis.recentCTAs.length > 0) {
      antiRepParts.push(`\nThese are recent closing lines. Use a different CTA style:`)
      antiRepParts.push(analysis.recentCTAs.slice(0, 5).map(c => `✗ "${c}"`).join('\n'))
    }

    if (analysis.recentPhrases.length > 0) {
      antiRepParts.push(`\nOverused phrases to avoid: ${analysis.recentPhrases.map(p => `"${p}"`).join(', ')}`)
    }

    if (analysis.structurePatterns.length > 0) {
      antiRepParts.push(`\nStructural notes: ${analysis.structurePatterns.join('. ')}`)
    }

    systemParts.push('\n' + antiRepParts.join('\n'))
  }

  // Feedback-informed preferences
  if (feedbackSummary.likedPatterns.length > 0 || feedbackSummary.dislikedPatterns.length > 0) {
    const fbParts: string[] = [`\n═══ LEARNED PREFERENCES ═══`]
    if (feedbackSummary.likedPatterns.length) {
      fbParts.push(`The user LIKES captions with these qualities:\n${feedbackSummary.likedPatterns.map(p => `✓ ${p}`).join('\n')}`)
    }
    if (feedbackSummary.dislikedPatterns.length) {
      fbParts.push(`The user DISLIKES captions with these issues:\n${feedbackSummary.dislikedPatterns.map(p => `✗ ${p}`).join('\n')}`)
    }
    systemParts.push(fbParts.join('\n'))
  }

  // ─── Build User Prompt ──────────────────────────────────────────

  const userParts: string[] = []

  userParts.push(`Write a ${length} social media caption for "${brand.name}".`)
  userParts.push(`Brand tone: ${tone}`)
  userParts.push(`Platform${platforms.length > 1 ? 's' : ''}: ${platforms.join(', ')}`)
  userParts.push(includeHashtags ? 'Include relevant hashtags.' : 'Do NOT include hashtags.')
  userParts.push(includeEmojis ? 'Use emojis where appropriate.' : 'Do NOT use emojis.')

  // Goals
  if (goals && goals.length > 0) {
    userParts.push(`\nCurrent brand goals (align content where relevant):`)
    for (const g of goals) {
      userParts.push(`- [${g.period}] ${g.title}${g.description ? ' — ' + g.description : ''}`)
    }
  }

  // User prompt / topic
  if (rawPrompt) {
    userParts.push(`\nTopic / instructions: ${rawPrompt}`)
  }

  // Image context
  if (hasImage) {
    if (hasMultipleImages) {
      userParts.push(`\nThis is a carousel post — the caption MUST work for the full set of images. Describe what you see and use it as context.`)
      userParts.push(`\n[CAROUSEL STRUCTURE]
- The caption must unify the carousel's arc, not describe each card individually.
- Open with a hook that implies there's more to swipe through (tease the reveal on card 2+).
- Land on a takeaway or CTA that only makes sense after the reader has seen the full set.
- Do NOT enumerate cards ("Slide 1…", "Slide 2…", "Swipe to see…" as a preface) — let the caption stand on its own.`)
    } else {
      userParts.push(`\nThe caption MUST be about the content shown in the attached image. Describe what you see and use it as context.`)
    }
  } else if (!rawPrompt) {
    userParts.push(`\nWrite an engaging caption that reflects the brand voice.`)
  }

  return {
    systemPrompt: systemParts.join('\n'),
    userPrompt: userParts.join('\n'),
    selectedPreset: preset,
  }
}

// ─── Helpers ────────────────────────────────────────────────────────

/** Create a blank enhanced rule with defaults */
export function createBlankRule(overrides: Partial<EnhancedBrandRule> = {}): EnhancedBrandRule {
  return {
    id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
    label: '',
    prompt: '',
    enabled: true,
    appliesTo: 'caption',
    category: 'general',
    priority: 'must',
    platforms: [],
    frequency: 'always',
    ...overrides,
  }
}

/** Get a readable summary of what the engine is doing — useful for debug/UI */
export function describeEngineState(input: CaptionEngineInput): string {
  const analysis = analyseRecentCaptions(input.recentCaptions)
  const feedbackSummary = summariseFeedback(input.feedback)
  const rules = input.brand.custom_rules || input.brand.customRules || []
  const enabledRules = rules.filter(r => r.enabled)

  const parts: string[] = []
  parts.push(`Context: ${input.recentCaptions.length} recent captions analysed`)
  parts.push(`Rules: ${enabledRules.length} active`)
  parts.push(`Feedback: ${input.feedback.length} rated captions`)
  if (feedbackSummary.preferredPresets.length) {
    parts.push(`Preferred styles: ${feedbackSummary.preferredPresets.join(', ')}`)
  }
  if (analysis.structurePatterns.length) {
    parts.push(`Notes: ${analysis.structurePatterns.join('; ')}`)
  }
  return parts.join(' · ')
}
