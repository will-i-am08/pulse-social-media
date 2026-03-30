import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedPostBySlug, getRelatedPosts } from '@/lib/blog'
import BlogImage from '@/components/marketing/BlogImage'
import ReadingProgress from '@/components/marketing/ReadingProgress'
import TableOfContents, { slugify } from '@/components/marketing/TableOfContents'
import ShareButtons from '@/components/marketing/ShareButtons'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import type { Metadata } from 'next'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

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
      <main className="pt-32 pb-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-16">
            {/* Main article column */}
            <article className="max-w-3xl w-full mx-auto xl:mx-0">
              {/* Back link */}
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-primary transition-colors mb-10"
              >
                <span className="material-symbols-outlined text-base">arrow_back</span>
                All Posts
              </Link>

              {/* Header */}
              <header className="mb-10">
                {post.tags && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {post.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                      <span key={tag} className="px-3 py-1 text-xs font-medium rounded-full bg-primary-container/20 text-primary border border-primary/10">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <h1 className="font-headline text-4xl md:text-5xl font-extrabold tracking-tighter leading-[1.05] mb-6">
                  {post.title}
                </h1>
                {post.meta && (
                  <p className="text-on-surface-variant text-lg leading-relaxed mb-6">{post.meta}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-outline-variant flex-wrap">
                  {post.author && <span className="text-on-surface font-medium">{post.author}</span>}
                  <span>{formatDate(post.publishedDate)}</span>
                  <span className="inline-flex items-center gap-1 text-primary font-medium">
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

              {/* Mobile TOC (xl:hidden is handled inside the component) */}
              <div className="xl:hidden">
                <TableOfContents headings={headings} />
              </div>

              {/* Markdown Content */}
              <div className="blog-prose">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="font-headline text-3xl font-extrabold tracking-tight mt-12 mb-4 text-on-surface">{children}</h1>
                    ),
                    h2: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return (
                        <h2 id={id} className="font-headline text-2xl font-bold tracking-tight mt-10 mb-4 text-on-surface scroll-mt-24">
                          {children}
                        </h2>
                      )
                    },
                    h3: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return (
                        <h3 id={id} className="font-headline text-xl font-bold tracking-tight mt-8 mb-3 text-on-surface scroll-mt-24">
                          {children}
                        </h3>
                      )
                    },
                    h4: ({ children }) => (
                      <h4 className="font-headline text-lg font-semibold mt-6 mb-2 text-on-surface">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-on-surface-variant text-base leading-relaxed mb-5">{children}</p>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-primary hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside pl-6 mb-5 space-y-1.5 text-on-surface-variant">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1.5 text-on-surface-variant">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-base leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-primary/40 pl-5 py-1 my-6 italic text-on-surface-variant/80">{children}</blockquote>
                    ),
                    code: ({ className, children }) => {
                      const isBlock = className?.includes('language-')
                      if (isBlock) {
                        return (
                          <code className="block bg-surface-container rounded-lg p-5 my-6 text-sm font-mono overflow-x-auto text-on-surface">
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className="bg-surface-container px-1.5 py-0.5 rounded text-sm font-mono text-primary">{children}</code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-surface-container rounded-lg p-5 my-6 overflow-x-auto">{children}</pre>
                    ),
                    hr: () => <hr className="border-outline-variant/20 my-10" />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full text-sm border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="text-left px-4 py-2 border-b border-outline-variant/30 font-semibold text-on-surface">{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 border-b border-outline-variant/10 text-on-surface-variant">{children}</td>
                    ),
                    img: ({ src, alt }) => (
                      <span className="block my-6 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={alt || ''} className="w-full rounded-lg" />
                      </span>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-on-surface">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </div>

              {/* Share Buttons */}
              <div className="mt-12 pt-8 border-t border-outline-variant/20">
                <p className="text-sm text-outline-variant mb-3">Share this post</p>
                <ShareButtons title={post.title} slug={post.slug} />
              </div>

              {/* Author Card */}
              {post.author && (
                <div className="mt-10 p-6 rounded-xl bg-surface-container border border-outline-variant/10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary-container/30 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-primary text-xl">person</span>
                    </div>
                    <div>
                      <p className="font-medium text-on-surface">{post.author}</p>
                      <p className="text-sm text-on-surface-variant">Pulse Digital</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <section className="mt-16 pt-12 border-t border-outline-variant/20">
                  <AnimateOnScroll variant="fade-up">
                    <h2 className="font-headline text-2xl font-bold tracking-tight mb-8">Related Posts</h2>
                  </AnimateOnScroll>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {relatedPosts.map(rp => (
                      <Link
                        key={rp.id}
                        href={`/blog/${rp.slug}`}
                        className="group bg-surface-container rounded-xl overflow-hidden border border-outline-variant/10 hover:border-primary/20 transition-colors"
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
                          <h3 className="font-headline text-base font-bold tracking-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {rp.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-outline-variant">
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
              <div className="mt-16 pt-10 border-t border-outline-variant/20">
                <Link
                  href="/blog"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                >
                  <span className="material-symbols-outlined text-base">arrow_back</span>
                  Back to all posts
                </Link>
              </div>
            </article>

            {/* Desktop TOC sidebar */}
            <div className="hidden xl:block w-64 flex-shrink-0" aria-label="Table of contents">
              <TableOfContents headings={headings} />
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

/** Recursively extract text from React children for heading ID generation */
function extractText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    return extractText((node as { props: { children?: unknown } }).props.children)
  }
  return ''
}
