import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'The content calendar is dead · Pulse Social Media',
  description: 'Why we stopped using monthly content calendars, and what replaced them.',
  alternates: { canonical: '/insights/the-content-engine' },
}

const CSS = `
.pulse-article .art-head{max-width:860px;margin:0 auto;padding:80px 48px 48px;text-align:center}
.pulse-article .art-meta{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--muted);display:flex;justify-content:center;gap:14px;margin-bottom:28px;flex-wrap:wrap}
.pulse-article .art-meta .pink{color:var(--accent)}
.pulse-article .art-head h1{font-size:clamp(44px,6vw,84px);font-weight:200;letter-spacing:-0.035em;line-height:1.02;margin:0}
.pulse-article .art-head h1 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-article .art-head .subh{font-size:22px;line-height:1.5;color:var(--muted);max-width:640px;margin:24px auto 0;font-weight:300}
.pulse-article .art-byline{max-width:860px;margin:40px auto 0;padding:0 48px;display:flex;justify-content:space-between;align-items:center;gap:24px;border-top:1px solid var(--hair);border-bottom:1px solid var(--hair)}
.pulse-article .art-byline .auth{display:flex;align-items:center;gap:14px;padding:20px 0}
.pulse-article .art-byline .av{width:44px;height:44px;border-radius:50%;background:linear-gradient(135deg,#ffb2b9,#ff5473)}
.pulse-article .art-byline .role{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-top:2px}
.pulse-article .art-hero{max-width:1080px;margin:40px auto;padding:0 48px}
.pulse-article .art-hero .ph{aspect-ratio:16/9;border-radius:16px;position:relative}
.pulse-article .pull{font-family:'Fraunces',serif;font-style:italic;font-weight:300;font-size:clamp(28px,3.6vw,44px);line-height:1.2;letter-spacing:-0.02em;max-width:740px;margin:48px auto;padding:0 48px;color:var(--ink)}
.pulse-article .pull em{color:var(--accent)}
.pulse-article .figure{max-width:1080px;margin:48px auto;padding:0 48px}
.pulse-article .figure .ph{aspect-ratio:16/9;border-radius:14px;position:relative}
.pulse-article .figure figcaption{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-top:14px;text-align:center}
.pulse-article .related{background:var(--paper-2);padding:80px 48px;margin-top:80px;border-top:1px solid var(--hair)}
.pulse-article .related-inner{max-width:1320px;margin:0 auto}
.pulse-article .related h2{font-size:40px;font-weight:200;letter-spacing:-0.03em;margin:0 0 32px}
.pulse-article .related h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-article .related-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:28px}
.pulse-article .rpost{background:#fff;border-radius:12px;overflow:hidden;border:1px solid var(--hair);display:flex;flex-direction:column}
.pulse-article .rpost .ph{aspect-ratio:16/10;border-radius:0;position:relative}
.pulse-article .rpost .body{padding:20px}
.pulse-article .rpost h3{font-size:18px;font-weight:500;margin:0 0 8px}
.pulse-article .mt{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
@media(max-width:820px){.pulse-article .art-head{padding:48px 24px 24px}.pulse-article .art-byline{margin:24px 24px 0;padding:0;flex-direction:column;align-items:flex-start}.pulse-article .art-hero,.pulse-article .figure{padding:0 24px}.pulse-article .prose{padding:0 24px}.pulse-article .pull{padding:0 24px;margin:32px 0}.pulse-article .related{padding:48px 24px}.pulse-article .related-grid{grid-template-columns:1fr}}
`

