import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REPLICATE_API = 'https://api.replicate.com/v1'
const POLL_INTERVAL_MS = 2000
const POLL_TIMEOUT_MS = 180_000 // 3 minutes

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 })

  const { modelVersion, prompt, width = 1024, height = 1024 } = await request.json()
  if (!modelVersion || !prompt) {
    return NextResponse.json({ error: 'modelVersion and prompt required' }, { status: 400 })
  }

  const headers = { 'Authorization': `Token ${apiKey}`, 'Content-Type': 'application/json' }

  // Create prediction
  const createRes = await fetch(`${REPLICATE_API}/predictions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      version: modelVersion,
      input: { prompt, width, height, num_outputs: 1 },
    }),
  })
  if (!createRes.ok) {
    const err = await createRes.json()
    return NextResponse.json({ error: err.detail || 'Failed to start generation' }, { status: 500 })
  }
  const prediction = await createRes.json()
  const predictionId = prediction.id

  // Poll until done
  const start = Date.now()
  while (Date.now() - start < POLL_TIMEOUT_MS) {
    await new Promise(r => setTimeout(r, POLL_INTERVAL_MS))

    const pollRes = await fetch(`${REPLICATE_API}/predictions/${predictionId}`, { headers })
    const data = await pollRes.json()

    if (data.status === 'succeeded') {
      const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output
      return NextResponse.json({ imageUrl })
    }
    if (data.status === 'failed' || data.status === 'canceled') {
      return NextResponse.json({ error: data.error || 'Generation failed' }, { status: 500 })
    }
    // status is 'starting' or 'processing' — keep polling
  }

  return NextResponse.json({ error: 'Generation timed out after 3 minutes' }, { status: 504 })
}
