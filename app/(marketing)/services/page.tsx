import Link from 'next/link'
import Image from 'next/image'

export default function ServicesPage() {
  return (
    <main className="pt-32 pb-20 overflow-hidden">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="flex-1 space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-container/30 text-primary text-xs font-bold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
              Engineering Growth
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter leading-tight font-headline">
              The Future of <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Digital Thermalism</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-xl leading-relaxed">
              We don&apos;t just manage digital presence; we ignite it. Combining high-velocity social strategy with bespoke AI SaaS solutions to keep your brand at the center of the conversation.
            </p>
            <div className="flex gap-4">
              <Link href="/contact" className="bg-primary-container text-on-primary-container px-8 py-4 rounded font-bold shadow-lg hover:shadow-primary-container/20 transition-all group">
                Start the Pulse
                <span className="material-symbols-outlined align-middle ml-2 group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </Link>
            </div>
          </div>
          <div className="flex-1 relative">
            <div className="relative z-10 rounded-xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=800&q=80"
                alt="Abstract 3D visualization of digital nodes and glowing connections"
                width={600}
                height={750}
                className="w-full aspect-[4/5] object-cover"
                unoptimized
              />
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -z-10"></div>
            <div className="absolute -top-10 -left-10 w-64 h-64 bg-secondary-container/20 blur-[100px] rounded-full -z-10"></div>
          </div>
        </div>
      </section>

      {/* Services Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Social Media Management - Large Card */}
          <div className="md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col justify-between min-h-[500px] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 group-hover:opacity-50 transition-opacity">
              <Image
                src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                alt="Professional studio setup with social media analytics on monitors"
                fill
                className="object-cover"
                unoptimized
              />
            </div>
            <div className="relative z-10 max-w-md">
              <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>share</span>
              </div>
              <h2 className="text-3xl font-bold mb-4 font-headline">Social Ecosystem Mastery</h2>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                High-frequency content creation and community management that converts passive observers into brand zealots. We manage the heat, you enjoy the growth.
              </p>
              <ul className="space-y-3 mb-10">
                <li className="flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Strategic Narrative Design
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Multi-Platform Pulse Syncing
                </li>
                <li className="flex items-center gap-3 text-sm font-medium">
                  <span className="material-symbols-outlined text-primary text-sm">check_circle</span> Real-time Viral Optimization
                </li>
              </ul>
            </div>
            <div className="relative z-10">
              <button className="text-primary font-bold flex items-center gap-2 hover:gap-4 transition-all">
                Explore Strategy <span className="material-symbols-outlined">north_east</span>
              </button>
            </div>
          </div>

          {/* AI Solution Card */}
          <div className="md:col-span-4 bg-primary-container rounded-xl p-10 text-on-primary-container flex flex-col justify-between group">
            <div>
              <span className="material-symbols-outlined text-4xl mb-6">psychology</span>
              <h3 className="text-2xl font-black font-headline leading-tight">AI Driven Automation</h3>
            </div>
            <p className="text-on-primary-container/80 text-sm leading-relaxed my-6">
              Bespoke AI SaaS architectures that eliminate operational friction and predict market shifts before they happen.
            </p>
            <button className="w-full py-4 bg-on-primary-container text-primary-container rounded font-bold hover:bg-neutral-900 hover:text-white transition-colors">
              Deploy Solutions
            </button>
          </div>

          {/* SaaS Platform Card */}
          <div className="md:col-span-4 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between min-h-[400px]">
            <div>
              <div className="text-primary font-bold text-xs tracking-widest uppercase mb-4">SaaS Infrastructure</div>
              <h3 className="text-xl font-bold font-headline mb-4">Pulse Intelligence Platform</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                A dedicated command center for your digital assets. Track every engagement, automate every response, and scale without limits.
              </p>
            </div>
            <div className="pt-8">
              <div className="flex -space-x-3 mb-6">
                {[
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                  "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80"
                ].map((src, i) => (
                  <Image key={i} src={src} alt="Team member" width={40} height={40} className="w-10 h-10 rounded-full border-2 border-surface" unoptimized />
                ))}
              </div>
              <p className="text-xs text-on-surface-variant">Trusted by 250+ tech pioneers</p>
            </div>
          </div>

          {/* Predictive Performance Card */}
          <div className="md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden">
            <div className="flex-1">
              <h3 className="text-2xl font-bold mb-4 font-headline">Predictive Performance</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Our proprietary &quot;Heat Mapping&quot; technology visualizes content performance in real-time, allowing for micro-adjustments that maximize ROI.
              </p>
              <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[85%]"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Efficiency Gain</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">85% Boost</span>
              </div>
            </div>
            <div className="flex-1 w-full md:w-auto h-48 rounded bg-surface-container-highest flex items-center justify-center p-6">
              <div className="flex gap-2 items-end h-full w-full">
                <div className="flex-1 bg-primary-container/20 rounded-t h-[40%]"></div>
                <div className="flex-1 bg-primary-container/40 rounded-t h-[60%]"></div>
                <div className="flex-1 bg-primary-container/60 rounded-t h-[90%]"></div>
                <div className="flex-1 bg-primary-container/30 rounded-t h-[50%]"></div>
                <div className="flex-1 bg-primary-container/80 rounded-t h-[100%]"></div>
                <div className="flex-1 bg-primary-container/50 rounded-t h-[70%]"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrated Intelligence */}
      <section className="max-w-7xl mx-auto px-8 mb-40">
        <div className="bg-surface-container-low rounded-xl p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none">
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#ff5473_0%,transparent_70%)]"></div>
          </div>
          <div className="text-center max-w-3xl mx-auto relative z-10">
            <h2 className="text-4xl md:text-5xl font-black font-headline mb-8">Integrated Intelligence</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-12">
              Pulse Digital bridges the gap between human creativity and machine precision. We build the tools that empower your team to achieve the impossible.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              <div className="p-6">
                <div className="text-primary text-4xl font-black mb-2">01</div>
                <div className="text-sm font-bold tracking-widest uppercase">Inception</div>
              </div>
              <div className="p-6 border-x border-outline-variant/20">
                <div className="text-primary text-4xl font-black mb-2">02</div>
                <div className="text-sm font-bold tracking-widest uppercase">Integration</div>
              </div>
              <div className="p-6">
                <div className="text-primary text-4xl font-black mb-2">03</div>
                <div className="text-sm font-bold tracking-widest uppercase">Ignition</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <div className="py-24 border-y border-outline-variant/10">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6 italic">Ready to feel the heat?</h2>
          <Link href="/contact" className="px-12 py-5 bg-white text-neutral-950 rounded-full font-black uppercase tracking-tighter hover:bg-primary transition-all active:scale-95 inline-block">
            Schedule a Consultation
          </Link>
        </div>
      </section>
    </main>
  )
}
