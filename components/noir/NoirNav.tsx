'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Podcast', href: '/podcast' },
  { label: 'Playbook', href: '/playbook' },
  { label: 'Contact', href: '/contact' },
]

export default function NoirNav({ climb = false }: { climb?: boolean }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [pathname])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  const accent = climb ? '#F2B066' : '#F97316'
  const accentInk = climb ? '#0C0F1E' : '#1a0800'
  const navBg = climb ? 'rgba(12,15,30,0.74)' : 'rgba(7,8,9,0.72)'
  const ink = climb ? '#ECE6D8' : '#F4F5F7'
  const inkSoft = climb ? 'rgba(236,230,216,0.66)' : 'rgba(244,245,247,0.7)'
  const hair = climb ? 'rgba(236,230,216,0.08)' : 'rgba(255,255,255,0.07)'

  return (
    <div
      style={{
        position: 'sticky', top: 0, zIndex: 100, background: navBg,
        backdropFilter: 'blur(18px) saturate(160%)', WebkitBackdropFilter: 'blur(18px) saturate(160%)',
        borderBottom: `1px solid ${hair}`,
      }}
    >
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '14px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'inherit', textDecoration: 'none' }}>
          <Image src="/noir/logo-white.png" alt="Pulse" width={36} height={36} style={{ display: 'block' }} priority />
          <span className="sora" style={{ fontWeight: 700, fontSize: 20, letterSpacing: '-0.02em' }}>Pulse</span>
        </Link>

        <div className="noir-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 30, fontSize: 14.5, fontWeight: 500 }}>
          {LINKS.map(l => {
            const active = isActive(l.href)
            return (
              <Link key={l.href} href={l.href} style={{ color: active ? ink : inkSoft, fontWeight: active ? 700 : 500, textDecoration: 'none' }}>
                {l.label}
              </Link>
            )
          })}
        </div>

        <Link
          href={climb ? '/podcast' : '/contact'}
          className="noir-nav-cta"
          style={{
            display: 'flex', alignItems: 'center', gap: 9, padding: '11px 20px', borderRadius: 999,
            textDecoration: 'none',
            background: accent, color: accentInk, fontWeight: 800, fontSize: 14,
            boxShadow: `0 6px 20px ${climb ? 'rgba(242,176,102,0.26)' : 'rgba(249,115,22,0.32)'}`,
            ...(climb ? { fontFamily: "'JetBrains Mono', monospace", fontWeight: 500, fontSize: 11.5, letterSpacing: '0.16em', textTransform: 'uppercase' as const } : {}),
          }}
        >
          {climb ? 'Join the waitlist' : <>Get in touch <span>→</span></>}
        </Link>

        <button
          className="noir-burger"
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          style={{ flexDirection: 'column', gap: 4, background: 'transparent', border: 0, cursor: 'pointer', padding: 8 }}
        >
          <span style={{ display: 'block', width: 22, height: 2, background: ink, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: ink, borderRadius: 2 }} />
          <span style={{ display: 'block', width: 22, height: 2, background: ink, borderRadius: 2 }} />
        </button>
      </div>

      {open && (
        <div className="noir-mobile-menu" style={{ flexDirection: 'column', padding: '8px 22px 22px', borderTop: `1px solid ${hair}` }}>
          {LINKS.map(l => (
            <Link key={l.href} href={l.href} style={{ padding: '14px 6px', fontSize: 16, fontWeight: 600, color: isActive(l.href) ? accent : ink, textDecoration: 'none' }}>
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
