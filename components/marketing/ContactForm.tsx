'use client'

import { useState } from 'react'

const INTENTS = ['Brand Identity', 'Digital Product', 'Growth Strategy', 'Motion Design']

export default function ContactForm() {
  const [selected, setSelected] = useState('Digital Product')

  return (
    <div className="glass-form p-8 md:p-12 rounded-xl relative">
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-primary/10 blur-[100px] rounded-full pointer-events-none"></div>
      <form className="space-y-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary font-bold ml-1">Full Name</label>
            <input
              className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-neutral-600 transition-all outline-none"
              placeholder="Your Name"
              type="text"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest text-primary font-bold ml-1">Email Address</label>
            <input
              className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-neutral-600 transition-all outline-none"
              placeholder="you@company.com"
              type="email"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-primary font-bold ml-1">Project Intent</label>
          <div className="flex flex-wrap gap-3">
            {INTENTS.map(intent => (
              <button
                key={intent}
                type="button"
                onClick={() => setSelected(intent)}
                className={`px-5 py-2 rounded-full border text-sm transition-colors ${
                  selected === intent
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant hover:border-primary text-on-surface-variant'
                }`}
              >
                {intent}
              </button>
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest text-primary font-bold ml-1">Message</label>
          <textarea
            className="w-full bg-surface-container-highest border-none rounded-lg p-4 focus:ring-2 focus:ring-primary/40 text-on-surface placeholder:text-neutral-600 transition-all outline-none resize-none"
            placeholder="Tell us about your project..."
            rows={5}
          />
        </div>
        <button
          className="group relative w-full py-5 bg-primary-container text-on-primary-container rounded-lg font-bold text-lg overflow-hidden transition-all hover:shadow-[0_0_20px_rgba(255,84,115,0.4)]"
          type="submit"
        >
          <span className="relative z-10">Initialize Connection</span>
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-container opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
      </form>
    </div>
  )
}
