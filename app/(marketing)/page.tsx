import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: {
    absolute: 'Pulse Social Media | Social Media Management Agency in Bendigo, VIC',
  },
  description: 'Pulse is a Bendigo social media management agency running always-on Instagram, TikTok, Facebook and LinkedIn for Australian brands. Strategy, content, community and AI tooling on a flat monthly retainer.',
  keywords: [
    'social media management',
    'social media agency Bendigo',
    'social media management Bendigo',
    'Bendigo social media marketing',
    'Instagram management Australia',
    'TikTok management',
    'content strategy agency',
    'AI social media',
    'Pulse Social Media',
  ],
  openGraph: {
    title: 'Pulse Social Media | Social Media Management Agency in Bendigo, VIC',
    description: 'Bendigo-based social media management for Australian brands. Always-on strategy, content, community and AI tooling — on a flat monthly retainer.',
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Social Media — Bendigo Social Media Management Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Social Media | Social Media Management Agency in Bendigo, VIC',
    description: 'Bendigo-based social media management for Australian brands. Always-on strategy, content, community and AI tooling.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/' },
}

const HOME_CSS = `
.pulse-home .hero{max-width:1320px;margin:0 auto;padding:80px 48px 100px}
.pulse-home .hero-top{display:flex;justify-content:space-between;align-items:flex-start;gap:48px;margin-bottom:64px}
.pulse-home .hero-meta{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);line-height:1.8}
.pulse-home .hero-meta b{color:var(--ink);font-weight:500}
.pulse-home .hero-lower{display:grid;grid-template-columns:1.3fr 1fr;gap:64px;align-items:end;margin-top:40px}
.pulse-home .hero-sub{font-size:20px;line-height:1.5;color:#3a3a3a;font-weight:300;max-width:540px}
.pulse-home .hero-cta{display:flex;gap:24px;align-items:center;margin-top:28px;justify-content:flex-end}
.pulse-home .pulse-strip{margin-top:72px;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair);padding:22px 0;display:flex;align-items:center;gap:24px;overflow:hidden}
.pulse-home .wave{flex:1;height:48px}
.pulse-home .wave svg{display:block;width:100%;height:100%}
.pulse-home .readout{display:flex;gap:28px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);white-space:nowrap}
.pulse-home .readout b{color:var(--accent);font-weight:500}
.pulse-home .clients{border-bottom:1px solid var(--hair);padding:28px 48px;max-width:1320px;margin:0 auto;display:flex;align-items:center;gap:40px;color:var(--muted);font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase}
.pulse-home .clients .logos{display:flex;gap:56px;flex:1;flex-wrap:wrap;color:#0a0a0a;font-weight:500;text-transform:none;font-family:'Plus Jakarta Sans';font-size:18px;opacity:.6}
.pulse-home .clients .frau{font-family:'Fraunces',serif;letter-spacing:-0.02em}
.pulse-home .stats{max-width:1320px;margin:0 auto;padding:100px 48px;display:grid;grid-template-columns:repeat(12,1fr);gap:32px;align-items:end}
.pulse-home .stats .intro{grid-column:span 4}
.pulse-home .stats .intro h2{font-size:48px;font-weight:200;letter-spacing:-0.03em;line-height:1;margin:12px 0 0}
.pulse-home .stats .intro h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-home .stats .grid{grid-column:span 8;display:grid;grid-template-columns:repeat(4,1fr);border-top:1px solid var(--hair)}
.pulse-home .stats .cell{padding:28px 20px 28px 0;border-right:1px solid var(--hair)}
.pulse-home .stats .cell:last-child{border-right:0}
.pulse-home .stats .num{font-size:56px;font-weight:200;letter-spacing:-0.04em;line-height:1}
.pulse-home .stats .num .unit{color:var(--accent);font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:.6em;margin-left:2px}
.pulse-home .stats .lbl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-top:14px;line-height:1.5}
.pulse-home .svc{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair)}
.pulse-home .svc-head{display:grid;grid-template-columns:1fr 1.4fr;gap:64px;align-items:end;margin-bottom:56px}
.pulse-home .svc-head p{color:var(--muted);font-size:16px;line-height:1.6;max-width:460px;margin:0}
.pulse-home .svc-grid{display:grid;grid-template-columns:repeat(12,1fr);grid-auto-rows:minmax(240px,auto);gap:20px}
.pulse-home .svc-a{grid-column:span 7;background:linear-gradient(140deg,#1a1717 0%, #2a1f22 100%) !important;color:#fff;border-color:transparent !important}
.pulse-home .svc-a h3{font-size:36px;font-weight:300;letter-spacing:-0.025em;max-width:480px;color:#fff}
.pulse-home .svc-a h3 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent-soft);font-weight:300}
.pulse-home .svc-a p{color:rgba(255,255,255,.6);max-width:400px}
.pulse-home .svc-a .num{color:var(--accent-soft)}
.pulse-home .svc-a .chart{position:absolute;right:-30px;bottom:-20px;width:340px;height:240px;opacity:.7}
.pulse-home .svc-b{grid-column:span 5;background:var(--paper-2) !important}
.pulse-home .svc-c,.pulse-home .svc-d,.pulse-home .svc-e{grid-column:span 4}
.pulse-home .svc-f{grid-column:span 7;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;overflow:hidden}
.pulse-home .svc-f .side{padding:28px;display:flex;flex-direction:column;gap:14px}
.pulse-home .svc-f .ph{border-radius:0;height:100%;min-height:260px}
.pulse-home .svc-g{grid-column:span 5;background:var(--accent) !important;color:#fff;border-color:transparent !important}
.pulse-home .svc-g .num{color:rgba(255,255,255,.7)}
.pulse-home .svc-g p{color:rgba(255,255,255,.85)}
.pulse-home .svc-g h3{font-family:'Fraunces',serif;font-style:italic;font-weight:400;font-size:34px;line-height:1.05;color:#fff}
.pulse-home .svc-g .arrow{color:#fff}
.pulse-home .quote-sec{background:var(--ink);color:#fff;padding:120px 48px;margin-top:80px}
.pulse-home .quote-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1.6fr;gap:80px;align-items:center}
.pulse-home .quote-inner .ph{height:540px;border-radius:20px}
.pulse-home .quote-inner blockquote{font-family:'Fraunces',serif;font-weight:300;font-size:clamp(32px,4vw,56px);line-height:1.1;letter-spacing:-0.025em;margin:0}
.pulse-home .quote-inner blockquote em{color:var(--accent-soft);font-style:italic}
.pulse-home .quote-inner cite{display:block;margin-top:40px;font-style:normal;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.pulse-home .quote-inner cite b{color:#fff;font-weight:500;display:block;margin-bottom:4px;letter-spacing:.05em}
.pulse-home .proc{max-width:1320px;margin:0 auto;padding:100px 48px}
.pulse-home .proc-head{display:flex;justify-content:space-between;align-items:end;margin-bottom:48px;gap:48px}
.pulse-home .proc-head p{color:var(--muted);max-width:340px;margin:0}
.pulse-home .proc-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--hair);border:1px solid var(--hair)}
.pulse-home .proc-step{background:var(--paper);padding:40px 32px;min-height:320px;display:flex;flex-direction:column}
.pulse-home .proc-step .n{font-family:'Fraunces',serif;font-style:italic;font-size:84px;font-weight:300;color:var(--accent);line-height:1;letter-spacing:-0.05em}
.pulse-home .proc-step h3{font-size:22px;font-weight:500;letter-spacing:-0.02em;margin:24px 0 12px}
.pulse-home .proc-step p{font-size:14px;line-height:1.6;color:var(--muted);margin:0}
.pulse-home .proc-step .mono-label{margin-top:auto;padding-top:24px}
@media(max-width:820px){
  .pulse-home .hero{padding:40px 24px 48px}
  .pulse-home .hero-top{flex-direction:column;gap:16px;margin-bottom:32px}
  .pulse-home .hero-lower{grid-template-columns:1fr;gap:24px}
  .pulse-home .hero-cta{justify-content:flex-start}
  .pulse-home .clients{padding:28px 24px;flex-wrap:wrap}
  .pulse-home .clients .logos{gap:28px;font-size:16px}
  .pulse-home .stats{grid-template-columns:1fr;padding:56px 24px;gap:32px}
  .pulse-home .stats .intro,.pulse-home .stats .grid{grid-column:auto}
  .pulse-home .stats .grid{grid-template-columns:1fr 1fr}
  .pulse-home .stats .num{font-size:42px}
  .pulse-home .svc{padding:48px 24px}
  .pulse-home .svc-head{grid-template-columns:1fr;gap:16px}
  .pulse-home .svc-grid{grid-template-columns:1fr}
  .pulse-home .svc-a,.pulse-home .svc-b,.pulse-home .svc-c,.pulse-home .svc-d,.pulse-home .svc-e,.pulse-home .svc-f,.pulse-home .svc-g{grid-column:auto}
  .pulse-home .svc-a h3{font-size:26px}.pulse-home .svc-a .chart{display:none}
  .pulse-home .svc-f{grid-template-columns:1fr}
  .pulse-home .quote-sec{padding:60px 24px}
  .pulse-home .quote-inner{grid-template-columns:1fr;gap:32px}
  .pulse-home .quote-inner .ph{height:360px}.pulse-home .quote-inner blockquote{font-size:30px}
  .pulse-home .proc{padding:48px 24px}
  .pulse-home .proc-grid{grid-template-columns:1fr}
  .pulse-home .proc-head{flex-direction:column;align-items:flex-start;gap:8px}
  .pulse-home .pulse-strip{flex-wrap:wrap;gap:12px}.pulse-home .wave{min-width:200px}
}
`

