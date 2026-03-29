import Image from 'next/image'

export default function InsightsPage() {
  return (
    <main className="pt-32 pb-24">
      {/* Hero Featured Article */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="flex flex-col lg:flex-row gap-12 items-end">
          <div className="w-full lg:w-7/12 order-2 lg:order-1">
            <div className="flex items-center gap-3 mb-6">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,178,185,0.5)]"></span>
              <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Featured Intelligence</span>
            </div>
            <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
              The Algorithm <br />
              <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Renaissance.</span>
            </h1>
            <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
              Navigating the transition from generative experimentation to structural intelligence. How the next wave of neural architectures will redefine digital agency.
            </p>
            <div className="flex items-center gap-6">
              <button className="flex items-center gap-2 group">
                <span className="font-label text-sm font-bold uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Full Intelligence</span>
                <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </button>
              <span className="text-outline-variant text-sm font-medium tracking-tight">12 Min Read — Jan 2026</span>
            </div>
          </div>
          <div className="w-full lg:w-5/12 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80"
                alt="Abstract fluid metallic 3D shape with warm coral lighting"
                fill
                className="object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-md bg-surface-container/40 rounded border border-outline-variant/10">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Current Thesis</p>
                <p className="text-sm text-on-surface">Predictive architectures are surpassing generative models in commercial ROI.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Insights Grid */}
      <section className="bg-surface-container-low py-32">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex justify-between items-end mb-16">
            <h2 className="font-headline text-3xl font-bold tracking-tight">Latest <br /><span className="text-primary-container">Perspectives</span></h2>
            <div className="flex gap-4">
              <button className="p-3 bg-surface-container hover:bg-surface-bright transition-colors rounded">
                <span className="material-symbols-outlined text-on-surface">filter_list</span>
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Large Bento Card */}
            <div className="md:col-span-8 group cursor-pointer">
              <div className="bg-surface-container p-1 rounded-lg transition-all duration-500 hover:shadow-[0_0_40px_-10px_rgba(255,84,115,0.1)]">
                <div className="relative h-96 rounded overflow-hidden mb-8">
                  <Image
                    src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80"
                    alt="Futuristic digital circuit board glowing with warm light pulses"
                    fill
                    className="object-cover scale-110 group-hover:scale-100 transition-transform duration-700"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-neutral-950/20 group-hover:bg-transparent transition-colors duration-500"></div>
                </div>
                <div className="px-8 pb-8">
                  <div className="flex gap-4 mb-4">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 bg-surface-bright text-primary-container rounded">Strategy</span>
                    <span className="text-[10px] font-medium text-outline uppercase tracking-widest self-center">Feb 02, 2026</span>
                  </div>
                  <h3 className="font-headline text-3xl font-bold mb-4 group-hover:text-primary transition-colors">The Death of Search: How LLMs are Rewriting the Visibility Playbook.</h3>
                  <p className="text-on-surface-variant line-clamp-2 max-w-2xl">Traditional SEO is pivoting. We analyze why indexing for LLMs is the new ranking for Google, and how brands must adapt their semantic footprints.</p>
                </div>
              </div>
            </div>

            {/* Small Bento Cards */}
            <div className="md:col-span-4 flex flex-col gap-6">
              <div className="bg-surface-container-high p-8 rounded-lg flex-1 group cursor-pointer hover:bg-surface-bright transition-colors duration-300">
                <span className="material-symbols-outlined text-primary text-3xl mb-6">token</span>
                <h4 className="font-headline text-xl font-bold mb-3">Tokenomics for Creatives</h4>
                <p className="text-on-surface-variant text-sm leading-relaxed mb-6">A deep dive into decentralised asset management for digital campaigns.</p>
                <span className="text-xs font-bold uppercase tracking-widest text-primary group-hover:translate-x-2 inline-block transition-transform">Read Analysis</span>
              </div>
              <div className="bg-primary-container p-8 rounded-lg flex-1 group cursor-pointer overflow-hidden relative">
                <div className="relative z-10">
                  <h4 className="font-headline text-xl font-bold text-on-primary-container mb-3">Thermal Content Strategy</h4>
                  <p className="text-on-primary-container/80 text-sm leading-relaxed mb-6">Using heat-map data to drive emotive engagement across social verticals.</p>
                  <div className="flex items-center gap-2 text-on-primary-container font-bold text-xs uppercase tracking-widest">
                    <span>Download Report</span>
                    <span className="material-symbols-outlined text-sm">download</span>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute -bottom-4 -right-4 text-9xl text-on-primary-container/10 rotate-12 transition-transform group-hover:rotate-0 duration-700">insights</span>
              </div>
            </div>

            {/* Row 2 */}
            {[
              {
                img: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
                alt: "Retro computer hardware with dramatic warm studio lighting",
                title: "Legacy Tech vs. The Pulse",
                desc: "Why mid-market firms are failing their digital transformation by holding onto monolithic stacks.",
                read: "8 MIN READ"
              },
              {
                img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
                alt: "Digital eye with glowing rose-tinted data and neural network overlays",
                title: "The Ethics of Attention",
                desc: "Balancing algorithmic efficiency with human-centric design in 2026's digital economy.",
                read: "14 MIN READ"
              },
              {
                img: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
                alt: "Abstract geometric architecture with warm light trails",
                title: "Spatial Design Paradigms",
                desc: "How spatial computing is forcing a complete rethink of 2D interface design systems.",
                read: "6 MIN READ"
              }
            ].map((article, i) => (
              <div key={i} className="md:col-span-4 group cursor-pointer">
                <div className="bg-surface p-6 rounded-lg border border-outline-variant/10 hover:border-primary/30 transition-all">
                  <div className="relative aspect-video rounded overflow-hidden mb-6">
                    <Image src={article.img} alt={article.alt} fill className="object-cover grayscale hover:grayscale-0 transition-all duration-500" unoptimized />
                  </div>
                  <h4 className="font-headline text-lg font-bold mb-2">{article.title}</h4>
                  <p className="text-on-surface-variant text-xs mb-4">{article.desc}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-outline font-medium">{article.read}</span>
                    <span className="material-symbols-outlined text-primary text-lg">north_east</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-8 my-32">
        <div className="bg-surface-container-highest rounded-xl p-12 md:p-20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
          <div className="relative z-10 max-w-2xl">
            <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-6 leading-tight">
              Receive the <span className="text-primary">Thermal Intelligence</span> briefing. Every Tuesday.
            </h2>
            <p className="text-on-surface-variant mb-10 text-lg">We distill global digital shifts into actionable agency directives. No fluff. Just the pulse.</p>
            <form className="flex flex-col md:flex-row gap-4">
              <input
                className="bg-surface-container border-none rounded px-6 py-4 flex-grow focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline transition-all outline-none"
                placeholder="Professional Email"
                type="email"
              />
              <button className="bg-primary-container text-on-primary-container px-10 py-4 rounded font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(255,84,115,0.4)] transition-all" type="submit">
                Subscribe
              </button>
            </form>
            <p className="mt-6 text-[10px] text-outline uppercase tracking-widest">Privacy guaranteed. Opt-out at any time.</p>
          </div>
        </div>
      </section>
    </main>
  )
}
