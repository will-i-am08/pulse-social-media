'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

const LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Services', href: '/services' },
  { label: 'Insights', href: '/insights' },
  { label: 'About', href: '/about' },
  { label: 'CaptionCraft', href: '/captioncraft' },
  { label: 'Contact', href: '/contact' },
]

function formatMelTime(date: Date) {
  const fmt = new Intl.DateTimeFormat('en-AU', {
    timeZone: 'Australia/Melbourne',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
  return fmt.format(date)
}

export default function MarketingNav() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [time, setTime] = useState('')

  useEffect(() => {
    const update = () => setTime(formatMelTime(new Date()))
    update()
    const id = setInterval(update, 60_000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(href + '/')

  return (
    <>
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="logo">
            <Image className="mark" src="/marketing/logo-dark.png" alt="Pulse" width={26} height={26} />
            Pulse
          </Link>

          <div className="nav-links">
            {LINKS.map(l => (
              <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
                {l.label}
              </Link>
            ))}
          </div>

          <div className="nav-cta">
            <span className="time">MEL · {time} AEST</span>
            <Link href="/contact" className="btn-pill btn-grad" style={{ padding: '10px 18px', fontSize: 13 }}>
              Start the project →
            </Link>
            <button
              onClick={() => setOpen(v => !v)}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="nav-burger"
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>
      </nav>

      <div
        className={`nav-drawer ${open ? 'open' : ''}`}
        onClick={() => setOpen(false)}
      />
      <aside className={`nav-panel ${open ? 'open' : ''}`}>
        {LINKS.map(l => (
          <Link key={l.href} href={l.href} className={isActive(l.href) ? 'active' : ''}>
            {l.label}
          </Link>
        ))}
        <Link href="/contact" className="btn-pill btn-grad" style={{ marginTop: 12, justifyContent: 'center' }}>
          Start the project →
        </Link>
      </aside>

      <style dangerouslySetInnerHTML={{ __html: `
        .pulse-marketing .nav-burger{display:none;flex-direction:column;gap:4px;background:transparent;border:0;cursor:pointer;padding:8px}
        .pulse-marketing .nav-burger span{display:block;width:22px;height:2px;background:#0a0a0a;border-radius:2px}
        .pulse-marketing .nav-drawer{position:fixed;inset:0;background:rgba(0,0,0,.3);backdrop-filter:blur(4px);z-index:48;opacity:0;pointer-events:none;transition:opacity .25s}
        .pulse-marketing .nav-drawer.open{opacity:1;pointer-events:auto}
        .pulse-marketing .nav-panel{position:fixed;top:0;right:0;bottom:0;width:80%;max-width:320px;background:#fafaf7;z-index:49;transform:translateX(100%);transition:transform .28s ease;padding:80px 24px 24px;display:flex;flex-direction:column;gap:8px;border-left:1px solid rgba(0,0,0,.08)}
        .pulse-marketing .nav-panel.open{transform:translateX(0)}
        .pulse-marketing .nav-panel a{padding:14px 12px;border-radius:12px;font-size:16px;font-weight:500;color:#0a0a0a}
        .pulse-marketing .nav-panel a.active{background:#fff0f2;color:#ff5473}
        @media (max-width: 820px){
          .pulse-marketing .nav-burger{display:inline-flex}
          .pulse-marketing .nav-cta .btn-pill{display:none}
        }
      ` }} />
    </>
  )
}
