import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white text-[#0a0a0a] selection:bg-[#ffb2b9] selection:text-white">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  )
}
