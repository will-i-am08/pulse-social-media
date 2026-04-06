import { Metadata } from 'next'
import Link from 'next/link'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Pulse Digital Agency | Social Media That Works',
  description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and content that connects with your audience.',
  keywords: ['social media agency', 'social media management', 'AI content creation', 'brand growth', 'digital marketing', 'social media strategy', 'content marketing'],
  openGraph: {
    title: 'Pulse Digital Agency | Social Media That Works',
    description: 'We help brands grow through smart social media strategy, AI-powered tools, and content that actually connects.',
    url: '/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Digital Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Digital Agency | Social Media That Works',
    description: 'We help brands grow through smart social media strategy, AI-powered tools, and content that actually connects.',
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
    description: 'We use AI to understand what your audience cares about — delivering the right content at the right time, across every platform.',
  },
  {
    title: 'Community Engagement',
    icon: 'groups',
    description: 'Active social media management that keeps your community growing and turns followers into loyal brand advocates.',
  },
  {
    title: 'Real Analytics',
    icon: 'analytics',
    description: 'Beyond vanity metrics. We measure what actually drives growth and use that data to sharpen every decision.',
  },
  {
    title: 'Content That Connects',
    icon: 'edit_note',
    description: 'High-quality creative content that cuts through the noise and resonates with the people who matter most to your brand.',
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

export default function HomePage() {
  return (
    <main style={{ color: '#0a0a0a' }}>
      <script
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
                What We<br />Do Best
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
      </section>

      {/* ── Testimonial ──────────────────────────────────────────────────────── */}
      <section className="py-20 px-8 md:px-16 max-w-7xl mx-auto">
        <AnimateOnScroll variant="fade-up">
          <div className={CARD} style={{ border: BORDER, boxShadow: '0 2px 16px rgba(0,0,0,0.05)', padding: '48px' }}>
            <p className="mono-label text-[#9ca3af] mb-6">Client Story</p>
            <blockquote className="text-[#0a0a0a] font-light italic mb-8 leading-snug" style={{ fontSize: 'clamp(22px, 3vw, 36px)', letterSpacing: '-0.02em' }}>
              &ldquo;Pulse Digital didn&apos;t just manage our social — they completely redefined our digital identity. Their AI-driven approach gave us insights we didn&apos;t know were possible.&rdquo;
            </blockquote>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-[#fff0f2] flex items-center justify-center">
                <span className="material-symbols-outlined text-[#ff5473] text-base">person</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-[#0a0a0a]">Alexander Vane</p>
                <p className="mono-label text-[#9ca3af] mt-0.5">CMO, Vesper Global</p>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
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
