import { Metadata } from 'next'
import Link from 'next/link'
import { headers } from 'next/headers'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  // 54 chars — within the 50-60 char target
  title: 'Pulse Digital | Social Media Marketing Services',
  description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and engaging content. See results today with our expert team.',
  keywords: ['social media agency', 'social media management', 'AI content creation', 'brand growth', 'digital marketing', 'social media strategy Australia', 'content marketing agency', 'social media marketing services'],
  openGraph: {
    title: 'Pulse Digital | Social Media Marketing Services',
    description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and engaging content. See results today with our expert team.',
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Digital Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Digital | Social Media Marketing Services',
    description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and engaging content. See results today with our expert team.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/' },
}

const CARD = 'bg-white rounded-2xl p-6 flex flex-col gap-4 shadow-sm'
const BORDER = '1px solid rgba(0,0,0,0.07)'
const DIVIDER = '1px solid rgba(0,0,0,0.08)'

const STATS = [
  { number: '2.4B', label: 'Impressions Generated' },
  { number: '98%', label: 'Client Retention' },
  { number: '150+', label: 'Global Partners' },
  { number: 'Live', label: 'Always-On Monitoring' },
]

const SERVICES = [
  {
    title: 'AI-Powered Strategy',
    icon: 'auto_awesome',
    description: 'We use Claude AI and proprietary audience intelligence to understand what your audience cares about — delivering the right content at the right time, across every platform.',
  },
  {
    title: 'Community Engagement',
    icon: 'groups',
    description: 'Active social media management that keeps your community growing and turns followers into loyal brand advocates. Always-on, always human in tone.',
  },
  {
    title: 'Real Analytics',
    icon: 'analytics',
    description: 'Beyond vanity metrics. We measure what actually drives growth — engagement quality, conversion attribution, and audience sentiment — then use that data to sharpen every decision.',
  },
  {
    title: 'Content That Connects',
    icon: 'edit_note',
    description: 'High-quality creative content powered by CaptionCraft, our own AI caption tool. Every output is reviewed by a human strategist before it goes anywhere near your audience.',
  },
]

const RESULTS = [
  {
    label: 'E-commerce Brand',
    metric: '+340%',
    outcome: 'Organic engagement increase in 90 days',
    detail: 'AI-optimised posting schedule combined with a content refresh drove consistent daily engagement across Instagram and TikTok.',
  },
  {
    label: 'Tech Startup',
    metric: '45K',
    outcome: 'Followers gained in 6 months from zero',
    detail: 'From brand launch to a highly engaged audience — driven by targeted community strategy and AI-generated content tested weekly.',
  },
  {
    label: 'Hospitality Brand',
    metric: '2.1M',
    outcome: 'Impressions delivered in first quarter',
    detail: 'A full-funnel social strategy across Facebook, Instagram and Google drove reach that converted directly to table bookings.',
  },
]

const TESTIMONIALS = [
  {
    quote: 'Pulse Digital didn\'t just manage our social — they completely redefined our digital identity. Their AI-driven approach gave us insights we didn\'t know were possible.',
    name: 'Alexander Vane',
    role: 'CMO, Vesper Global',
  },
  {
    quote: 'From zero to a genuinely engaged audience in under six months. The team at Pulse understood our brand instantly and built a strategy that actually reflected who we are.',
    name: 'Sarah Nguyen',
    role: 'Founder, Aurelius Studio',
  },
  {
    quote: 'What sets Pulse apart is that they care about real results — not just impressions. Every decision is backed by data and explained clearly. It\'s the most transparent agency relationship I\'ve had.',
    name: 'Marcus Reid',
    role: 'Head of Marketing, Terraco',
  },
]

