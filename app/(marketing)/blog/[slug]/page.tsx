import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getPublishedPostBySlug, getPublishedPosts } from '@/lib/blog'
import BlogImage from '@/components/marketing/BlogImage'
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

export async function generateStaticParams() {
  const posts = await getPublishedPosts()
  return posts.map(p => ({ slug: p.slug }))
}

function readTime(wordCount: number) {
  return Math.max(1, Math.ceil(wordCount / 200))
}

function formatDate(dateStr?: string) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPublishedPostBySlug(params.slug)
  if (!post) notFound()

  return (
    <main className="pt-32 pb-24">
      <article className="max-w-3xl mx-auto px-8">
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
            <span>{readTime(post.wordCount)} min read</span>
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

        {/* Markdown Content */}
        <div className="blog-prose">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              h1: ({ children }) => (
                <h1 className="font-headline text-3xl font-extrabold tracking-tight mt-12 mb-4 text-on-surface">{children}</h1>
              ),
              h2: ({ children }) => (
                <h2 className="font-headline text-2xl font-bold tracking-tight mt-10 mb-4 text-on-surface">{children}</h2>
              ),
              h3: ({ children }) => (
                <h3 className="font-headline text-xl font-bold tracking-tight mt-8 mb-3 text-on-surface">{children}</h3>
              ),
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

        {/* Footer */}
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
    </main>
  )
}
