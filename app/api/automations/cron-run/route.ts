import { NextRequest, NextResponse } from 'next/server'
import { executeAutomationAsService } from '@/lib/automations/engine'

export const maxDuration = 120

export async function POST(req: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 })

  const auth = req.headers.get('authorization') || ''
  const bearer = auth.startsWith('Bearer ') ? auth.slice(7) : null
  if (bearer !== cronSecret) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { automationId, userId } = await req.json()
  if (!automationId || !userId) return NextResponse.json({ error: 'automationId and userId required' }, { status: 400 })

  try {
    const result = await executeAutomationAsService(automationId, userId, { cronSecret, userId })
    return NextResponse.json(result)
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
