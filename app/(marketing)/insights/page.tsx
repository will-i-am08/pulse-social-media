import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { getPublishedPosts } from '@/lib/blog'
import type { BlogPost } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Insights · Pulse Social Media',
  description: 'Playbooks, teardowns, and quiet opinions on what\'s working on social right now. Updated weekly.',
  alternates: { canonical: '/insights' },
}

// Revalidate the list every 5 minutes so newly-published posts show up
// without needing a full redeploy.
export const revalidate = 300

const CSS = `
.pulse-insights .filters{max-width:1320px;margin:0 auto;padding:32px 48px;border-top:1px solid var(--hair);display:flex;justify-content:space-between;gap:24px;flex-wrap:wrap;align-items:center}
.pulse-insights .chips{display:flex;gap:8px;flex-wrap:wrap}
.pulse-insights .chip{padding:8px 14px;border-radius:999px;border:1px solid var(--hair);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);cursor:pointer;background:#fff}
.pulse-insights .chip.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.pulse-insights .feat{max-width:1320px;margin:0 auto;padding:40px 48px 80px;display:grid;grid-template-columns:1.4fr 1fr;gap:56px;align-items:center;border-bottom:1px solid var(--hair)}
.pulse-insights .feat .ph{aspect-ratio:4/3;border-radius:14px;position:relative}
.pulse-insights .feat .meta{display:flex;gap:14px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);margin-bottom:20px;flex-wrap:wrap}
.pulse-insights .feat .meta .pink{color:var(--accent)}
.pulse-insights .feat h2{font-size:clamp(40px,5vw,64px);font-weight:200;letter-spacing:-0.03em;line-height:1.02;margin:0 0 20px}
.pulse-insights .feat h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-insights .feat p{color:#333;line-height:1.6;margin:0 0 24px;max-width:520px}
.pulse-insights .grid-posts{max-width:1320px;margin:0 auto;padding:48px 48px 80px;display:grid;grid-template-columns:repeat(3,1fr);gap:36px 28px}
.pulse-insights .post{display:flex;flex-direction:column;gap:14px;cursor:pointer;transition:transform .2s}
.pulse-insights .post:hover{transform:translateY(-4px)}
.pulse-insights .post .ph{aspect-ratio:16/10;border-radius:10px;position:relative}
.pulse-insights .post .meta{display:flex;gap:10px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.pulse-insights .post h3{font-size:22px;font-weight:500;line-height:1.2;margin:0}
.pulse-insights .post p{color:var(--muted);font-size:14px;line-height:1.5;margin:0}
.pulse-insights .empty-hint{max-width:1320px;margin:0 auto;padding:32px 48px;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);border-top:1px solid var(--hair)}
.pulse-insights .newsletter{background:var(--ink);color:#fff;padding:80px 48px}
.pulse-insights .ns-inner{max-width:1320px;margin:0 auto;display:grid;grid-template-columns:1fr 1fr;gap:48px;align-items:center}
.pulse-insights .ns-inner h2{font-size:clamp(40px,5vw,72px);font-weight:200;letter-spacing:-0.03em;line-height:1;margin:0;color:#fff}
.pulse-insights .ns-inner h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent-soft);font-weight:300}
.pulse-insights .ns-form{display:flex;gap:8px;padding:6px;background:rgba(255,255,255,.05);border-radius:999px;border:1px solid rgba(255,255,255,.1);max-width:440px;margin-top:24px}
.pulse-insights .ns-form input{flex:1;background:transparent;border:0;outline:0;color:#fff;padding:12px 18px;font-family:inherit;font-size:14px}
.pulse-insights .ns-form input::placeholder{color:rgba(255,255,255,.4)}
@media(max-width:820px){.pulse-insights .filters{padding:20px 24px;flex-direction:column;align-items:flex-start}.pulse-insights .feat{grid-template-columns:1fr;padding:32px 24px 48px;gap:24px}.pulse-insights .feat h2{font-size:32px}.pulse-insights .grid-posts{grid-template-columns:1fr;padding:32px 24px 48px}.pulse-insights .newsletter{padding:48px 24px}.pulse-insights .ns-inner{grid-template-columns:1fr;gap:24px}.pulse-insights .ns-inner h2{font-size:34px}}
`

