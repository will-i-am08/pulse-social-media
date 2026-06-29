import type { Metadata } from 'next'
import NoirLegal from '@/components/noir/NoirLegal'

export const metadata: Metadata = {
  title: 'Cookies Policy',
  description: 'The smallest sensible set of cookies to keep this site working. No ad tech, no third-party trackers.',
  alternates: { canonical: '/cookies' },
}

export default function CookiesPage() {
  return (
    <NoirLegal
      eyebrow="Legal · Cookies"
      title={<>Cookies, honestly <em>explained.</em></>}
      intro="We use the smallest sensible set of cookies to keep this site working and to understand what's useful on it. No ad tech, no third-party trackers, no dark patterns."
      updated="29 June 2026"
    >
      <h2 id="what">What are <em>cookies?</em></h2>
      <p>Small text files a website puts on your device so it can remember things between visits — whether you&apos;re signed in, what you last looked at, whether you&apos;ve already dismissed a banner. Some are strictly necessary; others are there to help the site owner understand usage.</p>
      <p>We only set cookies that are either <strong>strictly necessary</strong> to run the site or that are limited to <strong>anonymous, aggregate analytics</strong>.</p>

      <h2 id="which">Which cookies <em>we use</em></h2>
      <table>
        <tbody>
          <tr><th>Cookie</th><th>Category</th><th>Purpose</th><th>Duration</th></tr>
          <tr><td><code>pulse_session</code></td><td className="cat">Necessary</td><td>Keeps you signed into CaptionCraft during a visit.</td><td>Session</td></tr>
          <tr><td><code>pulse_consent</code></td><td className="cat">Necessary</td><td>Remembers your cookie choices.</td><td>12 months</td></tr>
          <tr><td><code>pulse_prefs</code></td><td className="cat">Preferences</td><td>Theme choice and reading progress.</td><td>6 months</td></tr>
          <tr><td><code>pulse_analytics</code></td><td className="cat">Analytics</td><td>Anonymous, aggregate visit data — no personal identifiers.</td><td>30 days</td></tr>
        </tbody>
      </table>
      <p>That&apos;s it. Four cookies. No advertising, cross-site, or fingerprinting cookies on this domain.</p>

      <h2 id="third">Third <em>parties</em></h2>
      <p>Light-touch analytics only, privacy-first. No persistent identifiers, no fingerprinting, no sharing with advertisers.</p>
      <p>Embedded content from YouTube, Vimeo, or social platforms (if any appear on the site) may set their own cookies when loaded — these are lazy-loaded so they don&apos;t run unless you actively engage with the embed.</p>

      <h2 id="browser">Browser <em>controls</em></h2>
      <p>You can clear, block, or be notified about cookies in every modern browser — settings live under Privacy &amp; Security. Blocking strictly-necessary cookies will prevent CaptionCraft from signing you in, but the public site will still work fine.</p>
      <ul>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a></li>
        <li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noreferrer">Firefox</a></li>
        <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
      </ul>

      <h2 id="changes">Changes</h2>
      <p>If we add or remove any cookie, this page gets updated and the &ldquo;last updated&rdquo; date at the top changes. Material changes get flagged in a banner for 30 days.</p>
      <p>Anything unclear? Email <a href="mailto:hello@pulsesocialmedia.com.au">hello@pulsesocialmedia.com.au</a>.</p>
    </NoirLegal>
  )
}
