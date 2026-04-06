'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

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

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-xl border-b border-black/5 h-16 animate-[fadeSlideDown_0.5s_ease-out]">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-full">
        <Link href="/" className="flex items-center gap-2.5 cursor-pointer">
          <Image src="/logo.png" alt="Pulse" width={40} height={40} className="w-10 h-10" style={{ mixBlendMode: 'multiply' }} />
          <span className="text-[#0a0a0a] font-semibold text-sm tracking-tight">Pulse</span>
        </Link>

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
      </div>
    </nav>
  )
}
