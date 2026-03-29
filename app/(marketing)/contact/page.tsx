'use client'

import { useState } from 'react'
import Image from 'next/image'

const INTENTS = ['Brand Identity', 'Digital Product', 'Growth Strategy', 'Motion Design']

export default function ContactPage() {
  const [selected, setSelected] = useState('Digital Product')

  return (
    <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">
      {/* Hero Header */}
      <section className="mb-20 ml-0 md:ml-12 lg:ml-24">
        <h1 className="text-6xl md:text-8xl font-black font-headline tracking-tighter leading-none mb-6">
          Ignite the <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container">Conversation.</span>
        </h1>
        <p className="text-on-surface-variant text-lg md:text-xl max-w-xl leading-relaxed">
          We don&apos;t just build digital products; we generate heat. Let&apos;s discuss how your brand can become the next emissary of the digital pulse.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <div className="lg:col-span-7">
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
                  placeholder="Tell us about the pulse you want to create..."
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
        </div>

        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-8">
          <div className="grid grid-cols-1 gap-6">
            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-secondary-container text-primary">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">Global Nexus</h4>
                  <p className="text-on-surface-variant text-sm leading-relaxed mt-1">
                    888 Volcanic Avenue, Level 42<br />
                    Singapore 018989
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg group hover:bg-surface-container transition-colors">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-secondary-container text-primary">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <div>
                  <h4 className="font-bold text-on-surface text-lg">Direct Frequency</h4>
                  <p className="text-on-surface-variant text-sm mt-1">hello@pulsedigital.agency</p>
                  <p className="text-on-surface-variant text-sm">+65 8293 0011</p>
                </div>
              </div>
            </div>
            <div className="bg-surface-container-low p-6 rounded-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-primary">Live Operations</span>
              </div>
              <p className="text-on-surface-variant text-sm italic">
                Currently responding to pulses within 4 hours. Our sensors are active and awaiting your signal.
              </p>
            </div>
          </div>
          <div className="h-[300px] w-full rounded-lg overflow-hidden grayscale contrast-[1.2] brightness-[0.8] hover:grayscale-0 transition-all duration-700 relative group">
            <div className="absolute inset-0 bg-primary/10 pointer-events-none z-10 group-hover:bg-transparent transition-colors"></div>
            <Image
              src="https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80"
              alt="Map of Singapore central business district"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
      </div>
    </main>
  )
}
