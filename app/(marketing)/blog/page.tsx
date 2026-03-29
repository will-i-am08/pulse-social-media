import Link from 'next/link'
import { getPublishedPosts } from '@/lib/blog'
import BlogImage from '@/components/marketing/BlogImage'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Pulse Digital Agency',
  description: 'Insights, guides, and industry intelligence from Pulse Digital — your partner in digital strategy, AI, and creative growth.',
}

export const revalidate = 60

function readTime(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  if (posts.length === 0) {
    return (
      <main className="pt-32 pb-24">
        <section className="max-w-7xl mx-auto px-8 text-center">
          <h1 className="font-headline text-5xl md:text-7xl font-extrabold tracking-tighter mb-6">
            The <span className="bg-gradient-to-r from-primary to-primary-container bg-clip-text text-transparent">Blog.</span>
          </h1>
          <p className="text-on-surface-variant text-lg max-w-md mx-auto">No published posts yet. Check back soon for insights and guides.</p>
        </section>
      </main>
    )
  }

  const [featured, ...rest] = posts

  return (
    <main className="pt-32 pb-24">
      {/* Hero Featured Post */}
      <section className="max-w-7xl mx-auto px-8 mb-24">
        <div className="flex items-center gap-3 mb-10">
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(255,178,185,0.5)]"></span>
          <span className="font-label text-xs uppercase tracking-[0.2em] text-primary">Latest Post</span>
        </div>
        <Link href={`/blog/${featured.slug}`} className="group block">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            <div className="w-full lg:w-7/12 order-2 lg:order-1">
              <h1 className="font-headline text-4xl md:text-6xl font-extrabold tracking-tighter leading-[0.95] mb-6 group-hover:text-primary transition-colors">
                {featured.title}
              </h1>
              {featured.meta && (
                <p className="text-on-surface-variant text-lg md:text-xl max-w-xl mb-8 leading-relaxed line-clamp-3">
                  {featured.meta}
                </p>
              )}
              <div className="flex items-center gap-6 flex-wrap">
                {featured.author && (
                  <span className="text-on-surface text-sm font-medium">{featured.author}</span>
                )}
                <span className="text-outline-variant text-sm font-medium tracking-tight">
                  {formatDate(featured.publishedDate)} — {readTime(featured.wordCount)} min read
                </span>
              </div>
              {featured.tags && (
                <div className="flex flex-wrap gap-2 mt-6">
                  {featured.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 4).map(tag => (
                    <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-primary-container/20 text-primary border border-primary/10">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="w-full lg:w-5/12 order-1 lg:order-2">
              <div className="relative aspect-[4/3] rounded-lg overflow-hidden">
                <BlogImage
                  src={featured.featuredImage}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent opacity-40"></div>
              </div>
            </div>
          </div>
        </Link>
      </section>

      {/* Posts Grid */}
      {rest.length > 0 && (
        <section className="bg-surface-container-low py-24">
          <div className="max-w-7xl mx-auto px-8">
            <h2 className="font-headline text-3xl font-bold tracking-tight mb-12">More Posts</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map(post => (
                <Link
                  key={post.id}
                  href={`/blog/${post.slug}`}
                  className="group bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-colors"
                >
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <BlogImage
                      src={post.featuredImage}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="font-headline text-lg font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    {post.meta && (
                      <p className="text-on-surface-variant text-sm leading-relaxed line-clamp-2 mb-4">{post.meta}</p>
                    )}
                    <div className="flex items-center justify-between text-xs text-outline-variant">
                      <span>{formatDate(post.publishedDate)}</span>
                      <span>{readTime(post.wordCount)} min read</span>
                    </div>
                    {post.tags && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {post.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3).map(tag => (
                          <span key={tag} className="px-2 py-0.5 text-[10px] font-medium rounded-full bg-primary-container/15 text-primary/80">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  )
}
