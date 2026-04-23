import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'CaptionCraft · Pulse Social Media',
  description: 'Captions that sound like you. Not like a bot. CaptionCraft is the AI writing tool built in-house at Pulse because every other one made brands sound the same.',
  alternates: { canonical: '/captioncraft' },
}

const CSS = `
.pulse-cc .cc-hero{max-width:1320px;margin:0 auto;padding:48px 48px 96px;border-top:1px solid var(--hair);display:grid;grid-template-columns:1fr 1.1fr;gap:80px;align-items:center}
.pulse-cc .cc-hero .eyebrow{display:inline-flex;gap:10px;align-items:center;padding:8px 14px;border-radius:999px;border:1px solid var(--hair);background:#fff;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:24px}
.pulse-cc .cc-hero .eyebrow .dot{width:6px;height:6px;border-radius:50%;background:var(--accent)}
.pulse-cc .cc-hero h1{font-size:clamp(44px,5.5vw,84px);font-weight:200;letter-spacing:-0.035em;line-height:1.02;margin:0 0 24px}
.pulse-cc .cc-hero h1 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-cc .cc-hero p{color:#333;font-size:18px;line-height:1.55;max-width:500px;margin:0 0 32px}
.pulse-cc .cc-btns{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:40px}
.pulse-cc .cc-stats{display:flex;gap:40px;padding-top:28px;border-top:1px solid var(--hair)}
.pulse-cc .cc-stats .st .n{font-family:'Fraunces',serif;font-weight:300;font-size:40px;letter-spacing:-0.02em;color:var(--ink)}
.pulse-cc .cc-stats .st .l{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-top:4px}

.pulse-cc .cc-mock{background:#141313;border-radius:18px;padding:20px;box-shadow:0 40px 80px -30px rgba(0,0,0,.3);position:relative;overflow:hidden}
.pulse-cc .cc-mock::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 70% 20%,rgba(255,84,115,.15),transparent 50%);pointer-events:none}
.pulse-cc .cc-top{display:flex;align-items:center;gap:10px;padding:8px 4px 16px;border-bottom:1px solid rgba(255,255,255,.06)}
.pulse-cc .cc-top .dt{width:10px;height:10px;border-radius:50%;background:rgba(255,255,255,.1)}
.pulse-cc .cc-top .ttl{margin-left:14px;color:rgba(255,255,255,.55);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase}
.pulse-cc .cc-body{display:grid;grid-template-columns:180px 1fr;gap:16px;padding:16px 4px 4px;color:#fff}
.pulse-cc .cc-side{display:flex;flex-direction:column;gap:4px}
.pulse-cc .cc-side .item{padding:10px 12px;border-radius:8px;font-size:13px;color:rgba(255,255,255,.6);display:flex;gap:10px;align-items:center}
.pulse-cc .cc-side .item.on{background:rgba(255,84,115,.12);color:#fff}
.pulse-cc .cc-side .item .ic{width:14px;height:14px;border-radius:3px;background:rgba(255,255,255,.15)}
.pulse-cc .cc-side .item.on .ic{background:var(--accent)}
.pulse-cc .cc-main{background:#1c1b1b;border-radius:12px;padding:20px;display:flex;flex-direction:column;gap:14px}
.pulse-cc .cc-field{display:flex;flex-direction:column;gap:6px}
.pulse-cc .cc-field label{font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.15em;text-transform:uppercase;color:rgba(255,255,255,.4)}
.pulse-cc .cc-inp{background:#0e0d0d;border:1px solid rgba(255,255,255,.06);border-radius:8px;padding:10px 12px;font-size:13px;color:rgba(255,255,255,.85)}
.pulse-cc .cc-tone{display:flex;gap:6px;flex-wrap:wrap}
.pulse-cc .cc-tone span{padding:5px 10px;border-radius:999px;font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.6);border:1px solid rgba(255,255,255,.1)}
.pulse-cc .cc-tone span.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.pulse-cc .cc-output{background:linear-gradient(135deg,rgba(255,84,115,.12),rgba(255,178,185,.04));border:1px solid rgba(255,84,115,.25);border-radius:10px;padding:16px;color:rgba(255,255,255,.92);font-size:13.5px;line-height:1.55}
.pulse-cc .cc-output .handle{color:var(--accent);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em}
.pulse-cc .cc-output .acts{display:flex;gap:8px;margin-top:12px}
.pulse-cc .cc-output .acts span{padding:5px 10px;border-radius:6px;background:rgba(255,255,255,.06);font-family:'JetBrains Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:rgba(255,255,255,.7)}

.pulse-cc .features{background:var(--paper-2);padding:96px 48px;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.pulse-cc .feat-inner{max-width:1320px;margin:0 auto}
.pulse-cc .feat-head{display:grid;grid-template-columns:1fr 1fr;gap:60px;margin-bottom:64px;align-items:end}
.pulse-cc .feat-head h2{font-size:clamp(40px,5vw,72px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:0}
.pulse-cc .feat-head h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-cc .feat-head p{color:#333;line-height:1.6;margin:0}
.pulse-cc .feat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;background:var(--hair);border:1px solid var(--hair);border-radius:18px;overflow:hidden}
.pulse-cc .fc{background:#fff;padding:36px;display:flex;flex-direction:column;gap:14px;min-height:280px}
.pulse-cc .fc .num{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;color:var(--accent)}
.pulse-cc .fc h3{font-size:24px;font-weight:400;letter-spacing:-0.015em;margin:0;line-height:1.2}
.pulse-cc .fc p{color:var(--muted);line-height:1.6;margin:0;font-size:14.5px}
.pulse-cc .fc .mini{margin-top:auto;padding-top:16px;border-top:1px solid var(--hair);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}

.pulse-cc .how{max-width:1320px;margin:0 auto;padding:96px 48px}
.pulse-cc .how-head{text-align:center;margin-bottom:64px}
.pulse-cc .how-head h2{font-size:clamp(40px,5vw,72px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:0 0 16px}
.pulse-cc .how-head h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-cc .how-head p{color:var(--muted);max-width:520px;margin:0 auto;line-height:1.6}
.pulse-cc .steps{display:grid;grid-template-columns:repeat(4,1fr);gap:28px}
.pulse-cc .step{position:relative}
.pulse-cc .step .n{font-family:'Fraunces',serif;font-weight:300;font-style:italic;font-size:72px;color:var(--accent);line-height:1;margin-bottom:16px}
.pulse-cc .step h4{font-size:20px;font-weight:500;margin:0 0 8px}
.pulse-cc .step p{color:var(--muted);line-height:1.55;margin:0;font-size:14px}

.pulse-cc .pricing{background:var(--ink);color:#fff;padding:96px 48px}
.pulse-cc .price-inner{max-width:1320px;margin:0 auto}
.pulse-cc .price-head{text-align:center;margin-bottom:56px}
.pulse-cc .price-head h2{font-size:clamp(40px,5vw,72px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:0 0 16px;color:#fff}
.pulse-cc .price-head h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent-soft);font-weight:300}
.pulse-cc .price-head p{color:rgba(255,255,255,.55);max-width:520px;margin:0 auto;line-height:1.6}
.pulse-cc .price-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
.pulse-cc .plan{background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:16px;padding:32px;display:flex;flex-direction:column;gap:16px}
.pulse-cc .plan.featured{background:linear-gradient(180deg,rgba(255,84,115,.12),rgba(255,84,115,.03));border-color:rgba(255,84,115,.4)}
.pulse-cc .plan .tname{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:rgba(255,255,255,.5)}
.pulse-cc .plan.featured .tname{color:var(--accent-soft)}
.pulse-cc .plan h3{font-size:28px;font-weight:400;letter-spacing:-0.02em;margin:0;color:#fff}
.pulse-cc .plan .price{font-family:'Fraunces',serif;font-weight:300;font-size:56px;letter-spacing:-0.02em;line-height:1;color:#fff;margin:8px 0}
.pulse-cc .plan .price small{font-family:'Plus Jakarta Sans',sans-serif;font-size:14px;color:rgba(255,255,255,.5);letter-spacing:0}
.pulse-cc .plan ul{list-style:none;padding:0;margin:8px 0 0;display:flex;flex-direction:column;gap:10px}
.pulse-cc .plan li{color:rgba(255,255,255,.75);font-size:14px;line-height:1.5;padding-left:22px;position:relative}
.pulse-cc .plan li::before{content:'✓';position:absolute;left:0;color:var(--accent-soft);font-size:13px}
.pulse-cc .plan .btn-pill{margin-top:20px;justify-content:center;text-align:center}
.pulse-cc .plan .btn-line{background:transparent;color:#fff;border:1px solid rgba(255,255,255,.2)}

.pulse-cc .cc-faq{max-width:1080px;margin:0 auto;padding:96px 48px}
.pulse-cc .cc-faq h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;margin:0 0 40px;text-align:center}
.pulse-cc .cc-faq h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-cc details{border-top:1px solid var(--hair);padding:22px 0}
.pulse-cc details:last-child{border-bottom:1px solid var(--hair)}
.pulse-cc summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:400}
.pulse-cc summary::-webkit-details-marker{display:none}
.pulse-cc summary::after{content:'+';font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:22px}
.pulse-cc details[open] summary::after{content:'−'}
.pulse-cc details p{color:#444;line-height:1.65;margin:14px 0 0;max-width:720px}

@media(max-width:900px){.pulse-cc .cc-hero{grid-template-columns:1fr;padding:32px 24px 48px;gap:40px}.pulse-cc .cc-stats{flex-wrap:wrap;gap:24px}.pulse-cc .features,.pulse-cc .how,.pulse-cc .pricing,.pulse-cc .cc-faq{padding:64px 24px}.pulse-cc .feat-head,.pulse-cc .feat-grid,.pulse-cc .steps,.pulse-cc .price-grid{grid-template-columns:1fr}.pulse-cc .feat-head{gap:24px}.pulse-cc .cc-body{grid-template-columns:1fr}}
`

