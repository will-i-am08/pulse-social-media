import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact · Talk to a Bendigo Social Media Agency',
  description: 'Get in touch with Pulse Social Media, a Bendigo social media management agency. Book a discovery call or run a free social media audit — we reply within 1–2 business days.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Pulse Social Media · Bendigo',
    description: 'Book a discovery call with a Bendigo social media management agency, or run a free social media audit.',
    url: '/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
