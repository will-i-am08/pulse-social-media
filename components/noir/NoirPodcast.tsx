'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'

const AUDIENCE = [
  ['01', 'Founders and small-business owners'],
  ['02', 'Side-hustlers eyeing the leap to full-time'],
  ['03', 'Makers and quiet operators behind the scenes'],
  ['04', 'Anyone who prefers the honest version of the story'],
]

const PLATFORMS = ['Spotify', 'Apple Podcasts', 'YouTube', 'Founder Social']

export default function NoirPodcast() {
  const [email, setEmail] = useState('')
  const [joined, setJoined] = useState(false)
  const [err, setErr] = useState('')

  function scrollToWaitlist() {
    const el = document.querySelector('[data-anchor="waitlist"]') as HTMLElement | null
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 70
      window.scrollTo({ top: y < 0 ? 0 : y, behavior: 'smooth' })
    }
    setTimeout(() => document.getElementById('ntc-hero-email')?.focus({ preventScroll: true }), 520)
  }

  function join(e?: FormEvent) {
    e?.preventDefault()
    const value = email.trim()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setErr('Please enter a valid email address.')
      return
    }
    const fd = new URLSearchParams({ 'form-name': 'waitlist', email: value })
    fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() }).catch(() => {})
    fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'waitlist', email: value }) }).catch(() => {})
    setJoined(true)
    setErr('')
  }

  return (
    <>
      {/* ===== HERO ===== */}
      <div data-anchor="waitlist" style={{ position: 'relative', zIndex: 5, width: '100%', minHeight: '92vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', textAlign: 'center', padding: '74px 40px 0', overflow: 'hidden', background: 'radial-gradient(120% 90% at 50% 86%,rgba(84,64,61,0.55) 0%,rgba(35,37,57,0) 52%),linear-gradient(180deg,#0A0C18 0%,#0C0F1E 30%,#161B30 68%,#232539 100%)' }}>
        {/* stars */}
        {[[70, '18%', 2, 4, 0], [130, '74%', 2, 5.5, 1], [96, '46%', 1.5, 6, 0.5], [170, '30%', 1.5, 4.8, 2], [84, '88%', 1.5, 5, 1.4]].map(([top, left, size, dur, delay], i) => (
          <div key={i} style={{ position: 'absolute', top: top as number, left: left as string, width: size as number, height: size as number, borderRadius: '50%', background: '#CDD6EE', animation: `climbTwinkle ${dur}s ease-in-out ${delay}s infinite` }} />
        ))}
        {/* sun glow */}
        <div style={{ position: 'absolute', bottom: 130, left: '50%', width: 640, height: 640, borderRadius: '50%', background: 'radial-gradient(circle,rgba(242,176,102,0.42) 0%,rgba(232,143,77,0.18) 38%,rgba(232,143,77,0) 68%)', filter: 'blur(6px)', animation: 'sunGlow 9s ease-in-out infinite', pointerEvents: 'none', transform: 'translateX(-50%)' }} />

        <div style={{ position: 'relative', zIndex: 3, maxWidth: 900 }}>
          <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9A86A', marginBottom: 30 }}>A&nbsp;Pulse&nbsp;Original&nbsp;Podcast&nbsp;·&nbsp;Season&nbsp;One</div>
          <svg viewBox="0 0 140 112" style={{ width: 74, height: 59, display: 'block', margin: '0 auto 26px', overflow: 'visible' }}>
            <defs><radialGradient id="climbSunHero" cx="50%" cy="42%" r="60%"><stop offset="0%" stopColor="#F7CF95" /><stop offset="55%" stopColor="#F2B066" /><stop offset="100%" stopColor="#E88F4D" /></radialGradient></defs>
            <circle cx="70" cy="50" r="26" fill="url(#climbSunHero)" />
            <polygon points="0,112 40,58 78,112" fill="#2B3147" />
            <polygon points="62,112 102,68 140,112" fill="#262D42" />
            <polygon points="8,112 70,34 132,112" fill="#161C2C" />
            <polygon points="70,34 58,50 64,46 70,49 76,46 82.7,50" fill="#ECE6D8" />
          </svg>
          <div className="mono" style={{ fontSize: 13, fontWeight: 500, letterSpacing: '0.52em', textTransform: 'uppercase', color: 'rgba(236,230,216,0.62)', marginBottom: 4, paddingLeft: '0.52em' }}>Notes from the</div>
          <h1 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(82px,14vw,188px)', lineHeight: 0.86, letterSpacing: '0.04em', margin: 0, color: '#ECE6D8', textShadow: '0 0 60px rgba(242,176,102,0.18)' }}>Climb</h1>
          <p className="cormorant" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(20px,2.6vw,28px)', lineHeight: 1.42, color: 'rgba(205,214,238,0.84)', maxWidth: 560, margin: '28px auto 0' }}>A podcast about the long ascent: the doubt, the foothold, and the view that makes it worth the weight.</p>
        </div>

        {/* ridges */}
        <svg viewBox="0 0 1440 360" preserveAspectRatio="none" style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '42vh', minHeight: 280, zIndex: 2, display: 'block' }}>
          <polygon points="0,250 240,205 460,248 680,205 760,182 940,228 1180,200 1360,242 1440,222 1440,360 0,360" fill="#232539" opacity="0.82" />
          <polygon points="0,290 220,255 430,292 620,250 780,282 950,246 1140,288 1330,258 1440,284 1440,360 0,360" fill="#1B2034" />
          <polygon points="0,318 200,300 360,314 530,300 660,250 720,150 800,256 1000,306 1160,300 1320,316 1440,300 1440,360 0,360" fill="#0E1220" />
          <polygon points="720,150 707,172 714,165 720,169 727,165 736.5,172" fill="#ECE6D8" />
        </svg>
      </div>

      {/* waitlist capture */}
      <div style={{ position: 'relative', zIndex: 6, maxWidth: 600, margin: '-44px auto 0', padding: '0 40px' }}>
        {!joined ? (
          <form onSubmit={join} style={{ borderRadius: 18, background: 'rgba(43,49,71,0.66)', backdropFilter: 'blur(18px) saturate(150%)', border: '1px solid rgba(217,168,106,0.34)', boxShadow: '0 30px 80px rgba(8,10,20,0.6)', padding: 28 }}>
            <div className="mono" style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#D9A86A', textAlign: 'center', marginBottom: 14 }}>Join the waitlist</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <input id="ntc-hero-email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" style={{ flex: 1, minWidth: 200, padding: '15px 18px', borderRadius: 11, background: 'rgba(12,15,30,0.5)', border: '1px solid rgba(236,230,216,0.16)', color: '#ECE6D8', fontSize: 15, outline: 'none' }} />
              <button type="submit" className="mono" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 9, padding: '15px 26px', borderRadius: 11, background: '#F2B066', color: '#0C0F1E', fontWeight: 500, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', border: 0, boxShadow: '0 8px 26px rgba(242,176,102,0.3)' }}>Notify me <span>→</span></button>
            </div>
            {err && <div style={{ marginTop: 12, fontSize: 13.5, color: '#E88F4D', fontWeight: 600, textAlign: 'center' }}>{err}</div>}
            <div className="mono" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18, flexWrap: 'wrap', marginTop: 16, fontSize: 10.5, fontWeight: 400, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(194,178,154,0.7)' }}>
              <span>240+ on the trail</span><span style={{ color: 'rgba(217,168,106,0.5)' }}>·</span><span>Video &amp; audio</span><span style={{ color: 'rgba(217,168,106,0.5)' }}>·</span><span>New climb / fortnight</span>
            </div>
          </form>
        ) : (
          <div style={{ borderRadius: 18, background: 'rgba(43,49,71,0.66)', backdropFilter: 'blur(18px)', border: '1px solid rgba(242,176,102,0.4)', boxShadow: '0 30px 80px rgba(8,10,20,0.6)', padding: 30, display: 'flex', alignItems: 'center', gap: 18 }}>
            <div style={{ flex: 'none', width: 46, height: 46, borderRadius: '50%', background: '#F2B066', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#0C0F1E', fontSize: 22 }}>✓</div>
            <div style={{ textAlign: 'left' }}>
              <div className="cormorant" style={{ fontWeight: 600, fontSize: 23, letterSpacing: '0.01em', lineHeight: 1.1 }}>You&apos;re on the trail.</div>
              <div style={{ fontSize: 14.5, color: 'rgba(194,178,154,0.85)', marginTop: 4 }}>We&apos;ll send the first climb to <span style={{ color: '#ECE6D8' }}>{email}</span> the moment it&apos;s live.</div>
            </div>
          </div>
        )}
      </div>

      {/* essence quote */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 900, margin: '0 auto', padding: '128px 40px 0', textAlign: 'center' }}>
        <div style={{ width: 48, height: 1, background: '#D9A86A', margin: '0 auto 34px' }} />
        <blockquote className="cormorant" style={{ fontStyle: 'italic', fontWeight: 500, fontSize: 'clamp(30px,4.6vw,50px)', lineHeight: 1.24, letterSpacing: '0.01em', color: '#ECE6D8', margin: 0 }}>Every summit is just a series of small, deliberate steps taken in poor light.</blockquote>
      </div>

      {/* what it is */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 780, margin: '0 auto', padding: '118px 40px 0', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9A86A', marginBottom: 24 }}>What it is</div>
        <h2 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(34px,4.8vw,52px)', lineHeight: 1.08, letterSpacing: '0.01em', margin: '0 0 28px', color: '#ECE6D8' }}>We speak quietly, and earn the crescendo.</h2>
        <p style={{ fontSize: 18, lineHeight: 1.72, color: 'rgba(194,178,154,0.92)', fontWeight: 400, margin: '0 0 18px' }}>Recorded in the half-light after the hard part of the day, the show sits down with founders, makers, and quiet operators to talk about the long ascent. Not the highlight reel, but the real grade of it: the doubt, the footholds found in the dark, the decisions made when no one was watching.</p>
        <p style={{ fontSize: 18, lineHeight: 1.72, color: 'rgba(194,178,154,0.92)', fontWeight: 400, margin: 0 }}>Three words anchor every conversation: <span className="cormorant" style={{ fontStyle: 'italic', fontSize: 20, color: '#F2B066' }}>grounded, searching, warm.</span> The mountain is the constant; the light is what changes.</p>
      </div>

      {/* who it's for */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1180, margin: '0 auto', padding: '108px 40px 0' }}>
        <div className="grid-collapse" style={{ borderRadius: 22, background: 'linear-gradient(160deg,rgba(43,49,71,0.55),rgba(16,18,33,0.55))', border: '1px solid rgba(236,230,216,0.08)', padding: 54, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 54, alignItems: 'center' }}>
          <div>
            <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9A86A', marginBottom: 20 }}>Who it&apos;s for</div>
            <h2 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(30px,4vw,42px)', lineHeight: 1.1, letterSpacing: '0.01em', margin: '0 0 18px', color: '#ECE6D8' }}>If you&apos;re still climbing, this one&apos;s for you.</h2>
            <p style={{ fontSize: 17, lineHeight: 1.7, color: 'rgba(194,178,154,0.9)', fontWeight: 400, margin: 0 }}>No gurus, no theatrics. Just honest company for the people doing the work, whether you&apos;re at the first foothold or far up the north face.</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {AUDIENCE.map(([n, label]) => (
              <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 0', borderBottom: '1px solid rgba(236,230,216,0.08)' }}>
                <span className="mono" style={{ fontSize: 12, fontWeight: 500, color: '#D9A86A', letterSpacing: '0.1em' }}>{n}</span>
                <span style={{ fontSize: 16, fontWeight: 400, color: 'rgba(236,230,216,0.92)' }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* where to listen */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1180, margin: '0 auto', padding: '108px 40px 0', textAlign: 'center' }}>
        <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9A86A', marginBottom: 22 }}>Arriving soon</div>
        <h2 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(30px,4vw,44px)', lineHeight: 1.1, margin: '0 0 36px', color: '#ECE6D8' }}>Wherever you already listen.</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12 }}>
          {PLATFORMS.map(p => (
            <div key={p} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 22px', borderRadius: 12, background: 'rgba(43,49,71,0.4)', border: '1px solid rgba(236,230,216,0.1)', fontSize: 15, fontWeight: 600, color: 'rgba(236,230,216,0.86)' }}>
              {p}
              <span className="mono" style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(217,168,106,0.8)' }}>Soon</span>
            </div>
          ))}
        </div>
      </div>

      {/* be a guest */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 1180, margin: '108px auto 0', padding: '0 40px' }}>
        <div style={{ borderRadius: 22, background: 'linear-gradient(160deg,rgba(84,64,61,0.4),rgba(22,28,44,0.55))', border: '1px solid rgba(217,168,106,0.24)', padding: 50, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 44, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 300 }}>
            <div className="mono" style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.4em', textTransform: 'uppercase', color: '#D9A86A', marginBottom: 16 }}>Bring your story</div>
            <h2 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(30px,3.8vw,40px)', lineHeight: 1.08, letterSpacing: '0.01em', margin: '0 0 12px', color: '#ECE6D8' }}>Climbed something worth talking about?</h2>
            <p style={{ fontSize: 16.5, color: 'rgba(194,178,154,0.9)', lineHeight: 1.65, fontWeight: 400, margin: 0, maxWidth: 520 }}>We&apos;re booking guests for season one now. If you&apos;re somewhere on the ascent and willing to speak honestly about it, put your hand up. We read every application.</p>
          </div>
          <Link href="/contact" className="mono" style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 10, padding: '16px 30px', borderRadius: 12, background: '#F2B066', color: '#0C0F1E', fontWeight: 500, fontSize: 12, letterSpacing: '0.16em', textTransform: 'uppercase', boxShadow: '0 10px 30px rgba(242,176,102,0.3)' }}>Apply to be a guest →</Link>
        </div>
      </div>

      {/* waitlist band */}
      <div style={{ position: 'relative', zIndex: 5, maxWidth: 920, margin: '108px auto 0', padding: '0 40px 110px', textAlign: 'center' }}>
        <div style={{ width: 48, height: 1, background: '#D9A86A', margin: '0 auto 30px' }} />
        <h2 className="cormorant" style={{ fontWeight: 600, fontSize: 'clamp(34px,5vw,56px)', lineHeight: 1.06, letterSpacing: '0.01em', margin: '0 auto', maxWidth: 640, color: '#ECE6D8' }}>Be there at first light.</h2>
        <p style={{ fontSize: 17.5, color: 'rgba(194,178,154,0.9)', lineHeight: 1.65, margin: '20px auto 30px', fontWeight: 400, maxWidth: 520 }}>Join the waitlist and we&apos;ll send you the first climb the day it goes live, plus the occasional note from the trail while we build the show.</p>
        <button onClick={scrollToWaitlist} className="mono" style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '17px 34px', borderRadius: 12, background: '#F2B066', color: '#0C0F1E', fontWeight: 500, fontSize: 12.5, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', border: 0, boxShadow: '0 12px 36px rgba(242,176,102,0.34)' }}>Join the waitlist →</button>
      </div>
    </>
  )
}
