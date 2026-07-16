import type { ReactNode } from 'react'

export default function NoirLegal({
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  eyebrow: string
  title: ReactNode
  intro: string
  updated: string
  children: ReactNode
}) {
  return (
    <>
      <div className="glow-layer">
        <div className="glow" style={{ top: -180, left: -120, width: 600, height: 600, background: 'radial-gradient(circle,rgba(249,115,22,0.14),rgba(249,115,22,0) 65%)', animation: 'pulseFloat 14s ease-in-out infinite' }} />
        <div className="glow-grid" />
      </div>

      <div className="m-pad" style={{ position: 'relative', zIndex: 5, maxWidth: 820, margin: '0 auto', padding: '96px 40px 90px' }}>
        <div className="kicker" style={{ fontSize: 13, marginBottom: 18 }}>{eyebrow}</div>
        <h1 className="sora" style={{ fontWeight: 800, fontSize: 'clamp(36px,9vw,76px)', lineHeight: 1.0, letterSpacing: '-0.04em', margin: 0 }}>{title}</h1>
        <p style={{ fontSize: 19, lineHeight: 1.6, color: 'rgba(244,245,247,0.72)', fontWeight: 500, margin: '24px 0 0', maxWidth: 620 }}>{intro}</p>
        <div className="mono" style={{ marginTop: 22, fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(244,245,247,0.45)', fontFamily: "'JetBrains Mono', monospace" }}>Last updated · {updated}</div>

        <div className="noir-legal" style={{ marginTop: 40 }}>
          {children}
        </div>
      </div>
    </>
  )
}
