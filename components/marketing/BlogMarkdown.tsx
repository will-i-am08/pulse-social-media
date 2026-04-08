'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { slugify } from '@/lib/slugify'

function extractText(node: unknown): string {
  if (typeof node === 'string') return node
  if (typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(extractText).join('')
  if (node && typeof node === 'object' && 'props' in (node as Record<string, unknown>)) {
    return extractText((node as { props: { children?: unknown } }).props.children)
  }
  return ''
}

export default function BlogMarkdown({ content }: { content: string }) {
  return (
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
      {content}
    </ReactMarkdown>
  )
}
