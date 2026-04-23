import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Services · Pulse Social Media',
  description: 'Founder-led social media management — strategy, content, community, paid, analytics and AI tooling, rolled into a flat monthly retainer.',
  alternates: { canonical: '/services' },
}

const CSS = `
.pulse-services{ --italic:'Fraunces',serif; }
.pulse-services .svc-head{max-width:1320px;margin:0 auto;padding:80px 48px 48px;display:grid;grid-template-columns:1.2fr 1fr;gap:72px;align-items:end;border-bottom:1px solid var(--hair)}
.pulse-services .svc-head h1{font-size:clamp(56px,8vw,140px);font-weight:200;letter-spacing:-0.045em;line-height:.9;margin:16px 0 0}
.pulse-services .svc-head h1 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:300}
.pulse-services .svc-head .right{display:flex;flex-direction:column;gap:20px;max-width:460px}
.pulse-services .svc-head .right p{font-size:18px;line-height:1.55;color:#2a2a2a;margin:0}
.pulse-services .svc-head .meta{display:flex;gap:32px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);border-top:1px solid var(--hair);padding-top:20px}
.pulse-services .svc-head .meta b{display:block;color:var(--ink);font-family:var(--italic);font-style:italic;font-size:28px;font-weight:400;text-transform:none;letter-spacing:0;margin-bottom:4px}

.pulse-services .disc{max-width:1320px;margin:0 auto;padding:80px 48px}
.pulse-services .disc-head{display:grid;grid-template-columns:1fr 1.3fr;gap:64px;align-items:end;margin-bottom:48px}
.pulse-services .disc-head h2{font-size:clamp(40px,5vw,68px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:12px 0 0}
.pulse-services .disc-head h2 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:300}
.pulse-services .disc-head p{color:#333;font-size:16px;line-height:1.65;margin:0;max-width:480px}
.pulse-services .disc-grid{display:grid;grid-template-columns:repeat(12,1fr);gap:20px;grid-auto-rows:minmax(260px,auto)}
.pulse-services .d-card{background:#fff;border:1px solid var(--hair);border-radius:18px;padding:28px;display:flex;flex-direction:column;gap:12px;position:relative;overflow:hidden;transition:transform .25s, box-shadow .25s}
.pulse-services .d-card:hover{transform:translateY(-3px);box-shadow:0 24px 48px -24px rgba(0,0,0,.16)}
.pulse-services .d-card .num{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.2em;color:var(--muted);text-transform:uppercase}
.pulse-services .d-card h3{font-size:24px;font-weight:500;letter-spacing:-0.02em;margin:0;line-height:1.15}
.pulse-services .d-card h3 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:400}
.pulse-services .d-card p{font-size:14px;line-height:1.6;color:#333;margin:0}
.pulse-services .d-card ul{margin:auto 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:8px;border-top:1px solid var(--hair);padding-top:16px}
.pulse-services .d-card li{font-size:13px;color:#444;display:flex;gap:8px;align-items:baseline}
.pulse-services .d-card li::before{content:'●';color:var(--accent);font-size:8px;flex-shrink:0}
.pulse-services .d-a{grid-column:span 7;background:linear-gradient(140deg,#1a1717 0%,#2a1f22 100%);color:#fff;border-color:transparent}
.pulse-services .d-a h3{font-size:34px;max-width:480px;color:#fff}
.pulse-services .d-a h3 em{color:var(--accent-soft)}
.pulse-services .d-a .num{color:var(--accent-soft)}
.pulse-services .d-a p{color:rgba(255,255,255,.7);max-width:440px}
.pulse-services .d-a ul{border-top-color:rgba(255,255,255,.12)}
.pulse-services .d-a li{color:rgba(255,255,255,.75)}
.pulse-services .d-a li::before{color:var(--accent-soft)}
.pulse-services .d-b{grid-column:span 5;background:var(--paper-2)}
.pulse-services .d-c,.pulse-services .d-d,.pulse-services .d-e,.pulse-services .d-f{grid-column:span 3}
.pulse-services .d-g{grid-column:span 5;background:var(--accent);color:#fff;border-color:transparent}
.pulse-services .d-g h3{font-family:var(--italic);font-style:italic;font-weight:400;color:#fff;font-size:32px}
.pulse-services .d-g p,.pulse-services .d-g li{color:rgba(255,255,255,.9)}
.pulse-services .d-g .num{color:rgba(255,255,255,.7)}
.pulse-services .d-g ul{border-top-color:rgba(255,255,255,.2)}
.pulse-services .d-g li::before{color:#fff}
.pulse-services .d-h{grid-column:span 7;display:grid;grid-template-columns:1fr 1fr;gap:0;padding:0;overflow:hidden}
.pulse-services .d-h .ph{border-radius:0;min-height:100%}
.pulse-services .d-h .side{padding:28px;display:flex;flex-direction:column;gap:12px}
.pulse-services .d-h .side h3{font-size:24px}

.pulse-services .proof{background:var(--ink);color:#fff;padding:100px 48px}
.pulse-services .proof-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1.6fr;gap:80px;align-items:center}
.pulse-services .proof-inner .ph{height:460px;border-radius:20px;position:relative}
.pulse-services .proof-inner blockquote{font-family:var(--italic);font-style:italic;font-weight:300;font-size:clamp(30px,3.8vw,52px);line-height:1.1;letter-spacing:-0.02em;margin:0}
.pulse-services .proof-inner blockquote em{color:var(--accent-soft)}
.pulse-services .proof-inner cite{display:block;margin-top:32px;font-style:normal;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.pulse-services .proof-inner cite b{color:#fff;font-weight:500;display:block;margin-bottom:4px}
.pulse-services .proof-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:24px;margin-top:48px;border-top:1px solid rgba(255,255,255,.15);padding-top:32px}
.pulse-services .proof-stat .v{font-family:var(--italic);font-style:italic;font-size:48px;letter-spacing:-0.02em;line-height:1;color:#fff;font-weight:400}
.pulse-services .proof-stat .v .u{font-size:24px;color:var(--accent-soft)}
.pulse-services .proof-stat .l{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.5);margin-top:10px;line-height:1.5}

.pulse-services .proc{max-width:1320px;margin:0 auto;padding:100px 48px}
.pulse-services .proc-head{display:flex;justify-content:space-between;align-items:end;gap:48px;margin-bottom:48px;flex-wrap:wrap}
.pulse-services .proc-head h2{font-size:clamp(40px,5vw,68px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:12px 0 0}
.pulse-services .proc-head h2 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:300}
.pulse-services .proc-head p{color:var(--muted);max-width:360px;margin:0;font-size:15px;line-height:1.6}
.pulse-services .proc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:1px;background:var(--hair);border:1px solid var(--hair)}
.pulse-services .proc-step{background:var(--paper);padding:36px 28px;min-height:300px;display:flex;flex-direction:column}
.pulse-services .proc-step .n{font-family:var(--italic);font-style:italic;font-size:72px;font-weight:300;color:var(--accent);line-height:1;letter-spacing:-0.04em}
.pulse-services .proc-step h3{font-size:20px;font-weight:500;letter-spacing:-0.02em;margin:20px 0 10px}
.pulse-services .proc-step p{font-size:13px;line-height:1.6;color:#333;margin:0}
.pulse-services .proc-step .mono-label{margin-top:auto;padding-top:20px}

.pulse-services .faq{max-width:960px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair)}
.pulse-services .faq h2{font-size:clamp(36px,4.5vw,60px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:8px 0 32px}
.pulse-services .faq h2 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:300}
.pulse-services details{border-top:1px solid var(--hair);padding:22px 0}
.pulse-services details:last-of-type{border-bottom:1px solid var(--hair)}
.pulse-services summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:400;gap:24px}
.pulse-services summary::-webkit-details-marker{display:none}
.pulse-services summary::after{content:'+';font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:22px;flex-shrink:0}
.pulse-services details[open] summary::after{content:'−'}
.pulse-services details p{color:#333;line-height:1.65;margin:14px 0 0;max-width:720px;font-size:16px}

.pulse-services .cc{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair)}
.pulse-services .cc-inner{display:grid;grid-template-columns:1fr 1fr;gap:72px;align-items:center}
.pulse-services .cc-left h2{font-size:clamp(44px,5.5vw,76px);font-weight:200;letter-spacing:-0.035em;line-height:.95;margin:12px 0 24px}
.pulse-services .cc-left h2 em{font-family:var(--italic);font-style:italic;color:var(--accent);font-weight:300}
.pulse-services .cc-lead{font-size:18px;line-height:1.55;color:#222;margin:0 0 28px;max-width:520px}
.pulse-services .cc-points{list-style:none;padding:24px 0 0;margin:0 0 32px;display:flex;flex-direction:column;gap:14px;border-top:1px solid var(--hair)}
.pulse-services .cc-points li{font-size:15px;line-height:1.55;color:#333;padding-left:20px;position:relative}
.pulse-services .cc-points li::before{content:'';position:absolute;left:0;top:9px;width:8px;height:8px;border-radius:50%;background:var(--accent)}
.pulse-services .cc-points b{color:var(--ink);font-weight:600}
.pulse-services .cc-cta{display:flex;gap:12px;align-items:center;flex-wrap:wrap}
.pulse-services .cc-right{position:relative}
.pulse-services .cc-card{background:#fff;border:1px solid var(--hair);border-radius:20px;box-shadow:0 40px 80px -40px rgba(0,0,0,.25), 0 0 0 1px rgba(0,0,0,.02);overflow:hidden;transform:rotate(-0.6deg)}
.pulse-services .cc-card-head{background:var(--paper-2);padding:14px 18px;display:flex;align-items:center;gap:12px;border-bottom:1px solid var(--hair)}
.pulse-services .cc-dots{display:flex;gap:6px}
.pulse-services .cc-dots span{width:10px;height:10px;border-radius:50%;background:rgba(0,0,0,.12)}
.pulse-services .cc-dots span:nth-child(1){background:#ff5f57}
.pulse-services .cc-dots span:nth-child(2){background:#febc2e}
.pulse-services .cc-dots span:nth-child(3){background:#28c840}
.pulse-services .cc-label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.pulse-services .cc-card-body{padding:24px 22px 22px;display:flex;flex-direction:column;gap:14px}
.pulse-services .cc-meta{font-size:12px;color:var(--muted);font-family:'JetBrains Mono',monospace;letter-spacing:.04em}
.pulse-services .cc-meta span{opacity:.7}
.pulse-services .cc-meta b{color:var(--ink);font-weight:500;font-family:'Plus Jakarta Sans';font-size:13px;letter-spacing:0;margin-left:6px}
.pulse-services .cc-out{background:var(--paper-2);border:1px dashed var(--hair);border-radius:12px;padding:18px 20px;display:flex;flex-direction:column;gap:14px}
.pulse-services .cc-out p{margin:0;font-size:15px;line-height:1.55;color:var(--ink);font-weight:400}
.pulse-services .cc-chips{display:flex;flex-wrap:wrap;gap:6px}
.pulse-services .cc-chips span{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;padding:4px 8px;border:1px solid var(--hair);border-radius:999px;color:var(--muted);background:#fff}
.pulse-services .cc-actions{display:flex;justify-content:space-between;gap:10px;margin-top:4px}
.pulse-services .cc-btn{flex:1;padding:12px 14px;font-family:inherit;font-size:12px;font-weight:600;border-radius:10px;border:1px solid var(--hair);background:#fff;color:var(--ink);cursor:pointer;transition:background .15s, color .15s, border-color .15s}
.pulse-services .cc-btn:hover{border-color:var(--ink)}
.pulse-services .cc-btn.primary{background:var(--ink);color:#fff;border-color:var(--ink)}
.pulse-services .cc-btn.primary:hover{background:var(--accent);border-color:var(--accent)}

@media(max-width:960px){
  .pulse-services .svc-head,.pulse-services .disc-head,.pulse-services .proc-head{grid-template-columns:1fr;padding-left:24px;padding-right:24px;gap:24px}
  .pulse-services .svc-head{padding:48px 24px 32px}
  .pulse-services .disc{padding:56px 24px}
  .pulse-services .disc-grid{grid-template-columns:1fr;grid-auto-rows:auto}
  .pulse-services .disc-grid > *{grid-column:auto !important}
  .pulse-services .d-h{grid-template-columns:1fr}
  .pulse-services .proof{padding:56px 24px}
  .pulse-services .proof-inner{grid-template-columns:1fr;gap:32px}
  .pulse-services .proof-inner .ph{height:300px}
  .pulse-services .proof-stats{grid-template-columns:1fr 1fr;gap:16px}
  .pulse-services .proc{padding:56px 24px}
  .pulse-services .proc-grid{grid-template-columns:1fr 1fr}
  .pulse-services .faq{padding:48px 24px}
  .pulse-services .cc{padding:56px 24px}
  .pulse-services .cc-inner{grid-template-columns:1fr;gap:40px}
  .pulse-services .cc-card{transform:none}
}
@media(max-width:560px){
  .pulse-services .proc-grid{grid-template-columns:1fr}
  .pulse-services .proof-stats{grid-template-columns:1fr}
}
`

