import type { Metadata } from 'next'
import NoirPlaybook from '@/components/noir/NoirPlaybook'

export const metadata: Metadata = {
  title: 'The Free Playbook — 8 Ways to Look Stupidly Good on Social',
  description: 'Download the free Pulse playbook: the exact 8-step system we use to make our clients’ content look stupidly good, all shot on a phone. No agency, no expensive gear, no fluff.',
  alternates: { canonical: '/playbook' },
}

export default function PlaybookPage() {
  return <NoirPlaybook />
}
