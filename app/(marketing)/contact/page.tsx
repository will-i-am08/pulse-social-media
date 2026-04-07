import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'
import ContactForm from '@/components/marketing/ContactForm'

export const metadata: Metadata = {
  title: 'Contact Pulse Digital Agency | Get in Touch',
  description: 'Get in touch with Pulse Digital to discuss your brand, social media strategy, or digital growth project. We\'d love to hear from you.',
  keywords: ['contact pulse digital', 'social media agency contact', 'hire social media agency', 'digital marketing enquiry'],
  openGraph: {
    title: 'Contact Pulse Digital Agency',
    description: 'Get in touch to discuss your brand, social media strategy, or digital growth project.',
    url: '/contact',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Contact Pulse Digital' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Pulse Digital Agency',
    description: 'Get in touch to discuss your brand, social media strategy, or digital growth project.',
    images: ['/og-image.png'],
  },
  alternates: { canonical: '/contact' },
}

const DIVIDER = '1px solid rgba(0,0,0,0.08)'

export default function ContactPage() {
  return (
    <main style={{ color: '#0a0a0a' }} className="pt-32 pb-20 px-6 max-w-7xl mx-auto overflow-hidden">

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
                  <span className="material-symbols-outlined">alternate_email</span>
                </div>
                <div>
                  <h4 className="font-bold text-[#0a0a0a] text-lg">Email Us</h4>
                  <p className="text-[#6b7280] text-sm mt-1">hello@pulsesocialmedia.com.au</p>
                </div>
              </div>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.3}>
            <div className="bg-[#f9f9f9] p-6 rounded-lg" style={{ border: DIVIDER }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2 h-2 rounded-full bg-[#ff5473] animate-pulse"></div>
                <span className="text-xs font-bold uppercase tracking-widest text-[#ff5473]">Response Time</span>
              </div>
              <p className="text-[#6b7280] text-sm italic">
                We typically respond within one business day. We look forward to hearing about your brand.
              </p>
            </div>
          </AnimateOnScroll>

          <AnimateOnScroll variant="fade-up" delay={0.4}>
            <div className="bg-[#f9f9f9] p-8 rounded-lg" style={{ border: DIVIDER }}>
              <p className="mono-label text-[#9ca3af] mb-4">What happens next</p>
              <div className="space-y-4">
                {[
                  { step: '01', text: 'We review your enquiry and learn about your brand' },
                  { step: '02', text: 'We reach out to schedule a free discovery call' },
                  { step: '03', text: 'We put together a tailored social media strategy' },
                ].map((item) => (
                  <div key={item.step} className="flex items-start gap-4">
                    <span className="text-[#ff5473] font-black text-sm">{item.step}</span>
                    <p className="text-[#6b7280] text-sm leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </AnimateOnScroll>
        </div>
      </div>
    </main>
  )
}
