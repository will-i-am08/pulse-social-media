/**
 * Client-side helper to call the /api/claude proxy.
 * The actual Anthropic API key never leaves the server.
 */

interface ImageSource {
  type: 'base64'
  media_type: string
  data: string
}

type ContentBlock =
  | { type: 'text'; text: string }
  | { type: 'image'; source: ImageSource | { type: 'url'; url: string } }

export async function callClaude(
  systemPrompt: string,
  userContent: string | ContentBlock[],
  maxTokens = 1024,
  model = 'claude-sonnet-4-6'
): Promise<string | null> {
  try {
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userContent, maxTokens, model }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Claude API error')
    return data.text
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    console.error('callClaude error:', msg)
    return null
  }
}

export function buildImageContent(
  imgUrl: string,
  textPrompt: string
): ContentBlock[] {
  if (imgUrl.startsWith('data:')) {
    const [meta, b64] = imgUrl.split(',')
    const mediaType = meta.match(/data:([^;]+)/)?.[1] || 'image/jpeg'
    return [
      { type: 'image', source: { type: 'base64', media_type: mediaType, data: b64 } },
      { type: 'text', text: textPrompt },
    ]
  }
  return [
    { type: 'image', source: { type: 'url', url: imgUrl } },
    { type: 'text', text: textPrompt },
  ]
}
