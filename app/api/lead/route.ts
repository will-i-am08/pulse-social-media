import { type NextRequest, NextResponse } from 'next/server'
import { rateLimit, clientIp, escapeHtml } from '@/lib/rate-limit'

const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@pulsesocialmedia.com.au'
const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'william@pulsesocialmedia.com.au'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsesocialmedia.com.au'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type LeadType = 'playbook' | 'waitlist'

export async function POST(req: NextRequest) {
  if (!rateLimit(`lead:${clientIp(req)}`, 5, 10 * 60_000)) {
    return NextResponse.json({ error: 'Too many requests — try again shortly' }, { status: 429 })
  }

  const body = await req.json().catch(() => ({}))
  const type = body.type as LeadType
  const email = typeof body.email === 'string' ? body.email.trim().slice(0, 254) : ''
  const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : ''

  if (!EMAIL_RE.test(email) || (type !== 'playbook' && type !== 'waitlist')) {
    return NextResponse.json({ error: 'A valid email and lead type are required' }, { status: 400 })
  }

  const RESEND_API_KEY = process.env.RESEND_API_KEY
  if (!RESEND_API_KEY) {
    console.error('Missing RESEND_API_KEY')
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }

  const first = name.split(' ')[0] || 'there'

  let subject: string
  let text: string
  let html: string

  if (type === 'playbook') {
    const pdf = `${SITE_URL}/Pulse_Content_Playbook.pdf`
    subject = `Your free playbook is here, ${first} 📈`
    text = `Hi ${first},\n\nHere's your copy of "8 Ways to Look Stupidly Good on Social": ${pdf}\n\nWork through it one chapter at a time — even chapter one will sharpen your very next post. And if you'd rather we just ran the whole system for you, reply to this email and we'll set up a quick call.\n\nWill & the Pulse Social Media team`
    html = playbookHtml(escapeHtml(first), pdf)
  } else {
    subject = `You're on the trail — Notes from the Climb`
    text = `Hi ${first},\n\nYou're on the waitlist for Notes from the Climb, a Pulse Original podcast about the long ascent.\n\nWe'll send you the first climb the day it goes live, plus the occasional note from the trail while we build the show.\n\nSee you at first light,\nThe Pulse team`
    html = waitlistHtml(escapeHtml(first))
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${RESEND_API_KEY}` },
      body: JSON.stringify({
        from: `Pulse Social Media <${FROM_EMAIL}>`,
        to: [email],
        reply_to: OWNER_EMAIL,
        subject,
        html,
        text,
      }),
    })

    if (!res.ok) {
      console.error('Resend error:', await res.text())
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }
  } catch (e) {
    console.error('Resend fetch error:', e)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

function shell(headerBg: string, headerText: string, brand: string, body: string, footerAccent: string) {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#0a0a0b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;background:#0a0a0b;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#15151a;border-radius:14px;overflow:hidden;border:1px solid rgba(255,255,255,0.07);">
        <tr><td style="background:${headerBg};padding:28px 40px;">
          <span style="color:${headerText};font-size:20px;font-weight:800;letter-spacing:-0.5px;">${brand}</span>
        </td></tr>
        <tr><td style="padding:36px 40px;font-size:15px;color:#e7e7ea;">
          ${body}
        </td></tr>
        <tr><td style="padding:20px 40px;border-top:1px solid rgba(255,255,255,0.07);background:#101013;">
          <p style="margin:0;font-size:12px;color:#8a8a92;line-height:1.5;">
            Will Calder &mdash; Pulse Social Media<br>
            <a href="${SITE_URL}" style="color:${footerAccent};text-decoration:none;">pulsesocialmedia.com.au</a>
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function playbookHtml(first: string, pdf: string) {
  const body = `
    <p style="margin:0 0 16px;line-height:1.7;">Hi ${first},</p>
    <p style="margin:0 0 16px;line-height:1.7;">Here's your free copy of <strong>8 Ways to Look Stupidly Good on Social</strong> — the exact system we use to make our clients' content look the part, all shot on a phone.</p>
    <p style="margin:0 0 28px;line-height:1.7;">Work through it one chapter at a time. Even chapter one will sharpen your very next post.</p>
    <table cellpadding="0" cellspacing="0"><tr><td style="border-radius:12px;background:#F97316;">
      <a href="${pdf}" style="display:inline-block;padding:15px 30px;font-size:16px;font-weight:800;color:#1a0800;text-decoration:none;">↓ Download the playbook</a>
    </td></tr></table>
    <p style="margin:28px 0 0;line-height:1.7;color:#b3b3ba;">Rather we just ran the whole system for you? Reply to this email and we'll set up a quick call.</p>
    <p style="margin:20px 0 0;line-height:1.7;">Will &amp; the Pulse Social Media team</p>`
  return shell('linear-gradient(135deg,#fb923c 0%,#F97316 100%)', '#1a0800', 'Pulse Social Media', body, '#F97316')
}

function waitlistHtml(first: string) {
  const body = `
    <p style="margin:0 0 16px;line-height:1.7;">Hi ${first},</p>
    <p style="margin:0 0 16px;line-height:1.7;">You're on the waitlist for <strong>Notes from the Climb</strong> — a Pulse Original podcast about the long ascent: the doubt, the foothold, and the view that makes it worth the weight.</p>
    <p style="margin:0 0 16px;line-height:1.7;">We'll send you the first climb the day it goes live, plus the occasional note from the trail while we build the show.</p>
    <p style="margin:24px 0 0;line-height:1.7;color:#d9a86a;font-style:italic;">See you at first light.</p>
    <p style="margin:16px 0 0;line-height:1.7;">The Pulse team</p>`
  return shell('linear-gradient(135deg,#2B3147 0%,#0C0F1E 100%)', '#F2B066', 'Notes from the Climb', body, '#F2B066')
}
