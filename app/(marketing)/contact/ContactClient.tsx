'use client'

import { useRef, useState, FormEvent } from 'react'

const CSS = `
.pulse-contact .contact-wrap{max-width:1320px;margin:0 auto;padding:48px 48px 96px;display:grid;grid-template-columns:1.1fr 1fr;gap:80px;border-top:1px solid var(--hair)}
.pulse-contact .contact-left h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;line-height:1.05;margin:0 0 24px}
.pulse-contact .contact-left h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-contact .contact-left p{color:#333;line-height:1.6;margin:0 0 40px;max-width:480px}
.pulse-contact .contact-rows{display:flex;flex-direction:column;gap:0}
.pulse-contact .crow{padding:24px 0;border-top:1px solid var(--hair);display:grid;grid-template-columns:180px 1fr;gap:24px;align-items:start}
.pulse-contact .crow:last-child{border-bottom:1px solid var(--hair)}
.pulse-contact .crow .k{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted);padding-top:4px}
.pulse-contact .crow .v{font-size:17px;line-height:1.5;color:var(--ink)}
.pulse-contact .crow .v a{color:var(--ink);border-bottom:1px solid var(--accent)}
.pulse-contact .crow .v .sub{color:var(--muted);font-size:14px;margin-top:4px}
.pulse-contact .form-card{background:#fff;border:1px solid var(--hair);border-radius:16px;padding:36px;display:flex;flex-direction:column;gap:18px;box-shadow:0 1px 0 rgba(0,0,0,.02)}
.pulse-contact .form-card .mono-label{margin:0 0 4px}
.pulse-contact .form-card h3{font-size:26px;font-weight:400;letter-spacing:-0.02em;margin:0 0 8px}
.pulse-contact .field{display:flex;flex-direction:column;gap:6px}
.pulse-contact .field label{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.15em;text-transform:uppercase;color:var(--muted)}
.pulse-contact .field input,.pulse-contact .field textarea,.pulse-contact .field select{background:var(--paper-2);border:1px solid var(--hair);border-radius:10px;padding:14px 16px;font-family:inherit;font-size:15px;color:var(--ink);outline:0;transition:border-color .15s}
.pulse-contact .field input:focus,.pulse-contact .field textarea:focus,.pulse-contact .field select:focus{border-color:var(--accent)}
.pulse-contact .field textarea{resize:vertical;min-height:120px}
.pulse-contact .row-2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.pulse-contact .budget{display:flex;gap:8px;flex-wrap:wrap}
.pulse-contact .budget input[type=radio]{display:none}
.pulse-contact .budget label{padding:10px 14px;border-radius:999px;border:1px solid var(--hair);font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);cursor:pointer;background:#fff}
.pulse-contact .budget input:checked+label{background:var(--ink);color:#fff;border-color:var(--ink)}
.pulse-contact .submit-row{display:flex;justify-content:space-between;align-items:center;margin-top:8px}
.pulse-contact .submit-row .micro{font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.pulse-contact .locations{max-width:1320px;margin:0 auto;padding:80px 48px;border-top:1px solid var(--hair);display:grid;grid-template-columns:repeat(3,1fr);gap:40px}
.pulse-contact .loc h4{font-family:'Fraunces',serif;font-weight:300;font-style:italic;font-size:36px;margin:0 0 12px;letter-spacing:-0.02em}
.pulse-contact .loc .addr{line-height:1.6;color:#333}
.pulse-contact .loc .hrs{margin-top:16px;font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted)}
.pulse-contact .faq{background:var(--paper-2);padding:96px 48px;border-top:1px solid var(--hair)}
.pulse-contact .faq-inner{max-width:1080px;margin:0 auto}
.pulse-contact .faq h2{font-size:clamp(36px,4vw,56px);font-weight:200;letter-spacing:-0.03em;margin:0 0 40px}
.pulse-contact .faq h2 em{font-family:'Fraunces',serif;font-style:italic;color:var(--accent);font-weight:300}
.pulse-contact details{border-top:1px solid var(--hair);padding:22px 0}
.pulse-contact details:last-child{border-bottom:1px solid var(--hair)}
.pulse-contact summary{cursor:pointer;list-style:none;display:flex;justify-content:space-between;align-items:center;font-size:20px;font-weight:400}
.pulse-contact summary::-webkit-details-marker{display:none}
.pulse-contact summary::after{content:'+';font-family:'JetBrains Mono',monospace;color:var(--accent);font-size:22px}
.pulse-contact details[open] summary::after{content:'−'}
.pulse-contact details p{color:#444;line-height:1.65;margin:14px 0 0;max-width:720px}
@media(max-width:820px){.pulse-contact .contact-wrap{grid-template-columns:1fr;padding:32px 24px 64px;gap:48px}.pulse-contact .crow{grid-template-columns:1fr;gap:6px}.pulse-contact .locations{grid-template-columns:1fr;padding:48px 24px;gap:32px}.pulse-contact .faq{padding:64px 24px}.pulse-contact .form-card{padding:24px}.pulse-contact .row-2{grid-template-columns:1fr}}

.pulse-contact .audit{max-width:720px;margin:0 auto;padding:80px 24px 40px;border-top:1px solid rgba(0,0,0,0.06)}
.pulse-contact .audit .gradient-text{background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
.pulse-contact .audit .a-mono{font-family:'JetBrains Mono',monospace;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#ff5473;font-weight:500}
.pulse-contact .audit .a-hero{text-align:center;padding:16px 0 32px}
.pulse-contact .audit .a-hero h2{font-size:clamp(32px,6vw,52px);font-weight:200;letter-spacing:-0.03em;line-height:1.1;margin:16px 0 16px;color:#0a0a0a}
.pulse-contact .audit .a-hero p{color:#6b7280;font-size:1.05rem;font-weight:300;max-width:500px;margin:0 auto;line-height:1.6}
.pulse-contact .audit-card{background:#fff;border-radius:16px;padding:40px;box-shadow:0 1px 3px rgba(0,0,0,0.06);border:1px solid rgba(0,0,0,0.06);margin-bottom:40px}
.pulse-contact .audit .form-group{margin-bottom:24px}
.pulse-contact .audit .form-group label{display:block;font-size:.85rem;font-weight:600;margin-bottom:8px;color:#374151}
.pulse-contact .audit .form-group input,.pulse-contact .audit .form-group select{width:100%;padding:14px 16px;border:1px solid #e5e7eb;border-radius:10px;font-family:inherit;font-size:.95rem;transition:border-color .2s;background:#fafafa;color:#0a0a0a}
.pulse-contact .audit .form-group input:focus,.pulse-contact .audit .form-group select:focus{outline:none;border-color:#ff5473;background:#fff}
.pulse-contact .audit .form-row{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media (max-width:500px){.pulse-contact .audit .form-row{grid-template-columns:1fr}}
.pulse-contact .audit .btn-audit{width:100%;padding:16px;border:none;border-radius:12px;color:#fff;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer;transition:opacity .2s,transform .1s;background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%)}
.pulse-contact .audit .btn-audit:hover{opacity:.9}
.pulse-contact .audit .btn-audit:active{transform:scale(.98)}
.pulse-contact .audit .btn-audit:disabled{opacity:.6;cursor:not-allowed}
.pulse-contact .audit .progress-wrap{margin-top:24px}
.pulse-contact .audit .progress-bar-bg{height:6px;background:#f3f4f6;border-radius:3px;overflow:hidden}
.pulse-contact .audit .progress-bar-fill{height:100%;border-radius:3px;background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%);transition:width .4s ease}
.pulse-contact .audit .progress-label{font-size:.8rem;color:#9ca3af;margin-top:8px;text-align:center}
.pulse-contact .audit .score-hero{text-align:center;padding:48px 24px;margin-bottom:32px}
.pulse-contact .audit .score-ring{width:160px;height:160px;margin:0 auto 24px;position:relative}
.pulse-contact .audit .score-ring svg{transform:rotate(-90deg)}
.pulse-contact .audit .score-ring .ring-bg{stroke:#f3f4f6}
.pulse-contact .audit .score-ring .ring-fill{stroke-dasharray:440;transition:stroke-dashoffset 1.2s ease}
.pulse-contact .audit .score-ring .ring-fill.good{stroke:#10b981}
.pulse-contact .audit .score-ring .ring-fill.ok{stroke:#f59e0b}
.pulse-contact .audit .score-ring .ring-fill.bad{stroke:#ff5473}
.pulse-contact .audit .score-number{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);font-size:2.8rem;font-weight:700;color:#0a0a0a}
.pulse-contact .audit .score-label{font-size:1.2rem;font-weight:600;margin-bottom:4px;color:#0a0a0a}
.pulse-contact .audit .score-subtitle{color:#6b7280;font-size:.95rem;font-weight:300}
.pulse-contact .audit .category-card{background:#fff;border-radius:14px;padding:28px;margin-bottom:16px;border:1px solid rgba(0,0,0,0.06)}
.pulse-contact .audit .category-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.pulse-contact .audit .category-header h3{font-size:1rem;font-weight:600;color:#0a0a0a;margin:0}
.pulse-contact .audit .cat-score{font-size:.85rem;font-weight:700;padding:4px 12px;border-radius:20px}
.pulse-contact .audit .cat-score.good{background:#ecfdf5;color:#059669}
.pulse-contact .audit .cat-score.ok{background:#fffbeb;color:#d97706}
.pulse-contact .audit .cat-score.bad{background:#fff1f2;color:#e11d48}
.pulse-contact .audit .finding{display:flex;gap:12px;padding:12px 0;border-top:1px solid #f3f4f6;font-size:.9rem;line-height:1.5;color:#374151}
.pulse-contact .audit .finding .icon{flex-shrink:0;width:22px;height:22px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:700;margin-top:2px}
.pulse-contact .audit .finding .icon.pass{background:#ecfdf5;color:#059669}
.pulse-contact .audit .finding .icon.fail{background:#fff1f2;color:#e11d48}
.pulse-contact .audit .finding .icon.warn{background:#fffbeb;color:#d97706}
.pulse-contact .audit .site-insight{background:linear-gradient(135deg,#fff7f8 0%,#ffe8ec 100%);border:1px solid #ffc4cc;border-radius:14px;padding:28px;margin-bottom:16px}
.pulse-contact .audit .site-insight .tag{display:inline-block;font-family:'JetBrains Mono',monospace;font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:#ff5473;background:#fff;border-radius:999px;padding:6px 12px;margin-bottom:14px;border:1px solid #ffc4cc}
.pulse-contact .audit .site-insight h3{font-size:1.15rem;font-weight:600;color:#111;margin:0 0 8px}
.pulse-contact .audit .site-insight .snapshot{color:#374151;font-size:.95rem;line-height:1.6;margin:0 0 18px}
.pulse-contact .audit .site-insight .rec-list{list-style:none;padding:0;margin:0;display:flex;flex-direction:column;gap:10px}
.pulse-contact .audit .site-insight .rec-list li{display:flex;gap:12px;align-items:flex-start;color:#374151;font-size:.9rem;line-height:1.5}
.pulse-contact .audit .site-insight .rec-list li::before{content:"→";color:#ff5473;font-weight:700;flex-shrink:0}
.pulse-contact .audit .site-unreachable{background:#fff;border:1px dashed #e5e7eb;border-radius:14px;padding:20px 24px;margin-bottom:16px;color:#6b7280;font-size:.88rem;line-height:1.5}
.pulse-contact .audit .cta-section{background:#0a0a0a;border-radius:16px;padding:48px 36px;text-align:center;margin:40px 0 20px;color:#fff}
.pulse-contact .audit .cta-section h3{font-size:1.6rem;font-weight:600;margin-bottom:12px;color:#fff}
.pulse-contact .audit .cta-section p{color:#9ca3af;font-size:.95rem;max-width:440px;margin:0 auto 28px;line-height:1.6}
.pulse-contact .audit .btn-cta{display:inline-block;padding:14px 36px;border:none;border-radius:50px;color:#fff;font-family:inherit;font-size:1rem;font-weight:600;cursor:pointer;background:linear-gradient(135deg,#ffb2b9 0%,#ff5473 100%);transition:opacity .2s}
.pulse-contact .audit .btn-cta:hover{opacity:.9}
`