function wavePath(w: number, h: number, amp: number, freq: number, seed: number) {
  let d = `M 0 ${h / 2}`
  for (let x = 0; x <= w; x += 6) {
    const y =
      h / 2 +
      Math.sin(x * freq + seed) * amp * 0.55 +
      Math.sin(x * freq * 2.3 + seed * 1.3) * amp * 0.35 +
      Math.sin(x * freq * 5 + seed * 0.7) * amp * 0.2
    d += ` L ${x} ${y.toFixed(1)}`
  }
  return d
}

function areaChartSvg(color: string) {
  const pts = [120, 100, 90, 110, 80, 65, 90, 70, 45, 60, 35, 20]
  const step = 340 / (pts.length - 1)
  let fill = 'M 0 140'
  let line = `M 0 ${pts[0]}`
  pts.forEach((y, i) => {
    fill += ` L ${i * step} ${y}`
    if (i > 0) line += ` L ${i * step} ${y}`
  })
  fill += ' L 340 140 Z'
  const dots = pts.map((y, i) => `<circle cx="${i * step}" cy="${y}" r="2.5" fill="${color}"/>`).join('')
  return `<svg viewBox="0 0 340 150" preserveAspectRatio="none" width="100%" height="100%"><defs><linearGradient id="ga" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${color}" stop-opacity=".5"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></linearGradient></defs><path d="${fill}" fill="url(#ga)"/><path d="${line}" fill="none" stroke="${color}" stroke-width="2"/>${dots}</svg>`
}

