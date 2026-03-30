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

  let body: { systemPrompt?: string; userContent?: unknown; maxTokens?: number; model?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { systemPrompt, userContent, maxTokens = 1024, model = 'claude-sonnet-4-6' } = body

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
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      return NextResponse.json(
        { error: data.error?.message || 'Claude API error' },
        { status: response.status }
      )
    }

    return NextResponse.json({ text: data.content?.[0]?.text || '' })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