type Rating = 'pass' | 'warn' | 'fail'

const QUESTIONS: Array<{ id: string; label: string; options: Array<{ value: string; text: string; score: number; rating: Rating; improve?: string }>; category: string }> = [
  {
    id: 'q_frequency',
    category: 'Posting cadence',
    label: 'How often do you post on your main social platform?',
    options: [
      { value: 'daily', text: 'Daily or near-daily', score: 10, rating: 'pass' },
      { value: 'few_week', text: 'A few times a week', score: 8, rating: 'pass' },
      { value: 'weekly', text: 'About once a week', score: 5, rating: 'warn', improve: 'Increase to 3–5 posts per week to stay in-feed' },
      { value: 'sporadic', text: 'Sporadic — whenever I remember', score: 2, rating: 'fail', improve: 'Move from sporadic posting to a planned 3–5 posts/week cadence' },
      { value: 'rarely', text: 'Rarely or never', score: 0, rating: 'fail', improve: 'Start a regular posting cadence — consistency is the #1 unlock' },
    ],
  },
  {
    id: 'q_video',
    category: 'Content mix',
    label: 'Do you use short-form video (Reels, TikToks)?',
    options: [
      { value: 'regularly', text: 'Yes, regularly', score: 10, rating: 'pass' },
      { value: 'sometimes', text: 'Sometimes', score: 6, rating: 'warn', improve: 'Increase short-form video to at least 2 per week — it\'s the algorithmic priority' },
      { value: 'rarely', text: 'Rarely', score: 3, rating: 'fail', improve: 'Add weekly short-form video — Reels get 3x the reach of static posts' },
      { value: 'never', text: 'Never', score: 0, rating: 'fail', improve: 'Start posting short-form video weekly — biggest missed opportunity on your account' },
    ],
  },
  {
    id: 'q_bio',
    category: 'Profile optimisation',
    label: 'Does your bio clearly explain what you do and include a call-to-action?',
    options: [
      { value: 'yes', text: 'Yes — it\'s clear and has a CTA', score: 10, rating: 'pass' },
      { value: 'partial', text: 'It says what I do but no CTA', score: 6, rating: 'warn', improve: 'Add a clear CTA to your bio (e.g. "Book now", "Shop the collection")' },
      { value: 'outdated', text: 'It\'s outdated or vague', score: 3, rating: 'fail', improve: 'Rewrite your bio — what you do, who for, and one clear action' },
      { value: 'no', text: 'Not really', score: 0, rating: 'fail', improve: 'Your bio is invisible real estate — rewrite it with WHAT you do + a CTA' },
    ],
  },
  {
    id: 'q_link',
    category: 'Profile optimisation',
    label: 'Do you have a link-in-bio tool or website linked?',
    options: [
      { value: 'website', text: 'Yes — links to my website', score: 10, rating: 'pass' },
      { value: 'linktree', text: 'Yes — a link-in-bio tool', score: 9, rating: 'pass' },
      { value: 'random', text: 'There\'s a link but it\'s outdated or random', score: 3, rating: 'warn', improve: 'Update your link-in-bio — it should point to your highest-intent destination' },
      { value: 'none', text: 'No link at all', score: 0, rating: 'fail', improve: 'Add a link in bio immediately — you\'re losing every warm lead that lands on your profile' },
    ],
  },
  {
    id: 'q_engagement',
    category: 'Engagement',
    label: 'Do you respond to comments and DMs within 24 hours?',
    options: [
      { value: 'always', text: 'Always', score: 10, rating: 'pass' },
      { value: 'usually', text: 'Usually', score: 8, rating: 'pass' },
      { value: 'sometimes', text: 'Sometimes', score: 4, rating: 'warn', improve: 'Aim for 100% response rate within 24 hours — it signals an active brand' },
      { value: 'rarely', text: 'Rarely or never', score: 0, rating: 'fail', improve: 'Set a daily 10-min DM/comment triage — unresponded DMs kill trust fast' },
    ],
  },
  {
    id: 'q_strategy',
    category: 'Strategy',
    label: 'Do you have a content strategy or plan?',
    options: [
      { value: 'documented', text: 'Yes — documented strategy and calendar', score: 10, rating: 'pass' },
      { value: 'loose', text: 'I have a rough idea of what to post', score: 6, rating: 'warn', improve: 'Document your content pillars and a 90-day intent map' },
      { value: 'adhoc', text: 'I post whatever comes to mind', score: 2, rating: 'fail', improve: 'Build a basic content strategy — 3–5 pillars, 90-day intent map' },
      { value: 'nothing', text: 'I don\'t have any plan', score: 0, rating: 'fail', improve: 'Start with a content strategy — without one, posting is noise' },
    ],
  },
  {
    id: 'q_ads',
    category: 'Paid media',
    label: 'Are you running any paid ads?',
    options: [
      { value: 'strategic', text: 'Yes — with a strategy and tracking', score: 10, rating: 'pass' },
      { value: 'boosting', text: 'I boost posts occasionally', score: 4, rating: 'warn', improve: 'Move from boosting to proper Meta Ads Manager campaigns with pixel tracking' },
      { value: 'tried', text: 'I\'ve tried but stopped', score: 2, rating: 'warn', improve: 'Revisit paid — a small, well-targeted campaign outperforms organic 10x' },
      { value: 'no', text: 'No paid activity', score: 3, rating: 'warn', improve: 'Test a small paid campaign — even $200/mo well-targeted compounds fast' },
    ],
  },
  {
    id: 'q_branding',
    category: 'Branding',
    label: 'How consistent is your visual branding?',
    options: [
      { value: 'consistent', text: 'Consistent — colours, fonts, style all match', score: 10, rating: 'pass' },
      { value: 'mostly', text: 'Mostly consistent with occasional off-brand posts', score: 7, rating: 'warn', improve: 'Tighten brand consistency with a content template system' },
      { value: 'mixed', text: 'Mixed — no real visual identity', score: 3, rating: 'fail', improve: 'Build a visual system: colour palette, 2 fonts, 3 content templates' },
      { value: 'none', text: 'I haven\'t thought about it', score: 0, rating: 'fail', improve: 'Develop a visual identity — brand consistency is what separates pros from amateurs' },
    ],
  },
]

