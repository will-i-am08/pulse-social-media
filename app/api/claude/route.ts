import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(request: NextRequest) {
  // Verify auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) {
    return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })
  }

  if (!apiKey.startsWith('sk-ant-')) {
    return NextResponse.json({ error: `Key decryption issue — decrypted key starts with "${apiKey.substring(0, 6)}..." which is not a valid Anthropic key format. Please re-save your key.` }, { status: 400 })
  }

  let body: { systemPrompt?: string; userContent?: unknown; maxTokens?: number; model?: string; stream?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { systemPrompt, userContent, maxTokens = 1024, model = 'claude-sonnet-4-6', stream = false } = body

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system: systemPrompt,
        messages: [{ role: 'user', content: userContent }],
        ...(stream ? { stream: true } : {}),
      }),
    })

    if (!response.ok) {
      const data = await response.json().catch(() => ({} as { error?: { message?: string } }))
      return NextResponse.json(
        { error: data.error?.message || 'Claude API error' },
        { status: response.status }
      )
    }

    // Streaming: pass Anthropic's SSE bytes straight through — the client
    // extracts the text deltas. Keeps this route a thin proxy.
    if (stream && response.body) {
      return new Response(response.body, {
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache, no-transform',
        },
      })
    }

    const data = await response.json()
    return NextResponse.json({ text: data.content?.[0]?.text || '' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