export default function CaptionCraftPage() {
  return (
    <main className="pulse-cc">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="cc-hero">
        <div>
          <span className="eyebrow"><span className="dot" />A Pulse product · v2.4</span>
          <h1>Captions that<br />sound like <em>you.</em><br />Not like a bot.</h1>
          <p>CaptionCraft is the AI writing tool we built in-house because every other one made brands sound the same. It learns your brand voice in an afternoon and drafts every post from there.</p>
          <div className="cc-btns">
            <Link className="btn-pill btn-grad" href="#pricing" style={{ padding: '16px 28px' }}>Try it free for 14 days →</Link>
            <Link className="btn-pill" href="#how" style={{ padding: '16px 28px', background: 'transparent', color: 'var(--ink)', border: '1px solid var(--hair)' }}>See how it works</Link>
          </div>
          <div className="cc-stats">
            <div className="st"><div className="n">8</div><div className="l">Channels supported</div></div>
            <div className="st"><div className="n">~2s</div><div className="l">Per draft</div></div>
            <div className="st"><div className="n">∞</div><div className="l">Drafts &amp; revisions</div></div>
          </div>
        </div>

        <div className="cc-mock">
          <div className="cc-top">
            <div className="dt" /><div className="dt" /><div className="dt" />
            <span className="ttl">CaptionCraft · draft_0438</span>
          </div>
          <div className="cc-body">
            <div className="cc-side">
              <div className="item on"><div className="ic" />Drafts</div>
              <div className="item"><div className="ic" />Voice tuning</div>
              <div className="item"><div className="ic" />Brand library</div>
              <div className="item"><div className="ic" />Schedule</div>
              <div className="item"><div className="ic" />Analytics</div>
              <div className="item"><div className="ic" />Team</div>
            </div>
            <div className="cc-main">
              <div className="cc-field"><label>Brand voice</label><div className="cc-inp">North &amp; Co · Specialty coffee · Warm / dry / low-fi</div></div>
              <div className="cc-field"><label>Brief</label><div className="cc-inp">Launching the autumn blend — dark chocolate, plum, a bit of smoke.</div></div>
              <div className="cc-field">
                <label>Tone dials</label>
                <div className="cc-tone">
                  <span className="on">Dry</span><span>Formal</span><span className="on">Warm</span>
                  <span>Salesy</span><span className="on">Specific</span><span>Playful</span>
                </div>
              </div>
              <div className="cc-output">
                <div className="handle">@northandco · draft 2 of 5</div>
                <div style={{ marginTop: 8 }}>Autumn blend is here and it tastes like the first day you wore a jumper — dark chocolate, plum, a wisp of smoke. Roasted Tuesday. On the shelf Thursday. Don&apos;t sleep on it.</div>
                <div className="acts">
                  <span>★ Keep</span><span>↻ Regenerate</span><span>✎ Edit</span><span>→ Schedule</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="feat-inner">
          <div className="feat-head">
            <h2>Everything an in-house<br />writer <em>wishes</em> they had.</h2>
            <p>Built for our own studio floor first — then opened up. It&apos;s the only caption tool we let touch a client&apos;s account, because it&apos;s the only one we trust.</p>
          </div>
          <div className="feat-grid">
            <div className="fc"><span className="num">01</span><h3>Voice tuning in an afternoon</h3><p>Paste 20 posts, answer 8 questions, done. CaptionCraft builds a voice profile that gets within 90% of your house style on the first draft.</p><div className="mini">~20 min setup</div></div>
            <div className="fc"><span className="num">02</span><h3>Multiplayer, not magic</h3><p>Every draft is editable. Track changes, @-mentions, comments, approvals. It works the way your content team already works.</p><div className="mini">Web · macOS · iOS</div></div>
            <div className="fc"><span className="num">03</span><h3>Platform-native by default</h3><p>LinkedIn knows about line breaks. Instagram knows about hashtags. X knows to keep it short. CaptionCraft writes for the channel, not just the brief.</p><div className="mini">8 channels supported</div></div>
            <div className="fc"><span className="num">04</span><h3>Brand guardrails</h3><p>Banned words, required phrases, compliance checks, legal disclaimers — all enforced on every draft. No more &ldquo;let&apos;s not say that&rdquo; emails.</p><div className="mini">SOC 2 ready</div></div>
            <div className="fc"><span className="num">05</span><h3>Scheduling that respects the post</h3><p>Built-in calendar, cross-platform, with smart send-times tuned to your audience. No more juggling three tools and a spreadsheet.</p><div className="mini">Bulk upload · CSV / Notion</div></div>
            <div className="fc"><span className="num">06</span><h3>Analytics that mean something</h3><p>Engagement per 1000, save-rate, rewatch-rate, comment sentiment. Not just likes, because likes lie.</p><div className="mini">API · Looker · Tableau</div></div>
          </div>
        </div>
      </section>

      <section className="how" id="how">
        <div className="how-head">
          <p className="mono-label">How it works</p>
          <h2>Four <em>steps</em> from<br />onboarded to posting.</h2>
          <p>Most teams are up and drafting in under an hour. A voice tune that reads like you — in the time it takes to run a stand-up.</p>
        </div>
        <div className="steps">
          <div className="step"><div className="n">01</div><h4>Paste your posts</h4><p>Drop in 15–20 posts you&apos;re proud of. We handle the parsing.</p></div>
          <div className="step"><div className="n">02</div><h4>Tune the dials</h4><p>Eight quick sliders to push the voice warmer, drier, punchier.</p></div>
          <div className="step"><div className="n">03</div><h4>Brief &amp; generate</h4><p>Write a one-line brief. Get five drafts. Keep the best. Kill the rest.</p></div>
          <div className="step"><div className="n">04</div><h4>Schedule &amp; ship</h4><p>Approve, schedule across platforms, and get back to the day job.</p></div>
        </div>
      </section>

      <section className="pricing" id="pricing">
        <div className="price-inner">
          <div className="price-head">
            <p className="mono-label" style={{ color: 'rgba(255,255,255,.45)' }}>Pricing</p>
            <h2>Simple, flat, <em>per brand.</em></h2>
            <p>No per-seat nonsense. One price per brand voice. Every plan includes unlimited drafts and scheduling.</p>
          </div>
          <div className="price-grid">
            <div className="plan">
              <span className="tname">Starter</span>
              <h3>Studio</h3>
              <div className="price">$49<small>/ brand / mo</small></div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>For a single brand, a small team, and unlimited curiosity.</p>
              <ul><li>1 brand voice</li><li>Unlimited drafts</li><li>4 social channels</li><li>2 team seats</li><li>Email support</li></ul>
              <Link className="btn-pill btn-line" href="/contact">Start free trial →</Link>
            </div>
            <div className="plan featured">
              <span className="tname">Most popular</span>
              <h3>Studio+</h3>
              <div className="price">$149<small>/ brand / mo</small></div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>For growing teams with serious content cadence.</p>
              <ul><li>3 brand voices</li><li>All channels</li><li>Unlimited seats</li><li>Approval workflows</li><li>Priority support</li><li>Analytics &amp; API</li></ul>
              <Link className="btn-pill btn-grad" href="/contact">Start free trial →</Link>
            </div>
            <div className="plan">
              <span className="tname">Enterprise</span>
              <h3>Atelier</h3>
              <div className="price">Custom</div>
              <p style={{ color: 'rgba(255,255,255,.55)', fontSize: 14, lineHeight: 1.5, margin: 0 }}>For agencies and brands running 10+ voices in parallel.</p>
              <ul><li>Unlimited voices</li><li>SSO / SAML</li><li>Custom model tuning</li><li>Dedicated CSM</li><li>SOC 2 · DPA · MSA</li><li>99.95% SLA</li></ul>
              <Link className="btn-pill btn-line" href="/contact">Talk to sales →</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cc-faq">
        <h2>Honest <em>answers.</em></h2>
        <details open><summary>Is this just a ChatGPT wrapper?</summary><p>No. We use several models under the hood, but the real work is in the voice tuning, guardrails, and platform-native formatting layers we built on top. You could technically get to a similar place with GPT + two weeks of prompt engineering. We&apos;ve done that work for you.</p></details>
        <details><summary>Does my data train your model?</summary><p>Never. Your drafts, brand voice, and analytics are yours. We have a zero-retention contract with our model providers, and enterprise plans include a full DPA.</p></details>
        <details><summary>Can I cancel anytime?</summary><p>Yes. Monthly plans are month-to-month. Annual plans pro-rate to the month. No &ldquo;retention specialists.&rdquo; No survey maze.</p></details>
        <details><summary>Does it work for non-English?</summary><p>Currently fluent in English, French, Spanish, Portuguese (PT &amp; BR), Italian, German, Dutch, Japanese and Korean. More on the roadmap.</p></details>
        <details><summary>What happens to the drafts I delete?</summary><p>Hard-deleted after 30 days. Recoverable for the first 7 days, then purged. We keep encrypted analytics metadata only.</p></details>
      </section>

      <section className="final-cta" style={{ borderTop: 0 }}>
        <p className="mono-label">Ready to try it?</p>
        <h2>14 days.<br />No credit <em>card.</em></h2>
        <p className="sub">Tune your voice, ship a week of content, decide whether it belongs in your stack. That&apos;s the whole offer.</p>
        <Link className="btn-pill btn-grad" href="/contact" style={{ padding: '18px 36px', fontSize: 15 }}>Start free trial →</Link>
      </section>
    </main>
  )
}
