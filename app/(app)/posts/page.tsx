import { redirect } from 'next/navigation'

/**
 * /posts is superseded by the status-scoped views (Queue, Drafts, Approvals, Sent).
 * Redirecting to the Queue — the post-scheduled timeline — which is the closest match
 * to the previous "all posts" list.
 */
export default function PostsRedirect() {
  redirect('/queue')
}
