import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Terms of Service | Pulse Digital Agency',
  description: 'Terms and conditions governing the use of Pulse Digital services and website.',
}

export default function TermsPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <AnimateOnScroll variant="fade-in" delay={0}>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter mb-6">Terms of Service</h1>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-12">Last updated: March 2026</p>
      </AnimateOnScroll>

      <AnimateOnScroll variant="fade-up" delay={0.1}>
        <div className="prose-custom space-y-10 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Acceptance of Terms</h2>
            <p>By accessing and using the Pulse Digital website and services, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. Services</h2>
            <p>Pulse Digital provides social media management, content creation, AI-powered marketing tools, and related digital agency services. The specific scope of services will be outlined in individual client agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Intellectual Property</h2>
            <p>All content, designs, and materials on this website are the property of Pulse Digital Agency unless otherwise stated. Client-created content remains the property of the respective client.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. User Responsibilities</h2>
            <p>Users agree to provide accurate information, use our services in compliance with applicable laws, and not attempt to disrupt or compromise the security of our platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Limitation of Liability</h2>
            <p>Pulse Digital shall not be liable for any indirect, incidental, or consequential damages arising from the use of our services. Our total liability shall not exceed the amount paid by you for the specific service in question.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Changes to Terms</h2>
            <p>We reserve the right to modify these terms at any time. Continued use of our services after changes constitutes acceptance of the updated terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">7. Contact</h2>
            <p>For questions about these terms, contact us at <a href="mailto:hello@pulsedigital.agency" className="text-primary hover:underline">hello@pulsedigital.agency</a>.</p>
          </section>
        </div>
      </AnimateOnScroll>
    </main>
  )
}
