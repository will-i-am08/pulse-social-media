import Link from 'next/link'
import Image from 'next/image'

export default function MarketingFooter() {
  return (
    <footer className="bg-white border-t border-black/5 w-full pt-20 pb-10">
      <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex flex-col items-center md:items-start gap-4">
          <Link href="/" className="text-xl font-black font-headline tracking-tighter text-[#0a0a0a] flex items-center">
            <Image
              src="/logo.png"
              alt="Pulse Digital Logo"
              width={24}
              height={24}
              className="w-6 h-6 inline-block mr-2 mb-1"
              sizes="24px"
            />
            Pulse
          </Link>
          <p className="font-body text-xs uppercase tracking-widest text-rose-500 font-bold">Your Social Media Partner.</p>
        </div>
        <div className="flex flex-wrap justify-center gap-8">
          {[
            { label: 'Privacy Policy', href: '/privacy' },
            { label: 'Terms of Service', href: '/terms' },
            { label: 'Cookie Settings', href: '/cookies' },
            { label: 'Contact', href: '/contact' },
          ].map(({ label, href }) => (
            <Link key={label} href={href} className="font-body text-xs uppercase tracking-widest text-neutral-400 hover:text-[#ff5473] transition-colors">
              {label}
            </Link>
          ))}
        </div>
        <div className="text-neutral-400 font-body text-xs uppercase tracking-widest">&copy; 2026 Pulse Digital Agency. All rights reserved.</div>
      </div>
    </footer>
  )
}
