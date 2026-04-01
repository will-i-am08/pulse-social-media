import { Metadata } from 'next'
import Image from 'next/image'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'About | Pulse Digital Agency',
  description: 'Meet the team behind Pulse Digital — a creative agency combining human expertise with AI-powered tools to grow brands.',
}

export default function AboutPage() {
  return (
    <main className="pt-32 pb-20 overflow-hidden">
      {/* Mission Section */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 lg:col-span-7 mb-12 lg:mb-0">
            <AnimateOnScroll variant="fade-in" delay={0}>
              <span className="inline-flex items-center gap-2 text-primary uppercase tracking-[0.2em] text-xs font-bold mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                About Us
              </span>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] mb-8 text-on-surface">
                Our <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Mission.</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-xl md:text-2xl text-on-surface-variant max-w-xl leading-relaxed font-light">
                We bridge the gap between technology and real human connection. At Pulse Digital, we build digital experiences that feel natural, engaging, and meaningful.
              </p>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="col-span-12 lg:col-span-5 relative">
            <div className="aspect-[4/5] bg-surface-container rounded-lg overflow-hidden relative z-10">
              <Image
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80"
                alt="Dynamic team of digital creators in a modern studio with warm amber lighting"
                fill
                className="object-cover grayscale hover:grayscale-0 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 w-64 h-64 bg-primary-container/20 blur-[100px] rounded-full -z-10"></div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Vision Section */}
      <section className="bg-surface-container-low py-32 mb-40">
        <div className="max-w-7xl mx-auto px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight text-on-surface mb-6">
                  Shaping the Future of <span className="italic font-serif">Digital</span>
                </h2>
                <p className="text-on-surface-variant text-lg">
                  We believe technology should feel effortless. Our goal is to create warm, intuitive experiences that empower both creators and their audiences.
                </p>
              </div>
              <div className="flex gap-4">
                <div className="p-8 bg-surface-container rounded-lg border border-outline-variant/20 max-w-xs">
                  <span className="material-symbols-outlined text-primary mb-4 text-4xl">auto_awesome</span>
                  <h3 className="text-on-surface font-bold text-lg mb-2">Thoughtful Design</h3>
                  <p className="text-on-surface-variant text-sm">Visual systems built with purpose and attention to detail.</p>
                </div>
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
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1} className="h-64 md:col-span-2 rounded-lg overflow-hidden relative group">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&q=80"
                alt="High-end technology workstation with multiple curved monitors in a dark room"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <AnimateOnScroll variant="fade-up">
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-on-surface">Our Story</h2>
            <div className="h-1 w-20 bg-primary mx-auto mt-6"></div>
          </div>
        </AnimateOnScroll>
        {/* Desktop Timeline */}
        <div className="relative space-y-24 before:content-[''] before:absolute before:left-1/2 before:-translate-x-1/2 before:h-full before:w-[1px] before:bg-outline-variant/30 hidden md:block">
          <AnimateOnScroll variant="fade-up" delay={0.1}>
            <div className="flex items-center justify-between w-full">
              <div className="w-5/12 text-right">
                <span className="text-5xl font-black text-primary/20 block mb-2">2021</span>
                <h4 className="text-xl font-bold text-on-surface mb-2">The Spark</h4>
                <p className="text-on-surface-variant">Founded with a bold mission: to bring energy and fresh thinking to digital marketing.</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary relative z-10 outline outline-8 outline-surface"></div>
              <div className="w-5/12"></div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.2}>
            <div className="flex items-center justify-between w-full">
              <div className="w-5/12"></div>
              <div className="w-2 h-2 rounded-full bg-primary relative z-10 outline outline-8 outline-surface"></div>
              <div className="w-5/12 text-left">
                <span className="text-5xl font-black text-primary/20 block mb-2">2022</span>
                <h4 className="text-xl font-bold text-on-surface mb-2">First Pulse</h4>
                <p className="text-on-surface-variant">Launched our signature Design System, earning recognition for visual innovation.</p>
              </div>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.3}>
            <div className="flex items-center justify-between w-full">
              <div className="w-5/12 text-right">
                <span className="text-5xl font-black text-primary block mb-2">2026</span>
                <h4 className="text-xl font-bold text-on-surface mb-2">Going Global</h4>
                <p className="text-on-surface-variant">Expanding globally, setting a new standard for creative, tech-forward digital experiences.</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-primary relative z-10 ring-4 ring-primary/30 outline outline-8 outline-surface"></div>
              <div className="w-5/12"></div>
            </div>
          </AnimateOnScroll>
        </div>
        {/* Mobile Timeline */}
        <div className="md:hidden space-y-12">
          {[
            { year: '2021', title: 'The Spark', desc: 'Founded with a mission to bring fresh energy to digital marketing.' },
            { year: '2022', title: 'First Pulse', desc: 'Launched our signature Design System and earned global recognition.' },
            { year: '2026', title: 'Going Global', desc: 'Expanding worldwide with creative, tech-forward digital experiences.' },
          ].map(({ year, title, desc }) => (
            <div key={year} className="pl-8 border-l-2 border-primary-container/30 relative">
              <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-3xl font-black text-primary block mb-2">{year}</span>
              <h4 className="text-lg font-bold text-on-surface">{title}</h4>
              <p className="text-on-surface-variant">{desc}</p>
            </div>
          ))}
        </div>
      </section>

    </main>
  )
}
