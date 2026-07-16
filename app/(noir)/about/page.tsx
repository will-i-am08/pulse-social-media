import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About — A small studio for big voices',
  description: 'Pulse is a founder-led social media studio in Bendigo, Victoria. We build always-on social for brands who refuse to sound like everyone else — human creative, AI doing the admin.',
  alternates: { canonical: '/about' },
}

const PRINCIPLES = [
  ['i.', 'Strategy before content', 'We won’t write a caption until we understand the business underneath it.', false],
  ['ii.', 'Humans edit everything', 'AI drafts, we decide. Every post that ships has had our eyes on it.', false],
  ['iii.', 'Flat-rate, month-to-month', 'No lock-in, no hourly games. If we’re not worth keeping, you shouldn’t have to sue to leave.', false],
  ['iv.', 'Honest numbers', 'Reporting on what drives the business, not what flatters the agency.', true],
] as const

const WHY = [
  ['On craft', 'A brand is a voice, not a volume knob.', 'Feeds full of filler don’t grow brands, they anaesthetise them. We’d rather ship four posts that sound like you than forty that sound like the algorithm.'],
  ['On tools', 'The best thinking shouldn’t cost the most hours.', 'Senior thinking should go into strategy and judgement, not the busywork a machine can finish in seconds. We built the tooling so it can.'],
  ['On AI', 'AI is a studio assistant, not a ghostwriter.', 'AI drafts, we decide. Used well, it buys back the hours that kill great work, so the thinking gets deeper, not faster and worse.'],
  ['On how we work', 'Great work needs one clear owner.', 'No junior account managers translating what you said into what they think you meant. You deal with us from brief to ship, same team, every week.'],
] as const

