import type { Metadata } from 'next'
import NoirContact from '@/components/noir/NoirContact'

export const metadata: Metadata = {
  title: 'Contact — Let’s work out if we’re a fit',
  description: 'Tell us what you need and we’ll point you in the right direction. Founder-led social media studio in Bendigo, Victoria. We reply within one business day.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return <NoirContact />
}
