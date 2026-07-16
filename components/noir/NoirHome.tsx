'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'

const FAQS = [
  ['How much does it cost?', "Every plan is scoped to what you actually need, so there's no one-size price. You'll get an exact, no-surprises number on your free call — and no lock-in contracts."],
  ['How fast will I see results?', 'Content goes live within two weeks. Most clients see meaningful engagement lifts inside 30 days, and real revenue impact from ads inside 60 to 90.'],
  ['Do I need to be on camera?', 'Nope. We work with whatever you’ve got. That said, founders who show up on camera tend to win fastest, and we make it completely painless.'],
  ['What if it doesn’t work?', 'We set clear targets with you up front and report against them honestly. If something isn’t landing, we change it — fast. No lock-in contracts, so you’re never stuck.'],
  ['Which platforms do you cover?', 'Instagram, TikTok, Facebook, YouTube Shorts, and LinkedIn. We focus your effort on the few places your customers actually spend their time.'],
]

const WORK = [
  { offset: false, src: '/noir/work/work-coffee.jpg', alt: 'Latte art shot for a local café client' },
  { offset: true, src: '/noir/work/work-pasta.jpg', alt: 'Fresh pasta being rolled for a hospitality client shoot' },
  { offset: false, src: '/noir/work/work-car-street.jpg', alt: 'Automotive shoot on a tree-lined street at golden hour' },
  { offset: true, src: '/noir/work/work-phone-repair.jpg', alt: 'Behind the counter at a phone repair shop shoot' },
]

function PlaceholderTile() {
  return (
    <div
      style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 11px), linear-gradient(135deg,#15181a,#0a0c0d)',
      }}
    />
  )
}

