/**
 * Post-processing pipeline for AI-generated captions.
 * Order: dash replacement → filler phrase removal → whitespace cleanup.
 */

/** Blocklist of common AI filler phrases — easy to extend. */
export const AI_FILLER_PHRASES: string[] = [
  // Classic openers
  "In today's fast-paced world",
  "In today's digital landscape",
  "In today's digital age",
  "In today's world",
  "In this day and age",
  "We're thrilled to",
  "We're excited to announce",
  "We're humbled to",
  "We're proud to announce",
  "Meet your new",
  "Say hello to",
  "Introducing",
  // Transitions & fillers
  "Here's the thing",
  "Here's what I've learned",
  "Let me tell you",
  "One thing's for sure",
  "Needless to say",
  "At its core",
  "It's not just about",
  "At the end of the day",
  "Let's dive in",
  "Let's dive deep",
  "Let's be honest",
  "Without further ado",
  "Buckle up",
  "Spoiler alert",
  "Plot twist",
  // Tired social clichés
  "Game-changer",
  "Elevate your",
  "Unlock the power of",
  "Take it to the next level",
  "Stay tuned",
  "But wait, there's more",
  "Did you know",
  "Hot take",
  "Pro tip",
  "That's a wrap",
  "It's giving",
  // Overused verbs & adverbs
  "Dive deep into",
  "Dive into",
  "Unpack",
  "Seamlessly",
  "Effortlessly",
  "Holistically",
  "Authentically",
  // Overused nouns (metaphorical uses — contextual)
  "in today's landscape",
  "in the ecosystem",
  "on this journey",
  "embark on",
  "embark on a journey",
]

/**
 * Detection-only patterns — logged but not removed. Used to flag cadence tells
 * for telemetry so we can tighten prompt rules if they keep showing up.
 */
const DETECTION_PATTERNS: { name: string; regex: RegExp }[] = [
  // Triple-parallel "Not X. Not Y. But Z." / "It's not X. It's not Y. It's Z."
  { name: 'triple-parallel-not', regex: /\b(not|it'?s not)\b[^.?!]{2,60}[.?!]\s+\b(not|it'?s not)\b[^.?!]{2,60}[.?!]\s+\b(but|it'?s)\b/i },
  // "This isn't just X. It's Y." pattern
  { name: 'this-isnt-just', regex: /\bthis isn'?t just\b[^.?!]{2,80}[.?!]\s+it'?s\b/i },
  // "More than X. It's Y." pattern
  { name: 'more-than-its', regex: /\bmore than\b[^.?!]{2,80}[.?!]\s+it'?s\b/i },
]

/** Replace em dashes (—) and en dashes (–) with hyphens. */
function replaceDashes(text: string): string {
  // Spaced dashes: " — " or " – " → " - "
  let result = text.replace(/\s[—–]\s/g, ' - ')
  // Unspaced dashes between words: "word—word" → "word - word"
  result = result.replace(/(\w)[—–](\w)/g, '$1 - $2')
  // Any remaining standalone em/en dashes
  result = result.replace(/[—–]/g, '-')
  return result
}

/** Remove AI filler phrases from caption text. Logs which phrases were removed. */
function removeFillerPhrases(text: string): string {
  const removed: string[] = []

  let result = text
  for (const phrase of AI_FILLER_PHRASES) {
    // Escape special regex chars in the phrase
    const escaped = phrase.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const regex = new RegExp(escaped, 'gi')
    if (regex.test(result)) {
      removed.push(phrase)
      result = result.replace(regex, '')
    }
  }

  // Capitalise sentence starts after removal — find ". lowercase" or start-of-string lowercase
  result = result.replace(/([.!?]\s+)([a-z])/g, (_, punct, letter) => punct + letter.toUpperCase())
  // Capitalise if the entire string now starts lowercase
  result = result.replace(/^\s*([a-z])/, (_, letter) => letter.toUpperCase())

  if (removed.length > 0) {
    console.log(`[cleanCaption] Removed ${removed.length} filler phrase(s):`, removed)
  }

  return result
}

/** Collapse double spaces, trim lines, remove blank lines left by phrase removal. */
function cleanWhitespace(text: string): string {
  return text
    .replace(/ {2,}/g, ' ')           // collapse multiple spaces
    .replace(/\n{3,}/g, '\n\n')       // collapse 3+ newlines to 2
    .split('\n')
    .map(line => line.trim())          // trim each line
    .filter((line, i, arr) => {
      // Remove blank lines at start/end, keep at most one blank line between content
      if (line === '' && (i === 0 || i === arr.length - 1)) return false
      return true
    })
    .join('\n')
    .trim()
}

/** Log (don't remove) cadence patterns that smell AI — telemetry only. */
function detectCadencePatterns(text: string): void {
  const hits: string[] = []
  for (const p of DETECTION_PATTERNS) {
    if (p.regex.test(text)) hits.push(p.name)
  }
  if (hits.length) {
    console.log(`[cleanCaption] Detected AI cadence pattern(s):`, hits)
  }
}

/** Full cleaning pipeline — call this on every AI-generated caption. */
export function cleanCaption(raw: string): string {
  if (!raw) return raw
  let text = replaceDashes(raw)
  text = removeFillerPhrases(text)
  text = cleanWhitespace(text)
  detectCadencePatterns(text)
  return text
}