export default function AboutPage() {
  return (
    <>
      <div className="glow-layer">
        <div className="glow" style={{ top: -180, right: -120, width: 620, height: 620, background: 'radial-gradient(circle,rgba(249,115,22,0.16),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 14s ease-in-out infinite' }} />
        <div className="glow" style={{ top: 900, left: -160, width: 560, height: 560, background: 'radial-gradient(circle,rgba(60,150,255,0.12),rgba(60,150,255,0) 65%)', animation: 'pulseFloat2 18s ease-in-out infinite' }} />
        <div className="glow-grid" />
      </div>

      {/* hero */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '0 auto', padding: '96px 40px 0', textAlign: 'center' }}>
        <div className="kicker" style={{ fontSize: 13, marginBottom: 18 }}>About Pulse</div>
        <h1 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(40px,10vw,90px)', lineHeight: 1.0, letterSpacing: '-0.04em', margin: 0 }}>A small studio<br />for big voices.</h1>
        <p style={{ fontSize: 20, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', maxWidth: 580, margin: '28px auto 0', fontWeight: 500 }}>Pulse is a founder-led social media studio based in Bendigo, Victoria. We build always-on social for brands who refuse to sound like everyone else.</p>
      </div>

      {/* studio photo placeholder */}
      <div className="m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 1100, margin: '64px auto 0', padding: '0 40px' }}>
        <div style={{ position: 'relative', borderRadius: 28, overflow: 'hidden', aspectRatio: '21/9', background: '#0a0c0d', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(-45deg, rgba(255,255,255,0.03) 0 1px, transparent 1px 11px), linear-gradient(135deg,#15181a,#0a0c0d)' }} />
        </div>
      </div>

      {/* origin story */}
      <div className="m-pad m-mt" style={{ position: 'relative', zIndex: 5, maxWidth: 760, margin: '96px auto 0', padding: '0 40px' }}>
        <p style={{ fontSize: 22, lineHeight: 1.75, color: 'rgba(244,245,247,0.78)', fontWeight: 500, margin: '0 0 28px' }}>We started Pulse because social media kept feeling like an afterthought, even for brands spending real money on it.</p>
        <p style={{ fontSize: 22, lineHeight: 1.75, color: 'rgba(244,245,247,0.78)', fontWeight: 500, margin: '0 0 28px' }}>The best work we&apos;d seen came from operators who respected the craft: people who rewrote captions until they sang, watched comments like a weather system, and cared about the third frame.</p>
        <p style={{ fontSize: 22, lineHeight: 1.75, color: 'rgba(244,245,247,0.78)', fontWeight: 500, margin: 0 }}>So we built a studio around that standard, and built tools so we&apos;d never waste an hour on a task a machine could do. That&apos;s the whole idea: a human doing the creative, AI doing the admin, and a brand that sounds like itself every single day.</p>
        <div className="m-card" style={{ marginTop: 56, padding: '40px 44px', borderRadius: 24, background: 'rgba(249,115,22,0.05)', borderLeft: '3px solid #F97316', borderTop: '1px solid rgba(249,115,22,0.14)', borderRight: '1px solid rgba(249,115,22,0.06)', borderBottom: '1px solid rgba(249,115,22,0.06)' }}>
          <p className="sora" style={{ fontSize: 'clamp(20px,2.2vw,26px)', fontWeight: 700, lineHeight: 1.45, letterSpacing: '-0.02em', margin: 0, color: '#F4F5F7' }}>&ldquo;Most social media feels like it was written by nobody, for everybody. We started Pulse to prove it didn&apos;t have to.&rdquo;</p>
        </div>
      </div>

      {/* principles */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div className="kicker" style={{ fontSize: 13, marginBottom: 14 }}>Principles</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,46px)', letterSpacing: '-0.03em', margin: 0 }}>Four rules we actually live by.</h2>
          <p style={{ fontSize: 17, color: 'rgba(244,245,247,0.55)', margin: '14px auto 0', maxWidth: 480, fontWeight: 500 }}>Not a poster on the wall. How we price work, run accounts, and decide which clients to take on.</p>
        </div>
        <div className="grid-collapse" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 18 }}>
          {PRINCIPLES.map(([num, title, body, hl]) => (
            <div key={num} style={{ borderRadius: 24, background: hl ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.03)', border: hl ? '1px solid rgba(249,115,22,0.18)' : '1px solid rgba(255,255,255,0.07)', padding: 40 }}>
              <div className="sora" style={{ fontSize: 13, fontWeight: 800, color: '#F97316', letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 18 }}>{num}</div>
              <div className="sora" style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>{title}</div>
              <p style={{ fontSize: 16, color: 'rgba(244,245,247,0.62)', lineHeight: 1.6, fontWeight: 500, margin: 0 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* why we do it */}
      <div className="m-pad m-sect" style={{ position: 'relative', zIndex: 5, maxWidth: 1240, margin: '0 auto', padding: '110px 40px 0' }}>
        <div style={{ marginBottom: 48 }}>
          <div className="kicker" style={{ fontSize: 13, marginBottom: 14 }}>Our why</div>
          <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,46px)', letterSpacing: '-0.03em', margin: 0, lineHeight: 1.06 }}>Why we do what we do.</h2>
        </div>
        <div style={{ borderRadius: 24, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.07)' }}>
          {WHY.map(([kicker, head, body], i) => (
            <div key={kicker} className="grid-collapse m-card" style={{ padding: '40px 48px', background: i % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'rgba(13,15,17,0.6)', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 48, alignItems: 'start', borderTop: i === 0 ? 'none' : '1px solid rgba(255,255,255,0.05)' }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#F97316', marginBottom: 12 }}>{kicker}</div>
                <div className="sora" style={{ fontSize: 20, fontWeight: 700, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{head}</div>
              </div>
              <p className="m-p0t" style={{ fontSize: 17, color: 'rgba(244,245,247,0.68)', lineHeight: 1.65, fontWeight: 500, margin: 0, paddingTop: 28 }}>{body}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="m-pad m-mt" style={{ position: 'relative', zIndex: 5, maxWidth: 880, margin: '110px auto 0', padding: '0 40px 90px' }}>
        <div style={{ borderRadius: 28, padding: 1, background: 'linear-gradient(160deg,rgba(249,115,22,0.4),rgba(255,255,255,0.02))', boxShadow: '0 40px 120px rgba(0,0,0,0.55)' }}>
          <div className="m-card" style={{ borderRadius: 27, background: 'rgba(13,15,17,0.74)', backdropFilter: 'blur(26px)', padding: 60, textAlign: 'center' }}>
            <div className="kicker" style={{ fontSize: 13, marginBottom: 14 }}>Work with us</div>
            <h2 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(30px,7vw,44px)', letterSpacing: '-0.03em', margin: '0 0 18px', lineHeight: 1.06 }}>Let&apos;s make something.</h2>
            <p style={{ fontSize: 18, color: 'rgba(244,245,247,0.64)', margin: '0 auto 32px', maxWidth: 460, fontWeight: 500, lineHeight: 1.55 }}>We take on a small number of new clients each quarter. Tell us about your brand and we&apos;ll come back with a plan.</p>
            <Link href="/contact" className="btn-orange" style={{ padding: '17px 32px', fontSize: 17 }}>Start the project →</Link>
            <div style={{ marginTop: 18 }}><Link href="/playbook" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 600, color: 'rgba(244,245,247,0.7)' }}>Or download our free playbook <span style={{ color: '#F97316' }}>→</span></Link></div>
          </div>
        </div>
      </div>
    </>
  )
}