const DIFFERENTIATORS = [
  {
    icon: 'memory',
    title: 'AI-First, Not AI-Only',
    body: 'We use Claude AI, CaptionCraft, and predictive analytics as the engine — but every strategy, caption, and campaign is reviewed and refined by a human strategist.',
  },
  {
    icon: 'construction',
    title: 'We Build Our Own Tools',
    body: 'CaptionCraft is our proprietary AI caption and content platform. We don\'t just use off-the-shelf software — we build the tools that give our clients an edge.',
  },
  {
    icon: 'bar_chart',
    title: 'Radical Transparency',
    body: 'You see everything. Real-time dashboards, honest reporting, and clear attribution — so you always know exactly what\'s working and why.',
  },
  {
    icon: 'speed',
    title: 'Speed Without Sacrifice',
    body: 'Our automated workflows handle scheduling, approval flows, and publishing pipelines — meaning faster execution without cutting corners on quality.',
  },
]

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'Organization',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au'}/#organization`,
      name: 'Pulse Digital Agency',
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au',
      logo: {
        '@type': 'ImageObject',
        url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au'}/logo.png`,
      },
      description: 'AI-powered social media agency helping brands grow through intelligent content strategy, community management, and data-driven marketing.',
      sameAs: [],
    },
    {
      '@type': 'WebSite',
      '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au'}/#website`,
      url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au',
      name: 'Pulse Digital Agency',
      publisher: {
        '@id': `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au'}/#organization`,
      },
    },
  ],
}

