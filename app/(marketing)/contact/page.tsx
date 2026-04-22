import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact · Pulse Social Media',
  description: 'Tell me about the brand. Every enquiry comes directly to William — usually same-day, always within two working days.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return <ContactClient />
}
