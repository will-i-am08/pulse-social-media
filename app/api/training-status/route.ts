import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = process.env.REPLICATE_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'REPLICATE_API_KEY not configured' }, { status: 500 })

  const trainingId = request.nextUrl.searchParams.get('trainingId')
  if (!trainingId) return NextResponse.json({ error: 'trainingId required' }, { status: 400 })

  const res = await fetch(`https://api.replicate.com/v1/trainings/${trainingId}`, {
    headers: { 'Authorization': `Token ${apiKey}` },
  })
  if (!res.ok) return NextResponse.json({ error: 'Failed to fetch training status' }, { status: 500 })

  const data = await res.json()
  // Extract the trained model version from the output
  const modelVersion = data.output?.version ?? null

  return NextResponse.json({
    status: data.status,           // 'starting' | 'processing' | 'succeeded' | 'failed' | 'canceled'
    modelVersion,                  // e.g. "username/model-name:abc123..."
    error: data.error ?? null,
  })
}
