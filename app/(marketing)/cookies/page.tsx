import { Metadata } from 'next'
import AnimateOnScroll from '@/components/marketing/AnimateOnScroll'

export const metadata: Metadata = {
  title: 'Cookie Policy | Pulse Digital Agency',
  description: 'How Pulse Digital uses cookies and similar technologies on our website.',
}

export default function CookiesPage() {
  return (
    <main className="pt-32 pb-20 px-6 max-w-4xl mx-auto">
      <AnimateOnScroll variant="fade-in" delay={0}>
        <h1 className="text-5xl md:text-6xl font-black font-headline tracking-tighter mb-6">Cookie Policy</h1>
        <p className="text-on-surface-variant text-sm uppercase tracking-widest mb-12">Last updated: March 2026</p>
      </AnimateOnScroll>

      <AnimateOnScroll variant="fade-up" delay={0.1}>
        <div className="prose-custom space-y-10 text-on-surface-variant leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">1. What Are Cookies</h2>
            <p>Cookies are small text files stored on your device when you visit a website. They help us remember your preferences and improve your browsing experience.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">2. How We Use Cookies</h2>
            <p>We use cookies for essential site functionality (authentication, session management), analytics (understanding how visitors use our site), and preferences (remembering your settings and choices).</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">3. Types of Cookies</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong className="text-on-surface">Essential cookies:</strong> Required for basic site functionality and authentication.</li>
              <li><strong className="text-on-surface">Analytics cookies:</strong> Help us understand site usage and improve our services.</li>
              <li><strong className="text-on-surface">Preference cookies:</strong> Remember your settings like theme and language.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">4. Managing Cookies</h2>
            <p>You can control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that disabling essential cookies may affect site functionality.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-on-surface mb-3">5. Contact</h2>
            <p>For questions about our cookie practices, contact us at <a href="mailto:hello@pulsedigital.agency" className="text-primary hover:underline">hello@pulsedigital.agency</a>.</p>
          </section>
        </div>
      </AnimateOnScroll>
    </main>
  )
}
