import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import NewsletterForm from '@/components/marketing/NewsletterForm'
import InsightsBlogGrid from './InsightsBlogGrid'
import { getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Insights | Digital Strategy, AI & Social Media Guides',
  description: 'Digital strategy insights, AI trends, and actionable social media guides from the Pulse Digital team. Stay ahead of the curve.',
  keywords: ['social media insights', 'digital marketing blog', 'AI marketing trends', 'social media tips', 'content strategy guides'],
  openGraph: {
    title: 'Insights | Digital Strategy, AI & Social Media Guides',
    description: 'Digital strategy insights, AI trends, and actionable social media guides from the Pulse Digital team.',
    url: '/insights',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Digital Insights' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Insights | Pulse Digital Agency',
    description: 'Digital strategy insights, AI trends, and actionable social media guides from the Pulse Digital team.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/insights' },
}

export const revalidate = 60

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default async function InsightsPage() {
  const posts = await getPublishedPosts()
  const latestPost = posts[0]
  const featuredHref = latestPost ? `/blog/${latestPost.slug}` : '#blog-posts'

  return (
    <main style={{ color: '#0a0a0a' }} className="pt-32 pb-24">

      {/* Hero Featured Article */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <AnimateOnScroll variant="fade-in" delay={0}>
          <div className="flex items-center gap-3 mb-10">
            <span className="w-2 h-2 rounded-full bg-[#ff5473] animate-pulse"></span>
            <span className="mono-label text-[#ff5473]">Featured Article</span>
          </div>
        </AnimateOnScroll>
        <div className="flex flex-col lg:flex-row gap-12 items-center">
          <div className="w-full lg:w-7/12">
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="display-text text-[#0a0a0a] mb-8" style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>
                The Algorithm <br />
                <span style={{ color: '#ff5473' }}>Renaissance.</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-[#6b7280] text-lg md:text-xl max-w-xl mb-10 leading-relaxed font-light">
                Navigating the shift from generative experimentation to practical intelligence. How the next wave of AI is reshaping digital strategy for agencies and brands.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.3}>
              <div className="flex items-center gap-6">
                <Link href={featuredHref} className="flex items-center gap-2 group">
                  <span className="text-sm font-bold uppercase tracking-widest text-[#0a0a0a] group-hover:text-[#ff5473] transition-colors">Read More</span>
                  <span className="material-symbols-outlined text-[#ff5473] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <span className="text-[#9ca3af] text-sm font-medium tracking-tight">12 Min Read — Jan 2026</span>
              </div>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="w-full lg:w-5/12">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?auto=format&fit=crop&w=1200&q=80"
                alt="Social media content creation on a smartphone"
                fill
                className="object-cover grayscale brightness-90 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-md bg-white/80 rounded" style={{ border: DIVIDER }}>
                <p className="text-xs font-bold text-[#ff5473] mb-1 uppercase tracking-tighter">Key Takeaway</p>
                <p className="text-sm text-[#0a0a0a]">Predictive architectures are surpassing generative models in commercial ROI.</p>
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </section>

      {/* Research Callout */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <AnimateOnScroll variant="fade-up">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-3 mb-2">
              <p className="mono-label text-[#ff5473]">Why It Matters</p>
            </div>
            {[
              {
                icon: 'trending_up',
                headline: 'Brands that actively use social media report up to 92% increased exposure',
                body: 'Social media platforms provide a global stage for brands to showcase their products, services, and values — creating recognition and awareness far beyond traditional channels.',
              },
              {
                icon: 'groups',
                headline: 'Engaged communities drive brand loyalty that advertising alone cannot buy',
                body: 'By creating communities around their products, brands encourage like-minded individuals to connect and share experiences. Satisfied customers become brand advocates who recommend to their own networks.',
              },
              {
                icon: 'analytics',
                headline: 'Data from social platforms enables smarter, faster strategic decisions',
                body: 'Social media analytics allow brands to track engagement rates, audience demographics, and conversion rates — providing a continuous feedback loop to refine strategy and maximise ROI.',
              },
            ].map((item, i) => (
              <div key={i} className="bg-[#f9f9f9] rounded-xl p-8" style={{ border: DIVIDER }}>
                <span className="material-symbols-outlined text-[#ff5473] text-3xl mb-4 block">{item.icon}</span>
                <h3 className="text-lg font-bold text-[#0a0a0a] mb-3 leading-snug">{item.headline}</h3>
                <p className="text-[#6b7280] text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* Blog Posts */}
      <section id="blog-posts" className="py-32" style={{ background: '#f9f9f9', borderTop: DIVIDER, borderBottom: DIVIDER }}>
        <div className="max-w-7xl mx-auto px-8">
          <InsightsBlogGrid posts={posts} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-8 my-32">
        <AnimateOnScroll variant="scale-up">
          <div className="bg-[#f5f5f5] rounded-xl p-12 md:p-20 relative overflow-hidden" style={{ border: DIVIDER }}>
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#ff5473]/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <p className="mono-label text-[#ff5473] mb-4">Weekly Digest</p>
              <h2 className="display-text text-[#0a0a0a] mb-6" style={{ fontSize: 'clamp(32px, 4vw, 52px)' }}>
                Get our <span style={{ color: '#ff5473' }}>weekly digital insights</span>. Every Tuesday.
              </h2>
              <p className="text-[#6b7280] mb-10 text-lg font-light">We break down the latest digital trends into practical takeaways. No fluff, just the good stuff.</p>
              <NewsletterForm />
              <p className="mt-6 mono-label text-[#9ca3af]">Privacy guaranteed. Opt-out at any time.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>

    </main>
  )
}
