import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact · Pulse Social Media',
  description: 'Tell us about the brand. Every enquiry comes directly to the team — usually same-day, always within two working days.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return <ContactClient />
}
