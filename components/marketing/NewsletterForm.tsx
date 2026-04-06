'use client'

import { useState, type FormEvent } from 'react'

export default function NewsletterForm() {
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    try {
      await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      })
    } finally {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="flex items-center gap-3 py-4">
        <span className="material-symbols-outlined text-[#ff5473]">check_circle</span>
        <span className="text-[#0a0a0a] font-medium">You&apos;re subscribed! See you Tuesday.</span>
      </div>
    )
  }

  return (
    <form name="newsletter" method="POST" data-netlify="true" onSubmit={handleSubmit} className="flex flex-col md:flex-row gap-4">
      <input type="hidden" name="form-name" value="newsletter" />
      <input
        name="email"
        required
        type="email"
        className="bg-white flex-grow px-6 py-4 rounded-lg text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all"
        style={{ border: '1px solid rgba(0,0,0,0.1)' }}
        onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
        onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
        placeholder="Your email address"
      />
      <button
        type="submit"
        className="px-10 py-4 rounded-lg font-bold uppercase tracking-widest text-sm text-white transition-opacity hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
      >
        Subscribe
      </button>
    </form>
  )
}
