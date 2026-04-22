import { Metadata } from 'next'
import CookiesClient from './CookiesClient'

export const metadata: Metadata = {
  title: 'Cookies · Pulse Social Media',
  description: 'I use the smallest sensible set of cookies to keep this site working. No ad tech, no third-party trackers, no dark patterns.',
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return <CookiesClient />
}
