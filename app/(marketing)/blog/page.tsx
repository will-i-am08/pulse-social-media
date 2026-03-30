import { getPublishedPosts } from '@/lib/blog'
import BlogListClient from './BlogListClient'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog | Pulse Digital Agency',
  description: 'Insights, guides, and industry intelligence from Pulse Digital — your partner in digital strategy, AI, and creative growth.',
}

export const revalidate = 60

export default async function BlogPage() {
  const posts = await getPublishedPosts()

  return <BlogListClient posts={posts} />
}
