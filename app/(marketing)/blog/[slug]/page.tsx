import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedPostBySlug, getRelatedPosts } from '@/lib/blog'
import BlogImage from '@/components/marketing/BlogImage'
import BlogMarkdown from '@/components/marketing/BlogMarkdown'
import ReadingProgress from '@/components/marketing/ReadingProgress'
import TableOfContents from '@/components/marketing/TableOfContents'
import { slugify } from '@/lib/slugify'
import ShareButtons from '@/components/marketing/ShareButtons'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import type { Metadata } from 'next'

export const revalidate = 60

interface Props {
  params: { slug: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPublishedPostBySlug(params.slug)
  if (!post) return { title: 'Post Not Found | Pulse Digital' }

  const meta: Metadata = {
    title: `${post.title} | Pulse Digital Blog`,
    description: post.meta || `Read "${post.title}" on the Pulse Digital blog.`,
  }

  if (post.featuredImage && post.featuredImage.startsWith('http')) {
    meta.openGraph = {
      title: post.title,
      description: post.meta,
      images: [{ url: post.featuredImage }],
    }
  }

  return meta
}

function readTime(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

function extractHeadings(content: string): { id: string; text: string; level: number }[] {
  const headings: { id: string; text: string; level: number }[] = []
  const regex = /^(#{2,3})\s+(.+)$/gm
  let match
  while ((match = regex.exec(content)) !== null) {
    const level = match[1].length
    const text = match[2].trim()
    const id = slugify(text)
    headings.push({ id, text, level })
  }
  return headings
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPostBySlug(params.slug)
  if (!post) notFound()

  const headings = extractHeadings(post.content)
  const relatedPosts = await getRelatedPosts(post.slug, post.tags, 3)

  return (
    <>
      <ReadingProgress />
      <main className="pt-32 pb-24" style={{ color: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-16">
            {/* Main article column — wrapped in a white "island" so the
                background ParticleGrid dots don't sit behind the text. */}
            <article
              className="max-w-3xl w-full mx-auto xl:mx-0 bg-white rounded-2xl p-8 md:p-12"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
            >
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-[#6b7280] hover:text-[#ff5473] transition-colors mb-10"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                All Posts
              </Link>

              {/* Header */}
              <header className="mb-10">
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-[#fff0f2] text-[#ff5473]" style={{ border: '1px solid rgba(255,84,115,0.2)' }}>
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mb-6 text-[#0a0a0a]">
                  {post.title}
                </h1>
                {post.meta && (
                  <p className="text-[#6b7280] text-lg leading-relaxed mb-6">{post.meta}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-[#9ca3af] flex-wrap">
                  {post.author && <span className="text-[#0a0a0a] font-medium">{post.author}</span>}
                  <span>{formatDate(post.publishedDate)}</span>
                  <span className="inline-flex items-center gap-1 text-[#ff5473] font-medium">
                    <span className="material-symbols-outlined text-base">schedule</span>
                    {readTime(post.wordCount)} min read
                  </span>
                </div>
              </header>

              {/* Featured Image */}
              {post.featuredImage && (
                <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-12">
                  <BlogImage
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Mobile TOC */}
              <div className="xl:hidden">
                <TableOfContents headings={headings} />
              </div>

              {/* Markdown Content */}
              <div className="blog-prose">
                <BlogMarkdown content={post.content} />
              </div>

              {/* Share Buttons */}
              <div className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <p className="text-sm text-[#9ca3af] mb-3">Share this post</p>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Author Card */}
              {post.author && (
                <div className="mt-10 p-6 rounded-xl bg-[#f9f9f9]" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-[#fff0f2] flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-[#ff5473] text-xl">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-[#0a0a0a]">{post.author}</p>
                      <p className="text-sm text-[#6b7280]">Pulse Digital</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mt-16 pt-12" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                  <AnimateOnScroll variant="fade-up">
                    <h2 className="text-2xl font-bold tracking-tight mb-8 text-[#0a0a0a]">Related Posts</h2>
                  </AnimateOnScroll>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map(rp => (
                      <Link
                        key={rp.id}
                        href={`/blog/${rp.slug}`}
                        className="group bg-white rounded-xl overflow-hidden hover:shadow-md transition-shadow"
                        style={{ border: '1px solid rgba(0,0,0,0.08)' }}
                      >
                        <div className="relative aspect-[16/9] overflow-hidden">
                          <BlogImage
                            src={rp.featuredImage}
                            alt={rp.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="p-5">
                          <h3 className="text-base font-bold tracking-tight mb-2 text-[#0a0a0a] group-hover:text-[#ff5473] transition-colors line-clamp-2">
                            {rp.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-[#9ca3af]">
                            <span>{formatDate(rp.publishedDate)}</span>
                            <span>{readTime(rp.wordCount)} min</span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              )}

              {/* Footer nav */}
              <div className="mt-16 pt-10" style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}>
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#ff5473] hover:underline"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to all posts
                </Link>
              </div>
            </article>

            {/* Desktop TOC sidebar */}
            <div
              className="hidden xl:block w-64 flex-shrink-0 bg-white rounded-2xl p-6 self-start sticky top-28"
              style={{ border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}
              aria-label="Table of contents"
            >
              <TableOfContents headings={headings} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