export default function NoirHome() {
  const router = useRouter()
  const [openFaq, setOpenFaq] = useState(0)
  const [heroEmail, setHeroEmail] = useState('')
  const [ctaStatus, setCtaStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [compact, setCompact] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 560px)')
    const update = () => setCompact(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  function onHeroSubmit(e: FormEvent) {
    e.preventDefault()
    const value = heroEmail.trim()
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
    if (valid) {
      // Capture the lead (Netlify) and email the playbook straight away, then carry them through.
      const fd = new URLSearchParams({ 'form-name': 'playbook', email: value })
      fetch('/__forms.html', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: fd.toString() }).catch(() => {})
      fetch('/api/lead', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type: 'playbook', email: value }) }).catch(() => {})
    }
    router.push(`/playbook${valid ? `?email=${encodeURIComponent(value)}` : ''}`)
  }

  async function onCtaSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setCtaStatus('submitting')
    const fd = new FormData(e.currentTarget)
    const name = String(fd.get('name') || '')
    const business = String(fd.get('business') || '')
    const email = String(fd.get('email') || '')
    fd.set('intent', 'Strategy call')
    fd.set('form-name', 'contact')
    fd.set('message', `Strategy call request from home page. Business: ${business}`)
    try {
      fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(fd as unknown as Record<string, string>).toString(),
      }).catch(() => {})
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent: 'Strategy call', message: `Business: ${business}` }),
      })
      setCtaStatus(res.ok ? 'success' : 'error')
    } catch {
      setCtaStatus('error')
    }
  }

  return (
    <>
      {/* ambient glow layer */}
      <div className="glow-layer">
        <div className="glow" style={{ top: -180, left: -120, width: 620, height: 620, background: 'radial-gradient(circle,rgba(249,115,22,0.20),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 14s ease-in-out infinite' }} />
        <div className="glow" style={{ top: 1200, right: -160, width: 560, height: 560, background: 'radial-gradient(circle,rgba(60,150,255,0.16),rgba(60,150,255,0) 65%)', animation: 'pulseFloat2 18s ease-in-out infinite' }} />
        <div className="glow" style={{ top: 2600, left: -140, width: 560, height: 560, background: 'radial-gradient(circle,rgba(249,115,22,0.14),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 16s ease-in-out infinite' }} />
        <div className="glow-grid" />
      </div>

      {/* ===== HERO ===== */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 5, width: '100%', minHeight: '84vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '64px 40px 96px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, zIndex: 0, background: '#080a0b' }} />
        <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(5,5,6,0.74) 0%,rgba(5,5,6,0.5) 42%,rgba(5,5,6,0.9) 82%,rgba(5,5,6,1) 100%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', zIndex: 1, top: '6%', left: '50%', transform: 'translateX(-50%)', width: 760, height: 440, borderRadius: '50%', background: 'radial-gradient(circle,rgba(249,115,22,0.16),rgba(249,115,22,0) 65%)', filter: 'blur(20px)', animation: 'pulseFloat 14s ease-in-out infinite', pointerEvents: 'none' }} />

        <div style={{ position: 'relative', zIndex: 2, width: '100%', maxWidth: 1080 }}>
          <h1 className="sora noir-hero-h1" style={{ fontWeight: 800, textTransform: 'uppercase', fontSize: 'clamp(40px,9vw,138px)', lineHeight: 0.9, letterSpacing: '-0.04em', margin: 0 }}>
            <span style={{ display: 'block', paddingBottom: '0.04em' }}>
              <span style={{ display: 'inline-block', animation: 'riseUp 0.9s cubic-bezier(.2,.7,.2,1) both' }}>Rocket&nbsp;Fuel</span>
              <span style={{ display: 'inline-block', color: '#F97316', verticalAlign: 'super', fontSize: '0.46em', animation: 'riseUp 0.9s cubic-bezier(.2,.7,.2,1) 0.05s both, twinkle 2.6s ease-in-out 1.1s infinite' }}>*</span>
            </span>
            <span style={{ display: 'block', paddingBottom: '0.04em' }}>
              <span style={{ display: 'inline-block', animation: 'riseUp 0.9s cubic-bezier(.2,.7,.2,1) 0.12s both' }}>For Small Business</span>
            </span>
          </h1>
          <p style={{ fontSize: 'clamp(17px,2vw,23px)', lineHeight: 1.5, color: 'rgba(244,245,247,0.84)', maxWidth: 600, margin: '28px auto 0', fontWeight: 500, animation: 'riseUp 0.9s ease 0.3s both' }}>
            Growing a small business is hard. We make getting found, followed, and booked a whole lot easier, and a lot less stressful.
          </p>

          <form onSubmit={onHeroSubmit} className="m-stack" style={{ display: 'flex', alignItems: 'center', gap: 8, maxWidth: 680, margin: '38px auto 0', background: 'rgba(255,255,255,0.96)', borderRadius: 999, padding: '7px 7px 7px 22px', boxShadow: '0 24px 64px rgba(0,0,0,0.5)', animation: 'riseUp 0.9s ease 0.42s both' }}>
            <span className="m-hide-560" style={{ fontSize: 22 }}>👋</span>
            <input
              value={heroEmail}
              onChange={e => setHeroEmail(e.target.value)}
              type="email"
              placeholder={compact ? 'Your email for the free playbook…' : "Enter your email and we'll send you our free playbook…"}
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: 16, color: '#16181c', padding: '14px 12px', minWidth: 0 }}
            />
            <button type="submit" style={{ flex: 'none', display: 'flex', alignItems: 'center', gap: 8, padding: '16px 30px', borderRadius: 999, background: '#F97316', color: '#1a0800', fontWeight: 800, fontSize: 16, cursor: 'pointer', whiteSpace: 'nowrap', border: 0 }}>
              Send it <span style={{ fontSize: 18 }}>→</span>
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, flexWrap: 'wrap', marginTop: 22, fontSize: 13.5, color: 'rgba(244,245,247,0.62)', fontWeight: 500, animation: 'riseUp 0.9s ease 0.5s both' }}>
            <span>*No gimmicks, just content that actually sells.</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}><span style={{ color: '#F97316', letterSpacing: 2 }}>★★★★★</span> Trusted by local business owners</span>
          </div>
        </div>
      </div>

      {/* ===== VIDEO BLOCK ===== */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 6, maxWidth: 1100, margin: '-52px auto 0', padding: '0 40px' }}>
        <div style={{ position: 'relative', borderRadius: 28, padding: 1, background: 'linear-gradient(160deg,rgba(255,255,255,0.24),rgba(255,255,255,0.02))', boxShadow: '0 50px 130px rgba(0,0,0,0.7)' }}>
          <div style={{ position: 'relative', borderRadius: 27, overflow: 'hidden', background: '#0a0c0d', border: '1px solid rgba(255,255,255,0.06)', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <PlaceholderTile />
            <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(5,5,6,0.4),rgba(5,5,6,0.6))', pointerEvents: 'none' }} />
            <div style={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
              <div style={{ width: 88, height: 88, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', boxShadow: '0 12px 40px rgba(249,115,22,0.5)', cursor: 'pointer', animation: 'throb 2.6s ease-in-out infinite' }}>
                <div style={{ width: 0, height: 0, borderTop: '16px solid transparent', borderBottom: '16px solid transparent', borderLeft: '26px solid #04140d', marginLeft: 6 }} />
              </div>
              <div className="sora" style={{ marginTop: 22, fontSize: 22, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff' }}>Watch how we grow local businesses</div>
              <div style={{ marginTop: 10, display: 'inline-block', padding: '6px 14px', borderRadius: 999, border: '1px solid rgba(255,255,255,0.16)', background: 'rgba(5,5,6,0.4)', fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(244,245,247,0.8)' }}>Coming soon</div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PROBLEM AGITATION ===== */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '0 auto', padding: '110px 40px 0', textAlign: 'center' }}>
        <div className="kicker" style={{ marginBottom: 18 }}>Read this if you&apos;re invisible online</div>
        <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,46px)', letterSpacing: '-0.03em', lineHeight: 1.08, margin: '0 0 28px' }}>Let&apos;s be honest about why you&apos;re really here.</h2>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: '0 0 20px' }}>You&apos;re great at what you do. But online? Your competitors, who, let&apos;s face it, <span style={{ color: '#F97316', fontWeight: 700 }}>aren&apos;t even as good as you</span>, are the ones getting found, getting followed, and getting the customers.</p>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: '0 0 20px' }}>Meanwhile you post when you remember to, watch it flatline, and quietly wonder if any of it actually works. It&apos;s <span style={{ color: '#F4F5F7', fontWeight: 700 }}>not your fault.</span> Running a business and running a content machine are two full-time jobs.</p>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: 0 }}>That&apos;s the one we take off your plate, completely. You run your business. We make you <span style={{ color: '#F97316', fontWeight: 700 }}>impossible to ignore.</span></p>
      </div>

      {/* ===== WORK GRID ===== */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div className="kicker" style={{ marginBottom: 14 }}>The work</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7.5vw,48px)', letterSpacing: '-0.03em', margin: 0 }}>Work that&apos;s impossible to scroll past.</h2>
          <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(244,245,247,0.6)', maxWidth: 520, margin: '16px auto 0', fontWeight: 500 }}>Real shoots for real local businesses — cafés, kitchens, cars and repair benches, all captured in-house.</p>
        </div>
        <div className="work-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {WORK.map((w, i) => (
            <div key={i} style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', background: '#0a0c0d', border: '1px solid rgba(255,255,255,0.07)', aspectRatio: '9/16', boxShadow: '0 24px 60px rgba(0,0,0,0.45)', marginTop: w.offset ? 28 : 0 }}>
              <Image src={w.src} alt={w.alt} fill sizes="(max-width: 860px) 50vw, 25vw" style={{ objectFit: 'cover' }} />
              <div style={{ position: 'absolute', inset: 0, zIndex: 1, background: 'linear-gradient(180deg,rgba(5,5,6,0) 55%,rgba(5,5,6,0.55) 100%)', pointerEvents: 'none' }} />
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', marginTop: 34, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
          <Link href="/playbook" className="btn-orange" style={{ padding: '17px 32px', fontSize: 17 }}>Get the free playbook <span>→</span></Link>
          <Link href="/contact" className="btn-ghost-noir" style={{ padding: '13px 26px', fontSize: 15 }}>Or book a free strategy call <span style={{ color: '#F97316' }}>→</span></Link>
        </div>
      </div>

      {/* ===== FOUNDER AUTHORITY ===== */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ borderRadius: 28, padding: 1, background: 'linear-gradient(160deg,rgba(255,255,255,0.18),rgba(255,255,255,0.02))' }}>
          <div className="grid-collapse m-card" style={{ borderRadius: 27, background: 'rgba(13,15,17,0.7)', backdropFilter: 'blur(22px)', border: '1px solid rgba(255,255,255,0.06)', padding: 44, display: 'grid', gridTemplateColumns: '300px 1fr', gap: 44, alignItems: 'center' }}>
            <div style={{ width: '100%', height: 340, maxHeight: '58vw', borderRadius: 20, position: 'relative', overflow: 'hidden', background: '#0a0c0d', border: '1px solid rgba(255,255,255,0.07)' }}>
              <Image src="/noir/work/work-ipad-bench.jpg" alt="Hands-on device repair content shot for a client" fill sizes="(max-width: 860px) 90vw, 300px" style={{ objectFit: 'cover' }} />
            </div>
            <div>
              <div className="kicker" style={{ marginBottom: 16 }}>Why founders trust us</div>
              <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(26px,6vw,38px)', letterSpacing: '-0.03em', lineHeight: 1.1, margin: '0 0 20px' }}>We give small businesses the firepower big brands take for granted.</h2>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(244,245,247,0.68)', fontWeight: 500, margin: '0 0 16px' }}>Pulse was built on one belief: you shouldn&apos;t need a Fortune-500 budget to win attention. We&apos;ve spent years reverse-engineering what makes content spread and ads convert, and we run that exact playbook for every client.</p>
              <p style={{ fontSize: 17, lineHeight: 1.6, color: 'rgba(244,245,247,0.68)', fontWeight: 500, margin: 0 }}>No juniors. No guesswork. No hiding behind vanity metrics. Just the work that moves your numbers.</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginTop: 26 }}>
                <div className="sora" style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.01em' }}>— The Pulse team</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FAQ ===== */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 46 }}>
          <div className="kicker" style={{ marginBottom: 14 }}>Before you book</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7.5vw,48px)', letterSpacing: '-0.03em', margin: 0 }}>Questions you&apos;re probably asking.</h2>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map(([q, a], i) => {
            const open = openFaq === i
            return (
              <div key={q} onClick={() => setOpenFaq(open ? -1 : i)} style={{ borderRadius: 18, background: 'rgba(255,255,255,0.035)', backdropFilter: 'blur(14px)', border: '1px solid rgba(255,255,255,0.07)', padding: '24px 28px', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20 }}>
                  <div className="sora" style={{ fontSize: 19, fontWeight: 600, letterSpacing: '-0.01em' }}>{q}</div>
                  <div style={{ flex: 'none', width: 30, height: 30, borderRadius: '50%', background: 'rgba(249,115,22,0.12)', border: '1px solid rgba(249,115,22,0.3)', color: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700 }}>{open ? '–' : '+'}</div>
                </div>
                {open && <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(244,245,247,0.66)', fontWeight: 500, margin: '16px 0 0' }}>{a}</p>}
              </div>
            )
          })}
        </div>
      </div>

      {/* ===== FINAL CTA ===== */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '110px 40px 90px' }}>
        <div style={{ borderRadius: 30, padding: 1, background: 'linear-gradient(160deg,rgba(249,115,22,0.4),rgba(255,255,255,0.02))', boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}>
          <div className="grid-collapse m-card" style={{ borderRadius: 29, background: 'rgba(13,15,17,0.74)', backdropFilter: 'blur(26px) saturate(160%)', border: '1px solid rgba(255,255,255,0.06)', padding: 56, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 50, alignItems: 'center' }}>
            <div>
              {/* PLACEHOLDER: scarcity claim — confirm before launch */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', borderRadius: 999, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', fontSize: 13, fontWeight: 700, color: '#fed7aa', marginBottom: 20 }}>⚡ Only 5 spots left this month</div>
              <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,46px)', lineHeight: 1.05, letterSpacing: '-0.03em', margin: 0 }}>Ready to become impossible to ignore?</h2>
              <p style={{ fontSize: 17, color: 'rgba(244,245,247,0.64)', lineHeight: 1.55, margin: '18px 0 0', fontWeight: 500, maxWidth: 400 }}>Book a free 30-minute strategy call. We&apos;ll build you a custom growth plan on the spot, yours to keep whether you hire us or not.</p>
              <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 18, marginTop: 28, fontSize: 14.5, color: 'rgba(244,245,247,0.55)', fontWeight: 600 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ color: '#F97316' }}>✓</span> Free &amp; no obligation</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 7 }}><span style={{ color: '#F97316' }}>✓</span> 30 minutes</span>
              </div>
              <Link href="/playbook" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, marginTop: 24, padding: '13px 24px', borderRadius: 13, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', fontSize: 15, fontWeight: 700, color: '#fed7aa' }}>↓ Or download our free playbook <span style={{ color: '#F97316' }}>→</span></Link>
            </div>

            {ctaStatus === 'success' ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, textAlign: 'center', minHeight: 280 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#F97316', color: '#1a0800', fontSize: 28, fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
                <h3 className="sora" style={{ fontSize: 26, fontWeight: 800 }}>You&apos;re booked in spirit.</h3>
                <p style={{ fontSize: 15, color: 'rgba(244,245,247,0.66)', maxWidth: 320 }}>We&apos;ve got your details and will be in touch within one business day to lock in your strategy call.</p>
              </div>
            ) : (
              <form onSubmit={onCtaSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <input name="name" required placeholder="Your name" className="noir-input" />
                <input name="business" placeholder="Business name" className="noir-input" />
                <input name="email" required type="email" placeholder="Email address" className="noir-input" />
                <button type="submit" disabled={ctaStatus === 'submitting'} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, padding: 18, borderRadius: 13, background: '#F97316', color: '#1a0800', fontWeight: 800, fontSize: 17, cursor: 'pointer', boxShadow: '0 10px 30px rgba(249,115,22,0.35)', marginTop: 4, border: 0, opacity: ctaStatus === 'submitting' ? 0.6 : 1 }}>
                  {ctaStatus === 'submitting' ? 'Sending…' : 'Book my free strategy call →'}
                </button>
                {ctaStatus === 'error' && <div style={{ textAlign: 'center', fontSize: 13, color: '#fca5a5' }}>Something went wrong — email hello@pulsesocialmedia.com.au and we&apos;ll sort it.</div>}
                <div style={{ textAlign: 'center', fontSize: 12.5, color: 'rgba(244,245,247,0.45)', fontWeight: 500 }}>No spam. No pressure. We only take 5 new clients a month.</div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
