'use client'

import { useState } from 'react'
import LegalShell from '@/components/marketing/LegalShell'

const NAV = [
  { id: 'what', label: 'What are cookies' },
  { id: 'prefs', label: 'Your preferences' },
  { id: 'which', label: 'Which cookies we use' },
  { id: 'third', label: 'Third parties' },
  { id: 'browser', label: 'Browser controls' },
  { id: 'changes', label: 'Changes' },
]

export default function CookiesClient() {
  const [analytics, setAnalytics] = useState(true)
  const [prefs, setPrefs] = useState(true)

  return (
    <LegalShell
      eyebrow="Legal · Cookies"
      title={<>Cookies,<br />honestly <em>explained.</em></>}
      intro="We use the smallest sensible set of cookies to keep this site working and to understand what's useful on it. No ad tech, no third-party trackers, no dark patterns."
      updated="12 April 2026"
      nav={NAV}
    >
      <h2 id="what">What are <em>cookies?</em></h2>
      <p>Small text files a website puts on your device so it can remember things between visits — whether you&apos;re signed in, what you last looked at, whether you&apos;ve already dismissed a banner. Some are strictly necessary; others are there to help the site owner understand usage.</p>
      <p>We only set cookies that are either <strong>strictly necessary</strong> to run the site or that you&apos;ve <strong>explicitly consented to</strong> via the preferences panel below.</p>

      <h2 id="prefs">Your <em>preferences</em></h2>
      <div className="pref-card">
        <h3>Manage cookie preferences</h3>
        <p>Changes apply immediately and persist on this device only.</p>
        <div className="pref-row">
          <div className="pl"><span className="pn">Strictly necessary</span><span className="pd">Session state, security, and consent memory. Cannot be disabled.</span></div>
          <button className="sw locked" aria-label="Always on" />
        </div>
        <div className="pref-row">
          <div className="pl"><span className="pn">Analytics</span><span className="pd">Plausible — aggregate, anonymous, no personal identifiers.</span></div>
          <button className={`sw ${analytics ? 'on' : ''}`} onClick={() => setAnalytics(v => !v)} aria-label="Toggle analytics" />
        </div>
        <div className="pref-row">
          <div className="pl"><span className="pn">Preferences</span><span className="pd">Remembers tweaks panel state, theme, reading position.</span></div>
          <button className={`sw ${prefs ? 'on' : ''}`} onClick={() => setPrefs(v => !v)} aria-label="Toggle preferences" />
        </div>
        <div className="pref-row">
          <div className="pl"><span className="pn">Marketing</span><span className="pd">We don&apos;t use any. Left here for completeness.</span></div>
          <button className="sw" style={{ opacity: 0.5, cursor: 'not-allowed' }} disabled aria-label="Disabled" />
        </div>
        <div className="pref-actions">
          <button className="btn-pill btn-ink" style={{ padding: '12px 20px', fontSize: 13 }}>Save preferences</button>
          <button
            className="btn-pill"
            style={{ padding: '12px 20px', fontSize: 13, background: 'transparent', color: 'var(--ink)', border: '1px solid var(--hair)' }}
            onClick={() => { setAnalytics(false); setPrefs(false) }}
          >
            Reject non-essential
          </button>
        </div>
      </div>

      <h2 id="which">Which cookies <em>we use</em></h2>
      <table className="ctable">
        <tbody>
          <tr><th>Cookie</th><th>Category</th><th>Purpose</th><th>Duration</th></tr>
          <tr><td><code>pulse_session</code></td><td className="cat">Necessary</td><td>Keeps you signed into CaptionCraft during a visit.</td><td>Session</td></tr>
          <tr><td><code>pulse_consent</code></td><td className="cat">Necessary</td><td>Remembers your cookie choices on this page.</td><td>12 months</td></tr>
          <tr><td><code>pulse_prefs</code></td><td className="cat">Preferences</td><td>Tweaks panel state, theme choice, reading progress.</td><td>6 months</td></tr>
          <tr><td><code>pulse_analytics</code></td><td className="cat">Analytics</td><td>Anonymous, aggregate visit data — no personal identifiers.</td><td>30 days</td></tr>
        </tbody>
      </table>
      <p>That&apos;s it. Four cookies. No advertising, cross-site, or fingerprinting cookies on this domain.</p>

      <h2 id="third">Third <em>parties</em></h2>
      <p>Light-touch analytics only, privacy-first. No persistent identifiers, no fingerprinting, no sharing with advertisers.</p>
      <p>Embedded content from YouTube, Vimeo, or social platforms (if any appear on articles) may set their own cookies when loaded — these are lazy-loaded so they don&apos;t run unless you actively engage with the embed.</p>

      <h2 id="browser">Browser <em>controls</em></h2>
      <p>You can clear, block, or be notified about cookies in every modern browser — settings live under Privacy &amp; Security. Blocking strictly-necessary cookies will prevent CaptionCraft from signing you in, but the public site will still work fine.</p>
      <ul style={{ paddingLeft: 20, margin: '0 0 16px' }}>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noreferrer">Chrome</a></li>
        <li><a href="https://support.mozilla.org/kb/cookies-information-websites-store-on-your-computer" target="_blank" rel="noreferrer">Firefox</a></li>
        <li><a href="https://support.apple.com/guide/safari/manage-cookies-sfri11471/mac" target="_blank" rel="noreferrer">Safari</a></li>
      </ul>

      <h2 id="changes">Changes</h2>
      <p>If we add or remove any cookie, this page gets updated and the &ldquo;last updated&rdquo; date at the top changes. Material changes get flagged in a banner for 30 days.</p>
      <p>Anything unclear? Email <a href="mailto:hello@pulsesocialmedia.com.au">hello@pulsesocialmedia.com.au</a>.</p>
    </LegalShell>
  )
}
