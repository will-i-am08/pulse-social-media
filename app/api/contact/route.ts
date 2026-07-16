import { type NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIp, escapeHtml } from '@/lib/rate-limit'

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@pulsesocialmedia.com.au'
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'william@pulsesocialmedia.com.au'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: NextRequest) {
  if (!rateLimit(`contact:${clientIp(req)}`, 3, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests — try again shortly' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : ''
  const intent = typeof body.intent === 'string' ? body.intent.trim().slice(0, 120) : ''
  const message = typeof body.message === 'string' ? body.message.trim().slice(0, 2000) : ''

  if (!name || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Name and a valid email are required' }, { status: 400 })
  }

  // No auto-reply to the visitor — the enquiry is captured by Netlify Forms
  // regardless, and the owner notification below is best effort, so the form
  // never fails just because email delivery is down.
  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ ok: true })
  }

  // Notify the owner of the new enquiry (best effort).
  try {
    const detailRows = [
      ['Name', name],
      ['Email', email],
      ['Interested in', intent || '(not specified)'],
      ['Message', message || '(no message)'],
    ]
      .map(([k, v]) => `<tr><td style="padding:6px 12px 6px 0;font-weight:600;vertical-align:top;white-space:nowrap;">${k}</td><td style="padding:6px 0;">${escapeHtml(v).replace(/\n/g, '<br>')}</td></tr>`)
      .join('')

    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Pulse Social Media <${FROM_EMAIL}>`,
        to: [OWNER_EMAIL],
        reply_to: email,
        subject: `New enquiry: ${name}${intent ? ` — ${intent}` : ''}`,
        html: `<table style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;font-size:14px;color:#1a1a1a;">${detailRows}</table>`,
        text: detailRows ? `New enquiry\n\nName: ${name}\nEmail: ${email}\nInterested in: ${intent || '(not specified)'}\n\n${message || '(no message)'}` : '',
      }),
    })
  } catch (e) {
    console.error('Owner notification error:', e)
  }

  return NextResponse.json({ ok: true })
}
