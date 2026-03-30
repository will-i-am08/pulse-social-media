import Link from 'next/link'
import Image from 'next/image'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export default function MarketingFooter() {
  return (
    <footer className="bg-neutral-950 w-full pt-20 pb-10">
      <AnimateOnScroll variant="fade-up">
        <div className="max-w-7xl mx-auto px-8 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <Link href="/" className="text-xl font-black font-headline tracking-tighter text-[#E6E1E1] flex items-center">
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
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Global Offices'].map(t => (
              <a key={t} className="font-body text-xs uppercase tracking-widest text-neutral-500 hover:text-rose-300 transition-colors cursor-pointer">{t}</a>
            ))}
          </div>
          <div className="text-neutral-600 font-body text-xs uppercase tracking-widest">&copy; 2026 Pulse Digital Agency. All rights reserved.</div>
        </div>
      </AnimateOnScroll>
    </footer>
  )
}
