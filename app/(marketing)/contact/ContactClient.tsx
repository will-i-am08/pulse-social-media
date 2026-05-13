'use client'

import Link from 'next/link'
import { useRef, useState, type FormEvent } from 'react'

const CSS = `
.pulse-contact .selector-wrap{max-width:1320px;margin:0 auto;padding:48px 48px 24px}
.pulse-contact .selector-wrap .mono-label{margin:0 0 16px}
.pulse-contact .selector-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:16px}
.pulse-contact .svc-card{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:28px;display:flex;flex-direction:column;gap:10px;text-align:left;cursor:pointer;font-family:inherit;color:var(--ink);transition:transform .2s, box-shadow .2s, border-color .2s, background .2s;min-height:160px;position:relative}
.pulse-contact .svc-card:hover{transform:translateY(-2px);box-shadow:0 16px 36px -20px rgba(0,0,0,.14);border-color:var(--accent)}
.pulse-contact .svc-card[aria-pressed="true"]{border-color:var(--accent);background:var(--accent-tint);box-shadow:0 0 0 3px rgba(255,84,115,.12)}
.pulse-contact .svc-card h3{font-size:17px;font-weight:600;letter-spacing:-0.01em;margin:0}
.pulse-contact .svc-card p{font-size:13px;line-height:1.55;color:var(--muted);margin:0}
.pulse-contact .svc-card .corner{position:absolute;top:18px;right:18px;font-family:'JetBrains Mono',monospace;font-size:14px;color:var(--accent);opacity:.7}
.pulse-contact .svc-card .tick{position:absolute;top:18px;right:18px;width:20px;height:20px;border-radius:50%;background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700}
@media(max-width:1080px){.pulse-contact .selector-grid{grid-template-columns:repeat(2,1fr)}}
@media(max-width:560px){.pulse-contact .selector-grid{grid-template-columns:1fr}}
@media(max-width:820px){.pulse-contact .selector-wrap{padding:32px 24px 16px}}

.pulse-contact .funnel-wrap{max-width:1080px;margin:0 auto;padding:24px 48px 64px;scroll-margin-top:24px}
.pulse-contact .form-card{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:40px;display:flex;flex-direction:column;gap:18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.pulse-contact .form-card h3{font-size:24px;font-weight:500;letter-spacing:-0.02em;margin:0 0 4px}
.pulse-contact .form-card .lede{color:var(--muted);font-size:14px;line-height:1.5;margin:0 0 8px}
.pulse-contact .field{display:flex;flex-direction:column;gap:6px}
.pulse-contact .field label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted)}
.pulse-contact .field label .opt{text-transform:none;letter-spacing:0;font-family:'Plus Jakarta Sans',sans-serif;color:#9ca3af;font-size:11px;margin-left:6px}
.pulse-contact .field input,.pulse-contact .field textarea,.pulse-contact .field select{background:var(--paper-2);border:1px solid var(--hair);border-radius:10px;padding:14px 16px;font-family:inherit;font-size:15px;color:var(--ink);outline:0;transition:border-color .15s,box-shadow .15s}
.pulse-contact .field input:focus,.pulse-contact .field textarea:focus,.pulse-contact .field select:focus{border-color:var(--accent);box-shadow:0 0 0 3px rgba(255,84,115,.12)}
.pulse-contact .field textarea{resize:vertical;min-height:120px}
.pulse-contact .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pulse-contact .checkgroup{display:flex;gap:8px;flex-wrap:wrap}
.pulse-contact .checkgroup label{padding:10px 16px;border-radius:999px;border:1px solid var(--hair);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);cursor:pointer;background:#fff;display:inline-flex;align-items:center;gap:8px;transition:border-color .15s,color .15s,background .15s}
.pulse-contact .checkgroup label:has(input:checked){background:var(--ink);color:#fff;border-color:var(--ink)}
.pulse-contact .checkgroup input{accent-color:var(--accent);position:absolute;left:-9999px;opacity:0;pointer-events:none}
.pulse-contact .hp{position:absolute;left:-9999px;width:1px;height:1px;overflow:hidden}
.pulse-contact .submit-row{display:flex;flex-direction:column;gap:10px;margin-top:8px}
.pulse-contact .submit-row button{width:100%;justify-content:center;padding:18px 26px;font-size:15px}
.pulse-contact .submit-row .micro{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);text-align:center}
.pulse-contact .submit-row .micro.err{color:#e11d48;text-transform:none;letter-spacing:.04em;font-family:inherit;font-size:13px}
.pulse-contact .success{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:48px;text-align:center}
.pulse-contact .success .check{width:56px;height:56px;border-radius:50%;background:linear-gradient(135deg,var(--accent-soft) 0%, var(--accent) 100%);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:28px;margin-bottom:18px}
.pulse-contact .success h3{font-size:28px;font-weight:500;letter-spacing:-0.02em;margin:0 0 12px}
.pulse-contact .success p{color:var(--muted);font-size:16px;line-height:1.6;margin:0;max-width:480px;margin:0 auto}
@media(max-width:820px){.pulse-contact .funnel-wrap{padding:8px 24px 48px}.pulse-contact .form-card{padding:24px}.pulse-contact .row-2{grid-template-columns:1fr}}

.pulse-contact .trust{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair);display:grid;grid-template-columns:1fr 1fr;gap:64px;align-items:center}
.pulse-contact .logo-row{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
.pulse-contact .logo-ph{height:56px;background:repeating-linear-gradient(-45deg,rgba(10,10,10,.04) 0 1px,transparent 1px 9px),#f4f3ee;border:1px solid var(--hair);border-radius:10px;display:flex;align-items:center;justify-content:center;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.16em;text-transform:uppercase;color:#9ca3af}
.pulse-contact .testimonial blockquote{margin:0;font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:24px;line-height:1.4;color:var(--ink);border-left:3px solid var(--accent);padding:4px 0 4px 24px}
.pulse-contact .testimonial .cite{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--muted);margin-top:14px;display:block}
@media(max-width:820px){.pulse-contact .trust{grid-template-columns:1fr;padding:56px 24px;gap:40px}.pulse-contact .logo-row{grid-template-columns:repeat(2,1fr)}}

.pulse-contact .foot-block{max-width:1320px;margin:0 auto;padding:56px 48px;border-top:1px solid var(--hair);display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.pulse-contact .foot-block .item .k{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin:0 0 8px}
.pulse-contact .foot-block .item .v{font-size:15px;line-height:1.55;color:var(--ink);margin:0}
.pulse-contact .foot-block .item .v a{border-bottom:1px solid var(--accent)}
@media(max-width:820px){.pulse-contact .foot-block{grid-template-columns:1fr;padding:32px 24px;gap:24px}}

.pulse-contact .faq{background:var(--paper-2);padding:96px 48px;border-top:1px solid var(--hair)}
.pulse-contact .faq-inner{max-width:1080px;margin:0 auto}
.pulse-contact .faq h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;margin:0 0 40px}
.pulse-contact .faq h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-contact details{border-top:1px solid var(--hair);padding:22px 0}
.pulse-contact details:last-child{border-bottom:1px solid var(--hair)}
.pulse-contact summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:19px;font-weight:500}
.pulse-contact summary::-webkit-details-marker{display:none}
.pulse-contact summary::after{content:'+';font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:22px}
.pulse-contact details[open] summary::after{content:'−'}
.pulse-contact details p{color:#444;line-height:1.65;margin:14px 0 0;max-width:720px}
@media(max-width:820px){.pulse-contact .faq{padding:64px 24px}}

.pulse-contact .quick-form{max-width:760px;margin:0 auto;padding:96px 48px 32px;border-top:1px solid var(--hair)}
.pulse-contact .quick-form .head{text-align:center;margin-bottom:28px}
.pulse-contact .quick-form h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;line-height:1.05;margin:14px 0 14px}
.pulse-contact .quick-form h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-contact .quick-form .head p{color:var(--muted);font-size:16px;line-height:1.5;margin:0;max-width:480px;margin:0 auto}
@media(max-width:820px){.pulse-contact .quick-form{padding:56px 24px 24px}}

.pulse-contact .final-call{max-width:1080px;margin:0 auto;padding:64px 48px 96px;text-align:center}
.pulse-contact .final-call h2{font-size:clamp(48px,6vw,84px);font-weight:200;letter-spacing:-0.04em;line-height:.95;margin:18px 0 22px}
.pulse-contact .final-call h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-contact .final-call .sub{color:var(--muted);font-size:17px;max-width:480px;margin:0 auto 32px;line-height:1.5}
@media(max-width:820px){.pulse-contact .final-call{padding:56px 24px}}
`

