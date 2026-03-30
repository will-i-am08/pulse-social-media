import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getDecryptedClaudeKey } from '@/lib/account/getAccountSettings'

export const maxDuration = 60

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const apiKey = await getDecryptedClaudeKey(user.id)
  if (!apiKey) return NextResponse.json({ error: 'No Claude API key configured. Add it in Account Settings.' }, { status: 400 })

  const { type, clientName, services, pricing, terms, startDate, endDate, renewalDate, brandId, customInstructions } = await req.json()

  // Fetch brand context
  let brandContext = ''
  if (brandId) {
    const { data: brand } = await supabase
      .from('workspace_brands')
      .select('name, business_name, industry, brand_voice, primary_color')
      .eq('id', brandId)
      .eq('user_id', user.id)
      .single()
    if (brand) {
      brandContext = `
Agency/Business: ${brand.business_name || brand.name}
Industry: ${brand.industry || 'Not specified'}
${brand.brand_voice ? `Brand Voice: ${brand.brand_voice}` : ''}`
    }
  }

  const isContract = type === 'contract'

  const systemPrompt = `You are an expert business proposal and contract writer. Generate professional, compelling documents.
Output ONLY a valid JSON array of section objects. No markdown code fences, no commentary, no explanation.

Each section object must have:
- "id": a unique short string (e.g. "cover", "scope", "pricing")
- "type": one of "heading", "text", "services", "pricing", "timeline", "terms", "signature"
- "title": the section heading
- "content": the section body text (can include line breaks with \\n)
- "items": (only for type "services" or "pricing") array of { "description": string, "quantity": number, "unitPrice": number, "total": number }

Output ONLY the raw JSON array.`

  let userPrompt: string
  if (isContract) {
    userPrompt = `Generate a professional retainer/service contract with these details:

Client: ${clientName || 'TBD'}
${brandContext}
Services: ${services || 'To be defined'}
Pricing/Value: ${pricing || 'To be discussed'}
Terms: ${terms || 'Standard terms'}
Start Date: ${startDate || 'TBD'}
End Date: ${endDate || 'TBD'}
Renewal Date: ${renewalDate || 'Same as end date'}
${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Generate these sections:
1. heading: "Service Agreement"
2. text: "Parties" — identify both parties
3. text: "Scope of Services" — detailed description
4. services: "Deliverables" — with line items, quantities, and pricing
5. pricing: "Payment Terms" — payment schedule and total
6. text: "Duration & Renewal" — contract period and renewal terms
7. text: "Termination" — termination clauses
8. text: "Confidentiality" — NDA clause
9. text: "Limitation of Liability"
10. terms: "General Terms & Conditions"
11. signature: "Signatures" — signature block text`
  } else {
    userPrompt = `Generate a professional service proposal with these details:

Client: ${clientName || 'Prospective Client'}
${brandContext}
Services: ${services || 'To be defined'}
Pricing: ${pricing || 'To be discussed'}
${startDate ? `Proposed Start: ${startDate}` : ''}
${endDate ? `Proposed End: ${endDate}` : ''}
${customInstructions ? `Additional Instructions: ${customInstructions}` : ''}

Generate these sections:
1. heading: "Proposal"
2. text: "Cover Letter" — warm, professional intro addressing the client
3. text: "About Us" — brief company overview
4. text: "Scope of Work" — what we'll deliver
5. services: "Services & Deliverables" — with line items and pricing
6. pricing: "Investment" — pricing summary with total
7. timeline: "Timeline" — project phases and milestones
8. terms: "Terms & Conditions" — payment terms, revisions, IP
9. text: "Next Steps" — clear CTA to proceed
10. signature: "Agreement" — signature block`
  }

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: userPrompt }],
      }),
    })

    const data = await res.json()
    if (!res.ok) throw new Error(data.error?.message || 'API error')

    let text = data.content?.[0]?.text || ''
    // Strip code fences if present
    text = text.replace(/^```json?\s*/i, '').replace(/\s*```$/, '').trim()
    const match = text.match(/\[[\s\S]*\]/)
    if (!match) throw new Error('Invalid response format')

    const sections = JSON.parse(match[0])
    return NextResponse.json({ sections })
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}
