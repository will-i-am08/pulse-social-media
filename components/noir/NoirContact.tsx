'use client'

import { useState, type FormEvent } from 'react'

// PLACEHOLDER: set NEXT_PUBLIC_CAL_URL to your real booking link before launch.
const CAL_URL = process.env.NEXT_PUBLIC_CAL_URL ?? 'https://cal.com/pulse-social-media/discovery-call'

const SERVICES = [
  { id: 'management', label: 'Social Media Management', desc: 'Ongoing content, captions, scheduling, and strategy.' },
  { id: 'project', label: 'One-off Project', desc: 'Logo, branding, a single campaign, or a content audit.' },
  { id: 'unsure', label: 'Not sure yet', desc: 'Just want a chat about what’s possible.' },
]

const FAQS = [
  ['How does pricing work?', 'Retainers are scoped per engagement. We send a flat-rate proposal within 48 hours of a brief. No hourly games, no tiered pricing wall.'],
  ['How long does it take to get started?', 'From signed scope to first post in-market is usually 2 to 3 weeks. That covers kickoff, brand immersion, tool setup, a first content sprint, and review.'],
  ['Do you work outside Bendigo?', 'Yes, everything runs remote-first. We work with brands anywhere in Australia and beyond, as long as the time zones aren’t completely silly.'],
  ['Do you use AI?', 'AI handles the routine parts, drafting, tagging, scheduling, while we stay in charge of voice, strategy, and anything creative. Nothing ships without our eyes on it.'],
  ['Can you work with our existing team?', 'Yes, we often slot alongside in-house marketing, creative, or comms teams. Whatever shape the problem needs.'],
  ['Do you offer discovery workshops?', 'Yes. A short Discovery Sprint produces a tone-of-voice doc, a content engine setup, a 90-day intent map, and a measurement framework. A good way to test-drive the working style before a longer engagement.'],
]

