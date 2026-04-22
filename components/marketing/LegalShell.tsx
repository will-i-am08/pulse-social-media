'use client'

import { ReactNode, useEffect, useState } from 'react'

const CSS = `
.pulse-legal .legal{max-width:1200px;margin:0 auto;padding:40px 48px 96px;display:grid;grid-template-columns:240px 1fr;gap:80px;border-top:1px solid var(--hair)}
.pulse-legal .legal-nav{position:sticky;top:88px;align-self:start;display:flex;flex-direction:column;gap:2px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase}
.pulse-legal .legal-nav a{padding:8px 0;color:var(--muted);border-left:2px solid transparent;padding-left:12px;cursor:pointer}
.pulse-legal .legal-nav a.active,.pulse-legal .legal-nav a:hover{color:var(--ink);border-left-color:var(--accent)}
.pulse-legal .legal-nav .hdr{color:var(--ink);font-weight:500;margin-bottom:8px;padding-left:12px;letter-spacing:.15em}
.pulse-legal .legal-doc{max-width:760px}
.pulse-legal .legal-doc .updated{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:24px}
.pulse-legal .legal-doc h2{font-size:32px;font-weight:300;letter-spacing:-0.02em;margin:56px 0 16px;scroll-margin-top:96px}
.pulse-legal .legal-doc h2:first-of-type{margin-top:0}
.pulse-legal .legal-doc h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-legal .legal-doc p,.pulse-legal .legal-doc li{color:#333;line-height:1.7;font-size:16px}
.pulse-legal .legal-doc p{margin:0 0 16px}
.pulse-legal .legal-doc ul{margin:0 0 16px;padding-left:20px;display:flex;flex-direction:column;gap:8px}
.pulse-legal .legal-doc strong{color:var(--ink);font-weight:600}
.pulse-legal .legal-doc .note{background:var(--paper-2);border:1px solid var(--hair);border-radius:12px;padding:24px;margin:28px 0;font-size:15px;line-height:1.6;color:#444}
.pulse-legal .legal-doc .note b{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--accent);display:block;margin-bottom:6px;font-weight:500}
.pulse-legal .legal-doc a{color:var(--ink);border-bottom:1px solid var(--accent)}
.pulse-legal .ctable{width:100%;border-collapse:collapse;margin:20px 0;font-size:14.5px;border:1px solid var(--hair);border-radius:12px;overflow:hidden}
.pulse-legal .ctable th,.pulse-legal .ctable td{text-align:left;padding:14px 16px;border-bottom:1px solid var(--hair);vertical-align:top}
.pulse-legal .ctable th{background:var(--paper-2);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);font-weight:500}
.pulse-legal .ctable tr:last-child td{border-bottom:0}
.pulse-legal .ctable td code{font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--ink);background:var(--paper-2);padding:2px 6px;border-radius:4px}
.pulse-legal .ctable .cat{color:var(--accent);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase}
.pulse-legal .pref-card{background:#fff;border:1px solid var(--hair);border-radius:16px;padding:32px;margin:28px 0}
.pulse-legal .pref-card h3{font-size:22px;font-weight:400;letter-spacing:-0.015em;margin:0 0 8px}
.pulse-legal .pref-card p{color:var(--muted);margin:0 0 20px;font-size:14.5px}
.pulse-legal .pref-row{display:flex;justify-content:space-between;align-items:center;padding:18px 0;border-top:1px solid var(--hair)}
.pulse-legal .pref-row:first-of-type{border-top:0;padding-top:8px}
.pulse-legal .pref-row .pl{display:flex;flex-direction:column;gap:4px}
.pulse-legal .pref-row .pl .pn{font-weight:500;font-size:15px}
.pulse-legal .pref-row .pl .pd{color:var(--muted);font-size:13px;line-height:1.5}
.pulse-legal .sw{position:relative;width:44px;height:24px;background:#ddd;border-radius:999px;cursor:pointer;transition:background .2s;flex-shrink:0;border:0}
.pulse-legal .sw::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:left .2s;box-shadow:0 1px 2px rgba(0,0,0,.2)}
.pulse-legal .sw.on{background:var(--accent)}
.pulse-legal .sw.on::after{left:23px}
.pulse-legal .sw.locked{background:var(--ink);cursor:not-allowed;opacity:.7}
.pulse-legal .sw.locked::after{left:23px}
.pulse-legal .pref-actions{display:flex;gap:10px;margin-top:20px;flex-wrap:wrap}
@media(max-width:900px){.pulse-legal .legal{grid-template-columns:1fr;padding:32px 24px 64px;gap:32px}.pulse-legal .legal-nav{position:static;flex-direction:row;flex-wrap:wrap;gap:4px}.pulse-legal .legal-nav a{padding:6px 10px;border-left:0;border:1px solid var(--hair);border-radius:999px}.pulse-legal .legal-nav a.active{background:var(--ink);color:#fff;border-color:var(--ink)}.pulse-legal .legal-nav .hdr{display:none}.pulse-legal .pref-card{padding:24px}}
`

interface NavItem { id: string; label: string }

interface Props {
  eyebrow: string
  title: ReactNode
  intro: string
  updated: string
  nav: NavItem[]
  children: ReactNode
}

export default function LegalShell({ eyebrow, title, intro, updated, nav, children }: Props) {
  const [activeId, setActiveId] = useState(nav[0]?.id || '')

  useEffect(() => {
    const sections = nav
      .map(n => document.getElementById(n.id))
      .filter((el): el is HTMLElement => !!el)
    if (sections.length === 0) return

    const onScroll = () => {
      const y = window.scrollY + 120
      let cur = sections[0].id
      for (const s of sections) if (s.offsetTop <= y) cur = s.id
      setActiveId(cur)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [nav])

  return (
    <main className="pulse-legal">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="page-head">
        <div>
          <p className="mono-label">{eyebrow}</p>
          <h1>{title}</h1>
        </div>
        <p>{intro}</p>
      </section>

      <div className="legal">
        <nav className="legal-nav">
          <div className="hdr">On this page</div>
          {nav.map(n => (
            <a key={n.id} href={`#${n.id}`} className={activeId === n.id ? 'active' : ''}>
              {n.label}
            </a>
          ))}
        </nav>
        <article className="legal-doc">
          <p className="updated">Last updated · {updated}</p>
          {children}
        </article>
      </div>
    </main>
  )
}
