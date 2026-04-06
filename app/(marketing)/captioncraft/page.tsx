import { Metadata } from 'next'
import Link from 'next/link'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'CaptionCraft | Pulse Digital Agency',
  description: 'AI-powered caption and content generation for social media. Create on-brand posts in seconds with CaptionCraft by Pulse Digital.',
}

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function CaptionCraftPromoPage() {
  return (
    <main style={{ color: '#0a0a0a' }} className="pt-32 pb-20 overflow-hidden">

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-8 mb-32 relative">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[80%] h-[500px] bg-[radial-gradient(ellipse_at_center,_rgba(255,84,115,0.06)_0%,_transparent_70%)] pointer-events-none"></div>
        <div className="relative z-10 text-center max-w-4xl mx-auto">
          <AnimateOnScroll variant="fade-in" delay={0}>
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-[#fff0f2] mb-8" style={{ border: '1px solid rgba(255,84,115,0.2)' }}>
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff5473] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ff5473]"></span>
              </span>
              <span className="text-[#ff5473] text-xs font-bold uppercase tracking-widest">Powered by Claude AI</span>
            </div>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.1}>
            <h1 className="display-text text-[#0a0a0a] mb-8" style={{ fontSize: 'clamp(64px, 12vw, 120px)' }}>
              Caption<span style={{ color: '#ff5473' }}>Craft</span>
            </h1>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.2}>
            <p className="text-[#6b7280] text-xl md:text-2xl max-w-2xl mx-auto leading-relaxed mb-12 font-light">
              Your AI-powered content studio. Generate on-brand captions, manage every client, schedule every post — all in one place.
            </p>
          </AnimateOnScroll>
          <AnimateOnScroll variant="fade-up" delay={0.3}>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href="#cc-how"
                className="flex items-center gap-2 text-[#6b7280] font-semibold hover:text-[#ff5473] transition-colors px-6 py-4"
              >
                <span className="material-symbols-outlined">play_circle</span>
                See How It Works
              </a>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Problem / Solution */}
      <section className="max-w-7xl mx-auto px-8 mb-32" id="cc-how">
        <AnimateOnScroll variant="fade-up">
          <div className="bg-[#f5f5f5] rounded-xl p-12 md:p-20 relative overflow-hidden" style={{ border: DIVIDER }}>
            <div className="relative z-10 grid md:grid-cols-2 gap-16 items-center">
              <div>
                <p className="mono-label text-[#ff5473] mb-4">The Old Way</p>
                <h3 className="text-3xl md:text-4xl font-black text-[#0a0a0a] tracking-tight mb-6">
                  Agencies waste hours they don&apos;t have.
                </h3>
                <div className="space-y-4 text-[#6b7280]">
                  {[
                    'Writing the same caption five different ways, for five different clients, in five different tabs.',
                    'Switching between docs, spreadsheets, and DMs just to get a post approved.',
                    'Losing track of which draft went to which brand on which platform.',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-red-400 mt-0.5 text-lg">close</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p className="mono-label text-[#ff5473] mb-4">The CaptionCraft Way</p>
                <h3 className="text-3xl md:text-4xl font-black text-[#0a0a0a] tracking-tight mb-6">
                  One studio. Every brand. Zero chaos.
                </h3>
                <div className="space-y-4 text-[#6b7280]">
                  {[
                    'Claude AI writes polished, on-brand captions in seconds — you just review and approve.',
                    'Every brand, post, and schedule lives in one place — no more context switching.',
                    'Approved posts go straight to Buffer and onto your channels automatically.',
                  ].map((text, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <span className="material-symbols-outlined text-[#ff5473] mt-0.5 text-lg">check_circle</span>
                      <p>{text}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

      {/* Features Bento Grid */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <AnimateOnScroll variant="fade-up">
          <div className="mb-16 text-center">
            <p className="mono-label text-[#ff5473] mb-4">Everything You Need</p>
            <h3 className="display-text text-[#0a0a0a]" style={{ fontSize: 'clamp(36px, 5vw, 64px)' }}>
              Built for agencies.<br /><span className="italic text-[#9ca3af]">Powered by AI.</span>
            </h3>
          </div>
        </AnimateOnScroll>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

          {/* AI Caption Generation - Large */}
          <AnimateOnScroll variant="fade-up" delay={0} className="md:col-span-8 bg-[#f5f5f5] rounded-xl p-10 flex flex-col justify-between min-h-[420px] group overflow-hidden relative" style={{ border: DIVIDER }}>
            <div className="absolute top-0 right-0 w-2/5 h-full opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none">
              <span className="material-symbols-outlined absolute bottom-10 right-6 text-[200px] text-[#ff5473] leading-none">auto_awesome</span>
            </div>
            <div className="relative z-10 max-w-lg">
              <div className="w-12 h-12 rounded bg-[#fff0f2] flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-[#ff5473]" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              </div>
              <h3 className="text-3xl font-bold mb-4 text-[#0a0a0a]">AI Caption Generation</h3>
              <p className="text-[#6b7280] leading-relaxed mb-8">
                Claude AI writes scroll-stopping captions in seconds. Choose tone, length, and platform — then let the AI do the heavy lifting. Edit, regenerate, or use as-is.
              </p>
              <ul className="space-y-3">
                {[
                  'Professional, casual, playful, luxury — any voice',
                  'Instagram, Facebook & LinkedIn in one click',
                  'Bulk mode: generate up to 10 captions at once',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm font-medium text-[#0a0a0a]">
                    <span className="material-symbols-outlined text-[#ff5473] text-sm">check_circle</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimateOnScroll>

          {/* Multi-Brand */}
          <AnimateOnScroll variant="fade-up" delay={0.1} className="md:col-span-4 rounded-xl p-10 text-white flex flex-col justify-between" style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}>
            <div>
              <span className="material-symbols-outlined text-4xl mb-6 block">domain</span>
              <h3 className="text-2xl font-black leading-tight">Multi-Brand Management</h3>
            </div>
            <p className="text-white/80 text-sm leading-relaxed my-6">
              Unlimited brand profiles, each with its own voice, tone, guidelines, and social handles. Switch between clients in a single click.
            </p>
            <div className="flex items-center gap-2 text-white font-bold text-xs uppercase tracking-widest">
              <span>No brand limits</span>
              <span className="material-symbols-outlined text-sm">north_east</span>
            </div>
          </AnimateOnScroll>

          {/* Calendar */}
          <AnimateOnScroll variant="fade-up" delay={0.15} className="md:col-span-4 bg-[#f9f9f9] rounded-xl p-10 flex flex-col justify-between min-h-[340px]" style={{ border: DIVIDER }}>
            <div>
              <span className="material-symbols-outlined text-[#ff5473] text-4xl mb-6 block">calendar_month</span>
              <h3 className="text-xl font-bold mb-3 text-[#0a0a0a]">Content Calendar</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Drag-and-drop monthly view across all your brands. See everything that&apos;s scheduled, approved, or waiting at a glance.
              </p>
            </div>
            <div className="pt-6">
              <div className="grid grid-cols-7 gap-1">
                {['M','T','W','T','F','S','S'].map((d, i) => (
                  <div key={i} className="h-6 rounded bg-[#e5e5e5] text-[8px] flex items-center justify-center text-[#9ca3af] font-bold">{d}</div>
                ))}
                {[3,4,null,6,null,8,9].map((n, i) => (
                  <div key={i} className={`h-6 rounded text-[9px] flex items-center justify-center ${n === null ? 'bg-[#ff5473]/15 text-[#ff5473] font-bold' : 'bg-[#eeeeee] text-[#6b7280]'}`}>
                    {n === null ? (i === 4 ? 5 : 7) : n}
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>

          {/* Photo Library */}
          <AnimateOnScroll variant="fade-up" delay={0.2} className="md:col-span-4 bg-[#f9f9f9] rounded-xl p-10 flex flex-col justify-between min-h-[340px]" style={{ border: DIVIDER }}>
            <div>
              <span className="material-symbols-outlined text-[#ff5473] text-4xl mb-6 block">photo_library</span>
              <h3 className="text-xl font-bold mb-3 text-[#0a0a0a]">Photo Library</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Upload, organise, and tag your image assets. Folders, search, and one-click attach to any post.
              </p>
            </div>
            <div className="pt-6 grid grid-cols-3 gap-2">
              <div className="h-14 rounded bg-[#e5e5e5] flex items-center justify-center" style={{ border: DIVIDER }}>
                <span className="material-symbols-outlined text-[#9ca3af] text-xl">image</span>
              </div>
              <div className="h-14 rounded bg-[#fff0f2] flex items-center justify-center" style={{ border: '1px solid rgba(255,84,115,0.2)' }}>
                <span className="material-symbols-outlined text-[#ff5473] text-xl">image</span>
              </div>
              <div className="h-14 rounded bg-[#e5e5e5] flex items-center justify-center" style={{ border: DIVIDER }}>
                <span className="material-symbols-outlined text-[#9ca3af] text-xl">image</span>
              </div>
            </div>
          </AnimateOnScroll>

          {/* Publishing */}
          <AnimateOnScroll variant="fade-up" delay={0.25} className="md:col-span-4 bg-[#f9f9f9] rounded-xl p-10 flex flex-col justify-between min-h-[340px]" style={{ border: DIVIDER }}>
            <div>
              <span className="material-symbols-outlined text-[#ff5473] text-4xl mb-6 block">send</span>
              <h3 className="text-xl font-bold mb-3 text-[#0a0a0a]">One-Click Publishing</h3>
              <p className="text-[#6b7280] text-sm leading-relaxed">
                Direct Buffer integration sends approved posts straight to your social channels. Connect once, publish everywhere.
              </p>
            </div>
            <div className="pt-6 flex items-center gap-3 flex-wrap">
              <div className="px-3 py-1.5 rounded-full bg-[#fff0f2] text-[#ff5473] text-xs font-medium flex items-center gap-1.5" style={{ border: '1px solid rgba(255,84,115,0.2)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-[#ff5473] animate-pulse"></span>Buffer
              </div>
              <div className="px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#6b7280] text-xs font-medium" style={{ border: DIVIDER }}>Direct API</div>
              <div className="px-3 py-1.5 rounded-full bg-[#f5f5f5] text-[#6b7280] text-xs font-medium" style={{ border: DIVIDER }}>Auto-send</div>
            </div>
          </AnimateOnScroll>

          {/* Analytics */}
          <AnimateOnScroll variant="fade-up" delay={0.3} className="md:col-span-8 bg-[#f5f5f5] rounded-xl p-10 flex flex-col md:flex-row gap-10 items-center overflow-hidden" style={{ border: DIVIDER }}>
            <div className="flex-1">
              <span className="material-symbols-outlined text-[#ff5473] text-4xl mb-6 block">analytics</span>
              <h3 className="text-2xl font-bold mb-4 text-[#0a0a0a]">Analytics Dashboard</h3>
              <p className="text-[#6b7280] text-sm mb-6">
                Monthly trends, platform breakdowns, approval rates, and publication tracking — all per brand, all in one view.
              </p>
              <div className="h-1 w-full bg-[#e5e5e5] rounded-full overflow-hidden">
                <div className="h-full bg-[#ff5473] w-[78%]"></div>
              </div>
              <div className="flex justify-between mt-2">
                <span className="text-[10px] uppercase tracking-widest text-[#9ca3af]">Approval Rate</span>
                <span className="text-[10px] uppercase tracking-widest text-[#ff5473] font-bold">78% avg</span>
              </div>
            </div>
            <div className="flex-1 w-full md:w-auto h-48 rounded bg-[#eeeeee] flex items-end p-4 gap-2">
              {[35, 55, 40, 70, 60, 85, 78].map((h, i) => (
                <div key={i} className="flex-1 rounded-t" style={{ height: `${h}%`, background: i === 5 ? '#ff5473' : `rgba(255,84,115,${0.15 + i * 0.08})` }}></div>
              ))}
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-8 mb-20 text-center">
        <AnimateOnScroll variant="fade-in">
          <div className="py-32" style={{ borderTop: DIVIDER, borderBottom: DIVIDER }}>
            <p className="mono-label text-[#9ca3af] mb-10">Get started today</p>
            <h2 className="display-text text-[#0a0a0a] mb-12" style={{ fontSize: 'clamp(48px, 7vw, 80px)' }}>
              Ready to craft<br /><span style={{ color: '#ff5473' }}>at scale?</span>
            </h2>
            <Link
              href="/contact"
              className="inline-flex items-center px-12 py-5 rounded-full text-white font-semibold text-base transition-opacity hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
            >
              Get Started
            </Link>
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  )
}
