'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import Image from 'next/image'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Blog', href: '/blog' },
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'CaptionCraft', href: '/captioncraft' },
]

export default function MarketingNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-xl shadow-[0_8px_32px_0_rgba(64,0,16,0.06)] h-20">
      <div className="max-w-7xl mx-auto px-8 flex justify-between items-center h-full">
        <Link href="/" className="flex items-center gap-2 cursor-pointer">
          <Image
            src="/logo.png"
            alt="Pulse Digital Logo"
            width={40}
            height={40}
            className="w-10 h-10"
          />
        </Link>
        <div className="hidden md:flex items-center gap-8">
          {LINKS.map(({ label, href }) => {
            const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link font-medium text-sm tracking-tight${isActive ? ' active' : ''}`}
              >
                {label}
              </Link>
            )
          })}
        </div>
        <Link
          href="/dashboard"
          className="bg-primary-container text-on-primary-container px-6 py-2.5 rounded hover:bg-rose-500/10 transition-all duration-300 active:scale-95 font-medium text-sm"
        >
          Login
        </Link>
      </div>
    </nav>
  )
}
