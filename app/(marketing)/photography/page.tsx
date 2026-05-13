import type { Metadata } from 'next'
import PhotographyClient from './PhotographyClient'

export const metadata: Metadata = {
  title: 'Bendigo Small Business Photography · $300 Package · Pulse Social Media',
  description: '$300 Bendigo product and small business photography. 2-hour shoot, 20+ edited photos, 48-hour turnaround. Full commercial usage rights included.',
  alternates: { canonical: '/photography' },
  openGraph: {
    title: 'Bendigo Small Business Photography — $300',
    description: '2-hour shoot. 20+ edited photos. Delivered in 48 hours. Built for Bendigo small businesses.',
    url: '/photography',
  },
}

export default function PhotographyPage() {
  return <PhotographyClient />
}
