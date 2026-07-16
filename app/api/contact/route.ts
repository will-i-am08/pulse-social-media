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

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  // Templated confirmation — never compose outbound email from user-supplied
  // content via AI (prompt-injection risk on a public endpoint).
  const first = name.split(' ')[0]
  const about = intent || 'our services'
  const replyText = `Hi ${first},\n\nThank you so much for reaching out! We've received your enquiry about ${about} and Will will be in touch within one business day to chat further.\n\nFor anything urgent, feel free to email Will directly at ${OWNER_EMAIL}.\n\nLooking forward to connecting!\n\nWill & the Pulse Social Media team`

  const replyHtml = replyText
    .split('\n\n')
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px 0;line-height:1.7;color:#1a1a1a;">${escapeHtml(p).replace(/\n/g, '<br>')}</p>`)
    .join('')

  const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <tr>
          <td style="background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%);padding:28px 40px;">
            <span style="color:#ffffff;font-size:20px;font-weight:700;letter-spacing:-0.5px;">Pulse Social Media</span>
          </td>
        </tr>
        <tr>
          <td style="padding:36px 40px;font-size:15px;">
            ${replyHtml}
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #e5e7eb;background:#f9f9f9;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Will Calder &mdash; Pulse Social Media<br>
              <a href="https://pulsesocialmedia.com.au" style="color:#ff5473;text-decoration:none;">pulsesocialmedia.com.au</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

  try {
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Pulse Social Media <${FROM_EMAIL}>`,
        to: [email],
        reply_to: OWNER_EMAIL,
        subject: `Thanks for reaching out, ${first} — we'll be in touch soon`,
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

  // Notify the owner of the new enquiry (best effort — the lead's confirmation
  // already went out, so a failure here shouldn't fail the request).
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