export default function ContentEngineArticle() {
  return (
    <main className="pulse-article">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <header className="art-head">
        <div className="art-meta">
          <span className="pink">● Editor&apos;s pick</span>
          <span>Strategy</span>
          <span>12 min read</span>
          <span>Apr 18, 2026</span>
        </div>
        <h1>The content calendar is <em>dead.</em> Long live the content engine.</h1>
        <p className="subh">Most brands are still planning social the way they planned print ads in 2007. We broke the monthly calendar and replaced it with something lighter, faster, and less lonely.</p>
      </header>

      <div className="art-byline">
        <div className="auth">
          <div className="av" />
          <div>
            <b>William Calder</b>
            <div className="role">Founder · Pulse Social Media</div>
          </div>
        </div>
        <div style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, letterSpacing: '.12em', color: 'var(--muted)' }}>
          Share · Tw · Li · Link
        </div>
      </div>

      <div className="art-hero">
        <div className="ph has-img">
          <Image src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1800&q=75&auto=format" alt="Studio desks" fill sizes="(max-width: 820px) 100vw, 1080px" style={{ objectFit: 'cover' }} />
        </div>
      </div>

      <div className="prose">
        <p>We&apos;ve quietly stopped using content calendars on new accounts — and nobody&apos;s noticed, except that the work has gotten faster and the numbers have gotten better.</p>
        <h2>The problem with the monthly calendar</h2>
        <p>A content calendar is a commitment device. It says: <em>on the 14th, we are posting a carousel about sustainability.</em> It was a useful artifact in a world where brands shipped twelve posts a month and the algorithm rewarded consistency over relevance.</p>
        <p>That world is gone. The best post is almost always the one that reacts to something that just happened — a trend, a meme, a customer comment. Those posts die a little every day they sit in a Google sheet waiting for their calendar slot.</p>
        <blockquote>The best post is almost always the one that reacts to something that just happened.</blockquote>
        <h2>What changed</h2>
        <p>We started keeping two artifacts instead of one:</p>
        <ul>
          <li>A <b>rolling 14-day engine</b> that contains every piece of content in-flight.</li>
          <li>A <b>90-day intent map</b> that lists the themes, launches, and campaigns — but not the specific posts.</li>
        </ul>
        <div className="figure">
          <div className="ph has-img">
            <Image src="https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=1600&q=75&auto=format" alt="Engine vs calendar diagram" fill sizes="(max-width: 820px) 100vw, 1080px" style={{ objectFit: 'cover' }} />
          </div>
          <figcaption>Figure 01 — The engine replaces the calendar.</figcaption>
        </div>
      </div>

      <p className="pull">Stop asking <em>&ldquo;what are we posting on the 14th?&rdquo;</em> Start asking <em>&ldquo;what&apos;s the best thing we could post today?&rdquo;</em></p>

      <div className="prose">
        <h2>How the engine actually works</h2>
        <p>Single kanban: <b>drafting, in review, scheduled, posted.</b> Every card has a theme tag from the intent map. That&apos;s the only connection.</p>
        <h3>Three rules</h3>
        <ul>
          <li><b>Minimum inventory</b> — at least five cards in <em>drafting</em> at any moment.</li>
          <li><b>Maximum age</b> — no card older than 14 days.</li>
          <li><b>Weekly pulse</b> — Friday review of map, engine, and analytics.</li>
        </ul>
        <h2>What happened when we tried it</h2>
        <p>Ship rate went up. Posts felt fresher because they were responding to the week, not a month-old plan. And the weekly Friday pulse turned into the one meeting we actually look forward to.</p>
        <h2>Want to try it?</h2>
        <p>Steal it. <Link href="/contact">Get in touch</Link> and we&apos;ll send the template over.</p>
      </div>

      <section className="related">
        <div className="related-inner">
          <h2>Keep <em>reading</em></h2>
          <div className="related-grid">
            <Link className="rpost" href="/blog">
              <div className="ph has-img">
                <Image src="https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=75&auto=format" alt="Why the hook matters less than the rewatch" fill sizes="(max-width: 820px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              </div>
              <div className="body">
                <div className="mt">Creative · 5 min</div>
                <h3>Why the hook matters less than the rewatch</h3>
              </div>
            </Link>
            <Link className="rpost" href="/blog">
              <div className="ph has-img">
                <Image src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=75&auto=format" alt="A creative-testing framework that scales" fill sizes="(max-width: 820px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              </div>
              <div className="body">
                <div className="mt">Paid · 9 min</div>
                <h3>A creative-testing framework that scales</h3>
              </div>
            </Link>
            <Link className="rpost" href="/blog">
              <div className="ph has-img">
                <Image src="https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=800&q=75&auto=format" alt="Teaching CaptionCraft to sound like us" fill sizes="(max-width: 820px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
              </div>
              <div className="body">
                <div className="mt">AI tools · 8 min</div>
                <h3>Teaching CaptionCraft to sound like us</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section className="final-cta" style={{ borderTop: 0 }}>
        <p className="mono-label">Hungry for more?</p>
        <h2>Subscribe<br />to <em>Field Notes.</em></h2>
        <Link className="btn-pill btn-grad" href="/insights" style={{ padding: '18px 36px', fontSize: 15 }}>Back to insights →</Link>
      </section>
    </main>
  )
}
