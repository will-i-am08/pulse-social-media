import Link from 'next/link'
import Image from 'next/image'

export default function MarketingFooter() {
  return (
    <footer className="footer">
      <div className="footer-grid">
        <div className="brand">
          <div className="logo">
            <Image className="mark" src="/marketing/logo-dark.png" alt="Pulse Social Media" width={26} height={26} />
            Pulse Social Media
          </div>
          <p>Founder-led social media management — strategy, community, content and AI tooling, for brands that want to sound like themselves.</p>
        </div>
        <div>
          <h5>Company</h5>
          <ul>
            <li><Link href="/about">About</Link></li>
            <li><Link href="/services">Services</Link></li>
            <li><Link href="/insights">Insights</Link></li>
            <li><Link href="/contact">Contact</Link></li>
          </ul>
        </div>
        <div>
          <h5>Products</h5>
          <ul>
            <li><Link href="/captioncraft">CaptionCraft</Link></li>
            <li><Link href="#">Pulse Analytics</Link></li>
            <li><Link href="#">Blog Engine</Link></li>
            <li><Link href="#">GEO</Link></li>
          </ul>
        </div>
        <div>
          <h5>Legal</h5>
          <ul>
            <li><Link href="/privacy">Privacy</Link></li>
            <li><Link href="/terms">Terms</Link></li>
            <li><Link href="/cookies">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <div className="footer-bottom">
        <div>© Pulse Social Media {new Date().getFullYear()} · Bendigo VIC</div>
        <div>hello@pulsesocialmedia.com.au</div>
        <div>Instagram · LinkedIn</div>
      </div>
    </footer>
  )
}
