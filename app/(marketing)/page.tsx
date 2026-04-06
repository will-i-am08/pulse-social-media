import { Metadata } from 'next'
import Link from 'next/link'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Pulse Digital Agency | Social Media That Works',
  description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and content that connects with your audience.',
}

const FEATURES = [
  'AI Content Strategy',
  'Brand Scheduling',
  'Buffer Publishing',
  'Real-Time Analytics',
  'Community Management',
  'Social Automation',
]

const STATS = [
  { number: '2.4B', label: 'Impressions Generated' },
  { number: '98%', label: 'Client Retention' },
  { number: '150+', label: 'Global Partners' },
  { number: 'Live', label: 'Always-On Monitoring' },
]

const SERVICES = [
  {
    title: 'AI-Powered Strategy',
    description: 'We use AI to understand what your audience cares about — delivering the right content at the right time, across every platform.',
  },
  {
    title: 'Community Engagement',
    description: 'Active social media management that keeps your community growing and turns followers into loyal brand advocates.',
  },
  {
    title: 'Real Analytics',
    description: 'Beyond vanity metrics. We measure what actually drives growth and use that data to sharpen every decision.',
  },
  {
    title: 'Content That Connects',
    description: 'High-quality creative content that cuts through the noise and resonates with the people who matter most to your brand.',
  },
]

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function HomePage() {
  return (
    <main style={{ background: '#ffffff', color: '#0a0a0a' }}>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex flex-col justify-center pt-16 overflow-hidden">
        {/* Subtle rose glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(255,84,115,0.05) 0%, transparent 70%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-8 md:px-16 py-32 relative z-10">
          <AnimateOnScroll variant="fade-in" delay={0}>
            <p className="mono-label text-[#ff5473] mb-10">Social Media Management Platform</p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.1}>
            <h1
              className="display-text text-[#0a0a0a] mb-8"
              style={{ fontSize: 'clamp(56px, 10vw, 120px)' }}
            >
              Built for<br />
              Brands That<br />
              <span style={{ color: '#ff5473' }}>Move Fast.</span>
            </h1>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.2}>
            <p className="text-[#6b7280] text-lg md:text-xl max-w-xl mb-12 leading-relaxed font-light">
              We help brands grow through smart social media strategy, AI-powered tools, and content that actually connects with your audience.
            </p>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.3}>
            <div className="flex items-center gap-8">
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold text-sm transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
              >
                Start the Project
              </Link>
              <Link
                href="/services"
                className="text-sm font-medium text-[#9ca3af] hover:text-[#0a0a0a] transition-colors flex items-center gap-2"
              >
                See Our Work <span>→</span>
              </Link>
            </div>
          </AnimateOnScroll>
        </div>

        {/* Bottom divider */}
        <div className="absolute bottom-0 left-8 right-8 h-px" style={{ background: 'rgba(0,0,0,0.06)' }} />
      </section>

      {/* ── Feature Keywords ─────────────────────────────────────────────────── */}
      <section className="py-24" style={{ borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <AnimateOnScroll variant="fade-up">
            <p className="mono-label text-[#9ca3af] mb-12">What we do</p>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3" style={{ borderBottom: DIVIDER }}>
            {FEATURES.map((feature, i) => (
              <AnimateOnScroll key={feature} variant="fade-up" delay={i * 0.05}>
                <div
                  className="py-10 px-6"
                  style={{
                    borderTop: DIVIDER,
                    borderRight: i % 3 !== 2 ? DIVIDER : 'none',
                  }}
                >
                  <span
                    className="text-2xl md:text-3xl font-light text-[#0a0a0a]"
                    style={{ letterSpacing: '-0.02em' }}
                  >
                    {feature}
                  </span>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Stats Strip ──────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: '#f5f5f5', borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid grid-cols-2 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <AnimateOnScroll key={stat.label} variant="fade-up" delay={i * 0.08}>
                <div
                  className="py-10 px-6"
                  style={{
                    borderRight: i < 3 ? DIVIDER : 'none',
                  }}
                >
                  <div
                    className="display-text text-[#0a0a0a] mb-3"
                    style={{ fontSize: 'clamp(40px, 5vw, 72px)' }}
                  >
                    {stat.number}
                  </div>
                  <p className="mono-label text-[#9ca3af]" style={{ letterSpacing: '0.12em' }}>{stat.label}</p>
                </div>
              </AnimateOnScroll>
            ))}
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────────── */}
      <section className="py-32" style={{ borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8 md:px-16">
          <div className="grid md:grid-cols-3 gap-16">

            {/* Left label */}
            <AnimateOnScroll variant="fade-up">
              <div className="md:col-span-1">
                <p className="mono-label text-[#9ca3af] mb-4">Our Services</p>
                <h2
                  className="display-text text-[#0a0a0a]"
                  style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}
                >
                  What We<br />Do Best
                </h2>
              </div>
            </AnimateOnScroll>

            {/* Right list */}
            <div className="md:col-span-2">
              {SERVICES.map((service, i) => (
                <AnimateOnScroll key={service.title} variant="fade-up" delay={i * 0.08}>
                  <div
                    className="py-8 group"
                    style={{ borderTop: DIVIDER }}
                  >
                    <div className="flex items-start justify-between gap-8">
                      <div>
                        <h3 className="text-xl font-semibold text-[#0a0a0a] mb-2 group-hover:text-[#ff5473] transition-colors">
                          {service.title}
                        </h3>
                        <p className="text-[#6b7280] text-sm leading-relaxed max-w-lg font-light">
                          {service.description}
                        </p>
                      </div>
                      <span className="text-[#9ca3af] group-hover:text-[#ff5473] transition-colors text-xl mt-1 flex-shrink-0">→</span>
                    </div>
                  </div>
                </AnimateOnScroll>
              ))}
              <div style={{ borderTop: DIVIDER }} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonial ──────────────────────────────────────────────────────── */}
      <section className="py-40" style={{ borderBottom: DIVIDER }}>
        <div className="max-w-5xl mx-auto px-8 md:px-16 text-center">
          <AnimateOnScroll variant="fade-up">
            <p className="mono-label text-[#9ca3af] mb-12">Client Story</p>
            <blockquote
              className="text-[#0a0a0a] font-light italic mb-10 leading-snug"
              style={{ fontSize: 'clamp(28px, 4vw, 44px)', letterSpacing: '-0.02em' }}
            >
              &ldquo;Pulse Digital didn&apos;t just manage our social — they completely redefined our digital identity. Their AI-driven approach gave us insights we didn&apos;t know were possible.&rdquo;
            </blockquote>
            <div>
              <p className="text-[#0a0a0a] text-sm font-semibold">Alexander Vane</p>
              <p className="mono-label text-[#9ca3af] mt-1">CMO, Vesper Global</p>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="py-40">
        <div className="max-w-7xl mx-auto px-8 md:px-16 text-center">
          <AnimateOnScroll variant="fade-up">
            <p className="mono-label text-[#9ca3af] mb-10">Let&apos;s work together</p>
            <h2
              className="display-text text-[#0a0a0a] mb-12"
              style={{ fontSize: 'clamp(56px, 9vw, 110px)' }}
            >
              Ready to<br />
              <span style={{ color: '#ff5473' }}>Pulse?</span>
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center px-10 py-5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
            >
              Start the Project
            </Link>
          </AnimateOnScroll>
        </div>
      </section>

    </main>
  )
}