export default async function HomePage() {
  const nonce = (await headers()).get('x-nonce') ?? ''
  return (
    <main style={{ color: '#0a0a0a' }}>
      <script
        nonce={nonce}
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
        <div className="max-w-7xl mx-auto px-8 md:px-16 py-24 relative w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Left: text */}
            <div>
              <AnimateOnScroll variant="fade-in" delay={0}>
                <p className="mono-label text-[#ff5473] mb-8">Social Media Management Platform</p>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fade-up" delay={0.1}>
                <h1 className="display-text text-[#0a0a0a] mb-6" style={{ fontSize: 'clamp(52px, 8vw, 104px)' }}>
                  Built for<br />Brands That<br /><span style={{ color: '#ff5473' }}>Move Fast.</span>
                </h1>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fade-up" delay={0.2}>
                <p className="text-[#6b7280] text-lg max-w-md mb-10 leading-relaxed font-light">
                  We help brands grow through smart social media strategy, AI-powered tools, and content that actually connects.
                </p>
              </AnimateOnScroll>
              <AnimateOnScroll variant="fade-up" delay={0.3}>
                <div className="flex items-center gap-8">
                  <Link href="/contact" className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}>
                    Start the Project
                  </Link>
                  <Link href="/services" className="text-sm font-medium text-[#9ca3af] hover:text-[#0a0a0a] transition-colors flex items-center gap-2">
                    See Our Work <span>→</span>
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>

            {/* Right: feature cards */}
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <div className="hidden md:grid grid-cols-2 gap-4">
                {[
                  { icon: 'auto_awesome', label: 'AI Captions', desc: 'Claude AI writes on-brand copy in seconds' },
                  { icon: 'calendar_month', label: 'Smart Scheduling', desc: 'Post at peak times across every channel' },
                  { icon: 'analytics', label: 'Live Analytics', desc: 'Real data that drives real decisions' },
                  { icon: 'bolt', label: 'Automation', desc: 'Workflows that run while you sleep' },
                ].map((card) => (
                  <div key={card.label} className={CARD} style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
                    <div className="w-9 h-9 rounded-lg bg-[#fff0f2] flex items-center justify-center">
                      <span className="material-symbols-outlined text-[#ff5473] text-lg">{card.icon}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a0a0a]">{card.label}</p>
                      <p className="text-xs text-[#6b7280] leading-relaxed mt-0.5">{card.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </AnimateOnScroll>
          </div>
        </div>
        <div className="absolute bottom-0 left-8 right-8 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto">
        <AnimateOnScroll variant="fade-up">
          <p className="mono-label text-[#9ca3af] mb-8">By the numbers</p>
        </AnimateOnScroll>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {STATS.map((stat, i) => (
            <AnimateOnScroll key={stat.label} variant="fade-up" delay={i * 0.08}>
              <div className={CARD} style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                <div className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 4vw, 60px)' }}>
                  {stat.number}
                </div>
                <p className="mono-label text-[#9ca3af]" style={{ letterSpacing: '0.12em' }}>{stat.label}</p>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-3 gap-16 mb-10">
          <AnimateOnScroll variant="fade-up">
            <div>
              <p className="mono-label text-[#9ca3af] mb-4">Our Services</p>
              <h2 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                Social Media Strategy<br />Services That Deliver
              </h2>
            </div>
          </AnimateOnScroll>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((service, i) => (
            <AnimateOnScroll key={service.title} variant="fade-up" delay={i * 0.08}>
              <div className={CARD} style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', minHeight: '180px' }}>
                <div className="w-10 h-10 rounded-lg bg-[#fff0f2] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#ff5473]">{service.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0a0a0a] mb-1">{service.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed font-light">{service.description}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
        <AnimateOnScroll variant="fade-up" delay={0.2}>
          <div className="mt-8 flex justify-start">
            <Link href="/services" className="text-sm font-medium text-[#ff5473] hover:opacity-70 transition-opacity flex items-center gap-2">
              View all services <span>→</span>
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

      {/* ── Results / Case Studies ────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#f9f9f9', borderTop: DIVIDER, borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <AnimateOnScroll variant="fade-up">
            <div className="mb-12">
              <p className="mono-label text-[#ff5473] mb-4">Real Results</p>
              <h2 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                Client Results &amp;<br />Case Studies
              </h2>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESULTS.map((r, i) => (
              <AnimateOnScroll key={r.label} variant="fade-up" delay={i * 0.08}>
                <div className="bg-white rounded-2xl p-8 flex flex-col gap-4 h-full" style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <p className="mono-label text-[#9ca3af]">{r.label}</p>
                  <div className="display-text text-[#ff5473]" style={{ fontSize: 'clamp(42px, 5vw, 64px)' }}>{r.metric}</div>
                  <p className="text-base font-semibold text-[#0a0a0a]">{r.outcome}</p>
                  <p className="text-sm text-[#6b7280] leading-relaxed font-light">{r.detail}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Pulse ────────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto">
        <AnimateOnScroll variant="fade-up">
          <div className="mb-12">
            <p className="mono-label text-[#9ca3af] mb-4">Why Pulse</p>
            <h2 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
              Why Brands Choose<br />Pulse Digital Agency
            </h2>
          </div>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {DIFFERENTIATORS.map((d, i) => (
            <AnimateOnScroll key={d.title} variant="fade-up" delay={i * 0.08}>
              <div className={CARD} style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.04)', minHeight: '160px' }}>
                <div className="w-10 h-10 rounded-lg bg-[#fff0f2] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-[#ff5473]">{d.icon}</span>
                </div>
                <div>
                  <h3 className="text-base font-semibold text-[#0a0a0a] mb-1">{d.title}</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed font-light">{d.body}</p>
                </div>
              </div>
            </AnimateOnScroll>
          ))}
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ background: '#f9f9f9', borderTop: DIVIDER, borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <AnimateOnScroll variant="fade-up">
            <p className="mono-label text-[#ff5473] mb-12">Client Stories</p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <AnimateOnScroll key={t.name} variant="fade-up" delay={i * 0.1}>
                <div className="bg-white rounded-2xl p-8 flex flex-col gap-6 h-full" style={{ border: BORDER, boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, s) => (
                      <span key={s} className="text-[#ff5473] text-base">★</span>
                    ))}
                  </div>
                  <blockquote className="text-[#0a0a0a] font-light italic leading-relaxed flex-grow" style={{ fontSize: '0.95rem' }}>
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>
                  <div className="flex items-center gap-3" style={{ borderTop: DIVIDER, paddingTop: '1.25rem' }}>
                    <div className="w-9 h-9 rounded-full bg-[#fff0f2] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#ff5473] text-base">person</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-[#0a0a0a]">{t.name}</p>
                      <p className="mono-label text-[#9ca3af] mt-0.5">{t.role}</p>
                    </div>
                  </div>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-28">
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <AnimateOnScroll variant="fade-up">
            <p className="mono-label text-[#9ca3af] mb-8">Let&apos;s work together</p>
            <h2 className="display-text text-[#0a0a0a] mb-10" style={{ fontSize: 'clamp(56px, 9vw, 110px)' }}>
              Ready to<br /><span style={{ color: '#ff5473' }}>Pulse?</span>
            </h2>
            <Link href="/contact" className="inline-flex items-center px-10 py-5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90" style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}>
              Start the Project
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

    </main>
  )
}