// Fallback placeholder cards, shown when the Supabase blog has no published
// posts yet. Keeps the design looking intentional before launch.
const PLACEHOLDER_POSTS = [
  { img: 'https://images.unsplash.com/photo-1633355444132-695d5876cd00?w=800&q=75&auto=format', cat: 'AI tools', time: '8 min', title: 'Teaching CaptionCraft to sound like us', lead: 'The three tuning steps that make an AI captioning tool feel on-brand.', href: '/insights/the-content-engine' },
  { img: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&q=75&auto=format', cat: 'Case study', time: '6 min', title: 'How Geekly grew their social without paid', lead: 'Local-SEO-meets-TikTok, applied to a Bendigo repair shop.', href: '/insights/the-content-engine' },
  { img: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&q=75&auto=format', cat: 'Creative', time: '5 min', title: 'Why the hook matters less than the rewatch', lead: 'The first 3 seconds are overrated — here\'s what to watch instead.', href: '/insights/the-content-engine' },
]

const FILTERS = ['All', 'Strategy', 'AI tools', 'Creative', 'Community', 'Paid', 'Case studies']

function readTime(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function firstTag(tags: string): string {
  return tags.split(',').map(t => t.trim()).filter(Boolean)[0] || 'Post'
}

export default async function InsightsPage() {
  let posts: BlogPost[] = []
  try {
    posts = await getPublishedPosts(25)
  } catch {
    // If Supabase is unreachable we just fall through to the empty state —
    // the page still renders with placeholder cards rather than blowing up.
    posts = []
  }

  const featured = posts[0]
  const grid = posts.slice(1)

  return (
    <main className="pulse-insights">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="page-head">
        <div>
          <p className="mono-label">Insights &amp; field notes</p>
          <h1>What I&apos;ve learned<br />from <em>shipping daily.</em></h1>
        </div>
        <p>Playbooks, teardowns, and quiet opinions on what&apos;s working on social right now. Updated weekly.</p>
      </section>

      <div className="filters">
        <div className="chips">
          {FILTERS.map((f, i) => (
            <button key={f} className={`chip ${i === 0 ? 'on' : ''}`}>{f}</button>
          ))}
        </div>
      </div>

      {featured ? (
        <article className="feat">
          <div className="ph has-img">
            {featured.featuredImage ? (
              <Image src={featured.featuredImage} alt={featured.title} fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
            ) : null}
          </div>
          <div>
            <div className="meta">
              <span className="pink">● Latest</span>
              <span>{firstTag(featured.tags)}</span>
              <span>{readTime(featured.wordCount)} min read</span>
              <span>{formatDate(featured.publishedDate)}</span>
            </div>
            <h2>{featured.title}</h2>
            {featured.meta ? <p>{featured.meta}</p> : null}
            <Link className="btn-pill btn-ink" href={`/blog/${featured.slug}`}>Read the article →</Link>
          </div>
        </article>
      ) : (
        <article className="feat">
          <div className="ph has-img">
            <Image src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=1800&q=75&auto=format" alt="Feature article image" fill sizes="(max-width: 820px) 100vw, 50vw" style={{ objectFit: 'cover' }} />
          </div>
          <div>
            <div className="meta">
              <span className="pink">● Editor&apos;s pick</span>
              <span>Strategy</span>
              <span>12 min read</span>
              <span>Apr 18, 2026</span>
            </div>
            <h2>The content calendar is <em>dead.</em> Long live the content engine.</h2>
            <p>Most brands are still planning social the way they planned print ads in 2007. I broke the monthly calendar and replaced it with a rolling 14-day engine.</p>
            <Link className="btn-pill btn-ink" href="/insights/the-content-engine">Read the article →</Link>
          </div>
        </article>
      )}

      {grid.length > 0 ? (
        <section className="grid-posts">
          {grid.map(p => (
            <Link className="post" href={`/blog/${p.slug}`} key={p.id}>
              <div className="ph has-img">
                {p.featuredImage ? (
                  <Image src={p.featuredImage} alt={p.title} fill sizes="(max-width: 820px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                ) : null}
              </div>
              <div className="meta">
                <span style={{ color: 'var(--accent)' }}>{firstTag(p.tags)}</span>
                <span>{readTime(p.wordCount)} min</span>
              </div>
              <h3>{p.title}</h3>
              {p.meta ? <p>{p.meta}</p> : null}
            </Link>
          ))}
        </section>
      ) : (
        <>
          <div className="empty-hint">Preview · placeholder cards · real posts appear here once published</div>
          <section className="grid-posts">
            {PLACEHOLDER_POSTS.map((p) => (
              <Link className="post" href={p.href} key={p.title}>
                <div className="ph has-img">
                  <Image src={p.img} alt={p.title} fill sizes="(max-width: 820px) 100vw, 33vw" style={{ objectFit: 'cover' }} />
                </div>
                <div className="meta">
                  <span style={{ color: 'var(--accent)' }}>{p.cat}</span>
                  <span>{p.time}</span>
                </div>
                <h3>{p.title}</h3>
                <p>{p.lead}</p>
              </Link>
            ))}
          </section>
        </>
      )}

      <section className="newsletter">
        <div className="ns-inner">
          <div>
            <p className="mono-label" style={{ color: 'rgba(255,255,255,.45)' }}>Field notes newsletter</p>
            <h2>One letter,<br />every <em>Friday.</em></h2>
          </div>
          <div>
            <p style={{ color: 'rgba(255,255,255,.6)', lineHeight: 1.6, maxWidth: 420, margin: 0 }}>
              The three things I saw on social this week that are worth your time. No roundups. Unsubscribe in one click.
            </p>
            <form className="ns-form" action="#" method="post">
              <input placeholder="you@company.com" type="email" required />
              <button className="btn-pill btn-grad" type="submit">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}
