import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json([], { status: 401 })

  const type = req.nextUrl.searchParams.get('type')
  const status = req.nextUrl.searchParams.get('status')

  let query = supabase
    .from('proposals')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (type) query = query.eq('type', type)
  if (status) query = query.eq('status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data || [])
}

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const { id, ...fields } = body
  const now = new Date().toISOString()

  const row: Record<string, unknown> = { updated_at: now }
  if (fields.title !== undefined) row.title = fields.title
  if (fields.type !== undefined) row.type = fields.type
  if (fields.clientName !== undefined) row.client_name = fields.clientName
  if (fields.clientEmail !== undefined) row.client_email = fields.clientEmail
  if (fields.brandId !== undefined) row.brand_id = fields.brandId || null
  if (fields.content !== undefined) row.content = fields.content
  if (fields.status !== undefined) row.status = fields.status
  if (fields.startDate !== undefined) row.start_date = fields.startDate || null
  if (fields.endDate !== undefined) row.end_date = fields.endDate || null
  if (fields.renewalDate !== undefined) row.renewal_date = fields.renewalDate || null
  if (fields.totalValue !== undefined) row.total_value = fields.totalValue
  if (fields.signatureClient !== undefined) row.signature_client = fields.signatureClient
  if (fields.signatureAgency !== undefined) row.signature_agency = fields.signatureAgency
  if (fields.signedAt !== undefined) row.signed_at = fields.signedAt

  if (id) {
    const { data, error } = await supabase
      .from('proposals')
      .update(row)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  } else {
    row.user_id = user.id
    if (!row.title) row.title = 'Untitled'
    const { data, error } = await supabase
      .from('proposals')
      .insert(row)
      .select('*')
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(data)
  }
}
