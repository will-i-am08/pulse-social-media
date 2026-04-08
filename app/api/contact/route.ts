import { type NextRequest, NextResponse } from 'next/server'

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@pulsesocialmedia.com.au'
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'william@pulsesocialmedia.com.au'

export async function POST(req: NextRequest) {
  const { name, email, intent, message } = await req.json()

  if (!email || !name) {
    return NextResponse.json({ error: 'Name and email are required' }, { status: 400 })
  }

  const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
  const RESEND_API_KEY = process.env.RESEND_API_KEY

  if (!ANTHROPIC_API_KEY || !RESEND_API_KEY) {
    console.error('Missing ANTHROPIC_API_KEY or RESEND_API_KEY')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  // ── 1. Generate personalised reply via Claude ─────────────────────────────
  const prompt = `You are a friendly, professional assistant for Pulse Social Media — an AI-powered social media agency based in Australia. A potential client has just submitted a contact form enquiry.

Your job is to write a warm, personable, and professional email reply to them. The tone should be confident but approachable — like a message from a real person, not a template. Keep it concise (150–200 words). Do not use bullet points or headers — just flowing, conversational paragraphs.

The reply should:
1. Greet them by first name
2. Acknowledge what they're interested in (their intent) and briefly touch on their specific message
3. Let them know Will (the founder) will be in touch within one business day to set up a quick call
4. Give Will's direct email (${OWNER_EMAIL}) for anything urgent
5. Close warmly, signed off as "Will & the Pulse Social Media team"

Here are the enquiry details:
- Name: ${name}
- Interested in: ${intent ?? 'our services'}
- Their message: ${message ?? '(no message provided)'}

Write ONLY the email body text — no subject line, no markdown formatting. Start directly with the greeting.`

  let replyText = ''
  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (claudeRes.ok) {
      const claudeData = await claudeRes.json()
      replyText = claudeData.content?.[0]?.text ?? ''
    } else {
      console.error('Claude API error:', await claudeRes.text())
    }
  } catch (e) {
    console.error('Claude fetch error:', e)
  }

  // Fall back to a simple reply if Claude fails
  if (!replyText) {
    replyText = `Hi ${name.split(' ')[0]},\n\nThank you so much for reaching out! We've received your enquiry about ${intent ?? 'our services'} and Will will be in touch within one business day to chat further.\n\nFor anything urgent, feel free to email Will directly at ${OWNER_EMAIL}.\n\nLooking forward to connecting!\n\nWill & the Pulse Social Media team`
  }

  // ── 2. Convert to plain-looking HTML (no banners/gradients = lands in Primary) ──
  const replyHtml = replyText
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 14px 0;line-height:1.7;color:#1a1a1a;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:15px;">
  <div style="max-width:560px;margin:0 auto;padding:32px 16px;">
    ${replyHtml}
    <p style="margin:24px 0 0 0;color:#6b7280;font-size:13px;border-top:1px solid #e5e7eb;padding-top:16px;">
      Will Calder &mdash; <a href="https://pulsesocialmedia.com.au" style="color:#6b7280;">pulsesocialmedia.com.au</a>
    </p>
  </div>
</body>
</html>`

  // ── 3. Send via Resend ────────────────────────────────────────────────────
  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Will at Pulse <${FROM_EMAIL}>`,
        to: [email],
        reply_to: OWNER_EMAIL,
        subject: `Thanks for reaching out, ${name.split(' ')[0]} — we'll be in touch soon`,
        html: emailHtml,
        text: replyText,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      console.error('Resend error:', err)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (e) {
    console.error('Resend fetch error:', e)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
