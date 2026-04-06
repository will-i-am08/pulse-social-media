import { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Services | Social Media Management & AI Strategy',
  description: 'Social media management, AI-driven content creation, analytics, and creative strategy — explore the full range of Pulse Digital services.',
  keywords: ['social media management services', 'AI content strategy', 'social media analytics', 'community management', 'content creation agency'],
  openGraph: {
    title: 'Services | Social Media Management & AI Strategy',
    description: 'Full-service social media management, AI-powered content creation, analytics, and creative strategy from Pulse Digital.',
    url: '/services',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Digital Services' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Services | Pulse Digital Agency',
    description: 'Full-service social media management, AI-powered content creation, analytics, and creative strategy.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/services' },
}

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function ServicesPage() {
  return (
    <main style={{ color: '#0a0a0a' }} className="pt-32 pb-20 overflow-hidden">

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <AnimateOnScroll variant="fade-in" delay={0}>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fff0f2] text-[#ff5473] text-xs font-bold tracking-widest uppercase">
                <span className="w-2 h-2 rounded-full bg-[#ff5473] animate-pulse"></span>
                Engineering Growth
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(48px, 7vw, 88px)' }}>
                The Future of<br /><span style={{ color: '#ff5473' }}>Digital Marketing</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-[#6b7280] text-lg max-w-xl leading-relaxed font-light">
                We go beyond managing your digital presence &mdash; we grow it. Combining smart social strategy with custom AI tools to keep your brand front and centre.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.3}>
              <Link
                href="/contact"
                className="inline-flex items-center px-8 py-4 rounded-full text-white font-semibold transition-opacity hover:opacity-90"
                style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
              >
                Start the Pulse →
              </Link>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="flex-1 relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?auto=format&fit=crop&w=800&q=80"
                alt="Person using social media on a smartphone"
                width={600}
                height={750}
                className="w-full aspect-[4/5] object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-[#ff5473]/10 blur-[100px] rounded-full -z-10"></div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <AnimateOnScroll variant="fade-up">
          <p className="mono-label text-[#9ca3af] mb-8">What We Offer</p>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* Social Media Management - Large Card */}
          <AnimateOnScroll variant="fade-up" delay={0} className="md:col-span-8 bg-[#f5f5f5] rounded-xl p-10 flex flex-col justify-between min-h-[500px] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 group-hover:opacity-40 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                alt="Social media analytics on monitors"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 rounded bg-[#fff0f2] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#ff5473]" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 text-[#0a0a0a]">Social Media Management</h2>
              <p className="text-[#6b7280] leading-relaxed mb-8">
                Consistent, high-quality content creation and community management that turns casual followers into loyal brand advocates. We handle the strategy, you enjoy the growth.
              </p>
              <ul className="space-y-3 mb-10">
                {['Content Strategy', 'Multi-Platform Management', 'Real-Time Performance Optimisation'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm font-medium text-[#0a0a0a]">
                    <span className="material-symbols-outlined text-[#ff5473] text-sm">check_circle</span> {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative z-10">
              <Link href="/contact" className="text-[#ff5473] font-bold flex items-center gap-2 hover:gap-4 transition-all">
                Explore Strategy <span className="material-symbols-outlined">north_east</span>
              </Link>
            </div>
          </AnimateOnScroll>

          {/* AI Solution Card */}
          <AnimateOnScroll variant="fade-up" delay={0.1} className="md:col-span-4 rounded-xl p-10 flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}>
            <div>
              <span className="material-symbols-outlined text-white text-4xl mb-6 block">psychology</span>
              <h3 className="text-2xl font-black leading-tight text-white">AI-Driven Automation</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed my-6">
              Custom AI solutions that streamline your workflows and help you spot opportunities before your competitors do.
            </p>
            <Link href="/contact" className="block w-full py-4 bg-white text-[#ff5473] rounded font-bold hover:bg-neutral-100 transition-colors text-center">
              Deploy Solutions
            </Link>
          </AnimateOnScroll>

          {/* SaaS Platform Card */}
          <AnimateOnScroll variant="fade-up" delay={0.15} className="md:col-span-4 bg-[#f9f9f9] rounded-xl p-10 flex flex-col justify-between min-h-[400px]" style={{ border: DIVIDER }}>
            <div>
              <div className="text-[#ff5473] font-bold text-xs tracking-widest uppercase mb-4">SaaS Platform</div>
              <h3 className="text-xl font-bold mb-4 text-[#0a0a0a]">Pulse Analytics Platform</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Your all-in-one dashboard for tracking engagement, automating responses, and scaling your social presence without the headaches.
              </p>
            </div>
            <div className="pt-8">
              <p className="text-xs text-[#9ca3af]">Trusted by 250+ growing brands</p>
            </div>
          </AnimateOnScroll>

          {/* Predictive Performance Card */}
          <AnimateOnScroll variant="fade-up" delay={0.2} className="md:col-span-8 bg-[#f5f5f5] rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden" style={{ border: DIVIDER }}>
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4 text-[#0a0a0a]">Predictive Performance</h3>
              <p className="text-[#6b7280] text-sm mb-6">
                Our performance tracking tools show you how your content is doing in real time, so you can make smart adjustments that maximise your ROI.
              </p>
              <div className="h-1 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#ff5473] w-[85%]"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#9ca3af]">Efficiency Gain</span>
                <span className="text-[10px] uppercase tracking-widest text-[#ff5473] font-bold">85% Boost</span>
              </div>
            </div>
            <div className="flex-1 w-full md:w-auto h-48 rounded bg-[#eeeeee] flex items-center justify-center p-6">
              <div className="flex gap-2 items-end h-full w-full">
                <div className="flex-1 bg-[#ff5473]/15 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-[#ff5473]/25 rounded-t h-[60%]"></div>
                <div className="flex-1 bg-[#ff5473]/50 rounded-t h-[90%]"></div>
                <div className="flex-1 bg-[#ff5473]/20 rounded-t h-[50%]"></div>
                <div className="flex-1 bg-[#ff5473]/70 rounded-t h-[100%]"></div>
                <div className="flex-1 bg-[#ff5473]/35 rounded-t h-[70%]"></div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Research-Backed Stats */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <AnimateOnScroll variant="fade-up">
          <div className="rounded-xl p-10 flex flex-col md:flex-row items-center gap-10" style={{ border: DIVIDER }}>
            <div className="flex-shrink-0 max-w-xs">
              <h3 className="text-2xl font-black text-[#0a0a0a] mb-2">The Data Backs It Up</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">Social Media Examiner&apos;s annual industry report, surveying thousands of marketers, shows what consistent social media management actually delivers.</p>
            </div>
            <div className="h-px md:h-16 w-full md:w-px flex-shrink-0" style={{ background: 'rgba(0,0,0,0.08)' }} />
            <div className="flex flex-col flex-1 gap-6">
              <div className="flex flex-wrap md:flex-nowrap gap-10 justify-around text-center">
                {[
                  { stat: '92%', label: 'Increased brand exposure' },
                  { stat: '80%', label: 'Increased website traffic' },
                  { stat: '66%', label: 'Generated new leads' },
                  { stat: '58%', label: 'Grew business partnerships' },
                  { stat: '40%', label: 'Improved sales' },
                ].map((item, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-[#ff5473] mb-1">{item.stat}</div>
                    <div className="text-xs text-[#6b7280] uppercase tracking-[0.12em] font-bold leading-snug">{item.label}</div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-[#c4c9d4] text-right tracking-wide">Source: Social Media Examiner Industry Report</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* How We Work */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <AnimateOnScroll variant="fade-up">
          <div className="bg-[#f9f9f9] rounded-xl p-12 md:p-20 relative overflow-hidden" style={{ border: DIVIDER }}>
            <div className="text-center max-w-3xl mx-auto">
              <p className="mono-label text-[#9ca3af] mb-4">Our Process</p>
              <h2 className="display-text text-[#0a0a0a] mb-8" style={{ fontSize: 'clamp(36px, 4vw, 56px)' }}>
                How We Work Together
              </h2>
              <p className="text-[#6b7280] text-lg leading-relaxed mb-12">
                Pulse Digital brings together human creativity and smart technology. We build the tools and strategies that help your team achieve more than you thought possible.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3" style={{ borderTop: DIVIDER }}>
                {[
                  ['01', 'Discovery', 'We audit your current presence, learn your audience, and map out a clear strategy built around your goals.'],
                  ['02', 'Integration', 'We plug into your existing workflows, connect your channels, and set up the AI tools that will drive your content engine.'],
                  ['03', 'Launch', 'We go live, monitor performance in real time, and continuously optimise to make sure you keep growing.'],
                ].map(([num, label, desc], i) => (
                  <AnimateOnScroll key={num} variant="fade-up" delay={i * 0.1}>
                    <div
                      className="p-8 text-left"
                      style={i === 1 ? { borderLeft: DIVIDER, borderRight: DIVIDER } : {}}
                    >
                      <div className="text-[#ff5473] text-4xl font-black mb-2">{num}</div>
                      <div className="text-sm font-bold tracking-widest uppercase text-[#0a0a0a] mb-3">{label}</div>
                      <p className="text-[#6b7280] text-sm leading-relaxed font-light">{desc}</p>
                    </div>
                  </AnimateOnScroll>
                ))}
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <AnimateOnScroll variant="fade-in">
          <div className="py-32" style={{ borderTop: DIVIDER, borderBottom: DIVIDER }}>
            <p className="mono-label text-[#9ca3af] mb-10">Let&apos;s work together</p>
            <h2 className="display-text text-[#0a0a0a] mb-12" style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
              Ready to feel<br /><span style={{ color: '#ff5473' }}>the heat?</span>
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center px-10 py-5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
            >
              Schedule a Consultation
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  )
}
