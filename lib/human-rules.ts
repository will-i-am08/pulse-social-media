/**
 * Human-feel rulebook — proactive rules injected into every system prompt.
 * Addresses the patterns that separate human copy from AI slop *before* generation,
 * not just reactively (that's cleanCaption.ts).
 */

type BrandTone = 'professional' | 'casual' | 'playful' | 'luxury' | 'inspirational' | 'friendly' | string | undefined

/**
 * Build the "HUMAN VOICE RULES" block. Tone-aware: formal/luxury brands get softer
 * contractions guidance, everyone else defaults to casual-human cadence.
 */
export function buildHumanRules(brandTone?: BrandTone): string {
  const formal = brandTone === 'professional' || brandTone === 'luxury'

  const rules: string[] = [
    '═══ HUMAN VOICE RULES ═══',
    'These rules apply to every caption. They are how real people write — not how AI defaults to writing.',
    '',
    '• Vary sentence length. Mix short punchy lines with longer ones. Never three same-length sentences in a row.',
    formal
      ? '• Use contractions where natural ("it\'s", "you\'re") unless the brand voice explicitly calls for formality. Don\'t force stilted phrasing.'
      : '• Use contractions by default ("you\'re", "it\'s", "we\'ve", "don\'t"). Stilted full-form verbs sound robotic.',
    '• Specifics over vagueness. Named things, numbers, sensory detail. "Tuesday morning" beats "recently". "$89" beats "affordable". "The gearbox on a 2012 Hilux" beats "your vehicle".',
    '• Concrete verbs. "Fixed", "swapped", "rebuilt", "shipped", "landed" beat "transformed", "elevated", "optimised", "leveraged", "curated".',
    '• Natural rhythm. Line breaks at genuine pause points, not arbitrary decoration. Read it out loud in your head before committing to a break.',
    '• Ban triple-parallel cadence. Do NOT write "Not X. Not Y. But Z." or "This isn\'t X. It\'s not Y. It\'s Z." That structure is the tell of AI copy.',
    '• No performative transitions. Cut "Here\'s the thing", "But here\'s where it gets interesting", "The truth is", "Plot twist", "Spoiler alert".',
    '• Earn the emoji. One or two at most, placed where speech would pause. Never to decorate a sentence end. Zero is often right.',
    '• Match the channel. Write how a real person on that platform would actually talk — not how a brand deck would sound read aloud.',
    '• Avoid "journey", "ecosystem", "landscape", "realm", "tapestry", "embark", "seamlessly", "effortlessly", "holistically", "authentically".',
    '• No fake enthusiasm. If there\'s nothing genuinely exciting, don\'t fake it. Skip "we\'re thrilled/excited/humbled/stoked" openers.',
    '• Stop stating the obvious. Don\'t start with "Social media is powerful" or "In today\'s world" or any meta-observation about the topic.',
  ]

  return rules.join('\n')
}
