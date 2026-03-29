import type { PostStatus } from './types'

export function uid(): string {
  return crypto.randomUUID()
}

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  const d = new Date(iso)
  return (
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
    ' ' +
    d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  )
}

export function statusBadgeClass(status: PostStatus | string): string {
  const map: Record<string, string> = {
    draft: 'bd-draft',
    submitted: 'bd-sub',
    approved: 'bd-app',
    scheduled: 'bd-sched',
    published: 'bd-pub',
  }
  return map[status] || 'bd-gray'
}

export function bufferServiceIcon(service: string): string {
  const icons: Record<string, string> = {
    instagram: '📸',
    facebook: '📘',
    twitter: '𝕏',
    linkedin: '💼',
    tiktok: '🎵',
    pinterest: '📌',
    youtube: '🎬',
    other: '🔗',
  }
  return icons[service] || '🔗'
}
