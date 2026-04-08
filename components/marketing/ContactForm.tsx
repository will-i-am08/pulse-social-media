'use client'

import { useState, type FormEvent } from 'react'

const INTENTS = ['Social Media Management', 'Content Creation', 'CaptionCraft', 'Custom App Build']

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactForm() {
  const [selected, setSelected] = useState('Social Media Management')
  const [status, setStatus] = useState<Status>('idle')

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setStatus('submitting')

    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('intent', selected)

    const name = formData.get('name') as string
    const email = formData.get('email') as string
    const message = formData.get('message') as string

    try {
      // Post to Netlify Forms for dashboard record (fire-and-forget)
      fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      }).catch(() => {})

      // Send auto-reply via API route (reliable, no event trigger needed)
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent: selected, message }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-[#f9f9f9] p-8 md:p-12 rounded-xl text-center py-20" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="material-symbols-outlined text-[#ff5473] text-5xl mb-4 block">check_circle</span>
        <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2">Message Sent</h3>
        <p className="text-[#6b7280]">We&apos;ll get back to you within one business day.</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="bg-[#f9f9f9] p-8 md:p-12 rounded-xl text-center py-20" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="material-symbols-outlined text-[#ff5473] text-5xl mb-4 block">error_outline</span>
        <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2">Something went wrong</h3>
        <p className="text-[#6b7280] mb-6">Your message couldn&apos;t be sent. Please try again or email us directly.</p>
        <button
          onClick={() => setStatus('idle')}
          className="px-6 py-3 rounded-full text-sm font-semibold text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="bg-[#f9f9f9] p-8 md:p-12 rounded-xl" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
      <form name="contact" method="POST" data-netlify="true" onSubmit={handleSubmit} className="space-y-8">
        <input type="hidden" name="form-name" value="contact" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">Full Name</label>
            <input
              name="name"
              required
              type="text"
              placeholder="Your Name"
              className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">Email Address</label>
            <input
              name="email"
              required
              type="email"
              placeholder="you@company.com"
              className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">I&apos;m interested in</label>
          <input type="hidden" name="intent" value={selected} />
          <div className="flex flex-wrap gap-3">
            {INTENTS.map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelected(intent)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selected === intent
                    ? 'bg-[#ff5473] text-white'
                    : 'bg-white text-[#6b7280] hover:border-[#ff5473] hover:text-[#ff5473]'
                }`}
                style={{ border: selected === intent ? '1px solid #ff5473' : '1px solid rgba(0,0,0,0.1)' }}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">Message</label>
          <textarea
            name="message"
            required
            placeholder="Tell us about your brand and what you're looking to achieve..."
            rows={5}
            className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all resize-none"
            style={{ border: '1px solid rgba(0,0,0,0.1)' }}
            onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
          />
        </div>

        <button
          disabled={status === 'submitting'}
          className="w-full py-5 rounded-lg font-bold text-lg text-white transition-opacity hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
          type="submit"
        >
          {status === 'submitting' ? 'Sending…' : 'Send Message'}
        </button>
      </form>
    </div>
  )
}
