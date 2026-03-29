import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildArticleSchema, buildProductSchema, buildOrganizationSchema } from '@/lib/geo/schema-builder'
import { z } from 'zod'

const Schema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('article'),
    url: z.string().url(),
    title: z.string(),
    description: z.string(),
    authorName: z.string(),
    publishedDate: z.string(),
    modifiedDate: z.string().optional(),
    imageUrl: z.string().url().optional(),
    organizationName: z.string(),
    organizationUrl: z.string().url(),
  }),
  z.object({
    type: z.literal('product'),
    url: z.string().url(),
    name: z.string(),
    description: z.string(),
    imageUrl: z.string().url().optional(),
    price: z.number().optional(),
    currency: z.string().optional(),
    availability: z.enum(['InStock', 'OutOfStock', 'PreOrder']).optional(),
    brandName: z.string().optional(),
  }),
  z.object({
    type: z.literal('organization'),
    name: z.string(),
    url: z.string().url(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
    email: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
])

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => null)
  const parsed = Schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })

  const data = parsed.data
  let schema: object

  if (data.type === 'article') {
    schema = buildArticleSchema(data)
  } else if (data.type === 'product') {
    schema = buildProductSchema(data)
  } else {
    schema = buildOrganizationSchema(data)
  }

  return NextResponse.json({ schema })
}
