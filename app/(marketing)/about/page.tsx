import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About · Bendigo Social Media Agency',
  description: 'Pulse Social Media is a founder-led social media agency in Bendigo, Victoria. Human-led strategy, AI-assisted tooling, built for Australian brands that refuse to sound like everyone else.',
  keywords: [
    'Bendigo social media agency',
    'about Pulse Social Media',
    'social media agency Victoria',
    'founder-led social media',
  ],
  alternates: { canonical: '/about' },
  openGraph: {
    title: 'About Pulse Social Media · Bendigo Social Media Agency',
    description: 'Founder-led social media agency in Bendigo, Victoria. Human-led strategy, AI-assisted tooling, built for Australian brands.',
    url: '/about',
  },
}

const CSS = `
.pulse-about .manifesto{max-width:1320px;margin:0 auto;padding:40px 48px 80px;display:grid;grid-template-columns:1fr 1.4fr;gap:80px;align-items:start;border-top:1px solid var(--hair)}
.pulse-about .manifesto .ph{height:620px;position:relative}
.pulse-about .manifesto .text{font-size:22px;line-height:1.55;font-weight:300}
.pulse-about .manifesto .text p{margin:0 0 20px}
.pulse-about .manifesto .text p:first-of-type{font-family:'Fraunces',serif;font-style:italic;font-size:34px;line-height:1.25;letter-spacing:-0.01em}
.pulse-about .manifesto .text p:first-of-type em{color:var(--accent)}

.pulse-about .values{background:var(--ink);color:#fff;padding:120px 48px}
.pulse-about .values-inner{max-width:1320px;margin:0 auto}
.pulse-about .values-head{display:grid;grid-template-columns:1fr 1.4fr;gap:48px;margin-bottom:64px;align-items:end}
.pulse-about .values-head h2{font-size:clamp(48px,6vw,84px);font-weight:200;letter-spacing:-0.035em;line-height:1;margin:16px 0 0;color:#fff}
.pulse-about .values-head h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent-soft);font-weight:300}
.pulse-about .values-head p{color:rgba(255,255,255,.6);max-width:440px;line-height:1.6;margin:0}
.pulse-about .values-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.1)}
.pulse-about .value{background:var(--ink);padding:40px 28px;display:flex;flex-direction:column;gap:14px;min-height:280px}
.pulse-about .value .num{font-family:'Fraunces',serif;font-style:italic;font-size:64px;color:var(--accent-soft);line-height:1}
.pulse-about .value h3{font-size:22px;font-weight:500;margin:0}
.pulse-about .value p{color:rgba(255,255,255,.6);font-size:14px;line-height:1.55;margin:0}

.pulse-about .whywe{max-width:1320px;margin:0 auto;padding:100px 48px;border-top:1px solid var(--hair)}
.pulse-about .whywe-head{display:grid;grid-template-columns:1fr 1.3fr;gap:72px;align-items:end;margin-bottom:56px}
.pulse-about .whywe-head h2{font-size:clamp(44px,5.5vw,84px);font-weight:200;letter-spacing:-0.035em;line-height:.95;margin:16px 0 0}
.pulse-about .whywe-head h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-about .whywe-lead{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(24px,2.4vw,34px);line-height:1.3;letter-spacing:-0.01em;color:var(--ink);margin:0;max-width:520px}
.pulse-about .whywe-lead em{color:var(--accent)}

.pulse-about .whywe-pull{background:var(--ink);color:#fff;border-radius:22px;padding:64px 56px;display:grid;grid-template-columns:1.4fr 1fr;gap:56px;align-items:center;margin-bottom:24px}
.pulse-about .whywe-pull blockquote{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(28px,3.4vw,44px);line-height:1.15;letter-spacing:-0.015em;margin:0}
.pulse-about .whywe-pull blockquote em{color:var(--accent-soft)}
.pulse-about .whywe-pull .whywe-aside{border-left:1px solid rgba(255,255,255,.15);padding-left:32px;display:flex;flex-direction:column;gap:14px}
.pulse-about .whywe-pull .whywe-aside p{color:rgba(255,255,255,.72);font-size:15px;line-height:1.6;margin:0}
.pulse-about .whywe-pull .whywe-aside .mono-label{color:rgba(255,255,255,.45)}

.pulse-about .whywe-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:20px}
.pulse-about .why-card{background:#fff;border:1px solid var(--hair);border-radius:20px;padding:36px 32px;display:flex;flex-direction:column;gap:14px;min-height:320px;transition:transform .2s, box-shadow .2s}
.pulse-about .why-card:hover{transform:translateY(-3px);box-shadow:0 24px 48px -24px rgba(0,0,0,.15)}
.pulse-about .why-card .wn{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:72px;color:var(--accent);line-height:1;letter-spacing:-0.04em}
.pulse-about .why-card h3{font-size:24px;font-weight:500;letter-spacing:-0.015em;line-height:1.15;margin:0}
.pulse-about .why-card h3 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:400}
.pulse-about .why-card p{font-size:15px;line-height:1.6;color:#333;margin:0}
.pulse-about .why-card .tag{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);margin-top:auto;padding-top:20px;border-top:1px solid var(--hair)}

.pulse-about .ai-band{margin-top:40px;background:#fff;border:1px solid var(--hair);border-radius:22px;overflow:hidden;display:grid;grid-template-columns:1.1fr 1fr}
.pulse-about .ai-band .ai-body{padding:48px;display:flex;flex-direction:column;gap:18px}
.pulse-about .ai-band .ai-body h3{font-size:clamp(28px,3vw,42px);font-weight:300;letter-spacing:-0.025em;line-height:1.05;margin:8px 0 6px}
.pulse-about .ai-band .ai-body h3 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:400}
.pulse-about .ai-band .ai-body p{font-size:16px;line-height:1.6;color:#222;margin:0;max-width:460px}
.pulse-about .ai-band .ai-body p.italic{font-family:'Fraunces',serif;font-style:italic;font-size:22px;line-height:1.35;letter-spacing:-0.01em;color:var(--ink)}
.pulse-about .ai-band .ai-body p.italic em{color:var(--accent)}
.pulse-about .ai-band .ai-list{background:var(--paper-2);padding:40px;display:flex;flex-direction:column;gap:18px;border-left:1px solid var(--hair)}
.pulse-about .ai-row{display:grid;grid-template-columns:28px 1fr;gap:16px;align-items:baseline}
.pulse-about .ai-row + .ai-row{padding-top:18px;border-top:1px solid var(--hair)}
.pulse-about .ai-row .k{font-family:'Fraunces',serif;font-style:italic;font-size:26px;color:var(--accent);line-height:1;font-weight:300}
.pulse-about .ai-row .v b{display:block;font-size:15px;font-weight:600;color:var(--ink);margin-bottom:4px;letter-spacing:-0.005em}
.pulse-about .ai-row .v p{font-size:13.5px;line-height:1.55;color:#333;margin:0}

.pulse-about .ai-redlines{margin-top:36px;padding:32px 48px;background:var(--ink);color:#fff;border-radius:18px;display:grid;grid-template-columns:auto 1fr;gap:40px;align-items:center}
.pulse-about .ai-redlines .lbl{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.18em;text-transform:uppercase;color:var(--accent-soft);white-space:nowrap}
.pulse-about .ai-redlines ul{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
.pulse-about .ai-redlines li{font-size:14px;line-height:1.5;color:rgba(255,255,255,.85);position:relative;padding-left:20px}
.pulse-about .ai-redlines li::before{content:'✕';position:absolute;left:0;top:0;color:var(--accent-soft);font-size:12px;font-weight:600}
.pulse-about .ai-redlines li b{color:#fff;font-weight:600}

.pulse-about .whywe-close{margin-top:48px;padding:40px 0 0;border-top:1px solid var(--hair);display:grid;grid-template-columns:1fr 1.2fr;gap:56px;align-items:start}
.pulse-about .whywe-close h3{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(28px,3vw,40px);letter-spacing:-0.015em;line-height:1.15;margin:8px 0 0;color:var(--ink)}
.pulse-about .whywe-close h3 em{color:var(--accent)}
.pulse-about .whywe-close p{font-size:17px;line-height:1.6;color:#222;margin:0;max-width:560px}

@media(max-width:820px){
  .pulse-about .manifesto{grid-template-columns:1fr;padding:32px 24px 48px;gap:32px}
  .pulse-about .manifesto .ph{height:320px}
  .pulse-about .manifesto .text p:first-of-type{font-size:24px}
  .pulse-about .values{padding:60px 24px}
  .pulse-about .values-head{grid-template-columns:1fr;gap:16px}
  .pulse-about .values-grid{grid-template-columns:1fr 1fr}
  .pulse-about .whywe{padding:56px 24px}
  .pulse-about .whywe-head{grid-template-columns:1fr;gap:20px}
  .pulse-about .whywe-pull{grid-template-columns:1fr;gap:28px;padding:40px 32px}
  .pulse-about .whywe-pull .whywe-aside{border-left:0;border-top:1px solid rgba(255,255,255,.15);padding-left:0;padding-top:20px}
  .pulse-about .whywe-grid{grid-template-columns:1fr;gap:14px}
  .pulse-about .ai-band{grid-template-columns:1fr}
  .pulse-about .ai-band .ai-body{padding:32px 28px}
  .pulse-about .ai-band .ai-list{padding:28px;border-left:0;border-top:1px solid var(--hair)}
  .pulse-about .ai-redlines{grid-template-columns:1fr;padding:28px;gap:20px}
  .pulse-about .ai-redlines ul{grid-template-columns:1fr;gap:14px}
  .pulse-about .why-card{min-height:0;padding:28px 24px}
  .pulse-about .whywe-close{grid-template-columns:1fr;gap:18px}
}
`

