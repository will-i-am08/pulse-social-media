import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'
import './marketing.css'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="pulse-marketing">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  )
}
