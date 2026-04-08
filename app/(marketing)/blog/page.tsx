import { redirect } from 'next/navigation'

// /blog is an alias for /insights — the actual blog list lives there.
// Permanent redirect so any existing inbound links keep working.
export default function BlogPage() {
  redirect('/insights')
}
