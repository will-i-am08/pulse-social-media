'use client'

import { useState, useEffect, useCallback } from 'react'

interface Heading {
  id: string
  text: string
  level: number
}

interface Props {
  headings: Heading[]
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export { slugify }

export default function TableOfContents({ headings }: Props) {
  const [activeId, setActiveId] = useState<string>('')
  const [isOpen, setIsOpen] = useState(false)

  const handleScroll = useCallback(() => {
    const scrollY = window.scrollY + 120
    let currentId = ''
    for (const heading of headings) {
      const el = document.getElementById(heading.id)
      if (el && el.offsetTop <= scrollY) {
        currentId = heading.id
      }
    }
    setActiveId(currentId)
  }, [headings])

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [handleScroll])

  function scrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setIsOpen(false)
    }
  }

  if (headings.length === 0) return null

  return (
    <>
      {/* Mobile toggle */}
      <div className="xl:hidden mb-8">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 text-sm font-medium text-[#6b7280] hover:text-[#ff5473] transition-colors"
        >
          <span className="material-symbols-outlined text-base">toc</span>
          Table of Contents
          <span className={`material-symbols-outlined text-base transition-transform ${isOpen ? 'rotate-180' : ''}`}>
            expand_more
          </span>
        </button>
        {isOpen && (
          <nav className="mt-4 pl-2" style={{ borderLeft: '2px solid rgba(0,0,0,0.08)' }}>
            <ul className="space-y-2">
              {headings.map(h => (
                <li key={h.id} style={{ paddingLeft: h.level === 3 ? '1rem' : '0' }}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`text-sm text-left transition-colors ${
                      activeId === h.id
                        ? 'text-[#ff5473] font-medium'
                        : 'text-[#6b7280] hover:text-[#0a0a0a]'
                    }`}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        )}
      </div>

      {/* Desktop sidebar */}
      <aside className="hidden xl:block">
        <div className="sticky top-32">
          <p className="mono-label text-[#9ca3af] mb-4">On this page</p>
          <nav className="pl-4" style={{ borderLeft: '2px solid rgba(0,0,0,0.08)' }}>
            <ul className="space-y-2.5">
              {headings.map(h => (
                <li key={h.id} style={{ paddingLeft: h.level === 3 ? '0.75rem' : '0' }}>
                  <button
                    onClick={() => scrollTo(h.id)}
                    className={`text-[13px] leading-snug text-left transition-colors ${
                      activeId === h.id
                        ? 'text-[#ff5473] font-medium'
                        : 'text-[#9ca3af] hover:text-[#0a0a0a]'
                    }`}
                  >
                    {h.text}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </>
  )
}
