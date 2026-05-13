import type { Metadata } from 'next'
import ContactClient from './ContactClient'

export const metadata: Metadata = {
  title: 'Contact · Let’s work out if we’re a fit · Pulse Social Media',
  description: 'Tell us what you need and we’ll point you in the right direction — social media management, photography, one-off projects, or a chat. We reply within one business day.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contact Pulse Social Media · Bendigo',
    description: 'Tell us what you need and we’ll point you in the right direction — even if that’s not us.',
    url: '/contact',
  },
}

export default function ContactPage() {
  return <ContactClient />
}