type Service = 'social' | 'project' | 'general'
type Status = 'idle' | 'submitting' | 'success' | 'error'

const PLATFORMS = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Other'] as const

export default function ContactClient() {
  const [selected, setSelected] = useState<Service | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState<string>('')
  const [quickStatus, setQuickStatus] = useState<Status>('idle')
  const [quickError, setQuickError] = useState<string>('')
  const formRef = useRef<HTMLDivElement>(null)

  function selectCard(svc: Service) {
    setSelected(svc)
    setStatus('idle')
    setErrorMsg('')
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 80)
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (status === 'submitting' || status === 'success' || !selected) return

    const form = e.currentTarget
    const data = new FormData(form)
    const honey = String(data.get('bot-field') ?? '').trim()
    if (honey) return

    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const business = String(data.get('business') ?? '').trim()
    const phone = String(data.get('phone') ?? '').trim()

    let intent = ''
    let message = ''
    const formName = selected === 'social' ? 'lead-social' : selected === 'project' ? 'lead-project' : 'lead-general'

    if (selected === 'social') {
      const platforms = PLATFORMS.filter(p => data.get(`platform-${p.toLowerCase()}`) === 'on')
      const cadence = String(data.get('cadence') ?? '').trim()
      const budget = String(data.get('budget') ?? '').trim()
      const about = String(data.get('about') ?? '').trim()
      intent = 'Social media management'
      message = [
        `Business: ${business}`,
        phone && `Phone: ${phone}`,
        `Platforms: ${platforms.length ? platforms.join(', ') : '—'}`,
        `Posts per week: ${cadence || '—'}`,
        `Monthly budget: ${budget || '—'}`,
        about && `\nAbout the business:\n${about}`,
      ].filter(Boolean).join('\n')
    } else if (selected === 'project') {
      const project = String(data.get('project') ?? '').trim()
      const budget = String(data.get('budget') ?? '').trim()
      const timing = String(data.get('timing') ?? '').trim()
      intent = 'One-off project'
      message = [
        `Business: ${business}`,
        phone && `Phone: ${phone}`,
        `Rough budget: ${budget || '—'}`,
        `Timing: ${timing || '—'}`,
        project && `\nProject:\n${project}`,
      ].filter(Boolean).join('\n')
    } else {
      const story = String(data.get('story') ?? '').trim()
      intent = 'General enquiry'
      message = [
        `Business: ${business}`,
        phone && `Phone: ${phone}`,
        story && `\n${story}`,
      ].filter(Boolean).join('\n')
    }

    setStatus('submitting')
    setErrorMsg('')

    // Mirror to Netlify Forms dashboard
    const netlifyBody = new URLSearchParams()
    data.forEach((v, k) => { if (typeof v === 'string') netlifyBody.append(k, v) })
    netlifyBody.set('intent', intent)
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
        body: JSON.stringify({ name, email, intent, message }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        throw new Error(error || 'Something went wrong sending your enquiry.')
      }
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMsg(err instanceof Error ? err.message : 'Something went wrong sending your enquiry.')
    }
    // form-name is included via hidden input below for Netlify clarity (unused server-side)
    void formName
  }

  async function onQuickSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (quickStatus === 'submitting' || quickStatus === 'success') return

    const form = e.currentTarget
    const data = new FormData(form)
    const honey = String(data.get('bot-field') ?? '').trim()
    if (honey) return

    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const story = String(data.get('story') ?? '').trim()
    const intent = 'General enquiry'
    const message = story

    setQuickStatus('submitting')
    setQuickError('')

    const netlifyBody = new URLSearchParams()
    data.forEach((v, k) => { if (typeof v === 'string') netlifyBody.append(k, v) })
    netlifyBody.set('intent', intent)
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
        body: JSON.stringify({ name, email, intent, message }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        throw new Error(error || 'Something went wrong sending your message.')
      }
      setQuickStatus('success')
    } catch (err) {
      setQuickStatus('error')
      setQuickError(err instanceof Error ? err.message : 'Something went wrong sending your message.')
    }
  }

  const successCopy =
    selected === 'social'
      ? "We'll be in touch within one business day to book a strategy call. No hard sell — just a chat to see if we're a fit."
      : selected === 'project'
        ? 'Brief received. We’ll reply within one business day with a yes/no/maybe and rough timing.'
        : 'Got it. We’ll reach out within one business day to figure out what you need.'

  return (
    <main className="pulse-contact">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="page-head">
        <div>
          <p className="mono-label">Get in touch</p>
          <h1>Let&apos;s work out<br />if we&apos;re <em>a fit.</em></h1>
        </div>
        <p>Tell us what you need and we&apos;ll point you in the right direction — even if that&apos;s not us.</p>
      </section>

      <section className="selector-wrap" aria-labelledby="svc-heading">
        <p className="mono-label" id="svc-heading">What are you after?</p>
        <div className="selector-grid" role="radiogroup" aria-label="Choose a service">
          <button
            type="button"
            className="svc-card"
            aria-pressed={selected === 'social'}
            onClick={() => selectCard('social')}
          >
            {selected === 'social' ? <span className="tick" aria-hidden="true">✓</span> : null}
            <h3>Social Media Management</h3>
            <p>Ongoing content, captions, scheduling, and strategy.</p>
          </button>

          <Link href="/photography" className="svc-card" aria-label="Photography Package — opens dedicated page">
            <span className="corner" aria-hidden="true">↗</span>
            <h3>Photography Package</h3>
            <p>$300 product shoot for Bendigo small businesses.</p>
          </Link>

          <button
            type="button"
            className="svc-card"
            aria-pressed={selected === 'project'}
            onClick={() => selectCard('project')}
          >
            {selected === 'project' ? <span className="tick" aria-hidden="true">✓</span> : null}
            <h3>One-off Project</h3>
            <p>Logo, branding, a single campaign, content audit, etc.</p>
          </button>

          <button
            type="button"
            className="svc-card"
            aria-pressed={selected === 'general'}
            onClick={() => selectCard('general')}
          >
            {selected === 'general' ? <span className="tick" aria-hidden="true">✓</span> : null}
            <h3>Not sure yet</h3>
            <p>Just want a chat about what&apos;s possible.</p>
          </button>
        </div>
      </section>

      {selected && (
        <section className="funnel-wrap" ref={formRef}>
          {status === 'success' ? (
            <div className="success" role="status" aria-live="polite">
              <div className="check" aria-hidden="true">✓</div>
              <h3>Thanks — we&apos;ve got it.</h3>
              <p>{successCopy}</p>
            </div>
          ) : (
            <form
              key={selected}
              className="form-card"
              name={selected === 'social' ? 'lead-social' : selected === 'project' ? 'lead-project' : 'lead-general'}
              method="POST"
              data-netlify="true"
              data-netlify-honeypot="bot-field"
              onSubmit={onSubmit}
            >
              <input
                type="hidden"
                name="form-name"
                value={selected === 'social' ? 'lead-social' : selected === 'project' ? 'lead-project' : 'lead-general'}
              />
              <p className="hp"><label>Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>

              <h3>
                {selected === 'social' && 'Tell us about the brand.'}
                {selected === 'project' && 'Tell us about the project.'}
                {selected === 'general' && 'Tell us what’s going on.'}
              </h3>
              <p className="lede">
                {selected === 'social' && 'A few quick details so we can shape the right strategy call.'}
                {selected === 'project' && 'Enough for us to give you a yes/no/maybe and rough timing.'}
                {selected === 'general' && 'We’ll work out the right next step from here.'}
              </p>

              <div className="row-2">
                <div className="field">
                  <label htmlFor="c-name">Name</label>
                  <input id="c-name" name="name" type="text" placeholder="Your name" required autoComplete="name" />
                </div>
                <div className="field">
                  <label htmlFor="c-business">Business name</label>
                  <input id="c-business" name="business" type="text" placeholder="e.g. Acme Co." required autoComplete="organization" />
                </div>
              </div>
              <div className="row-2">
                <div className="field">
                  <label htmlFor="c-email">Email</label>
                  <input id="c-email" name="email" type="email" placeholder="you@business.com" required autoComplete="email" />
                </div>
                <div className="field">
                  <label htmlFor="c-phone">Phone <span className="opt">(optional)</span></label>
                  <input id="c-phone" name="phone" type="tel" placeholder="0400 000 000" autoComplete="tel" />
                </div>
              </div>

              {selected === 'social' && (
                <>
                  <div className="field">
                    <label>Which platforms?</label>
                    <div className="checkgroup" role="group" aria-label="Platforms">
                      {PLATFORMS.map(p => (
                        <label key={p}>
                          <input type="checkbox" name={`platform-${p.toLowerCase()}`} />
                          <span>{p}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="c-cadence">Posts per week</label>
                      <select id="c-cadence" name="cadence" defaultValue="">
                        <option value="" disabled>Select…</option>
                        <option>2–3</option>
                        <option>4–5</option>
                        <option>6+</option>
                        <option>Not sure</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="c-budget">Monthly budget</label>
                      <select id="c-budget" name="budget" defaultValue="">
                        <option value="" disabled>Select…</option>
                        <option>Under $500</option>
                        <option>$500–$1000</option>
                        <option>$1000–$2000</option>
                        <option>$2000+</option>
                      </select>
                    </div>
                  </div>
                  <div className="field">
                    <label htmlFor="c-about">Tell us about your business</label>
                    <textarea id="c-about" name="about" placeholder="What you do, who for, and what you’re trying to achieve." />
                  </div>
                </>
              )}

              {selected === 'project' && (
                <>
                  <div className="field">
                    <label htmlFor="c-project">What&apos;s the project?</label>
                    <textarea id="c-project" name="project" placeholder="One-off campaign, content audit, logo, brand refresh, etc." required />
                  </div>
                  <div className="row-2">
                    <div className="field">
                      <label htmlFor="c-pbudget">Rough budget</label>
                      <select id="c-pbudget" name="budget" defaultValue="">
                        <option value="" disabled>Select…</option>
                        <option>Under $500</option>
                        <option>$500–$1500</option>
                        <option>$1500–$5000</option>
                        <option>$5000+</option>
                        <option>Not sure</option>
                      </select>
                    </div>
                    <div className="field">
                      <label htmlFor="c-timing">When do you need it done?</label>
                      <select id="c-timing" name="timing" defaultValue="">
                        <option value="" disabled>Select…</option>
                        <option>ASAP</option>
                        <option>Within a month</option>
                        <option>Within 3 months</option>
                        <option>No rush</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {selected === 'general' && (
                <div className="field">
                  <label htmlFor="c-story">What&apos;s going on?</label>
                  <textarea id="c-story" name="story" placeholder="Tell us what’s going on and we’ll work it out together." required />
                </div>
              )}

              <div className="submit-row" aria-live="polite">
                <button className="btn-pill btn-grad" type="submit" disabled={status === 'submitting'}>
                  {status === 'submitting'
                    ? 'Sending…'
                    : selected === 'social'
                      ? 'Get My Strategy Call Booked →'
                      : selected === 'project'
                        ? 'Send Project Brief →'
                        : 'Start the Conversation →'}
                </button>
                {status === 'error'
                  ? <span className="micro err">⚠ {errorMsg}</span>
                  : <span className="micro">→ We reply within one business day</span>}
              </div>
            </form>
          )}
        </section>
      )}

      <section className="trust">
        <div>
          <p className="mono-label" style={{ marginBottom: 16 }}>Trusted by</p>
          <div className="logo-row">
            {/* Client logo */}<div className="logo-ph">Logo</div>
            {/* Client logo */}<div className="logo-ph">Logo</div>
            {/* Client logo */}<div className="logo-ph">Logo</div>
            {/* Client logo */}<div className="logo-ph">Logo</div>
            {/* Client logo */}<div className="logo-ph">Logo</div>
            {/* Client logo */}<div className="logo-ph">Logo</div>
          </div>
        </div>
        <div className="testimonial">
          {/* Replace with real testimonial quote */}
          <blockquote>“Pulse took over our socials and within a quarter we were getting weekly leads we didn’t have before. They get small business.”</blockquote>
          {/* Replace with real client name + role */}
          <span className="cite">— Client name · Business name</span>
        </div>
      </section>

      <section className="foot-block">
        <div className="item">
          <p className="k">Response time</p>
          <p className="v">We reply to every enquiry within one business day.</p>
        </div>
        <div className="item">
          <p className="k">Where we&apos;re based</p>
          <p className="v">Based in Bendigo. Working with businesses across regional Victoria.</p>
        </div>
        <div className="item">
          <p className="k">Email</p>
          {/* Fill in correct email */}
          <p className="v"><a href="mailto:hello@pulsesocialmedia.com.au">hello@pulsesocialmedia.com.au</a></p>
        </div>
      </section>

      <section className="faq">
        <div className="faq-inner">
          <p className="mono-label">Questions</p>
          <h2 style={{ marginTop: 16 }}>People always <em>ask.</em></h2>
          <details open><summary>How does pricing work?</summary><p>Retainers are scoped per engagement — we send a flat-rate SOW within 48 hours of a brief. No hourly games, no tiered pricing wall. One-off projects (a launch campaign, a content audit, a CaptionCraft rollout) can be scoped independently.</p></details>
          <details><summary>How long does it take to get started?</summary><p>From signed scope to first post in-market is usually 2–3 weeks. That covers kickoff, brand immersion, tool setup, a first content sprint, and review.</p></details>
          <details><summary>Do you work with brands outside Bendigo?</summary><p>Yes — everything runs remote-first, so location doesn&apos;t matter much. Happy to take on brands anywhere in Australia and beyond, as long as the time zones aren&apos;t completely silly.</p></details>
          <details><summary>Do you use AI? Should I be worried?</summary><p>AI handles the boring parts — drafting, tagging, scheduling, transcription — while we stay firmly in charge of voice, strategy, and anything creative. CaptionCraft is our in-house tool for exactly this, and nothing ships without our eyes on it.</p></details>
          <details><summary>Can you work with our existing team?</summary><p>Yes — we often slot alongside in-house marketing, creative, or comms teams. Whatever shape the problem needs.</p></details>
          <details><summary>Do you offer discovery workshops?</summary><p>Yes. A short Discovery Sprint produces a tone-of-voice doc, a content engine setup, a 90-day intent map, and a measurement framework. Good way to test-drive the working style before a longer engagement.</p></details>
        </div>
      </section>

      <section className="quick-form">
        <div className="head">
          <p className="mono-label">Or just drop us a line</p>
          <h2>Skip the form, <em>kind of.</em></h2>
          <p>Didn&apos;t fit any of the lanes above? Tell us what&apos;s on your mind — we&apos;ll reply within one business day.</p>
        </div>

        {quickStatus === 'success' ? (
          <div className="success" role="status" aria-live="polite">
            <div className="check" aria-hidden="true">✓</div>
            <h3>Message received.</h3>
            <p>Thanks for reaching out — we&apos;ll be in touch within one business day.</p>
          </div>
        ) : (
          <form
            className="form-card"
            name="lead-general"
            method="POST"
            data-netlify="true"
            data-netlify-honeypot="bot-field"
            onSubmit={onQuickSubmit}
          >
            <input type="hidden" name="form-name" value="lead-general" />
            <p className="hp"><label>Don&apos;t fill this out: <input name="bot-field" tabIndex={-1} autoComplete="off" /></label></p>

            <div className="row-2">
              <div className="field">
                <label htmlFor="q-name">Name</label>
                <input id="q-name" name="name" type="text" placeholder="Your name" required autoComplete="name" />
              </div>
              <div className="field">
                <label htmlFor="q-email">Email</label>
                <input id="q-email" name="email" type="email" placeholder="you@business.com" required autoComplete="email" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="q-story">What&apos;s on your mind?</label>
              <textarea id="q-story" name="story" placeholder="A line or two is plenty." required />
            </div>

            <div className="submit-row" aria-live="polite">
              <button className="btn-pill btn-grad" type="submit" disabled={quickStatus === 'submitting'}>
                {quickStatus === 'submitting' ? 'Sending…' : 'Send Message →'}
              </button>
              {quickStatus === 'error'
                ? <span className="micro err">⚠ {quickError}</span>
                : <span className="micro">→ We reply within one business day</span>}
            </div>
          </form>
        )}
      </section>

      <section className="final-call">
        <p className="mono-label">Prefer a chat?</p>
        <h2>Book a <em>call.</em></h2>
        <p className="sub">Pick a 20-minute slot that suits. No sales pitch, no pressure — just a chat about what you&apos;re trying to do.</p>
        <a className="btn-pill btn-grad" href="https://cal.eu/pulsesocialmedia/discovery-call" target="_blank" rel="noopener noreferrer" style={{ padding: '18px 36px', fontSize: 15 }}>Book a call →</a>
      </section>
    </main>
  )
}
