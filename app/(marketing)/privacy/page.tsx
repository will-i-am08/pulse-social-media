import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Privacy Policy | Pulse Digital Agency',
  description: 'How Pulse Digital collects, uses, and protects your personal information.',
}

export default function PrivacyPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <AnimateOnScroll variant="fade-in" delay={0}>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter mb-6">Privacy Policy</h1>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-12">Last updated: March 2026</p>
      </AnimateOnScroll>

      <AnimateOnScroll variant="fade-up" delay={0.1}>
        <div className="prose-custom space-y-10 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. Information We Collect</h2>
            <p>We collect information you provide directly, such as your name, email address, and message content when you use our contact forms or subscribe to our newsletter. We also collect standard usage data through cookies and analytics to improve our services.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. How We Use Your Information</h2>
            <p>We use the information we collect to respond to your enquiries, send newsletter updates you have opted into, improve our website and services, and communicate with you about our products and offerings.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Data Sharing</h2>
            <p>We do not sell, rent, or share your personal information with third parties for marketing purposes. We may share data with service providers who assist us in operating our website and delivering our services, subject to confidentiality agreements.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Data Security</h2>
            <p>We implement industry-standard security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Your Rights</h2>
            <p>You have the right to access, correct, or delete your personal data. You may opt out of marketing communications at any time by using the unsubscribe link in our emails or by contacting us directly.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">6. Contact</h2>
            <p>If you have questions about this privacy policy, please contact us at <a href="mailto:hello@pulsedigital.agency" className="text-primary hover:underline">hello@pulsedigital.agency</a>.</p>
          </section>
        </div>
      </AnimateOnScroll>
    </main>
  )
}