export default function AboutPage() {
  return (
    <main className="pulse-about">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="page-head">
        <div>
          <p className="mono-label">About Pulse</p>
          <h1>A small studio<br />for big <em>voices.</em></h1>
        </div>
        <p>Pulse Social Media is a founder-led social media studio based in Bendigo, Victoria. We build always-on social for brands who refuse to sound like everyone else.</p>
      </section>

      <section className="manifesto">
        <div className="ph has-img">
          <Image src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1600&q=75&auto=format" alt="The Pulse studio, golden hour" fill sizes="(max-width: 820px) 100vw, 45vw" style={{ objectFit: 'cover' }} />
        </div>
        <div className="text">
          <p>We started Pulse because social media kept <em>feeling</em> like an afterthought — even for brands spending real money on it.</p>
          <p>The best work we&apos;d seen came from operators who respected the craft: people who rewrote captions until they sang, watched comments like a weather system, and cared about the third frame.</p>
          <p>So we built a studio around that standard — and built tools so we&apos;d never waste an hour on a task a machine could do.</p>
          <p>That&apos;s the whole idea. A human doing the creative, AI doing the admin, and a brand that sounds like itself every single day.</p>
        </div>
      </section>

      <section className="values">
        <div className="values-inner">
          <div className="values-head">
            <div>
              <p className="mono-label" style={{ color: 'rgba(255,255,255,.45)' }}>Principles</p>
              <h2>Four rules<br />we <em>actually</em> live by.</h2>
            </div>
            <p>These aren&apos;t a poster on the wall. They&apos;re how we price work, run accounts, and decide which clients to take on.</p>
          </div>
          <div className="values-grid">
            <div className="value"><div className="num">i.</div><h3>Strategy before content</h3><p>We won&apos;t write a caption until we understand the business underneath it.</p></div>
            <div className="value"><div className="num">ii.</div><h3>Humans edit everything</h3><p>AI drafts, we decide. Every post that ships has had our eyes on it.</p></div>
            <div className="value"><div className="num">iii.</div><h3>Flat-rate, month-to-month</h3><p>No lock-in, no hourly games. If we&apos;re not worth keeping, you shouldn&apos;t have to sue to leave.</p></div>
            <div className="value"><div className="num">iv.</div><h3>Honest numbers</h3><p>Reporting on what drives the business — not what flatters the agency.</p></div>
          </div>
        </div>
      </section>

      <section className="whywe">
        <div className="whywe-head">
          <div>
            <p className="mono-label">Our why</p>
            <h2>Why we do<br />what we <em>do.</em></h2>
          </div>
          <p className="whywe-lead">Pulse isn&apos;t here to post more. It&apos;s here to make brands sound <em>unmistakably like themselves</em> — every day, on every channel, without needing a ten-person marketing team to pull it off.</p>
        </div>

        <div className="whywe-pull">
          <blockquote>&ldquo;Most social media feels like it was written by <em>nobody</em>, for <em>everybody.</em> We started Pulse to prove it didn&apos;t have to.&rdquo;</blockquote>
          <div className="whywe-aside">
            <p className="mono-label">The founding brief</p>
            <p>After watching brilliant brand voices get flattened — by committee, by templates, by the sheer volume of daily posting — we built the studio we wished existed. Senior-led, AI-assisted, and answerable directly to the person paying the invoice.</p>
          </div>
        </div>

        <div className="whywe-grid">
          <div className="why-card">
            <div className="wn">i.</div>
            <h3>Because a brand is a <em>voice,</em> not a volume knob.</h3>
            <p>Feeds full of filler don&apos;t grow brands — they anaesthetise them. We&apos;d rather ship four posts that sound like you than forty that sound like the algorithm.</p>
            <div className="tag">On craft</div>
          </div>
          <div className="why-card">
            <div className="wn">ii.</div>
            <h3>Because the best <em>thinking</em> shouldn&apos;t cost the most hours.</h3>
            <p>Senior thinking should go into strategy and judgement — not into the busywork a machine can finish in seconds. We built the tooling so it can.</p>
            <div className="tag">On tools</div>
          </div>
          <div className="why-card">
            <div className="wn">iii.</div>
            <h3>Because AI is a <em>studio assistant,</em> not a ghostwriter.</h3>
            <p>AI drafts, we decide. Used well, it buys back the hours that kill great work — so the thinking gets deeper, not faster and worse.</p>
            <div className="tag">On AI</div>
          </div>
          <div className="why-card">
            <div className="wn">iv.</div>
            <h3>Because great work needs <em>one clear owner,</em> not a handoff chain.</h3>
            <p>No junior account managers translating what you said into what they think you meant. You deal with us from brief to ship — same team, every week.</p>
            <div className="tag">On how we work</div>
          </div>
        </div>

        <div className="ai-band">
          <div className="ai-body">
            <p className="mono-label">On AI, specifically</p>
            <h3>We use AI to buy back <em>taste.</em></h3>
            <p className="italic">Most operators use AI to do <em>more.</em> We use it to do the same, <em>better</em> — and to free up the hours a ten-person agency normally spends on drafting and reformatting.</p>
            <p>Before CaptionCraft, drafting cross-channel captions ate roughly a third of the working week. Now that time goes into watching competitor feeds, handling community inboxes, and sharpening the things only a human can.</p>
          </div>
          <div className="ai-list">
            <div className="ai-row"><div className="k">i.</div><div className="v"><b>It drafts. We decide.</b><p>Every caption, reply and report is reviewed by us before it ships. AI never gets a publish button.</p></div></div>
            <div className="ai-row"><div className="k">ii.</div><div className="v"><b>Trained on <u>your</u> voice, not the internet&apos;s.</b><p>CaptionCraft is fine-tuned on your own archive — the posts you&apos;ve approved, the phrases you use, the ones you don&apos;t. It sounds like you, not like everyone.</p></div></div>
            <div className="ai-row"><div className="k">iii.</div><div className="v"><b>It replaces tasks, never judgement.</b><p>Reformatting for TikTok. Alt text. Monthly recap drafts. The admin gets automated so the craft gets more attention, not less.</p></div></div>
          </div>
        </div>

        <div className="ai-redlines">
          <div className="lbl">Our AI red-lines</div>
          <ul>
            <li><b>No unreviewed output</b> goes live — ever.</li>
            <li><b>No synthetic faces or voices</b> pretending to be real people.</li>
            <li><b>No training on client data</b> without explicit opt-in.</li>
          </ul>
        </div>

        <div className="whywe-close">
          <div>
            <p className="mono-label">The bet</p>
            <h3>If we make the <em>work</em> better, the numbers follow.</h3>
          </div>
          <p>The pattern we keep seeing: the brand starts sounding sharper first, and the metrics catch up three months later. We&apos;re betting the studio on that order of operations being right.</p>
        </div>
      </section>

      <section className="final-cta">
        <p className="mono-label">Work with us</p>
        <h2>Let&apos;s<br />make <em>something.</em></h2>
        <p className="sub">We take on a small number of new clients each quarter. If the brand fits, we&apos;ll tell you.</p>
        <Link className="btn-pill btn-grad" href="/contact" style={{ padding: '18px 36px', fontSize: 15 }}>Start the project →</Link>
      </section>
    </main>
  )
}
