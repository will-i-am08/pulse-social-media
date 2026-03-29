import MarketingNav from '@/components/marketing/MarketingNav'
import MarketingFooter from '@/components/marketing/MarketingFooter'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface text-on-surface selection:bg-primary-container selection:text-on-primary-container">
      <MarketingNav />
      {children}
      <MarketingFooter />
    </div>
  )
}
