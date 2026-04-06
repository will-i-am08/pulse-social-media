import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'About | Pulse Digital Agency',
  description: 'Meet the team behind Pulse Digital — a creative agency combining human expertise with AI-powered tools to grow brands.',
}

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function AboutPage() {
  return (
    <main style={{ color: '#0a0a0a' }} className="pt-32 pb-20 overflow-hidden">

      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 mb-12 lg:mb-0">
            <AnimateOnScroll variant="fade-in" delay={0}>
              <p className="mono-label text-[#ff5473] mb-6">About Us</p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="display-text text-[#0a0a0a] mb-8" style={{ fontSize: 'clamp(56px, 10vw, 100px)' }}>
                Our <br /><span style={{ color: '#ff5473' }}>Mission.</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-xl md:text-2xl text-[#6b7280] max-w-xl leading-relaxed font-light">
                We bridge the gap between technology and real human connection. At Pulse Digital, we build digital experiences that feel natural, engaging, and meaningful.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="col-span-12 lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-[#f5f5f5] rounded-lg overflow-hidden relative z-10">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Dynamic team of digital creators in a modern studio with warm amber lighting"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-[#ff5473]/10 blur-[100px] rounded-full -z-10"></div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Vision Section */}
      <section className="py-32 mb-40" style={{ background: '#f9f9f9', borderTop: DIVIDER, borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <p className="mono-label text-[#9ca3af] mb-4">Our Vision</p>
                <h2 className="display-text text-[#0a0a0a] mb-6" style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}>
                  Shaping the Future of <span className="italic">Digital</span>
                </h2>
                <p className="text-[#6b7280] text-lg font-light">
                  We believe technology should feel effortless. Our goal is to create warm, intuitive experiences that empower both creators and their audiences.
                </p>
              </div>
              <div className="p-8 bg-white rounded-lg max-w-xs" style={{ border: DIVIDER }}>
                <span className="material-symbols-outlined text-[#ff5473] mb-4 text-4xl block">auto_awesome</span>
                <h3 className="text-[#0a0a0a] font-bold text-lg mb-2">Thoughtful Design</h3>
                <p className="text-[#6b7280] text-sm">Visual systems built with purpose and attention to detail.</p>
              </div>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <AnimateOnScroll variant="fade-up" delay={0} className="h-64 rounded-lg overflow-hidden relative group">
              <Image
                src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&q=80"
                alt="Ultra-modern dark office interior with dramatic warm floor lighting"
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1} className="h-64 md:col-span-2 rounded-lg overflow-hidden relative group">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                alt="High-end technology workstation with multiple curved monitors in a dark room"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* What We Do */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <AnimateOnScroll variant="fade-up">
          <div className="mb-20">
            <p className="mono-label text-[#9ca3af] mb-4">What We Do</p>
            <h2 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
              Social media<br /><span style={{ color: '#ff5473' }}>that performs.</span>
            </h2>
          </div>
        </AnimateOnScroll>
        <div className="grid md:grid-cols-2 gap-0">
          {[
            {
              title: 'Content Strategy',
              description: 'We build content strategies grounded in audience insight and platform intelligence — not guesswork. Every post has a purpose, every campaign a clear objective.',
            },
            {
              title: 'Community Management',
              description: 'Active, always-on management that keeps your brand present and engaged. We turn followers into advocates and conversations into conversions.',
            },
            {
              title: 'Scheduling & Publishing',
              description: 'We handle the full publishing pipeline — from approval to scheduling to posting. Your content goes live at the right time, on the right channel, every time.',
            },
            {
              title: 'Analytics & Reporting',
              description: 'We go beyond vanity metrics. Clear, honest reporting on what\'s driving growth — and what to do next.',
            },
          ].map((item, i) => (
            <AnimateOnScroll key={item.title} variant="fade-up" delay={i * 0.08}>
              <div
                className="py-10 px-6 group"
                style={{
                  borderTop: DIVIDER,
                  borderRight: i % 2 === 0 ? DIVIDER : 'none',
                }}
              >
                <h3 className="text-xl font-semibold text-[#0a0a0a] mb-3 group-hover:text-[#ff5473] transition-colors">
                  {item.title}
                </h3>
                <p className="text-[#6b7280] text-sm leading-relaxed font-light max-w-sm">
                  {item.description}
                </p>
              </div>
            </AnimateOnScroll>
          ))}
          <div className="md:col-span-2" style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* How We Use AI */}
      <section className="py-32 mb-20" style={{ background: '#f9f9f9', borderTop: DIVIDER, borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="grid md:grid-cols-3 gap-16">
              <div className="md:col-span-1">
                <p className="mono-label text-[#ff5473] mb-4">AI-Powered</p>
                <h2 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 4vw, 52px)' }}>
                  How we<br />use AI.
                </h2>
              </div>
              <div className="md:col-span-2 space-y-0">
                {[
                  {
                    icon: 'auto_awesome',
                    title: 'AI Caption & Content Generation',
                    description: 'We use Claude AI to generate on-brand captions, post copy, and creative briefs in seconds. Our team reviews and refines every output — AI handles the heavy lifting, humans ensure it\'s right.',
                  },
                  {
                    icon: 'schedule',
                    title: 'Intelligent Scheduling',
                    description: 'AI analyses audience behaviour to identify the best times to post across every platform. Content goes out when it\'s most likely to land.',
                  },
                  {
                    icon: 'analytics',
                    title: 'Predictive Analytics',
                    description: 'We use machine learning to spot trends before they peak, so your brand is always ahead of the curve — not chasing it.',
                  },
                  {
                    icon: 'bolt',
                    title: 'Workflow Automation',
                    description: 'Approval flows, scheduling queues, and publishing pipelines are automated end-to-end. What used to take hours now takes minutes.',
                  },
                ].map((item, i) => (
                  <div
                    key={item.title}
                    className="py-8 flex gap-6"
                    style={{ borderTop: DIVIDER }}
                  >
                    <div className="w-10 h-10 rounded bg-[#fff0f2] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="material-symbols-outlined text-[#ff5473] text-xl">{item.icon}</span>
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#0a0a0a] mb-2">{item.title}</h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed font-light">{item.description}</p>
                    </div>
                  </div>
                ))}
                <div style={{ borderTop: DIVIDER }} />
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <AnimateOnScroll variant="fade-in">
          <div className="py-32" style={{ borderTop: DIVIDER, borderBottom: DIVIDER }}>
            <p className="mono-label text-[#9ca3af] mb-10">Let&apos;s work together</p>
            <h2 className="display-text text-[#0a0a0a] mb-12" style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
              Ready to<br /><span style={{ color: '#ff5473' }}>Pulse?</span>
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center px-10 py-5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
            >
              Start the Project
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  )
}
