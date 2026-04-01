import Image from 'next/image'
import Link from 'next/link'
import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import NewsletterForm from '@/components/marketing/NewsletterForm'
import InsightsBlogGrid from './InsightsBlogGrid'
import { getPublishedPosts } from '@/lib/blog'

export const metadata: Metadata = {
  title: 'Insights | Pulse Digital Agency',
  description: 'Digital strategy insights, AI trends, and actionable guides from the Pulse Digital team.',
}

export const revalidate = 60

export default async function InsightsPage() {
  const posts = await getPublishedPosts()

  return (
    <main className="pt-32 pb-24">
      {/* Hero Featured Article */}
      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="flex flex-col lg:flex-row gap-12 items-end">
          <div className="w-full lg:w-7/12 order-2 lg:order-1">
            <AnimateOnScroll variant="fade-in" delay={0}>
              <div className="flex items-center gap-3 mb-6">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,178,185,0.5)]"></span>
                <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Featured Article</span>
              </div>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.1}>
              <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter leading-[0.9] mb-8">
                The Algorithm <br />
                <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Renaissance.</span>
              </h1>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.2}>
              <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-10 leading-relaxed">
                Navigating the shift from generative experimentation to practical intelligence. How the next wave of AI is reshaping digital strategy for agencies and brands.
              </p>
            </AnimateOnScroll>
            <AnimateOnScroll variant="fade-up" delay={0.3}>
              <div className="flex items-center gap-6">
                <Link href="/blog" className="flex items-center gap-2 group">
                  <span className="font-label text-sm font-bold uppercase tracking-widest text-on-surface group-hover:text-primary transition-colors">Read More</span>
                  <span className="material-symbols-outlined text-primary group-hover:translate-x-1 transition-transform">arrow_forward</span>
                </Link>
                <span className="text-outline-variant text-sm font-medium tracking-tight">12 Min Read — Jan 2026</span>
              </div>
            </AnimateOnScroll>
          </div>
          <AnimateOnScroll variant="slide-right" delay={0.2} className="w-full lg:w-5/12 order-1 lg:order-2">
            <div className="relative aspect-[4/5] rounded-lg overflow-hidden group">
              <Image
                src="https://images.unsplash.com/photo-1677442135703-1787eea5ce01?auto=format&fit=crop&w=1200&q=80"
                alt="Abstract fluid metallic 3D shape with warm coral lighting"
                fill
                className="object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700"
                sizes="(max-width: 768px) 100vw, 42vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-60"></div>
              <div className="absolute bottom-6 left-6 right-6 p-6 backdrop-blur-md bg-surface-container/40 rounded border border-outline-variant/10">
                <p className="text-xs font-bold text-primary mb-1 uppercase tracking-tighter">Key Takeaway</p>
                <p className="text-sm text-on-surface">Predictive architectures are surpassing generative models in commercial ROI.</p>
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
              <span className="text-primary text-xs font-bold uppercase tracking-[0.3em]">Why It Matters</span>
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
              <div key={i} className="bg-surface-container-low rounded-xl p-8 border border-outline-variant/10">
                <span className="material-symbols-outlined text-primary text-3xl mb-4 block">{item.icon}</span>
                <h3 className="font-headline text-lg font-bold text-on-surface mb-3 leading-snug">{item.headline}</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </AnimateOnScroll>
      </section>

      {/* Blog Posts */}
      <section className="bg-surface-container-low py-32">
        <div className="max-w-7xl mx-auto px-8">
          <InsightsBlogGrid posts={posts} />
        </div>
      </section>

      {/* Newsletter */}
      <section className="max-w-7xl mx-auto px-8 my-32">
        <AnimateOnScroll variant="scale-up">
          <div className="bg-surface-container-highest rounded-xl p-12 md:p-20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none"></div>
            <div className="relative z-10 max-w-2xl">
              <h2 className="font-headline text-4xl font-extrabold tracking-tighter mb-6 leading-tight">
                Get our <span className="text-primary">weekly digital insights</span>. Every Tuesday.
              </h2>
              <p className="text-on-surface-variant mb-10 text-lg">We break down the latest digital trends into practical takeaways. No fluff, just the good stuff.</p>
              <NewsletterForm />
              <p className="mt-6 text-[10px] text-outline uppercase tracking-widest">Privacy guaranteed. Opt-out at any time.</p>
            </div>
          </div>
        </AnimateOnScroll>
      </section>
    </main>
  )
}
