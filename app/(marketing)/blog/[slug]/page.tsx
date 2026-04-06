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
      <main className="pt-32 pb-24" style={{ background: '#ffffff', color: '#0a0a0a' }}>
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex gap-16">
            {/* Main article column */}
            <article className="max-w-3xl w-full mx-auto xl:mx-0">
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
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-3xl font-extrabold tracking-tight mt-12 mb-4 text-[#0a0a0a]">{children}</h1>
                    ),
                    h2: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return (
                        <h2 id={id} className="text-2xl font-bold tracking-tight mt-10 mb-4 text-[#0a0a0a] scroll-mt-24">
                          {children}
                        </h2>
                      )
                    },
                    h3: ({ children }) => {
                      const text = typeof children === 'string' ? children : extractText(children)
                      const id = slugify(text)
                      return (
                        <h3 id={id} className="text-xl font-bold tracking-tight mt-8 mb-3 text-[#0a0a0a] scroll-mt-24">
                          {children}
                        </h3>
                      )
                    },
                    h4: ({ children }) => (
                      <h4 className="text-lg font-semibold mt-6 mb-2 text-[#0a0a0a]">{children}</h4>
                    ),
                    p: ({ children }) => (
                      <p className="text-[#374151] text-base leading-relaxed mb-5">{children}</p>
                    ),
                    a: ({ href, children }) => (
                      <a href={href} className="text-[#ff5473] hover:underline" target="_blank" rel="noopener noreferrer">{children}</a>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc list-outside pl-6 mb-5 space-y-1.5 text-[#374151]">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal list-outside pl-6 mb-5 space-y-1.5 text-[#374151]">{children}</ol>
                    ),
                    li: ({ children }) => (
                      <li className="text-base leading-relaxed">{children}</li>
                    ),
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-4 border-[#ff5473]/40 pl-5 py-1 my-6 italic text-[#6b7280]">{children}</blockquote>
                    ),
                    code: ({ className, children }) => {
                      const isBlock = className?.includes('language-')
                      if (isBlock) {
                        return (
                          <code className="block bg-[#f5f5f5] rounded-lg p-5 my-6 text-sm font-mono overflow-x-auto text-[#0a0a0a]" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
                            {children}
                          </code>
                        )
                      }
                      return (
                        <code className="bg-[#f5f5f5] px-1.5 py-0.5 rounded text-sm font-mono text-[#ff5473]">{children}</code>
                      )
                    },
                    pre: ({ children }) => (
                      <pre className="bg-[#f5f5f5] rounded-lg p-5 my-6 overflow-x-auto" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>{children}</pre>
                    ),
                    hr: () => <hr className="my-10" style={{ borderColor: 'rgba(0,0,0,0.08)' }} />,
                    table: ({ children }) => (
                      <div className="overflow-x-auto my-6">
                        <table className="w-full text-sm border-collapse">{children}</table>
                      </div>
                    ),
                    th: ({ children }) => (
                      <th className="text-left px-4 py-2 border-b font-semibold text-[#0a0a0a]" style={{ borderColor: 'rgba(0,0,0,0.1)' }}>{children}</th>
                    ),
                    td: ({ children }) => (
                      <td className="px-4 py-2 border-b text-[#6b7280]" style={{ borderColor: 'rgba(0,0,0,0.06)' }}>{children}</td>
                    ),
                    img: ({ src, alt }) => (
                      <span className="block my-6 rounded-lg overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={src} alt={alt || ''} className="w-full rounded-lg" />
                      </span>
                    ),
                    strong: ({ children }) => <strong className="font-semibold text-[#0a0a0a]">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                  }}
                >
                  {post.content}
                </ReactMarkdown>
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
