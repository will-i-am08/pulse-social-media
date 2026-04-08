/**
 * Netlify Background Function — submission-created
 * Automatically triggered when any Netlify Form is submitted.
 * Generates a personalised AI reply via Claude and sends it via Resend.
 */

export const handler = async (event) => {
  try {
    const payload = JSON.parse(event.body)
    const { name, email, intent, message } = payload.data ?? {}

    if (!email) {
      console.error('No email address in submission payload')
      return { statusCode: 400 }
    }

    const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const FROM_EMAIL = process.env.FROM_EMAIL ?? 'hello@pulsedigital.com.au'
    const OWNER_EMAIL = process.env.OWNER_EMAIL ?? 'will@pulsedigital.com.au'

    if (!ANTHROPIC_API_KEY || !RESEND_API_KEY) {
      console.error('Missing ANTHROPIC_API_KEY or RESEND_API_KEY environment variables')
      return { statusCode: 500 }
    }

    // ── 1. Generate personalised reply via Claude ──────────────────────────
    const prompt = `You are a friendly, professional assistant for Pulse Digital Agency — an AI-powered social media agency based in Australia. A potential client has just submitted a contact form enquiry.

Your job is to write a warm, personable, and professional email reply to them. The tone should be confident but approachable — like a message from a real person, not a template. Keep it concise (150–200 words). Do not use bullet points or headers — just flowing, conversational paragraphs.

The reply should:
1. Greet them by first name
2. Acknowledge what they're interested in (their intent) and briefly touch on their specific message
3. Let them know Will (the founder) will be in touch within one business day to set up a quick call
4. Give Will's direct email (${OWNER_EMAIL}) for anything urgent
5. Close warmly, signed off as "Will & the Pulse Digital team"

Here are the enquiry details:
- Name: ${name ?? 'there'}
- Interested in: ${intent ?? 'our services'}
- Their message: ${message ?? '(no message provided)'}

Write ONLY the email body text — no subject line, no markdown formatting. Start directly with the greeting.`

    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-opus-4-5',
        max_tokens: 400,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const err = await claudeRes.text()
      console.error('Claude API error:', err)
      return { statusCode: 500 }
    }

    const claudeData = await claudeRes.json()
    const replyText = claudeData.content?.[0]?.text ?? ''

    if (!replyText) {
      console.error('Empty response from Claude')
      return { statusCode: 500 }
    }

    // Convert plain text paragraphs to simple HTML
    const replyHtml = replyText
      .split('\n\n')
      .filter(Boolean)
      .map(p => `<p style="margin:0 0 16px 0;line-height:1.6;">${p.replace(/\n/g, '<br>')}</p>`)
      .join('')

    // ── 2. Send email via Resend ───────────────────────────────────────────
    const emailHtml = `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%);padding:32px 40px;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.5px;">Pulse Digital</span>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px;color:#1a1a1a;font-size:15px;">
            ${replyHtml}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:24px 40px;border-top:1px solid #e5e7eb;background:#f9f9f9;">
            <p style="margin:0;font-size:12px;color:#9ca3af;line-height:1.5;">
              Pulse Digital Agency &mdash; AI-powered social media management<br>
              <a href="https://pulsedigital.com.au" style="color:#ff5473;text-decoration:none;">pulsedigital.com.au</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: `Pulse Digital <${FROM_EMAIL}>`,
        to: [email],
        reply_to: OWNER_EMAIL,
        subject: `Thanks for reaching out, ${name?.split(' ')[0] ?? 'there'} — we'll be in touch soon`,
        html: emailHtml,
        text: replyText,
      }),
    })

    if (!resendRes.ok) {
      const err = await resendRes.text()
      console.error('Resend API error:', err)
      return { statusCode: 500 }
    }

    console.log(`Auto-reply sent to ${email} for intent: ${intent}`)
    return { statusCode: 200 }

  } catch (err) {
    console.error('submission-created function error:', err)
    return { statusCode: 500 }
  }
}