const BASE_WAVE = wavePath(1200, 48, 10, 0.022, 1.2)
const ACCENT_WAVE = wavePath(1200, 48, 14, 0.016, 0)
const HERO_CHART = areaChartSvg('#ffb2b9')

export default function HomePage() {
  return (
    <main className="pulse-home">
      <style dangerouslySetInnerHTML={{ __html: HOME_CSS }} />

      <section className="hero">
        <div className="hero-top">
          <div className="hero-meta">
            <div><b>Pulse Social Media</b> / Founder-led agency</div>
            <div>Est. 2026 · Bendigo VIC · Remote-friendly</div>
          </div>
          <div className="hero-meta" style={{ textAlign: 'right' }}>
            <div>Channels · <b>IG · TT · FB · LI</b></div>
            <div>Available · <b>7 days · 9–5 AEST</b></div>
          </div>
        </div>

        <h1 className="hero-display">
          Built for brands that<br />move <em className="fraunces">fast.</em>
        </h1>

        <div className="hero-lower">
          <p className="hero-sub">Pulse is a Bendigo social media management agency. We run always-on Instagram, TikTok, Facebook and LinkedIn for Australian brands — strategy, content, community and AI tooling on a flat monthly retainer.</p>
          <div className="hero-cta">
            <Link className="btn-pill btn-grad" href="/contact">Start the project →</Link>
            <Link className="btn-pill btn-ghost" href="/insights">Read our thinking</Link>
          </div>
        </div>

        <div className="pulse-strip">
          <span className="mono-label">Live pulse ─</span>
          <div className="wave">
            <svg viewBox="0 0 1200 48" preserveAspectRatio="none">
              <defs>
                <linearGradient id="g1" x1="0" x2="1">
                  <stop offset="0" stopColor="#ff5473" stopOpacity=".1" />
                  <stop offset=".2" stopColor="#ff5473" />
                  <stop offset=".8" stopColor="#ff5473" />
                  <stop offset="1" stopColor="#ff5473" stopOpacity=".1" />
                </linearGradient>
              </defs>
              <path d={BASE_WAVE} stroke="#cfc9c0" strokeWidth="1" fill="none" opacity=".6" />
              <path d={ACCENT_WAVE} stroke="url(#g1)" strokeWidth="1.5" fill="none" />
            </svg>
          </div>
          <div className="readout">
            <span>Flat-rate <b>month-to-month</b></span>
            <span>Voice <b>trained on yours</b></span>
            <span>Bendigo <b>AEST</b></span>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="intro">
          <p className="mono-label">Market benchmarks · why social</p>
          <h2>Social media,<br />in <em>motion.</em></h2>
        </div>
        <div className="grid">
          <div className="cell"><div className="num">5.24<span className="unit">B</span></div><div className="lbl">Global social users (DataReportal, 2024)</div></div>
          <div className="cell"><div className="num">2<span className="unit">h 20m</span></div><div className="lbl">Avg. daily time on social</div></div>
          <div className="cell"><div className="num">80<span className="unit">%</span></div><div className="lbl">Consumers follow brands on social</div></div>
          <div className="cell"><div className="num">73<span className="unit">%</span></div><div className="lbl">Marketers say social drives results</div></div>
        </div>
      </section>

      <section className="svc">
        <div className="svc-head">
          <div>
            <p className="mono-label">Our services</p>
            <h2 className="section-display">Strategy that <em>performs,</em><br />content that <em>connects.</em></h2>
          </div>
          <p>Four disciplines, one engine. We combine human-led strategy with Claude-powered tooling so brands can show up every day with intention — not noise.</p>
        </div>
        <div className="svc-grid">
          <div className="card svc-a">
            <div className="num">01 · Signature service</div>
            <h3>Always-on social media management — <em>with a real strategist at the wheel.</em></h3>
            <p>Multi-channel scheduling, community care, creative, and reporting. Your brand, online every day, on-message every time.</p>
            <Link className="arrow" style={{ color: 'var(--accent-soft)' }} href="/services">Explore strategy →</Link>
            <div className="chart" dangerouslySetInnerHTML={{ __html: HERO_CHART }} />
          </div>

          <div className="card svc-b">
            <div className="num">02</div><h3>AI caption engine</h3>
            <p>CaptionCraft, our in-house tool, drafts on-brand copy in seconds — every word reviewed by a human strategist before it ships.</p>
            <Link className="arrow" href="/captioncraft">Meet CaptionCraft →</Link>
          </div>

          <div className="card svc-c">
            <div className="num">03</div><h3>Content &amp; creative</h3>
            <p>Photo, video, motion. We produce the work that fills your feed and make it easy for your team to sign off.</p>
          </div>

          <div className="card svc-d">
            <div className="num">04</div><h3>Community management</h3>
            <p>Always-on replies, DM triage, and brand-safe conversation. Turning followers into loyal advocates.</p>
          </div>

          <div className="card svc-e">
            <div className="num">05</div><h3>Analytics &amp; attribution</h3>
            <p>Honest reporting on what actually moves the needle — engagement quality, conversions, sentiment.</p>
          </div>

          <div className="card svc-f">
            <div className="ph has-img">
              <Image src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?w=1400&q=75&auto=format" alt="Pulse team at work" fill sizes="(max-width:820px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className="side">
              <div className="num">06 · Paid</div><h3>Performance campaigns</h3>
              <p>Creative testing frameworks that scale the winners. We match the spend to the strategy — no vanity budgets.</p>
              <Link className="arrow" href="/services">See case studies →</Link>
            </div>
          </div>

          <div className="card svc-g">
            <div className="num">07 · Featured</div>
            <h3>Build with us — your<br />content, fully managed.</h3>
            <p>From zero to always-on in 30 days. Fixed monthly retainer, unlimited revisions, full attribution.</p>
            <Link className="arrow" href="/contact">Book a call →</Link>
          </div>
        </div>
      </section>

      <section className="quote-sec">
        <div className="quote-inner">
          <div className="ph dark has-img">
            <Image src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1400&q=75&auto=format" alt="Client portrait" fill sizes="(max-width:820px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <p className="mono-label" style={{ color: 'rgba(255,255,255,.4)' }}>Client story · Geekly, Bendigo VIC</p>
            <blockquote>&ldquo;Pulse turned our shopfront into a <em>conversation.</em> We went from posting when we remembered to being the most <em>recognised</em> repair shop in the region.&rdquo;</blockquote>
            <cite><b>Geekly Computers &amp; Mobile Repair</b>Bendigo VIC</cite>
          </div>
        </div>
      </section>

      <section className="proc">
        <div className="proc-head">
          <div>
            <p className="mono-label">How we work</p>
            <h2 className="section-display">Three moves, one <em>rhythm.</em></h2>
          </div>
          <p>We keep it simple. No multi-month discovery, no mystery deliverables. Here&apos;s the shape of the first 90 days.</p>
        </div>
        <div className="proc-grid">
          <div className="proc-step">
            <div className="n">i.</div><h3>Tune in</h3>
            <p>We audit your current presence, map your audience, and set the measurable goals we&apos;ll all be held to.</p>
            <div className="mono-label">Week 1 – 2</div>
          </div>
          <div className="proc-step">
            <div className="n">ii.</div><h3>Plug in</h3>
            <p>We connect CaptionCraft, build out the content engine, and run the first wave of campaigns against the plan.</p>
            <div className="mono-label">Week 3 – 6</div>
          </div>
          <div className="proc-step">
            <div className="n">iii.</div><h3>Turn up</h3>
            <p>Always-on management, real-time reporting, and a monthly strategy review so you always know what&apos;s next.</p>
            <div className="mono-label">Week 7 onward</div>
          </div>
        </div>
      </section>

      <section className="final-cta">
        <p className="mono-label">Let&apos;s work together</p>
        <h2>Ready<br />to <em>Pulse?</em></h2>
        <p className="sub">Tell us about the brand. We&apos;ll come back with a plan, a timeline, and a flat-rate proposal — no pitch theatre.</p>
        <Link className="btn-pill btn-grad" href="/contact" style={{ padding: '18px 36px', fontSize: 15 }}>
          Start the project →
        </Link>
      </section>
    </main>
  )
}