export default function ServicesPage() {
  return (
    <main className="pulse-services">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="svc-head">
        <div>
          <p className="mono-label">Services · What we do</p>
          <h1>The full <em>engine,</em><br />one flat <em>fee.</em></h1>
        </div>
        <div className="right">
          <p>Six disciplines, one operator, one invoice. Pulse runs your social the way an in-house hire would — strategy, creative, community, paid, analytics and AI tooling — without the overhead of a ten-person agency.</p>
          <div className="meta">
            <div><b>6</b>Disciplines</div>
            <div><b>30d</b>Rolling</div>
            <div><b>48h</b>SOW turnaround</div>
          </div>
        </div>
      </section>

      <section className="disc">
        <div className="disc-head">
          <div>
            <p className="mono-label">What&apos;s in the box</p>
            <h2>Six things we<br />do <em>better</em> than anyone.</h2>
          </div>
          <p>Most agencies bolt specialisms together and pass your account between five juniors. Pulse is a single operator stack — one brain, one playbook, AI doing the busywork so senior thinking makes it into every post.</p>
        </div>
        <div className="disc-grid">
          <div className="d-card d-a">
            <div className="num">01 · Signature</div>
            <h3>Always-on social management — <em>with a real strategist at the wheel.</em></h3>
            <p>Multi-channel scheduling, creative, community care, monthly reviews. Your brand online every day, on-message every time.</p>
            <ul>
              <li>Up to 4 channels, weekly cadence</li>
              <li>One senior operator on your account — no juniors</li>
              <li>Monthly performance review + next-quarter plan</li>
            </ul>
          </div>
          <div className="d-card d-b">
            <div className="num">02</div>
            <h3>AI <em>caption engine</em></h3>
            <p>CaptionCraft drafts on-brand copy in seconds — reviewed by a human before it ships.</p>
            <ul><li>Voice-trained on your archive</li><li>Strategist QA on every caption</li></ul>
          </div>
          <div className="d-card d-c">
            <div className="num">03</div>
            <h3>Content &amp; creative</h3>
            <p>Photo, vertical video, motion. We produce the feed and make sign-off painless.</p>
          </div>
          <div className="d-card d-d">
            <div className="num">04</div>
            <h3>Community</h3>
            <p>Reply coverage, DM triage, brand-safe conversation. Followers into loyal advocates.</p>
          </div>
          <div className="d-card d-e">
            <div className="num">05</div>
            <h3>Paid media</h3>
            <p>Creative-testing frameworks that scale the winners. No vanity spend.</p>
          </div>
          <div className="d-card d-f">
            <div className="num">06</div>
            <h3>Analytics</h3>
            <p>Exec dashboards, monthly readouts, honest attribution.</p>
          </div>
          <div className="d-card d-g">
            <div className="num">Add-on · Featured</div>
            <h3>Creator &amp; UGC programme</h3>
            <p>Matching, contracts, rights management, briefing — plug a creator layer into your retainer at any tier.</p>
            <ul><li>4 matched creators / month</li><li>Briefing, approvals, rights in your drive</li></ul>
          </div>
          <div className="d-card d-h">
            <div className="ph has-img">
              <Image src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1600&q=75&auto=format" alt="A Pulse operator at work" fill sizes="(max-width: 960px) 100vw, 40vw" style={{ objectFit: 'cover' }} />
            </div>
            <div className="side">
              <div className="num">How we&apos;re staffed</div>
              <h3>One operator, <em>never a pool.</em></h3>
              <p>You deal with us from day one — brief, draft, ship, review. No account-manager layer, no junior ghostwriters, no work shipping without our eyes on it.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cc">
        <div className="cc-inner">
          <div className="cc-left">
            <p className="mono-label pink">Our in-house tool</p>
            <h2>Meet <em>CaptionCraft.</em></h2>
            <p className="cc-lead">Every Pulse retainer comes with access to CaptionCraft — the AI caption engine we built in-house, trained on your brand voice. It drafts on-brand copy in seconds, so our time goes on strategy, community and the work that actually moves numbers.</p>
            <ul className="cc-points">
              <li><b>Voice-trained on your archive</b> — the longer you use it, the more it sounds like you.</li>
              <li><b>Human QA on every caption</b> — nothing ships without our sign-off.</li>
              <li><b>Variants on tap</b> — three angles, three lengths, three CTAs, in one click.</li>
            </ul>
            <div className="cc-cta">
              <Link className="btn-pill btn-ink" href="/captioncraft">See how it works →</Link>
              <Link className="btn-pill btn-ghost" href="/contact">Or talk to us</Link>
            </div>
          </div>
          <div className="cc-right">
            <div className="cc-card">
              <div className="cc-card-head">
                <div className="cc-dots"><span /><span /><span /></div>
                <div className="cc-label">CaptionCraft · draft</div>
              </div>
              <div className="cc-card-body">
                <div className="cc-meta"><span>Voice:</span> <b>Geekly · friendly, dry, Bendigo-local</b></div>
                <div className="cc-meta"><span>Angle:</span> <b>Spring window-cleaning special</b></div>
                <div className="cc-out">
                  <p>Screens full of dust bunnies? Same. Bring your laptop in this week and we&apos;ll give it a proper spring clean — inside and out — for $49. Your keyboard will thank you.</p>
                  <div className="cc-chips">
                    <span>Hook ★</span><span>CTA ★</span><span>152 chars</span><span>Voice match 94%</span>
                  </div>
                </div>
                <div className="cc-actions">
                  <button className="cc-btn">Regenerate ↻</button>
                  <button className="cc-btn primary">Send for review →</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="proof">
        <div className="proof-inner">
          <div className="ph dark has-img">
            <Image src="https://images.unsplash.com/photo-1552058544-f2b08422138a?w=1400&q=75&auto=format" alt="Client portrait" fill sizes="(max-width: 960px) 100vw, 35vw" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <p className="mono-label" style={{ color: 'rgba(255,255,255,.4)' }}>Client · Geekly, Bendigo VIC</p>
            <blockquote>&ldquo;Pulse turned our shopfront into a <em>conversation.</em> We went from posting when we remembered to being the most <em>recognised</em> repair shop in the region.&rdquo;</blockquote>
            <cite><b>Geekly Computers &amp; Mobile Repair</b>Bendigo VIC</cite>
            <div className="proof-stats">
              <div className="proof-stat"><div className="v">~1.5<span className="u">%</span></div><div className="l">Market avg IG engagement · Social Insider benchmark</div></div>
              <div className="proof-stat"><div className="v">3–5<span className="u">/wk</span></div><div className="l">Posting cadence proven to sustain reach</div></div>
              <div className="proof-stat"><div className="v">3<span className="u">×</span></div><div className="l">Short-form video reach vs static · platform data</div></div>
            </div>
          </div>
        </div>
      </section>

      <section className="proc">
        <div className="proc-head">
          <div>
            <p className="mono-label">What happens next</p>
            <h2>Four weeks from<br />signed to <em>live.</em></h2>
          </div>
          <p>No multi-month discovery theatre. Onboarded in two weeks, shipping in week three — the person who scopes your work is the same person who runs it.</p>
        </div>
        <div className="proc-grid">
          <div className="proc-step"><div className="n">i.</div><h3>Scope &amp; sign</h3><p>Flat-fee SOW back within 48 hours of the brief. No pricing games, no surprise contractors.</p><div className="mono-label">Week 0</div></div>
          <div className="proc-step"><div className="n">ii.</div><h3>Tune in</h3><p>Audit, voice doc, channel reset, tooling plug-in. We meet your team, you meet us.</p><div className="mono-label">Week 1–2</div></div>
          <div className="proc-step"><div className="n">iii.</div><h3>Plug in</h3><p>Content engine live. First wave of posts, first campaign brief, first community shift.</p><div className="mono-label">Week 3–4</div></div>
          <div className="proc-step"><div className="n">iv.</div><h3>Turn up</h3><p>Always-on rhythm. Weekly ship, monthly review, quarterly reset. Month-to-month forever.</p><div className="mono-label">Week 5+</div></div>
        </div>
      </section>

      <section className="faq">
        <p className="mono-label">Short answers</p>
        <h2>Before you <em>enquire.</em></h2>
        <details open><summary>How does pricing work?</summary><p>Retainers are scoped per engagement — we send a flat-rate SOW within 48 hours of a brief. No hourly games, no mystery line items.</p></details>
        <details><summary>Is platform ad spend included?</summary><p>No. The retainer covers management only. Platform spend (Meta, TikTok, LinkedIn) is billed directly against a card you give us, or to your own ad account.</p></details>
        <details><summary>Who owns what we make?</summary><p>You do. Every raw file, caption, strategy doc and dashboard lives in your drive from day one. On exit, you keep the keys.</p></details>
        <details><summary>Can I pause or cancel?</summary><p>Yes. Month-to-month, cancel at the end of any billing cycle with 30 days&apos; notice. No lock-ins.</p></details>
        <details><summary>Can you work with our existing in-house team?</summary><p>Yes — happy to slot alongside in-house marketing, comms or creative. Hybrid setups work well.</p></details>
        <details><summary>What if I just need a one-off project?</summary><p>We run short <em>Strategy Intensives</em> — a tight two-week engagement that ships a voice doc, channel mix, content pillars and a 90-day calendar. Ask and we&apos;ll scope one.</p></details>
      </section>

      <section className="final-cta">
        <p className="mono-label">Ready when you are</p>
        <h2>Let&apos;s make it<br /><em>Pulse.</em></h2>
        <p className="sub">Tell us about the brand. We&apos;ll come back with a plan, a timeline, and a flat-rate SOW — no pitch theatre, no mystery line items.</p>
        <Link className="btn-pill btn-grad" href="/contact" style={{ padding: '18px 36px', fontSize: 15 }}>Start the project →</Link>
      </section>
    </main>
  )
}
