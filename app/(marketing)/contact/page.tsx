import { Metadata } from 'next'
import Image from 'next/image'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import ContactForm from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Us | Pulse Digital Agency',
  description: 'Get in touch with Pulse Digital to discuss your brand, social media strategy, or digital growth project.',
}

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function ContactPage() {
  return (
    <main style={{ background: '#ffffff', color: '#0a0a0a' }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">

      {/* Hero Header */}
      <section className="mb-20 ml-0 md:ml-12 lg:ml-24">
        <AnimateOnScroll variant="fade-in" delay={0}>
          <p className="mono-label text-[#ff5473] mb-6">Let&apos;s Talk</p>
          <h1 className="display-text text-[#0a0a0a] mb-6" style={{ fontSize: 'clamp(48px, 9vw, 96px)' }}>
            Ignite the <br />
            <span style={{ color: '#ff5473' }}>Conversation.</span>
          </h1>
        </AnimateOnScroll>
        <AnimateOnScroll variant="fade-up" delay={0.15}>
          <p className="text-[#6b7280] text-lg md:text-xl max-w-xl leading-relaxed font-light">
            We&apos;d love to hear about your project. Tell us what you&apos;re working on and let&apos;s figure out how we can help your brand grow.
          </p>
        </AnimateOnScroll>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Contact Form */}
        <AnimateOnScroll variant="fade-up" delay={0.1} className="lg:col-span-7">
          <ContactForm />
        </AnimateOnScroll>

        {/* Contact Info */}
        <div className="lg:col-span-5 space-y-6">
          <AnimateOnScroll variant="fade-up" delay={0.2}>
            <div className="bg-[#f9f9f9] p-6 rounded-lg" style={{ border: DIVIDER }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#fff0f2] text-[#ff5473]">
                  <span className="material-symbols-outlined">location_on</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0a0a0a] text-lg">Our Office</h4>
                  <p className="text-[#6b7280] text-sm leading-relaxed mt-1">
                    888 Volcanic Avenue, Level 42<br />
                    Singapore 018989
                  </p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.3}>
            <div className="bg-[#f9f9f9] p-6 rounded-lg" style={{ border: DIVIDER }}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#fff0f2] text-[#ff5473]">
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0a0a0a] text-lg">Get In Touch</h4>
                  <p className="text-[#6b7280] text-sm mt-1">hello@pulsedigital.agency</p>
                  <p className="text-[#6b7280] text-sm">+65 8293 0011</p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.4}>
            <div className="bg-[#f9f9f9] p-6 rounded-lg" style={{ border: DIVIDER }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#ff5473] animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff5473]">Response Time</span>
              </div>
              <p className="text-[#6b7280] text-sm italic">
                We typically respond within 4 hours during business hours. We look forward to hearing from you.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.5}>
            <div className="h-[280px] w-full rounded-lg overflow-hidden grayscale contrast-[1.1] hover:grayscale-0 transition-all duration-700 relative">
              <Image
                src="https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=800&q=80"
                alt="Map of Singapore central business district"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 42vw"
              />
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </main>
  )
}
