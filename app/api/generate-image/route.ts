import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

const REPLICATE_API = 'https://api.replicate.com/v1'

// POST — start a prediction, return predictionId immediately (client polls)
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
  return NextResponse.json({ predictionId: prediction.id })
}

// GET — poll prediction status: ?id=predictionId
export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const res = await fetch(`${REPLICATE_API}/predictions/${id}`, {
    headers: { 'Authorization': `Token ${apiKey}` },
  })

  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch prediction' }, { status: 500 })

  const data = await res.json()

  if (data.status === 'succeeded') {
    const imageUrl = Array.isArray(data.output) ? data.output[0] : data.output
    return NextResponse.json({ status: 'succeeded', imageUrl })
  }

  if (data.status === 'failed' || data.status === 'canceled') {
    return NextResponse.json({ status: data.status, error: data.error || 'Generation failed' })
  }

  // still starting / processing
  return NextResponse.json({ status: data.status })
}
