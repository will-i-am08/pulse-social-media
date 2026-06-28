import type { Metadata } from 'next'
import NoirPodcast from '@/components/noir/NoirPodcast'

export const metadata: Metadata = {
  title: 'Notes from the Climb — A Pulse Original Podcast',
  description: 'A podcast about the long ascent: the doubt, the foothold, and the view that makes it worth the weight. Honest conversations with founders, makers and quiet operators. Join the waitlist.',
  alternates: { canonical: '/podcast' },
}

export default function PodcastPage() {
  return <NoirPodcast />
}
