import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact · Pulse Social Media',
  description: 'Tell us about the brand. Every enquiry comes directly to the team and we reply within 1–2 business days.',
  alternates: { canonical: '/contact' },
}

export default function ContactPage() {
  return <ContactClient />
}
