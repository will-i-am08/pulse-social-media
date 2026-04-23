import { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'Terms · Pulse Social Media',
  description: 'The rules of the road for using pulsesocialmedia.com.au and CaptionCraft.',
  alternates: { canonical: '/terms' },
}

const NAV = [
  { id: 'accept', label: 'Accepting these terms' },
  { id: 'account', label: 'Accounts' },
  { id: 'use', label: 'Acceptable use' },
  { id: 'ip', label: 'IP & ownership' },
  { id: 'ai', label: 'AI-generated content' },
  { id: 'billing', label: 'Billing' },
  { id: 'cancel', label: 'Cancellation' },
  { id: 'warranty', label: 'Warranty' },
  { id: 'liability', label: 'Liability' },
  { id: 'law', label: 'Governing law' },
  { id: 'changes', label: 'Changes' },
]

export default function TermsPage() {
  return (
    <LegalShell
      eyebrow="Legal · Terms"
      title={<>Terms of<br /><em>service.</em></>}
      intro="The rules of the road for using pulsesocialmedia.com.au and CaptionCraft. Short, plain, and written so you can actually read them."
      updated="12 April 2026"
      nav={NAV}
    >
      <h2 id="accept">Accepting these <em>terms</em></h2>
      <p>By using pulsesocialmedia.com.au, CaptionCraft, or engaging Pulse Social Media (ABN 24 459 717 280) for services, you&apos;re agreeing to these terms. If you&apos;re doing so on behalf of a company, you&apos;re confirming you have the authority to bind that company.</p>
      <p>If any of these terms are unacceptable, don&apos;t use the service. We&apos;d rather you didn&apos;t than you used it under protest.</p>

      <h2 id="account">Your <em>account</em></h2>
      <ul>
        <li>You&apos;re responsible for keeping your login credentials secure.</li>
        <li>One human per seat. Shared logins are not allowed on team plans.</li>
        <li>Tell us promptly if you suspect unauthorised access.</li>
        <li>You must be 16 or older. Pulse doesn&apos;t serve minors.</li>
      </ul>

      <h2 id="use">Acceptable <em>use</em></h2>
      <p>You agree not to use these services to:</p>
      <ul>
        <li>Break the law, or help anyone else break it.</li>
        <li>Harass, defame, or threaten other people.</li>
        <li>Generate content that&apos;s deceptive, fraudulent, or impersonates real individuals without their consent.</li>
        <li>Build tooling that competes with Pulse by scraping the interface.</li>
        <li>Push obvious spam or bulk unsolicited outreach through CaptionCraft.</li>
      </ul>
      <p>We reserve the right to suspend any account that does any of the above. We&apos;ll tell you why, and give you a chance to fix it where we can.</p>

      <h2 id="ip">Intellectual <em>property</em></h2>
      <p><strong>Your stuff stays yours.</strong> Brand guidelines, voice profiles, drafts, scheduled posts — all owned by you. We have a non-exclusive licence to process them solely to deliver the service.</p>
      <p><strong>Our stuff stays ours.</strong> The Pulse wordmark, the CaptionCraft application, the tuning methodology, templates and writing — all owned by Pulse Social Media, licensed to you for internal use only.</p>
      <p>Work product produced under a service engagement (social posts, strategy decks, creative assets) transfers to you on payment of the final invoice.</p>

      <h2 id="ai">AI-generated <em>content</em></h2>
      <div className="note"><b>Important</b>CaptionCraft helps you write. You&apos;re still the publisher. You are responsible for reviewing, approving, and factually checking every piece of output before it goes live.</div>
      <p>AI outputs can be wrong, biased, or accidentally match something someone else wrote. We don&apos;t warrant factual accuracy or uniqueness of generated content. Treat every draft as a draft.</p>

      <h2 id="billing">Billing</h2>
      <ul>
        <li>Service fees are billed monthly or annually in advance.</li>
        <li>Prices are in AUD unless your contract says otherwise. GST applies where applicable.</li>
        <li>Unpaid invoices after 14 days accrue 1.5% interest per month. Accounts 30+ days overdue may be suspended.</li>
        <li>All fees are non-refundable except as required by Australian Consumer Law.</li>
      </ul>

      <h2 id="cancel">Cancellation</h2>
      <p>Month-to-month plans cancel at the end of the current billing period. Annual plans cancel at renewal; pro-rata refunds are not standard, but we&apos;ll talk about edge cases. Service retainers have 30 days&apos; notice either way.</p>

      <h2 id="warranty">Warranty <em>&amp; disclaimer</em></h2>
      <p>We provide services with reasonable care and skill. We don&apos;t warrant that results (engagement, revenue, growth) will match any specific benchmark — social media is not that kind of contract.</p>
      <p>To the extent permitted by law, services are provided &ldquo;as is&rdquo;. Nothing in these terms excludes your rights under the Australian Consumer Law.</p>

      <h2 id="liability">Liability</h2>
      <p>To the maximum extent permitted by law, Pulse Social Media&apos;s aggregate liability for any claim arising from these terms is limited to the fees you paid in the 12 months preceding the claim. No liability for indirect, consequential, or incidental damages.</p>

      <h2 id="law">Governing <em>law</em></h2>
      <p>These terms are governed by the laws of Victoria, Australia. Disputes go to the courts of Victoria — though we&apos;ll always try mediation first.</p>

      <h2 id="changes">Changes</h2>
      <p>We may update these terms. Material changes get 30 days&apos; notice by email. Continued use after that counts as acceptance.</p>

      <div className="note"><b>Questions?</b><a href="mailto:hello@pulsesocialmedia.com.au">hello@pulsesocialmedia.com.au</a> — a real human, not a ticket queue.</div>
    </LegalShell>
  )
}
