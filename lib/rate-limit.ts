/**
 * Minimal in-memory sliding-window rate limiter for public API routes.
 *
 * Per-instance only — serverless deployments run many instances, so treat
 * the limits as "per instance, best effort" and set them accordingly tight.
 * Good enough to stop casual abuse of unauthenticated endpoints; swap for
 * Upstash/Redis if real distributed limiting is ever needed.
 */

import type { NextRequest } from 'next/server'

interface Bucket {
  timestamps: number[]
}

const buckets = new Map<string, Bucket>()

// Cap total tracked keys so a spray of unique IPs can't grow memory unbounded
const MAX_KEYS = 5_000

function prune(now: number, windowMs: number) {
  if (buckets.size < MAX_KEYS) return
  for (const [key, bucket] of buckets) {
    bucket.timestamps = bucket.timestamps.filter(t => now - t < windowMs)
    if (bucket.timestamps.length === 0) buckets.delete(key)
  }
}

/**
 * Returns true if the call is allowed, false if the limit is exhausted.
 * `key` should namespace the route + caller, e.g. `contact:1.2.3.4`.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now()
  prune(now, windowMs)

  const bucket = buckets.get(key) ?? { timestamps: [] }
  bucket.timestamps = bucket.timestamps.filter(t => now - t < windowMs)

  if (bucket.timestamps.length >= limit) {
    buckets.set(key, bucket)
    return false
  }

  bucket.timestamps.push(now)
  buckets.set(key, bucket)
  return true
}

/** Best-effort client IP for rate-limit keys (Netlify/Vercel set x-forwarded-for). */
export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for')
  if (fwd) return fwd.split(',')[0].trim()
  return req.headers.get('x-real-ip') ?? 'unknown'
}

/** Escape user-supplied text before interpolating into HTML emails. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
