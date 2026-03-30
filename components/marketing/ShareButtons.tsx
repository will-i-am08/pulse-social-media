'use client'

import { useState } from 'react'

interface Props {
  title: string
  slug: string
}

export default function ShareButtons({ title, slug }: Props) {
  const [copied, setCopied] = useState(false)
  const url = typeof window !== 'undefined' ? `${window.location.origin}/blog/${slug}` : `/blog/${slug}`

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      const input = document.createElement('input')
      input.value = url
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      document.body.removeChild(input)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title, url })
      } catch {
        // user cancelled
      }
    }
  }

  const hasNativeShare = typeof navigator !== 'undefined' && !!navigator.share

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={copyLink}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20 text-sm text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
      >
        <span className="material-symbols-outlined text-base">
          {copied ? 'check' : 'link'}
        </span>
        {copied ? 'Copied!' : 'Copy link'}
      </button>
      {hasNativeShare && (
        <button
          onClick={nativeShare}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container border border-outline-variant/20 text-sm text-on-surface-variant hover:border-primary/30 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-base">share</span>
          Share
        </button>
      )}
    </div>
  )
}