export default function ContactClient() {
  const [auditStage, setAuditStage] = useState<'form' | 'progress' | 'results'>('form')
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [progress, setProgress] = useState(0)
  const [progressLabel, setProgressLabel] = useState('Analysing your profile…')
  const [score, setScore] = useState(0)
  const briefRef = useRef<HTMLTextAreaElement>(null)
  const [briefValue, setBriefValue] = useState('')
  const [nameValue, setNameValue] = useState('')
  const [emailValue, setEmailValue] = useState('')
  const [companyValue, setCompanyValue] = useState('')
  const [websiteValue, setWebsiteValue] = useState('')
  const [websiteInsight, setWebsiteInsight] = useState<{
    snapshot: string
    recommendations: string[]
    reachable: boolean
  } | null>(null)
  const [sentEnquiry, setSentEnquiry] = useState(false)
  const [sendingEnquiry, setSendingEnquiry] = useState(false)
  const [enquiryError, setEnquiryError] = useState<string | null>(null)
  const formCardRef = useRef<HTMLDivElement>(null)

  async function runAudit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const a: Record<string, string> = {}
    QUESTIONS.forEach(q => {
      const v = data.get(q.id)
      if (typeof v === 'string') a[q.id] = v
    })
    setAnswers(a)
    setAuditStage('progress')
    setWebsiteInsight(null)

    const bizName = (data.get('bizName') as string) || 'our brand'
    const userName = (data.get('userName') as string) || ''
    const userEmail = (data.get('userEmail') as string) || ''
    const industry = (data.get('industry') as string) || ''
    const websiteUrl = ((data.get('website') as string) || '').trim()

    let total = 0
    QUESTIONS.forEach(q => {
      const opt = q.options.find(o => o.value === a[q.id])
      total += opt?.score ?? 0
    })
    const pct = Math.round((total / (QUESTIONS.length * 10)) * 100)

    const baseSteps = [
      { pct: 20, msg: 'Analysing your profile…', delay: 400 },
      { pct: 45, msg: 'Checking content cadence…', delay: 400 },
      { pct: 65, msg: 'Scoring each category…', delay: 400 },
    ] as const

    for (const s of baseSteps) {
      setProgress(s.pct)
      setProgressLabel(s.msg)
      await new Promise(r => setTimeout(r, s.delay))
    }

    let insight: { snapshot: string; recommendations: string[]; reachable: boolean } | null = null
    if (websiteUrl) {
      setProgress(80)
      setProgressLabel('Visiting your website…')
      try {
        const res = await fetch('/api/audit-website', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: websiteUrl,
            bizName,
            industry,
            score: pct,
            answers: a,
          }),
        })
        if (res.ok) {
          const json = await res.json()
          insight = {
            snapshot: typeof json.snapshot === 'string' ? json.snapshot : '',
            recommendations: Array.isArray(json.recommendations) ? json.recommendations : [],
            reachable: Boolean(json.reachable),
          }
        }
      } catch {
        insight = null
      }
    }

    setProgress(100)
    setProgressLabel('Generating recommendations…')
    await new Promise(r => setTimeout(r, 400))

    setScore(pct)
    setWebsiteInsight(insight)
    setAuditStage('results')

    const improvements = QUESTIONS
      .map(q => q.options.find(o => o.value === a[q.id]))
      .filter((o): o is NonNullable<typeof o> => !!o && !!o.improve)
      .map(o => `• ${o.improve}`)
      .join('\n')

    const personalised = insight && insight.recommendations.length
      ? `\n\nWhat the AI flagged from my website:\n${insight.recommendations.map(r => `• ${r}`).join('\n')}`
      : ''
    const summary = `Hi William — I just ran your audit for ${bizName} and scored ${pct}/100.\n\nThings I need help with:\n${improvements}${personalised}\n\nKeen to chat.`
    setBriefValue(summary)
    if (userName) setNameValue(userName)
    if (userEmail) setEmailValue(userEmail)
    if (bizName && bizName !== 'our brand') setCompanyValue(bizName)
    if (websiteUrl) setWebsiteValue(websiteUrl)
  }

  function scrollToBrief() {
    const el = formCardRef.current
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
      setTimeout(() => briefRef.current?.focus(), 500)
    }
  }

  async function onEnquirySubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (sendingEnquiry || sentEnquiry) return

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const company = String(data.get('company') ?? '').trim()
    const website = String(data.get('website') ?? '').trim()
    const intent = String(data.get('type') ?? '').trim()
    const budgetId = String(data.get('b') ?? '')
    const budgetMap: Record<string, string> = {
      b1: '< $5k',
      b2: '$5–15k',
      b3: '$15–40k',
      b4: '$40k+',
      b5: 'Not sure',
    }
    const budget = budgetMap[budgetId] ?? ''
    const brief = String(data.get('brief') ?? '').trim()

    const message = [
      company && `Company: ${company}`,
      website && `Website: ${website}`,
      budget && `Budget: ${budget}`,
      brief && `\n${brief}`,
    ].filter(Boolean).join('\n')

    setSendingEnquiry(true)
    setEnquiryError(null)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, intent, message }),
      })
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: '' }))
        throw new Error(error || 'Something went wrong sending your enquiry.')
      }
      setSentEnquiry(true)
    } catch (err) {
      setEnquiryError(err instanceof Error ? err.message : 'Something went wrong sending your enquiry.')
    } finally {
      setSendingEnquiry(false)
    }
  }

  const scoreClass = score >= 75 ? 'good' : score >= 50 ? 'ok' : 'bad'
  const scoreLabel = score >= 75 ? 'Strong foundation' : score >= 50 ? 'Solid, with gaps' : 'Big opportunity'
  const scoreSub = score >= 75
    ? 'You\'re doing most things right. Fine-tuning the rest will compound.'
    : score >= 50
      ? 'You\'ve got the bones — tightening the weak areas will move the needle fast.'
      : 'Good news: the fundamentals are low-hanging fruit. We can fix this quickly.'

  const ringOffset = 440 - (440 * Math.min(Math.max(score, 0), 100)) / 100

  const categories = Array.from(new Set(QUESTIONS.map(q => q.category))).map(cat => {
    const qs = QUESTIONS.filter(q => q.category === cat)
    const findings = qs.map(q => {
      const opt = q.options.find(o => o.value === answers[q.id])
      return opt ? { text: opt.text, rating: opt.rating, improve: opt.improve } : null
    }).filter(Boolean) as Array<{ text: string; rating: Rating; improve?: string }>
    const avg = findings.reduce((s, f) => s + (f.rating === 'pass' ? 10 : f.rating === 'warn' ? 5 : 0), 0) / findings.length
    const catClass = avg >= 8 ? 'good' : avg >= 4 ? 'ok' : 'bad'
    const catLabel = avg >= 8 ? 'Strong' : avg >= 4 ? 'Needs work' : 'Priority'
    return { cat, findings, catClass, catLabel }
  })

  return (
    <main className="pulse-contact">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />

      <section className="page-head">
        <div>
          <p className="mono-label">Get in touch</p>
          <h1>Let&apos;s make<br />something <em>loud.</em></h1>
        </div>
        <p>Tell me a little about the brand, the brief, and the headache. Every enquiry comes directly to me — usually same-day, always within two working days.</p>
      </section>

      <section className="audit">
        <div className="a-hero">
          <p className="a-mono">Free Tool</p>
          <h2>Social Media <span className="gradient-text">Audit</span></h2>
          <p>Answer a few quick questions about your social media presence and get an instant, personalised report card with actionable recommendations.</p>
        </div>

        {auditStage !== 'results' && (
          <div className="audit-card">
            <form onSubmit={runAudit}>
              <div className="form-row">
                <div className="form-group"><label>Your Name</label><input type="text" name="userName" placeholder="e.g. Sarah" required /></div>
                <div className="form-group"><label>Business Name</label><input type="text" name="bizName" placeholder="e.g. The Corner Cafe" required /></div>
              </div>
              <div className="form-row">
                <div className="form-group"><label>Email Address</label><input type="email" name="userEmail" placeholder="you@business.com" required /></div>
                <div className="form-group"><label>Instagram Handle (optional)</label><input type="text" name="igHandle" placeholder="@yourbusiness" /></div>
              </div>
              <div className="form-group">
                <label>Business Website (optional) <span style={{ fontWeight: 400, color: '#6b7280', fontSize: '.85em' }}>— we&apos;ll read it and tailor your report</span></label>
                <input type="text" name="website" placeholder="e.g. yourbusiness.com.au" />
              </div>
              <div className="form-group">
                <label>Industry</label>
                <select name="industry" required defaultValue="">
                  <option value="">Select your industry</option>
                  <option value="hospitality">Hospitality (cafe, restaurant, bar)</option>
                  <option value="retail">Retail / E-commerce</option>
                  <option value="trades">Trades &amp; Services</option>
                  <option value="health">Health &amp; Wellness</option>
                  <option value="beauty">Beauty &amp; Personal Care</option>
                  <option value="professional">Professional Services</option>
                  <option value="fitness">Fitness &amp; Sport</option>
                  <option value="creative">Creative / Agency</option>
                  <option value="coaching">Coaching / Consulting</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <p style={{ fontSize: '.85rem', fontWeight: 600, color: '#374151', marginBottom: 16 }}>
                Answer honestly — the more accurate, the more useful your report.
              </p>

              {QUESTIONS.map(q => (
                <div className="form-group" key={q.id}>
                  <label>{q.label}</label>
                  <select name={q.id} required defaultValue="">
                    <option value="">Select</option>
                    {q.options.map(o => <option key={o.value} value={o.value}>{o.text}</option>)}
                  </select>
                </div>
              ))}

              <button type="submit" className="btn-audit" disabled={auditStage === 'progress'}>
                {auditStage === 'progress' ? 'Running…' : 'Run My Free Audit'}
              </button>

              {auditStage === 'progress' && (
                <div className="progress-wrap">
                  <div className="progress-bar-bg"><div className="progress-bar-fill" style={{ width: `${progress}%` }} /></div>
                  <div className="progress-label">{progressLabel}</div>
                </div>
              )}
            </form>
          </div>
        )}

        {auditStage === 'results' && (
          <>
            <div className="score-hero">
              <p className="a-mono" style={{ marginBottom: 20 }}>Your Audit Results</p>
              <div className="score-ring">
                <svg width="160" height="160">
                  <circle className="ring-bg" cx="80" cy="80" r="70" fill="none" strokeWidth="10" />
                  <circle className={`ring-fill ${scoreClass}`} cx="80" cy="80" r="70" fill="none" strokeWidth="10" strokeLinecap="round" style={{ strokeDashoffset: ringOffset }} />
                </svg>
                <div className="score-number">{score}</div>
              </div>
              <div className="score-label">{scoreLabel}</div>
              <div className="score-subtitle">{scoreSub}</div>
            </div>

            {websiteInsight && (websiteInsight.snapshot || websiteInsight.recommendations.length > 0) && (
              <div className="site-insight">
                <span className="tag">AI · Tailored to your site</span>
                <h3>What we read on your website</h3>
                {websiteInsight.snapshot && <p className="snapshot">{websiteInsight.snapshot}</p>}
                {websiteInsight.recommendations.length > 0 && (
                  <ul className="rec-list">
                    {websiteInsight.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                )}
              </div>
            )}
            {websiteInsight && !websiteInsight.reachable && (
              <div className="site-unreachable">
                We couldn&apos;t reach your website this time — the rest of your report is based on your answers. Double-check the URL and re-run the audit for a site-specific section.
              </div>
            )}

            {categories.map(c => (
              <div className="category-card" key={c.cat}>
                <div className="category-header">
                  <h3>{c.cat}</h3>
                  <span className={`cat-score ${c.catClass}`}>{c.catLabel}</span>
                </div>
                {c.findings.map((f, i) => (
                  <div className="finding" key={i}>
                    <div className={`icon ${f.rating}`}>
                      {f.rating === 'pass' ? '✓' : f.rating === 'warn' ? '!' : '✕'}
                    </div>
                    <div>{f.improve || f.text}</div>
                  </div>
                ))}
              </div>
            ))}

            <div className="cta-section">
              <p className="a-mono" style={{ color: '#ff5473', marginBottom: 16 }}>What&apos;s Next?</p>
              <h3>Want us to fix all of this?</h3>
              <p>We&apos;ve pre-filled the enquiry form below with a full summary of your audit and everything worth fixing. Add a line or two and send it — we&apos;ll reply within a working day.</p>
              <button type="button" className="btn-cta" onClick={scrollToBrief}>Send as brief →</button>
            </div>
          </>
        )}
      </section>

      <section className="contact-wrap">
        <div className="contact-left">
          <h2>Not quite ready<br />for a <em>form?</em></h2>
          <p>Totally fine. Here are the other ways in. Pulse is a one-person studio, so whichever channel you pick, you&apos;ll hear back from me directly.</p>
          <div className="contact-rows">
            <div className="crow"><div className="k">New business</div><div className="v"><a href="mailto:william@pulsesocialmedia.com.au">william@pulsesocialmedia.com.au</a><div className="sub">Replies from William, usually same-day</div></div></div>
            <div className="crow"><div className="k">Press &amp; speaking</div><div className="v"><a href="mailto:william@pulsesocialmedia.com.au">william@pulsesocialmedia.com.au</a><div className="sub">Interviews, podcasts, conferences</div></div></div>
            <div className="crow"><div className="k">Phone</div><div className="v"><a href="tel:+61480436685">0480 436 685</a><div className="sub">7 days, 9am–5pm AEST</div></div></div>
            <div className="crow"><div className="k">Social</div><div className="v">Instagram · LinkedIn<div className="sub">DMs open — just maybe not at 2am</div></div></div>
          </div>
        </div>

        <div ref={formCardRef}>
          <form className="form-card" onSubmit={onEnquirySubmit}>
            <p className="mono-label">Project enquiry</p>
            <h3>Tell us about it.</h3>
            <div className="row-2">
              <div className="field"><label>Name</label><input name="name" placeholder="Jane Kapoor" required value={nameValue} onChange={e => setNameValue(e.target.value)} /></div>
              <div className="field"><label>Company</label><input name="company" placeholder="Kapoor &amp; Co." value={companyValue} onChange={e => setCompanyValue(e.target.value)} /></div>
            </div>
            <div className="row-2">
              <div className="field"><label>Email</label><input name="email" type="email" placeholder="jane@company.com" required value={emailValue} onChange={e => setEmailValue(e.target.value)} /></div>
              <div className="field"><label>Website</label><input name="website" placeholder="kapoor.co" value={websiteValue} onChange={e => setWebsiteValue(e.target.value)} /></div>
            </div>
            <div className="field">
              <label>What are you looking for?</label>
              <select name="type" defaultValue="Social media management">
                <option>Social media management</option>
                <option>Content strategy</option>
                <option>Paid social</option>
                <option>AI tools / CaptionCraft</option>
                <option>Blog / SEO engine</option>
                <option>Not sure yet</option>
              </select>
            </div>
            <div className="field">
              <label>Rough monthly budget</label>
              <div className="budget">
                <input type="radio" name="b" id="b1" /><label htmlFor="b1">&lt; $5k</label>
                <input type="radio" name="b" id="b2" defaultChecked /><label htmlFor="b2">$5–15k</label>
                <input type="radio" name="b" id="b3" /><label htmlFor="b3">$15–40k</label>
                <input type="radio" name="b" id="b4" /><label htmlFor="b4">$40k+</label>
                <input type="radio" name="b" id="b5" /><label htmlFor="b5">Not sure</label>
              </div>
            </div>
            <div className="field">
              <label>The brief</label>
              <textarea
                ref={briefRef}
                name="brief"
                placeholder="What's the brand, what are you trying to do, and what's been frustrating about the way it's going now?"
                value={briefValue}
                onChange={e => setBriefValue(e.target.value)}
              />
            </div>
            <div className="submit-row">
              <span className="micro">
                {enquiryError
                  ? `⚠ ${enquiryError}`
                  : sentEnquiry
                    ? '✓ Check your inbox for a confirmation'
                    : '→ We reply in 1–2 working days'}
              </span>
              <button className="btn-pill btn-grad" type="submit" style={{ padding: '14px 24px', fontSize: 14 }} disabled={sendingEnquiry || sentEnquiry}>
                {sentEnquiry
                  ? "Sent ✓ — we'll be in touch"
                  : sendingEnquiry
                    ? 'Sending…'
                    : 'Send enquiry →'}
              </button>
            </div>
          </form>
        </div>
      </section>

      <section className="locations" style={{ gridTemplateColumns: '1fr' }}>
        <div className="loc" style={{ maxWidth: 480 }}>
          <p className="mono-label">Studio · HQ</p>
          <h4>Bendigo, Victoria</h4>
          <div className="addr">Bendigo VIC, Australia<br />Working with brands across Australia and beyond.</div>
          <div className="hrs">7 days · 9–5 AEST</div>
        </div>
      </section>

      <section className="faq">
        <div className="faq-inner">
          <h2>Questions people <em>always</em> ask.</h2>
          <details open><summary>How does pricing work?</summary><p>Retainers are scoped per engagement — I send a flat-rate SOW within 48 hours of a brief. No hourly games, no tiered pricing wall. One-off projects (a launch campaign, a content audit, a CaptionCraft rollout) can be scoped independently.</p></details>
          <details><summary>How long does it take to get started?</summary><p>From signed scope to first post in-market is usually 2–3 weeks. That covers kickoff, brand immersion, tool setup, a first content sprint, and review.</p></details>
          <details><summary>Do you work with brands outside Bendigo?</summary><p>Yes — everything runs remote-first, so location doesn&apos;t matter much. Happy to take on brands anywhere in Australia and beyond, as long as the time zones aren&apos;t completely silly.</p></details>
          <details><summary>Do you use AI? Should I be worried?</summary><p>AI handles the boring parts — drafting, tagging, scheduling, transcription — while I stay firmly in charge of voice, strategy, and anything creative. CaptionCraft is my in-house tool for exactly this, and nothing ships without my eyes on it.</p></details>
          <details><summary>Can you work with our existing team?</summary><p>Yes — I often slot alongside in-house marketing, creative, or comms teams. Whatever shape the problem needs.</p></details>
          <details><summary>Do you offer discovery workshops?</summary><p>Yes. A short Discovery Sprint produces a tone-of-voice doc, a content engine setup, a 90-day intent map, and a measurement framework. Good way to test-drive the working style before a longer engagement.</p></details>
        </div>
      </section>

      <section className="final-cta" style={{ borderTop: 0 }}>
        <p className="mono-label">One more thing</p>
        <h2>Prefer a <em>call?</em></h2>
        <p className="sub">Pick a 20-minute slot that suits. No sales pitch, no pressure — just a chat about what you&apos;re trying to do.</p>
        <a className="btn-pill btn-grad" href="mailto:william@pulsesocialmedia.com.au" style={{ padding: '18px 36px', fontSize: 15 }}>Book a call →</a>
      </section>
    </main>
  )
}
