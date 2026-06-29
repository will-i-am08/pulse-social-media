import Image from 'next/image'
import Link from 'next/link'

const LEGAL = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Cookies', href: '/cookies' },
]

export default function NoirFooter({ climb = false }: { climb?: boolean }) {
  const year = new Date().getFullYear()

  if (climb) {
    return (
      <div style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(236,230,216,0.08)' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '42px 40px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Image src="/noir/logo-white.png" alt="Pulse" width={32} height={32} />
            <span className="sora" style={{ fontWeight: 700, fontSize: 17 }}>Pulse</span>
          </div>
          <div className="mono" style={{ fontSize: 11, fontWeight: 400, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(194,178,154,0.65)' }}>
            Notes from the Climb · A Pulse Original · {year}
          </div>
          <div style={{ display: 'flex', gap: 18, fontSize: 14, fontWeight: 600 }}>
            <a href="https://www.instagram.com/pulsesocialmedia" style={{ color: 'rgba(236,230,216,0.6)' }}>Instagram</a>
            <a href="https://www.linkedin.com/company/pulse-social-media" style={{ color: 'rgba(236,230,216,0.6)' }}>LinkedIn</a>
          </div>
        </div>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 40px 36px', display: 'flex', justifyContent: 'center', gap: 22, fontSize: 13, fontWeight: 600 }}>
          {LEGAL.map(l => (
            <Link key={l.href} href={l.href} style={{ color: 'rgba(236,230,216,0.5)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', zIndex: 5, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div style={{ maxWidth: 1240, margin: '0 auto', padding: '44px 40px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Image src="/noir/logo-white.png" alt="Pulse" width={34} height={34} />
          <span className="sora" style={{ fontWeight: 700, fontSize: 18 }}>Pulse</span>
        </div>
        <div style={{ display: 'flex', gap: 18, fontSize: 14, color: 'rgba(244,245,247,0.6)', fontWeight: 600 }}>
          <a href="https://www.instagram.com/pulsesocialmedia">Instagram</a>
          <a href="https://www.linkedin.com/company/pulse-social-media">LinkedIn</a>
        </div>
      </div>
      <div style={{ maxWidth: 1240, margin: '24px auto 0', padding: '20px 40px 40px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
        <div style={{ fontSize: 13.5, color: 'rgba(244,245,247,0.5)', fontWeight: 500 }}>
          © {year} Pulse Social Media. Made to be impossible to ignore.
        </div>
        <div style={{ display: 'flex', gap: 22, fontSize: 13.5, fontWeight: 600 }}>
          {LEGAL.map(l => (
            <Link key={l.href} href={l.href} style={{ color: 'rgba(244,245,247,0.55)', textDecoration: 'none' }}>{l.label}</Link>
          ))}
        </div>
      </div>
    </div>
  )
}
