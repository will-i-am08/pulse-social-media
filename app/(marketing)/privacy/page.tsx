import { Metadata } from 'next'
import LegalShell from '@/components/marketing/LegalShell'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'We collect the least we can. We store it for the shortest time we can. We never sell it.',
  alternates: { canonical: '/privacy' },
}

const NAV = [
  { id: 'who', label: 'Who we are' },
  { id: 'what', label: 'What we collect' },
  { id: 'why', label: 'Why we collect it' },
  { id: 'share', label: 'Who we share with' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'retention', label: 'Retention' },
  { id: 'rights', label: 'Your rights' },
  { id: 'intl', label: 'International' },
  { id: 'kids', label: 'Kids' },
  { id: 'changes', label: 'Changes' },
  { id: 'contact', label: 'Contact' },
]

export default function PrivacyPage() {
  return (
    <LegalShell
      eyebrow="Legal · Policy"
      title={<>Privacy<br /><em>policy.</em></>}
      intro="We collect the least we can. We store it for the shortest time we can. We never sell it. This page explains the specifics — without the legalese fog."
      updated="12 April 2026"
      nav={NAV}
    >
      <h2 id="who">Who <em>we are</em></h2>
      <p>&ldquo;Pulse&rdquo; refers to <strong>Pulse Social Media</strong> (ABN 24 459 717 280), operating in Bendigo, Victoria, Australia. &ldquo;We&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo; all refer to the same entity.</p>
      <p>This policy covers pulsesocialmedia.com.au, the CaptionCraft web app, and any data you share with us through forms, emails or working engagements.</p>

      <h2 id="what">What we <em>collect</em></h2>
      <p>Broadly, three buckets.</p>
      <ul>
        <li><strong>Identity &amp; contact</strong> — name, company, email, phone, job title. You give us this when you fill a form or sign a contract.</li>
        <li><strong>Project data</strong> — anything you share so we can do the work. Brand guidelines, social copy, campaign briefs, access tokens for platforms you ask us to manage.</li>
        <li><strong>Usage data</strong> — pages visited on this site, device type, coarse region. Collected through cookies and aggregated analytics.</li>
      </ul>
      <div className="note"><b>In plain English</b>We don&apos;t want your data. We want to make your content better. Everything we keep, we keep because we need it to do the work.</div>

      <h2 id="why">Why we <em>collect</em> it</h2>
      <ul>
        <li>To deliver the services you&apos;ve engaged us for.</li>
        <li>To respond to enquiries and quote new work.</li>
        <li>To run this website and understand what&apos;s useful on it.</li>
        <li>To meet legal and tax obligations.</li>
        <li>Occasionally, to share something we think you&apos;ll find interesting — only if you&apos;ve opted in.</li>
      </ul>

      <h2 id="share">Who we <em>share</em> with</h2>
      <p>A short list of vetted sub-processors, all under their standard data-processing agreements:</p>
      <ul>
        <li><strong>Google Workspace</strong> — email, docs, calendar</li>
        <li><strong>Notion</strong> — project docs and engines</li>
        <li><strong>Supabase</strong> — product database and auth</li>
        <li><strong>Netlify</strong> — hosting and build infrastructure</li>
        <li><strong>Stripe</strong> — invoicing and card payments</li>
        <li><strong>Anthropic &amp; OpenAI</strong> — model providers for CaptionCraft, with zero-retention settings</li>
      </ul>
      <p>We never sell data, and we never share it with advertisers.</p>

      <h2 id="cookies">Cookies &amp; <em>tracking</em></h2>
      <p>This site uses a handful of strictly-necessary cookies and minimal analytics. Details live in the <a href="/cookies">Cookies policy</a>.</p>

      <h2 id="retention">How long we <em>keep it</em></h2>
      <ul>
        <li><strong>Enquiry forms</strong> — 12 months from last contact, then deleted.</li>
        <li><strong>Active client data</strong> — for the term of the engagement, plus 6 months.</li>
        <li><strong>Financial records</strong> — 7 years, because the ATO says so.</li>
        <li><strong>CaptionCraft drafts</strong> — hard-deleted 30 days after you delete them in-app.</li>
      </ul>

      <h2 id="rights">Your <em>rights</em></h2>
      <p>Under Australian Privacy Principles and (where applicable) GDPR and CCPA, you have the right to:</p>
      <ul>
        <li>Ask what we hold on you.</li>
        <li>Correct anything wrong.</li>
        <li>Ask us to delete it (subject to legal obligations to keep some things).</li>
        <li>Withdraw consent for anything you opted into, at any time.</li>
        <li>Complain to the Office of the Australian Information Commissioner — though we&apos;d prefer you complain to us first.</li>
      </ul>

      <h2 id="intl">International <em>transfers</em></h2>
      <p>Some of our sub-processors store data in the US and EU. Where personal data is transferred outside Australia, we rely on Standard Contractual Clauses or equivalent safeguards.</p>

      <h2 id="kids">Kids</h2>
      <p>Pulse&apos;s services aren&apos;t aimed at anyone under 16. If you think we&apos;ve accidentally collected data about a child, email us and we&apos;ll delete it.</p>

      <h2 id="changes">Changes to <em>this policy</em></h2>
      <p>We&apos;ll post the updated date at the top and, for anything material, email the primary contact on every active engagement at least 14 days before the change takes effect.</p>

      <h2 id="contact">Contact <em>us</em></h2>
      <p>Privacy questions, access requests, or complaints: <a href="mailto:hello@pulsesocialmedia.com.au">hello@pulsesocialmedia.com.au</a>. Pulse Social Media is based in Bendigo, Victoria, Australia.</p>
      <div className="note"><b>TL;DR</b>Your data stays small, stays ours (not anyone else&apos;s), and goes away when you ask it to. Email hello@pulsesocialmedia.com.au for anything.</div>
    </LegalShell>
  )
}
