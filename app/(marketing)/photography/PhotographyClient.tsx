'use client'

import { useState, type FormEvent } from 'react'

const CSS = `
.pulse-photo .ph-hero{max-width:1320px;margin:0 auto;padding:80px 48px 48px;display:grid;grid-template-columns:1.05fr .95fr;gap:64px;align-items:center}
.pulse-photo .ph-hero .eyebrow{margin:0 0 18px}
.pulse-photo .ph-hero h1{font-size:clamp(48px,7vw,96px);font-weight:200;letter-spacing:-0.04em;line-height:.95;margin:0 0 22px}
.pulse-photo .ph-hero h1 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo .ph-hero .sub{font-size:19px;line-height:1.5;color:var(--muted);margin:0 0 32px;max-width:480px}
.pulse-photo .hero-media{aspect-ratio:4/3;border-radius:18px;background:repeating-linear-gradient(-45deg,rgba(10,10,10,.06) 0 1px,transparent 1px 9px),linear-gradient(135deg,#eeeae4,#e4ded5);position:relative;overflow:hidden;display:flex;align-items:flex-end;padding:16px}
.pulse-photo .hero-media .tag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#7e746a;background:rgba(255,255,255,.78);padding:6px 10px;border-radius:6px;backdrop-filter:blur(4px)}
@media(max-width:820px){.pulse-photo .ph-hero{grid-template-columns:1fr;padding:48px 24px 24px;gap:32px}.pulse-photo .ph-hero h1{font-size:46px !important}}

.pulse-photo .ph-includes{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair)}
.pulse-photo .ph-includes .lede{display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:end;margin-bottom:48px}
.pulse-photo .ph-includes h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;line-height:1.05;margin:14px 0 0}
.pulse-photo .ph-includes h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo .ph-includes .lede p{color:var(--muted);font-size:17px;line-height:1.55;margin:0;max-width:420px;justify-self:end}
.pulse-photo .feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pulse-photo .feature-card{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:32px;display:flex;flex-direction:column;gap:10px;transition:transform .25s, box-shadow .25s}
.pulse-photo .feature-card:hover{transform:translateY(-2px);box-shadow:0 16px 36px -20px rgba(0,0,0,.12)}
.pulse-photo .feature-card .ic{font-size:28px;line-height:1;margin-bottom:6px}
.pulse-photo .feature-card h3{font-size:18px;font-weight:600;letter-spacing:-0.01em;margin:0}
.pulse-photo .feature-card p{font-size:14px;line-height:1.55;color:var(--muted);margin:0}
@media(max-width:820px){.pulse-photo .ph-includes{padding:56px 24px}.pulse-photo .ph-includes .lede{grid-template-columns:1fr;gap:14px;margin-bottom:32px}.pulse-photo .ph-includes .lede p{justify-self:start}.pulse-photo .feature-grid{grid-template-columns:1fr;gap:14px}.pulse-photo .feature-card{padding:24px}}

.pulse-photo .ph-how{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair)}
.pulse-photo .ph-how h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;line-height:1.05;margin:14px 0 48px}
.pulse-photo .ph-how h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo .how-steps{display:grid;grid-template-columns:repeat(3,1fr);gap:32px}
.pulse-photo .how-step .num{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:84px;line-height:1;color:var(--accent);margin-bottom:12px;display:block}
.pulse-photo .how-step h3{font-size:22px;font-weight:500;letter-spacing:-0.01em;margin:0 0 8px}
.pulse-photo .how-step p{font-size:15px;line-height:1.55;color:var(--muted);margin:0;max-width:280px}
@media(max-width:820px){.pulse-photo .ph-how{padding:56px 24px}.pulse-photo .ph-how h2{margin-bottom:28px}.pulse-photo .how-steps{grid-template-columns:1fr;gap:28px}}

.pulse-photo .scarcity{background:linear-gradient(135deg,var(--accent-soft) 0%, var(--accent) 100%);color:#fff;padding:22px 24px;text-align:center;font-family:'JetBrains Mono',monospace;font-size:13px;letter-spacing:.18em;text-transform:uppercase;font-weight:500}

.pulse-photo .ph-book{max-width:1080px;margin:0 auto;padding:80px 48px;scroll-margin-top:24px}
.pulse-photo .ph-book .head{text-align:center;margin-bottom:36px}
.pulse-photo .ph-book h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;line-height:1.05;margin:14px 0 14px}
.pulse-photo .ph-book h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo .ph-book .head p{color:var(--muted);font-size:17px;line-height:1.5;margin:0;max-width:520px;margin:0 auto}
.pulse-photo .form-card{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:40px;display:flex;flex-direction:column;gap:18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.pulse-photo .field{display:flex;flex-direction:column;gap:6px}
.pulse-photo .field label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.pulse-photo .field label .opt{text-transform:none;letter-spacing:0;font-family:'Plus Jakarta Sans',sans-serif;color:#9ca3af;font-size:11px;margin-left:6px}
.pulse-photo .field input,.pulse-photo .field textarea{background:var(--paper-2);border:1px solid var(--hair);border-radius:10px;padding:14px 16px;font-family:inherit;font-size:15px;color:var(--ink);outline:0;transition:border-color .15s,box-shadow .15s}
.pulse-photo .field input:focus,.pulse-photo .field textarea:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,84,115,.12)}
.pulse-photo .field textarea{resize:vertical;min-height:110px}
.pulse-photo .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pulse-photo .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.pulse-photo .submit-row{display:flex;flex-direction:column;gap:10px;margin-top:8px}
.pulse-photo .submit-row button{width:100%;justify-content:center;padding:18px 26px;font-size:15px}
.pulse-photo .submit-row .micro{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:center}
.pulse-photo .submit-row .micro.err{color:#e11d48;text-transform:none;letter-spacing:.04em;font-family:inherit;font-size:13px}
.pulse-photo .success{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:48px;text-align:center}
.pulse-photo .success .check{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent-soft) 0%, var(--accent) 100%);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:18px}
.pulse-photo .success h3{font-size:28px;font-weight:500;letter-spacing:-0.02em;margin:0 0 12px}
.pulse-photo .success p{color:var(--muted);font-size:16px;line-height:1.6;margin:0;max-width:460px;margin:0 auto}
@media(max-width:820px){.pulse-photo .ph-book{padding:56px 24px}.pulse-photo .form-card{padding:24px}.pulse-photo .row-2{grid-template-columns:1fr}}

.pulse-photo .ph-faq{background:var(--paper-2);padding:96px 48px;border-top:1px solid var(--hair)}
.pulse-photo .ph-faq-inner{max-width:1080px;margin:0 auto}
.pulse-photo .ph-faq h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;margin:0 0 40px}
.pulse-photo .ph-faq h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo details{border-top:1px solid var(--hair);padding:22px 0}
.pulse-photo details:last-child{border-bottom:1px solid var(--hair)}
.pulse-photo summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:19px;font-weight:500}
.pulse-photo summary::-webkit-details-marker{display:none}
.pulse-photo summary::after{content:'+';font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:22px}
.pulse-photo details[open] summary::after{content:'−'}
.pulse-photo details p{color:#444;line-height:1.65;margin:14px 0 0;max-width:720px}
@media(max-width:820px){.pulse-photo .ph-faq{padding:64px 24px}}

.pulse-photo .ph-final{max-width:1320px;margin:0 auto;padding:120px 48px;text-align:center;border-top:1px solid var(--hair)}
.pulse-photo .ph-final h2{font-size:clamp(48px,7vw,96px);font-weight:200;letter-spacing:-0.04em;line-height:.95;margin:18px 0 32px}
.pulse-photo .ph-final h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-photo .ph-final .sub{color:var(--muted);font-size:18px;max-width:480px;margin:0 auto 32px;line-height:1.5}
@media(max-width:820px){.pulse-photo .ph-final{padding:64px 24px}}
`

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function PhotographyClient() {
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success') return

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()
    const business = String(data.get('business') ?? '').trim()
    const address = String(data.get('address') ?? '').trim()
    const shooting = String(data.get('shooting') ?? '').trim()
    const date1 = String(data.get('date1') ?? '').trim()
    const date2 = String(data.get('date2') ?? '').trim()
    const notes = String(data.get('notes') ?? '').trim()
    const honey = String(data.get('bot-field') ?? '').trim()
    if (honey) return

    const message = [
      `Business: ${business}`,
      `Phone: ${phone}`,
      `Address: ${address}`,
      `What we're shooting: ${shooting}`,
      `Preferred date 1: ${date1}`,
      `Preferred date 2: ${date2}`,
      notes && `\nAnything else: ${notes}`,
    ].filter(Boolean).join('\n')

    setStatus('submitting')
    setErrorMsg('')

    // Mirror to Netlify Forms dashboard (fire-and-forget)
    const netlifyBody = new URLSearchParams()
    data.forEach((v, k) => { if (typeof v === 'string') netlifyBody.append(k, v) })
    netlifyBody.set('intent', 'Photography booking')
    netlifyBody.set('message', message)
    fetch('/__forms.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: netlifyBody.toString(),
    }).catch(() => {})

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent: 'Photography booking', message }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        throw new Error(error || 'Something went wrong sending your booking.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong sending your booking.')
    }
  }

  return (
    <main className="pulse-photo">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="ph-hero">
        <div>
          <p className="mono-label eyebrow">Bendigo · Small Business Photography</p>
          <h1>Bendigo Small<br />Business Photography<br />— <em>$300.</em></h1>
          <p className="sub">2-hour shoot. 20+ edited photos. Delivered in 48 hours.</p>
          <a className="btn-pill btn-grad" href="#book">Book Your Shoot →</a>
        </div>
        <div className="hero-media" aria-hidden="true">
          {/* Hero image: edited product shot, landscape orientation */}
          <span className="tag">Hero image · drop file here</span>
        </div>
      </section>

      <section className="ph-includes">
        <div className="lede">
          <div>
            <p className="mono-label">What&apos;s included</p>
            <h2>Everything you need <em>to look the part.</em></h2>
          </div>
          <p>One flat price, no surprises. Built for Bendigo small businesses that want to stop posting phone pics.</p>
        </div>
        <div className="feature-grid">
          <div className="feature-card">
            <span className="ic" aria-hidden="true">⏱</span>
            <h3>2 hours, on your turf</h3>
            <p>Shop, workspace, wherever your product lives. We come to you.</p>
          </div>
          <div className="feature-card">
            <span className="ic" aria-hidden="true">📸</span>
            <h3>20+ edited photos</h3>
            <p>Hero shots, lifestyle, detail, and social-ready crops.</p>
          </div>
          <div className="feature-card">
            <span className="ic" aria-hidden="true">⚡</span>
            <h3>48-hour turnaround</h3>
            <p>Shoot Monday, post Wednesday.</p>
          </div>
          <div className="feature-card">
            <span className="ic" aria-hidden="true">📁</span>
            <h3>Full usage rights</h3>
            <p>Print, post, advertise. They&apos;re yours forever.</p>
          </div>
          <div className="feature-card">
            <span className="ic" aria-hidden="true">💰</span>
            <h3>$300 flat</h3>
            <p>No travel fees within Bendigo. No editing add-ons.</p>
          </div>
          <div className="feature-card">
            <span className="ic" aria-hidden="true">🎯</span>
            <h3>Bendigo focused</h3>
            <p>Built for local small businesses, not big brands.</p>
          </div>
        </div>
      </section>

      <section className="ph-how">
        <p className="mono-label">How it works</p>
        <h2>Three steps, <em>start to inbox.</em></h2>
        <div className="how-steps">
          <div className="how-step">
            <span className="num">1</span>
            <h3>Book</h3>
            <p>Pick a date and tell us about your business.</p>
          </div>
          <div className="how-step">
            <span className="num">2</span>
            <h3>Shoot</h3>
            <p>Two hours at your location.</p>
          </div>
          <div className="how-step">
            <span className="num">3</span>
            <h3>Deliver</h3>
            <p>20+ edited photos in your inbox within 48 hours.</p>
          </div>
        </div>
      </section>

      <div className="scarcity" role="note">Only 4 shoots available each month.</div>

      <section className="ph-book" id="book">
        <div className="head">
          <p className="mono-label">Book your shoot</p>
          <h2>Lock in <em>your date.</em></h2>
          <p>Fill in the form and we&apos;ll confirm within 24 hours.</p>
        </div>

        {status === 'success' ? (
          <div className="success" role="status" aria-live="polite">
            <div className="check" aria-hidden="true">✓</div>
            <h3>You&apos;re in.</h3>
            <p>We&apos;ll be in touch within 24 hours to confirm your date and send a calendar invite. Keep an eye on your inbox — sometimes our emails land in promotions.</p>
          </div>
        ) : (
          <form
            className="form-card"
            name="photography-booking"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={onSubmit}
            noValidate={false}
          >
            <input type="hidden" name="form-name" value="photography-booking" />
            <p className="hp"><label>Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>

            <div className="row-2">
              <div className="field">
                <label htmlFor="ph-name">Name</label>
                <input id="ph-name" name="name" type="text" placeholder="Your name" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="ph-business">Business name</label>
                <input id="ph-business" name="business" type="text" placeholder="e.g. The Corner Cafe" required autoComplete="organization" />
              </div>
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="ph-email">Email</label>
                <input id="ph-email" name="email" type="email" placeholder="you@business.com" required autoComplete="email" />
              </div>
              <div className="field">
                <label htmlFor="ph-phone">Phone</label>
                <input id="ph-phone" name="phone" type="tel" placeholder="0400 000 000" required autoComplete="tel" />
              </div>
            </div>

            <div className="field">
              <label htmlFor="ph-shooting">What are we shooting?</label>
              <textarea id="ph-shooting" name="shooting" placeholder="e.g. coffee products, retail homeware, café food" required />
            </div>

            <div className="field">
              <label htmlFor="ph-address">Shoot location address</label>
              <input id="ph-address" name="address" type="text" placeholder="Street, suburb" required autoComplete="street-address" />
            </div>

            <div className="row-2">
              <div className="field">
                <label htmlFor="ph-date1">Preferred date 1</label>
                <input id="ph-date1" name="date1" type="date" required />
              </div>
              <div className="field">
                <label htmlFor="ph-date2">Preferred date 2</label>
                <input id="ph-date2" name="date2" type="date" required />
              </div>
            </div>

            <div className="field">
              <label htmlFor="ph-notes">Anything else we should know? <span className="opt">(optional)</span></label>
              <textarea id="ph-notes" name="notes" placeholder="Access notes, opening hours, vibe references, anything that helps us prep" />
            </div>

            <div className="submit-row" aria-live="polite">
              <button className="btn-pill btn-grad" type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Sending…' : 'Lock In My Shoot →'}
              </button>
              {status === 'error'
                ? <span className="micro err">⚠ {errorMsg}</span>
                : <span className="micro">→ 50% deposit confirms the date · we reply within 24 hours</span>}
            </div>
          </form>
        )}
      </section>

      <section className="ph-faq">
        <div className="ph-faq-inner">
          <p className="mono-label">Frequently asked</p>
          <h2>Questions, <em>answered.</em></h2>
          <details open>
            <summary>What kind of businesses is this for?</summary>
            <p>Mostly Bendigo small businesses — retail, hospitality, trades, services. If you sell something physical or run a space that has a vibe, we can shoot it.</p>
          </details>
          <details>
            <summary>Do I need to provide anything?</summary>
            <p>Just your products and the space. We bring the camera, lights, and the edit.</p>
          </details>
          <details>
            <summary>What if it rains?</summary>
            <p>We&apos;ll reschedule. No charge, no drama.</p>
          </details>
          <details>
            <summary>Can I use the photos for ads?</summary>
            <p>Yes. Full commercial usage rights are included — socials, website, print ads, packaging, anywhere.</p>
          </details>
          <details>
            <summary>Do you travel outside Bendigo?</summary>
            <p>Yes, within 25km. Outside that, message us and we&apos;ll work it out.</p>
          </details>
          <details>
            <summary>When do I pay?</summary>
            <p>50% deposit to lock in the date, 50% on delivery. Invoiced through Pulse — 30 day terms standard, but most clients pay on the spot.</p>
          </details>
        </div>
      </section>

      <section className="ph-final">
        <p className="mono-label">One last thing</p>
        <h2>Ready to stop<br />posting <em>phone pics?</em></h2>
        <p className="sub">Tap below. Two minutes to fill in, 48 hours to delivered photos.</p>
        <a className="btn-pill btn-grad" href="#book" style={{ padding: '18px 36px', fontSize: 15 }}>Book My Shoot →</a>
      </section>
    </main>
  )
}
