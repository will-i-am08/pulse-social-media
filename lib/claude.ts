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
  model = 'claude-sonnet-4-6',
  onDelta?: (textSoFar: string) => void
): Promise<string | null> {
  try {
    const stream = !!onDelta
    const res = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ systemPrompt, userContent, maxTokens, model, stream }),
    })

    if (!res.ok) {
      const data = await res.json().catch(() => ({}))
      throw new Error((data as { error?: string }).error || 'Claude API error')
    }

    if (!stream) {
      const data = await res.json()
      return data.text
    }

    // Parse Anthropic SSE: accumulate content_block_delta text deltas
    const reader = res.body?.getReader()
    if (!reader) throw new Error('Streaming not supported')
    const decoder = new TextDecoder()
    let buffer = ''
    let text = ''
    for (;;) {
      const { done, value } = await reader.read()
      if (done) break
      buffer += decoder.decode(value, { stream: true })
      const lines = buffer.split('\n')
      buffer = lines.pop() ?? ''
      for (const line of lines) {
        if (!line.startsWith('data:')) continue
        const payload = line.slice(5).trim()
        if (!payload || payload === '[DONE]') continue
        try {
          const event = JSON.parse(payload)
          if (event.type === 'content_block_delta' && event.delta?.type === 'text_delta') {
            text += event.delta.text
            onDelta!(text)
          } else if (event.type === 'error') {
            throw new Error(event.error?.message || 'Claude API error')
          }
        } catch (err) {
          if (err instanceof SyntaxError) continue // partial/keepalive frame
          throw err
        }
      }
    }
    return text
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
