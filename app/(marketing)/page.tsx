import Link from 'next/link'
import Image from 'next/image'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import StaggerChildren from '@/components/marketing/StaggerChildren'

export const metadata = {
  title: 'Pulse Digital Agency | Social Media That Works',
}

export default function HomePage() {
  return (
    <main>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[140%] h-[140%] bg-[radial-gradient(circle_at_center,_rgba(255,84,115,0.08)_0%,_transparent_50%)]" />
          <Image
            src="https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80"
            alt="Abstract digital flow visualization"
            fill
            className="object-cover opacity-20 grayscale"
            sizes="100vw"
          />
        </div>
        <div className="container mx-auto px-8 relative z-10 grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <AnimateOnScroll variant="fade-in" delay={0}>
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-container/10 border border-primary/20">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-primary" />
                </span>
                <span className="text-primary text-xs font-bold uppercase tracking-widest">Social Media Agency</span>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] text-on-surface">
                The Rhythm <br />
                <span className="thermal-gradient-text">of Growth</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-on-surface-variant text-xl max-w-lg leading-relaxed">
                We help brands grow through smart social media strategy, AI-powered tools, and content that actually connects with your audience.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.3}>
              <div className="flex items-center gap-6 pt-4">
                <Link href="/contact" className="bg-primary-container text-on-primary-container px-8 py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_20px_rgba(255,84,115,0.4)] transition-all">
                  Ignite Your Brand
                </Link>
                <button className="flex items-center gap-2 text-on-surface font-semibold hover:text-primary transition-colors">
                  <span className="material-symbols-outlined">play_circle</span>
                  Watch Reel
                </button>
              </div>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="relative hidden lg:block">
            <div className="absolute -inset-4 thermal-gradient blur-3xl opacity-10 rounded-full" />
            <div className="relative bg-surface-container rounded-2xl p-8 border border-outline-variant/20 shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                alt="Professional data analytics dashboard"
                width={600}
                height={400}
                className="rounded-lg w-full grayscale contrast-125"
                priority
                sizes="100vw"
              />
              <div className="absolute -bottom-10 -left-10 glass-card p-6 rounded-xl w-64">
                <div className="text-primary text-4xl font-black">+142%</div>
                <div className="text-on-surface-variant text-sm font-medium">Conversion Growth</div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-primary text-sm font-bold uppercase tracking-[0.3em] mb-4">Our Expertise</h2>
                <h3 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">What We Do <span className="italic text-outline">Best</span></h3>
              </div>
              <p className="text-on-surface-variant max-w-sm">We create thoughtful, high-quality digital experiences that stand out and drive real results.</p>
            </div>
          </AnimateOnScroll>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">
            <AnimateOnScroll variant="fade-up" delay={0} className="md:col-span-2 group relative overflow-hidden rounded-xl bg-surface-container-low p-12 flex flex-col justify-end transition-all hover:bg-surface-container">
              <div className="absolute top-12 right-12 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="material-symbols-outlined text-9xl">psychology</span>
              </div>
              <h4 className="text-3xl font-bold text-on-surface mb-4">AI-Powered Strategy</h4>
              <p className="text-on-surface-variant max-w-md mb-8">Using AI to understand what your audience cares about and deliver the right content at the right time, across every platform.</p>
              <div className="flex gap-4">
                <span className="px-3 py-1 bg-surface-variant text-on-surface text-xs rounded-full">Smart Targeting</span>
                <span className="px-3 py-1 bg-surface-variant text-on-surface text-xs rounded-full">Predictive Analytics</span>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1} className="group bg-primary-container p-12 rounded-xl flex flex-col justify-between hover:scale-[1.02] transition-transform">
              <span className="material-symbols-outlined text-on-primary-container text-5xl">share</span>
              <div>
                <h4 className="text-3xl font-bold text-on-primary-container mb-4">Community Engagement</h4>
                <p className="text-on-primary-container/80 text-sm">Active social media management that keeps your community engaged and turns followers into loyal fans.</p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.15} className="group bg-surface-container-high p-12 rounded-xl flex flex-col justify-between border border-outline-variant/10">
              <span className="material-symbols-outlined text-primary text-5xl">monitoring</span>
              <div>
                <h4 className="text-2xl font-bold text-on-surface mb-2">Real Analytics</h4>
                <p className="text-on-surface-variant text-sm">Going beyond vanity metrics to measure what actually matters for your growth.</p>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2} className="md:col-span-2 relative overflow-hidden rounded-xl">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                alt="High-tech circuit board with glowing warm light paths"
                fill
                className="object-cover grayscale opacity-40"
                sizes="100vw"
              />
              <div className="relative h-full p-12 flex flex-col justify-center bg-gradient-to-r from-surface-container-lowest to-transparent">
                <h4 className="text-3xl font-bold text-on-surface mb-4">Content That Connects</h4>
                <p className="text-on-surface-variant max-w-sm">High-quality creative content that cuts through the noise and resonates with your audience.</p>
              </div>
            </AnimateOnScroll>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-24 bg-surface-container-lowest relative overflow-hidden">
        <div className="container mx-auto px-8 relative z-10">
          <AnimateOnScroll variant="scale-up">
            <div className="bg-surface p-12 rounded-2xl shadow-2xl border border-outline-variant/10 grid md:grid-cols-4 gap-12 text-center">
              <div>
                <div className="text-5xl font-black text-primary mb-2">2.4B</div>
                <div className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Impressions Generated</div>
              </div>
              <div>
                <div className="text-5xl font-black text-on-surface mb-2">98<span className="text-primary">%</span></div>
                <div className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Client Retention</div>
              </div>
              <div>
                <div className="text-5xl font-black text-on-surface mb-2">150<span className="text-primary">+</span></div>
                <div className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Global Partners</div>
              </div>
              <div>
                <div className="text-5xl font-black text-primary mb-2">Live</div>
                <div className="flex justify-center items-center gap-2 mt-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
                  </span>
                  <div className="text-xs uppercase tracking-[0.2em] text-on-surface-variant font-bold">Always-On Monitoring</div>
                </div>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
      </section>

      {/* Testimonials */}
      <section className="py-32 bg-surface">
        <div className="container mx-auto px-8">
          <AnimateOnScroll variant="fade-up">
            <div className="text-center max-w-3xl mx-auto mb-20">
              <h2 className="text-primary text-sm font-bold uppercase tracking-[0.3em] mb-4">What Our Clients Say</h2>
              <h3 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">Real Results, Real Words</h3>
            </div>
          </AnimateOnScroll>
          <StaggerChildren staggerDelay={0.15} className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { quote: "Pulse Digital didn't just manage our social; they completely redefined our digital identity. Their AI-driven approach gave us insights we didn't know were possible.", name: 'Alexander Vane', role: 'CMO, Vesper Global', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', border: 'border-primary' },
              { quote: "The level of sophistication in their creative work is unmatched. It feels less like marketing and more like storytelling with a clear purpose.", name: 'Elena Rodriguez', role: 'Founder, Aura Collective', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', border: 'border-outline-variant' },
              { quote: "The data-driven approach they used on our funnel helped us find friction points we'd been overlooking for years. Game changer.", name: 'Silas Vance', role: 'Director, Kinetic Labs', img: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80', border: 'border-primary' },
            ].map((t, i) => (
              <div key={i} className={`p-8 rounded-xl bg-surface-container-low border-l-4 ${t.border}`}>
                <div className="mb-6 flex gap-1">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <span key={j} className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                  ))}
                </div>
                <p className="text-on-surface italic leading-relaxed mb-8">&ldquo;{t.quote}&rdquo;</p>
                <div className="flex items-center gap-4">
                  <Image src={t.img} alt={t.name} width={48} height={48} className="w-12 h-12 rounded-full grayscale" sizes="48px" />
                  <div>
                    <div className="font-bold text-on-surface">{t.name}</div>
                    <div className="text-xs text-on-surface-variant uppercase tracking-widest">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </StaggerChildren>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-8">
          <AnimateOnScroll variant="scale-up">
            <div className="relative thermal-gradient p-16 rounded-3xl overflow-hidden text-center flex flex-col items-center">
              <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />
              <div className="relative z-10 max-w-2xl">
                <h2 className="text-4xl md:text-6xl font-black text-on-primary-container mb-6 tracking-tight">Ready to Pulse?</h2>
                <p className="text-on-primary-container/90 text-xl mb-10 font-medium">Let&apos;s build something great together. Start your brand&apos;s next chapter today.</p>
                <Link href="/contact" className="bg-on-primary-container text-primary-container px-12 py-5 rounded-xl font-black text-xl hover:bg-neutral-900 transition-colors shadow-2xl">
                  Start the Project
                </Link>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>
    </main>
  )
}
