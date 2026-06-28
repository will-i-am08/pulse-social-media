import type { Metadata } from 'next'
import NoirHome from '@/components/noir/NoirHome'

export const metadata: Metadata = {
  title: 'Pulse Social Media | Rocket Fuel for Small Business',
  description: 'We make small businesses impossible to ignore online. Done-for-you social media content, ads and strategy that gets you found, followed and booked.',
  alternates: { canonical: '/' },
}

export default function HomePage() {
  return <NoirHome />
}
