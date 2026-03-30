import Link from 'next/link'

export default function CaptionCraftPromoPage() {
  return (
    <main className="pt-32 pb-20 overflow-hidden">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(255,84,115,0.07)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary-container/10 border border-primary/20 mb-8">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
            </span>
            <span className="text-primary text-xs font-bold uppercase tracking-widest">Powered by Claude AI</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[0.9] mb-8">
            <span className="text-on-surface">Caption</span><span className="thermal-gradient-text">Craft</span>
          </h1>
          <p className="text-on-surface-variant text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12">
            Your AI-powered content studio. Generate on-brand captions, manage every client, schedule every post — all in one place.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="bg-primary-container text-on-primary-container px-10 py-4 rounded-lg font-bold text-lg hover:shadow-[0_0_30px_rgba(255,84,115,0.4)] transition-all active:scale-95"
            >
              Open CaptionCraft
            </Link>
            <a
              href="#cc-how"
              className="flex items-center gap-2 text-on-surface font-semibold hover:text-primary transition-colors px-6 py-4"
            >
              <span className="material-symbols-outlined">play_circle</span>
              See How It Works
            </a>
          </div>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-7xl mx-auto px-8 mb-32" id="cc-how">
        <div className="bg-surface-container rounded-xl p-12 md:p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[radial-gradient(circle_at_80%_50%,#ff5473_0%,transparent_60%)]"></div>
          </div>
          <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">The Old Way</h2>
              <h3 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-6">
                Agencies waste hours they don&apos;t have.
              </h3>
              <div className="space-y-4 text-on-surface-variant">
                {[
                  'Writing the same caption five different ways, for five different clients, in five different tabs.',
                  'Switching between docs, spreadsheets, and DMs just to get a post approved.',
                  'Losing track of which draft went to which brand on which platform.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-error mt-0.5 text-lg">close</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-primary text-xs font-bold uppercase tracking-[0.3em] mb-4">The CaptionCraft Way</h2>
              <h3 className="text-3xl md:text-4xl font-black text-on-surface tracking-tight mb-6">
                One studio. Every brand. Zero chaos.
              </h3>
              <div className="space-y-4 text-on-surface-variant">
                {[
                  'Claude AI writes polished, on-brand captions in seconds — you just review and approve.',
                  'Every brand, post, and schedule lives in one place — no more context switching.',
                  'Approved posts go straight to Buffer and onto your channels automatically.',
                ].map((text, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <span className="material-symbols-outlined text-primary mt-0.5 text-lg">check_circle</span>
                    <p>{text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="mb-16 text-center">
          <h2 className="text-primary text-sm font-bold uppercase tracking-[0.3em] mb-4">Everything You Need</h2>
          <h3 className="text-4xl md:text-5xl font-black text-on-surface tracking-tight">Built for agencies.<br /><span className="italic text-outline">Powered by AI.</span></h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* AI Caption Generation - Large */}
          <div className="md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col justify-between min-h-[420px] group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-2/5 h-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined absolute bottom-10 right-6 text-[200px] text-primary leading-none">auto_awesome</span>
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded bg-primary-container/10 flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary-container" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 font-headline">AI Caption Generation</h3>
              <p className="text-on-surface-variant leading-relaxed mb-8">
                Claude AI writes scroll-stopping captions in seconds. Choose tone, length, and platform — then let the AI do the heavy lifting. Edit, regenerate, or use as-is.
              </p>
              <ul className="space-y-3">
                {[
                  'Professional, casual, playful, luxury — any voice',
                  'Instagram, Facebook & LinkedIn in one click',
                  'Bulk mode: generate up to 10 captions at once',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium">
                    <span className="material-symbols-outlined text-primary text-sm">check_circle</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Multi-Brand */}
          <div className="md:col-span-4 bg-primary-container rounded-xl p-10 text-on-primary-container flex flex-col justify-between group">
            <div>
              <span className="material-symbols-outlined text-4xl mb-6">domain</span>
              <h3 className="text-2xl font-black font-headline leading-tight">Multi-Brand Management</h3>
            </div>
            <p className="text-on-primary-container/80 text-sm leading-relaxed my-6">
              Unlimited brand profiles, each with its own voice, tone, guidelines, and social handles. Switch between clients in a single click.
            </p>
            <div className="flex items-center gap-2 text-on-primary-container font-bold text-xs uppercase tracking-widest">
              <span>No brand limits</span>
              <span className="material-symbols-outlined text-sm">north_east</span>
            </div>
          </div>

          {/* Calendar */}
          <div className="md:col-span-4 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between min-h-[340px]">
            <div>
              <span className="material-symbols-outlined text-primary text-4xl mb-6">calendar_month</span>
              <h3 className="text-xl font-bold font-headline mb-3">Content Calendar</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Drag-and-drop monthly view across all your brands. See everything that&apos;s scheduled, approved, or waiting at a glance.
              </p>
            </div>
            <div className="pt-6">
              <div className="grid grid-cols-7 gap-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="h-6 rounded bg-surface-variant text-[8px] flex items-center justify-center text-outline font-bold">{d}</div>
                ))}
                {[3,4,null,6,null,8,9].map((n, i) => (
                  <div key={i} className={`h-6 rounded text-[9px] flex items-center justify-center ${n === null ? 'bg-primary-container/40 text-primary font-bold' : 'bg-surface-container-high text-on-surface-variant'}`}>
                    {n === null ? (i === 4 ? 5 : 7) : n}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Photo Library */}
          <div className="md:col-span-4 bg-surface-container-low rounded-xl p-10 flex flex-col justify-between min-h-[340px]">
            <div>
              <span className="material-symbols-outlined text-primary text-4xl mb-6">photo_library</span>
              <h3 className="text-xl font-bold font-headline mb-3">Photo Library</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Upload, organise, and tag your image assets. Folders, search, and one-click attach to any post.
              </p>
            </div>
            <div className="pt-6 grid grid-cols-3 gap-2">
              <div className="h-14 rounded bg-surface-variant/50 border border-outline-variant/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-xl">image</span>
              </div>
              <div className="h-14 rounded bg-primary-container/20 border border-primary/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-xl">image</span>
              </div>
              <div className="h-14 rounded bg-surface-variant/50 border border-outline-variant/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-outline text-xl">image</span>
              </div>
            </div>
          </div>

          {/* Publishing */}
          <div className="md:col-span-4 bg-surface-container rounded-xl p-10 flex flex-col justify-between min-h-[340px] group border border-outline-variant/10">
            <div>
              <span className="material-symbols-outlined text-primary text-4xl mb-6">send</span>
              <h3 className="text-xl font-bold font-headline mb-3">One-Click Publishing</h3>
              <p className="text-on-surface-variant text-sm leading-relaxed">
                Direct Buffer integration sends approved posts straight to your social channels. Connect once, publish everywhere.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-3">
              <div className="px-3 py-1.5 rounded-full bg-surface-variant text-on-surface text-xs font-medium flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>Buffer
              </div>
              <div className="px-3 py-1.5 rounded-full bg-surface-variant text-on-surface text-xs font-medium">Direct API</div>
              <div className="px-3 py-1.5 rounded-full bg-surface-variant text-on-surface text-xs font-medium">Auto-send</div>
            </div>
          </div>

          {/* Analytics */}
          <div className="md:col-span-8 bg-surface-container rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden">
            <div className="flex-1">
              <span className="material-symbols-outlined text-primary text-4xl mb-6">analytics</span>
              <h3 className="text-2xl font-bold mb-4 font-headline">Analytics Dashboard</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Monthly trends, platform breakdowns, approval rates, and publication tracking — all per brand, all in one view.
              </p>
              <div className="h-1 w-full bg-surface-variant rounded-full overflow-hidden">
                <div className="h-full bg-primary w-[78%]"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Approval Rate</span>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">78% avg</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <div className="py-24 border-y border-outline-variant/10">
          <h2 className="text-3xl md:text-4xl font-bold font-headline mb-6">Ready to craft at scale?</h2>
          <Link
            href="/dashboard"
            className="px-12 py-5 bg-primary-container text-on-primary-container rounded-full font-black uppercase tracking-tighter hover:shadow-[0_0_30px_rgba(255,84,115,0.4)] transition-all active:scale-95 inline-block"
          >
            Launch CaptionCraft
          </Link>
        </div>
      </section>
    </main>
  )
}
