'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'
import { useState, useEffect } from 'react'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'CaptionCraft', href: '/captioncraft' },
]

export default function MarketingNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  // Close menu on route change
  useEffect(() => { setOpen(false) }, [pathname])

  // Prevent body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 h-16 animate-[fadeSlideDown_0.5s_ease-out]">
        <div className="max-w-7xl mx-auto px-6 md:px-8 flex justify-between items-center h-full">
          <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
            <Image src="/logo.png" alt="Pulse" width={28} height={28} className="w-7 h-7" style={{ mixBlendMode: 'multiply' }} />
            <span className="text-[#0a0a0a] font-semibold text-base tracking-tight">Pulse</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {LINKS.map(({ label, href }) => {
              const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
              return (
                <Link
                  key={href}
                  href={href}
                  className={`nav-link text-sm tracking-tight ${isActive ? 'active' : ''}`}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          <Link
            href="/contact"
            className="hidden md:inline-flex items-center px-5 py-2 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
          >
            Get Started
          </Link>

          {/* Hamburger button — mobile only */}
          <button
            onClick={() => setOpen(prev => !prev)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden flex flex-col justify-center items-center w-10 h-10 gap-1.5 rounded-lg hover:bg-black/5 transition-colors"
          >
            <span className={`block h-0.5 w-5 bg-[#0a0a0a] rounded-full transition-all duration-300 ${open ? 'translate-y-2 rotate-45' : ''}`} />
            <span className={`block h-0.5 w-5 bg-[#0a0a0a] rounded-full transition-all duration-300 ${open ? 'opacity-0' : ''}`} />
            <span className={`block h-0.5 w-5 bg-[#0a0a0a] rounded-full transition-all duration-300 ${open ? '-translate-y-2 -rotate-45' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu overlay */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(4px)' }}
      />

      {/* Mobile menu drawer */}
      <div
        className={`fixed top-16 left-0 right-0 z-50 md:hidden transition-all duration-300 ease-out bg-white border-b border-black/5 shadow-xl ${open ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'}`}
      >
        <div className="px-6 py-4 space-y-1">
          {LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[#fff0f2] text-[#ff5473]'
                    : 'text-[#0a0a0a] hover:bg-black/5'
                }`}
              >
                {label}
              </Link>
            )
          })}

          <div className="pt-2 pb-1">
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="block w-full text-center px-5 py-3 rounded-full text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </>
  )
}