export default function NoirContact() {
  const [service, setService] = useState('management')
  const [openFaq, setOpenFaq] = useState(-1)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const serviceLabel = SERVICES.find(s => s.id === service)?.label ?? 'General enquiry'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '')
    const email = String(fd.get('email') || '')
    const business = String(fd.get('business') || '')
    const message = String(fd.get('message') || '')
    fd.set('form-name', 'contact')
    fd.set('intent', serviceLabel)
    fd.set('message', `${message}${business ? `\n\nBusiness: ${business}` : ''}`)
    try {
      fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd as unknown as Record<string, string>).toString(),
      }).catch(() => {})
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent: serviceLabel, message: `${message}${business ? `\n\nBusiness: ${business}` : ''}` }),
      })
      setStatus(res.ok ? 'success' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <>
      <div className="glow-layer">
        <div className="glow" style={{ top: -180, left: -120, width: 620, height: 620, background: 'radial-gradient(circle,rgba(249,115,22,0.18),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 14s ease-in-out infinite' }} />
        <div className="glow" style={{ top: 800, right: -140, width: 520, height: 520, background: 'radial-gradient(circle,rgba(60,150,255,0.12),rgba(60,150,255,0) 65%)', animation: 'pulseFloat2 18s ease-in-out infinite' }} />
        <div className="glow-grid" />
      </div>

      {/* hero */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 760, margin: '0 auto', padding: '96px 40px 0', textAlign: 'center' }}>
        <div className="kicker" style={{ fontSize: 13, marginBottom: 18 }}>Get in touch</div>
        <h1 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(38px,10vw,84px)', lineHeight: 1.0, letterSpacing: '-0.04em', margin: 0 }}>Let&apos;s work out<br />if we&apos;re a fit.</h1>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', maxWidth: 520, margin: '26px auto 0', fontWeight: 500 }}>Tell us what you need and we&apos;ll point you in the right direction, even if that&apos;s not us.</p>
      </div>

      {/* selector + form */}
      <div className="grid-collapse m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 1100, margin: '70px auto 0', padding: '0 40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 44, alignItems: 'start' }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(244,245,247,0.5)', marginBottom: 18 }}>What are you after?</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SERVICES.map(s => {
              const active = service === s.id
              return (
                <div key={s.id} onClick={() => setService(s.id)} style={{ borderRadius: 16, padding: '22px 24px', background: active ? 'rgba(249,115,22,0.08)' : 'rgba(255,255,255,0.03)', border: active ? '1px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.07)', cursor: 'pointer' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                    <div className="sora" style={{ fontSize: 17, fontWeight: 700, letterSpacing: '-0.01em' }}>{s.label}</div>
                    {active && (
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#F97316', flex: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#04140d' }} />
                      </div>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: 'rgba(244,245,247,0.55)', margin: '6px 0 0', fontWeight: 500, lineHeight: 1.5 }}>{s.desc}</p>
                </div>
              )
            })}
          </div>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', borderRadius: 18, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6, background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(244,245,247,0.5)' }}>Email</span>
              <a href="mailto:hello@pulsesocialmedia.com.au" style={{ fontSize: 14, fontWeight: 700, color: '#F97316' }}>hello@pulsesocialmedia.com.au</a>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(244,245,247,0.5)' }}>Based in</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(244,245,247,0.8)' }}>Bendigo, Victoria</span>
            </div>
            <div style={{ padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.03)' }}>
              <span style={{ fontSize: 13.5, fontWeight: 600, color: 'rgba(244,245,247,0.5)' }}>Response time</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: 'rgba(244,245,247,0.8)' }}>Within 1 business day</span>
            </div>
          </div>
        </div>

        {/* form */}
        <div style={{ borderRadius: 24, padding: 1, background: 'linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))', boxShadow: '0 40px 100px rgba(0,0,0,0.5)' }}>
          <div className="m-card" style={{ borderRadius: 23, background: 'rgba(13,15,17,0.72)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.05)', padding: 38 }}>
            {status === 'success' ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F97316', color: '#1a0800', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 18px' }}>✓</div>
                <h3 className="sora" style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Message sent.</h3>
                <p style={{ fontSize: 15, color: 'rgba(244,245,247,0.66)' }}>We reply within one business day. No pitch, no pressure.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input name="name" required placeholder="Name" className="noir-input" style={{ padding: '15px 18px' }} />
                <input name="email" required type="email" placeholder="Email" className="noir-input" style={{ padding: '15px 18px' }} />
                <input name="business" placeholder="Business name" className="noir-input" style={{ padding: '15px 18px' }} />
                <textarea name="message" required placeholder="What's on your mind?" rows={5} className="noir-input" style={{ padding: '15px 18px', resize: 'vertical', lineHeight: 1.55 }} />
                <button type="submit" disabled={status === 'submitting'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 17, borderRadius: 13, background: '#F97316', color: '#1a0800', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 28px rgba(249,115,22,0.32)', marginTop: 4, border: 0, opacity: status === 'submitting' ? 0.6 : 1 }}>
                  {status === 'submitting' ? 'Sending…' : 'Send message →'}
                </button>
                {status === 'error' && <div style={{ textAlign: 'center', fontSize: 13, color: '#fca5a5' }}>Couldn&apos;t send — email hello@pulsesocialmedia.com.au directly.</div>}
                <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(244,245,247,0.4)', fontWeight: 500 }}>We reply within one business day. No pitch, no pressure.</div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* FAQ */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div className="kicker" style={{ fontSize: 13, marginBottom: 14 }}>Before you reach out</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,46px)', letterSpacing: '-0.03em', margin: 0 }}>People always ask.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQS.map(([q, a], i) => {
            const open = openFaq === i
            return (
              <div key={q} onClick={() => setOpenFaq(open ? -1 : i)} style={{ borderRadius: 18, background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px 28px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div className="sora" style={{ fontSize: 18, fontWeight: 600, letterSpacing: '-0.01em' }}>{q}</div>
                  <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700 }}>{open ? '–' : '+'}</div>
                </div>
                {open && <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(244,245,247,0.66)', fontWeight: 500, margin: '16px 0 0' }}>{a}</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* book a call */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '60px auto 0', padding: '0 40px 90px' }}>
        <div className="m-card" style={{ borderRadius: 24, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', padding: 44, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 40, flexWrap: 'wrap' }}>
          <div>
            <div className="kicker" style={{ fontSize: 13, marginBottom: 12 }}>Prefer a call?</div>
            <div className="sora" style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 10 }}>Book a 20-minute slot.</div>
            <p style={{ fontSize: 16, color: 'rgba(244,245,247,0.62)', fontWeight: 500, margin: 0, lineHeight: 1.55, maxWidth: 360 }}>No sales pitch. Just a conversation about what you&apos;re trying to do, and whether we&apos;re a fit.</p>
          </div>
          <a href={CAL_URL} target="_blank" rel="noopener noreferrer" className="btn-orange" style={{ flex: 'none', padding: '16px 28px', fontSize: 16, whiteSpace: 'nowrap' }}>Book a call →</a>
        </div>
        <div style={{ textAlign: 'center', marginTop: 22 }}><a href="/playbook" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: 'rgba(244,245,247,0.7)' }}>Not quite ready? Download our free playbook <span style={{ color: '#F97316' }}>→</span></a></div>
      </div>
    </>
  )
}
