import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import ParticleGrid from '@/components/marketing/ParticleGrid'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative bg-white text-[#0a0a0a] selection:bg-[#ffb2b9] selection:text-white">
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <ParticleGrid />
      </div>
      <div className="relative" style={{ zIndex: 1 }}>
        <MarketingNav />
        {children}
        <MarketingFooter />
      </div>
    </div>
  )
}
