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
        <span className="material-symbols-outlined text-primary">check_circle</span>
        <span className="text-on-surface font-medium">You&apos;re subscribed! See you Tuesday.</span>
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
        className="bg-surface-container border-none rounded px-6 py-4 flex-grow focus:ring-1 focus:ring-primary text-on-surface placeholder:text-outline transition-all outline-none"
        placeholder="Your email address"
      />
      <button
        type="submit"
        className="bg-primary-container text-on-primary-container px-10 py-4 rounded font-bold uppercase tracking-widest text-sm hover:shadow-[0_0_20px_rgba(255,84,115,0.4)] transition-all"
      >
        Subscribe
      </button>
    </form>
  )
}
