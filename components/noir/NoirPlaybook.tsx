'use client'

import { useEffect, useState, type FormEvent } from 'react'

const PDF_URL = '/Pulse_Content_Playbook.pdf'

const CHAPTERS = [
  ['01', 'Set up your studio for free', 'Turn the phone in your pocket into a content machine, lighting, framing, and sound included.'],
  ['02', 'The 3-second hook formula', 'How to stop the scroll before anyone decides they’re not interested.'],
  ['03', 'Talk to one person', 'The voice shift that makes a video feel made for the viewer, not the masses.'],
  ['04', 'Steal the b-roll shortcut', 'The handful of shots that make any business look polished and intentional.'],
  ['05', 'Captions that get read', 'Structure your on-screen text so people watch to the end with the sound off.'],
  ['06', 'A week of content in an hour', 'The batching system that kills the daily scramble for good.'],
  ['07', 'Post at the right time', 'When to publish on each platform so the algorithm actually does its job.'],
  ['08', 'Turn views into customers', 'The call-to-action playbook that converts attention into booked work.'],
]

export default function NoirPlaybook() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const e = params.get('email')
    if (e) {
      // Came from the home hero — already captured + emailed there. Show the download straight away.
      setEmail(e)
      setSent(true)
    }
  }, [])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
    if (!name.trim() || !emailOk) {
      alert('Please add your full name and a valid email address.')
      return
    }
    const fd = new URLSearchParams({ 'form-name': 'playbook', name: name.trim(), email: email.trim() })
    fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() }).catch(() => {})
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'playbook', name: name.trim(), email: email.trim() }) }).catch(() => {})
    setSent(true)
  }

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      <div className="glow-layer">
        <div className="glow" style={{ top: -180, left: -120, width: 620, height: 620, background: 'radial-gradient(circle,rgba(249,115,22,0.18),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 14s ease-in-out infinite' }} />
        <div className="glow" style={{ top: 760, right: -160, width: 560, height: 560, background: 'radial-gradient(circle,rgba(60,150,255,0.12),rgba(60,150,255,0) 65%)', animation: 'pulseFloat2 18s ease-in-out infinite' }} />
        <div className="glow-grid" />
      </div>

      {/* hero */}
      <div className="grid-collapse" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '80px 40px 0', display: 'grid', gridTemplateColumns: '1fr 1.05fr', gap: 56, alignItems: 'center' }}>
        <div style={{ animation: 'riseUpClean 0.8s ease both' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, padding: '8px 16px', borderRadius: 999, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', fontSize: 13, fontWeight: 700, color: '#fed7aa', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: 24 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#F97316', boxShadow: '0 0 8px #F97316' }} />
            Free playbook
          </div>
          <h1 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(38px,4vw,56px)', lineHeight: 1.04, letterSpacing: '-0.035em', margin: 0 }}>8 ways to make your business look stupidly good on social, <span style={{ color: '#F97316' }}>without hiring a videographer.</span></h1>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: '22px 0 0', maxWidth: 480 }}>Download your <span style={{ color: '#F4F5F7', fontWeight: 700 }}>free</span> copy of the playbook: the exact 8-step system we use to make our clients&apos; content look stupidly good, all shot on a phone.</p>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: '14px 0 0', maxWidth: 480 }}>Everything you need to post content that gets seen, looks the part, and actually brings in customers. No agency, no expensive gear, no fluff.</p>

          {!sent ? (
            <form onSubmit={onSubmit} style={{ marginTop: 32, maxWidth: 460, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name" className="noir-input" />
              <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address" className="noir-input" />
              <button type="submit" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 13, background: '#F97316', color: '#1a0800', fontWeight: 800, fontSize: 16, cursor: 'pointer', boxShadow: '0 10px 30px rgba(249,115,22,0.35)', marginTop: 2, border: 0 }}>Send my free copy <span>→</span></button>
              <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(244,245,247,0.45)', fontWeight: 500 }}>Instant download. No spam, ever. Unsubscribe any time.</div>
            </form>
          ) : (
            <div style={{ marginTop: 32, maxWidth: 460 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F97316', color: '#1a0800', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18, boxShadow: '0 10px 30px rgba(249,115,22,0.4)' }}>✓</div>
              <h2 className="sora" style={{ fontWeight: 800, fontSize: 28, letterSpacing: '-0.02em', margin: '0 0 10px' }}>You&apos;re in.</h2>
              <p style={{ fontSize: 16, color: 'rgba(244,245,247,0.66)', lineHeight: 1.55, fontWeight: 500, margin: '0 0 22px', maxWidth: 400 }}>Your copy of the playbook is ready. Hit the button below to download it.</p>
              <a href={PDF_URL} download className="btn-orange" style={{ padding: '16px 30px', fontSize: 16 }}>↓ Download the playbook</a>
            </div>
          )}
        </div>

        {/* 3D ebook */}
        <div style={{ display: 'flex', justifyContent: 'center', perspective: 1600, transform: 'translateY(-40px)' }}>
          <div style={{ position: 'relative', width: 'clamp(340px,36vw,500px)', aspectRatio: '530/740', transformStyle: 'preserve-3d', borderRadius: '3px 12px 12px 3px', boxShadow: '46px 60px 100px rgba(0,0,0,0.6),0 0 0 1px rgba(255,255,255,0.04)', animation: 'bookFloat 6s ease-in-out infinite' }}>
            <div style={{ position: 'absolute', inset: 0, borderRadius: '3px 9px 9px 3px', overflow: 'hidden', background: 'linear-gradient(150deg,#15151c 0%,#0c0c12 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '14% 10%' }}>
              <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 18, background: 'linear-gradient(90deg,rgba(0,0,0,0.55),rgba(255,255,255,0.05) 60%,transparent)' }} />
              <div style={{ position: 'absolute', left: 0, right: 0, top: '82%', height: 4, background: '#F97316', opacity: 0.9 }} />
              <div style={{ color: '#F97316', fontWeight: 800, fontSize: 'clamp(11px,1vw,15px)', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: '8%' }}>The Free Playbook</div>
              <div className="sora" style={{ fontWeight: 800, fontSize: 'clamp(150px,18vw,260px)', lineHeight: 0.8, color: '#F97316', textShadow: '0 0 64px rgba(249,115,22,0.45)', marginBottom: '4%' }}>8</div>
              <div className="sora" style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 'clamp(20px,2.8vw,38px)', lineHeight: 1.04, color: '#fff', letterSpacing: '-0.01em' }}>Ways to Look<br />Stupidly Good<br />on Social</div>
              <div style={{ marginTop: 'auto', color: 'rgba(244,245,247,0.5)', fontSize: 'clamp(10px,0.9vw,14px)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>By Pulse Social</div>
            </div>
          </div>
        </div>
      </div>

      {/* what's inside */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '120px 40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div className="kicker" style={{ marginBottom: 14 }}>What&apos;s inside</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(32px,3.5vw,48px)', letterSpacing: '-0.03em', margin: 0 }}>8 chapters. Zero fluff.</h2>
        </div>
        <div className="grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 14 }}>
          {CHAPTERS.map(([num, title, desc]) => (
            <div key={num} style={{ display: 'flex', gap: 18, padding: 24, borderRadius: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div className="sora" style={{ flex: 'none', width: 40, height: 40, borderRadius: 11, background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F97316', fontWeight: 800, fontSize: 16 }}>{num}</div>
              <div>
                <div className="sora" style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.01em' }}>{title}</div>
                <p style={{ fontSize: 14.5, color: 'rgba(244,245,247,0.6)', lineHeight: 1.5, margin: '6px 0 0', fontWeight: 500 }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* final CTA */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1000, margin: '110px auto 0', padding: '0 40px 90px' }}>
        <div style={{ borderRadius: 28, padding: 1, background: 'linear-gradient(160deg,rgba(249,115,22,0.4),rgba(255,255,255,0.02))', boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}>
          <div style={{ borderRadius: 27, background: 'rgba(13,15,17,0.74)', backdropFilter: 'blur(26px) saturate(160%)', border: '1px solid rgba(255,255,255,0.06)', padding: 56, textAlign: 'center' }}>
            <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,3.4vw,42px)', lineHeight: 1.08, letterSpacing: '-0.03em', margin: '0 auto', maxWidth: 560 }}>Get the playbook. Start looking the part.</h2>
            <p style={{ fontSize: 17, color: 'rgba(244,245,247,0.64)', lineHeight: 1.55, margin: '18px auto 32px', fontWeight: 500, maxWidth: 440 }}>It&apos;s free, it&apos;s instant, and it&apos;s the exact system we charge clients for. Grab it before we wise up.</p>
            <button onClick={scrollTop} className="btn-orange" style={{ padding: '17px 32px', fontSize: 17 }}>Send me my free copy <span>→</span></button>
          </div>
        </div>
      </div>
    </>
  )
}
