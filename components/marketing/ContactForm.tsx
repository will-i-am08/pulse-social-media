'use client'

import { useState, type FormEvent } from 'react'

const INTENTS = ['Brand Identity', 'Digital Product', 'Growth Strategy', 'Motion Design']

export default function ContactForm() {
  const [selected, setSelected] = useState('Digital Product')
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const formData = new FormData(form)
    formData.set('intent', selected)
    try {
      await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(formData as unknown as Record<string, string>).toString(),
      })
      setSubmitted(true)
    } catch {
      setSubmitted(true)
    }
  }

  if (submitted) {
    return (
      <div className="bg-[#f9f9f9] p-8 md:p-12 rounded-xl text-center py-20" style={{ border: '1px solid rgba(0,0,0,0.08)' }}>
        <span className="material-symbols-outlined text-[#ff5473] text-5xl mb-4 block">check_circle</span>
        <h3 className="text-2xl font-bold text-[#0a0a0a] mb-2">Message Sent</h3>
        <p className="text-[#6b7280]">We&apos;ll get back to you within 4 hours during business hours.</p>
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
              className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
              placeholder="Your Name"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">Email Address</label>
            <input
              name="email"
              required
              className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all"
              style={{ border: '1px solid rgba(0,0,0,0.1)' }}
              onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
              onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
              placeholder="you@company.com"
              type="email"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-[#ff5473] font-bold ml-1">Project Intent</label>
          <input type="hidden" name="intent" value={selected} />
          <div className="flex flex-wrap gap-3">
            {INTENTS.map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelected(intent)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                  selected === intent
                    ? 'bg-[#ff5473] text-white border-[#ff5473]'
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
            className="w-full bg-white rounded-lg p-4 text-[#0a0a0a] placeholder:text-[#9ca3af] outline-none transition-all resize-none"
            style={{ border: '1px solid rgba(0,0,0,0.1)' }}
            onFocus={e => { e.target.style.borderColor = '#ff5473'; e.target.style.boxShadow = '0 0 0 3px rgba(255,84,115,0.1)' }}
            onBlur={e => { e.target.style.borderColor = 'rgba(0,0,0,0.1)'; e.target.style.boxShadow = 'none' }}
            placeholder="Tell us about your project..."
            rows={5}
          />
        </div>
        <button
          className="w-full py-5 rounded-lg font-bold text-lg text-white transition-opacity hover:opacity-90"
          style={{ background: 'linear-gradient(135deg, #ffb2b9 0%, #ff5473 100%)' }}
          type="submit"
        >
          Initialize Connection
        </button>
      </form>
    </div>
  )
}
