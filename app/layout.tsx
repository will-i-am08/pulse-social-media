import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import { ThemeProvider } from 'next-themes'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta',
})

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsesocialmedia.com.au'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pulse Social Media | Social Media Management Agency in Bendigo',
    template: '%s | Pulse Social Media',
  },
  description: 'Pulse is a Bendigo social media management agency running always-on Instagram, TikTok, Facebook and LinkedIn for Australian brands. Strategy, content, community and AI tooling on a flat monthly retainer.',
  keywords: [
    'social media management',
    'social media agency',
    'social media management Bendigo',
    'Bendigo social media agency',
    'social media marketing Bendigo',
    'Instagram management',
    'TikTok management',
    'content strategy',
    'AI social media',
    'Pulse Social Media',
  ],
  authors: [{ name: 'Pulse Social Media' }],
  creator: 'Pulse Social Media',
  publisher: 'Pulse Social Media',
  category: 'Marketing',
  openGraph: {
    type: 'website',
    siteName: 'Pulse Social Media',
    locale: 'en_AU',
    url: SITE_URL,
    title: 'Pulse Social Media | Social Media Management Agency in Bendigo',
    description: 'Always-on social media management for Australian brands. Strategy, content, community and AI tooling — built in Bendigo, Victoria.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Social Media — Bendigo Social Media Management Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Social Media | Social Media Management Agency in Bendigo',
    description: 'Always-on social media management for Australian brands. Strategy, content, community and AI tooling — built in Bendigo, Victoria.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-AU': SITE_URL },
  },
  other: {
    'geo.region': 'AU-VIC',
    'geo.placename': 'Bendigo',
    'geo.position': '-36.7570;144.2794',
    'ICBM': '-36.7570, 144.2794',
  },
}

const ORG_JSONLD = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['ProfessionalService', 'LocalBusiness', 'Organization'],
      '@id': `${SITE_URL}/#organization`,
      name: 'Pulse Social Media',
      legalName: 'Pulse Social Media',
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
      image: `${SITE_URL}/og-image.png`,
      description: 'Bendigo-based social media management agency providing strategy, content, community management and AI-assisted tooling for Australian brands.',
      email: 'hello@pulsesocialmedia.com.au',
      telephone: '+61480436685',
      priceRange: '$$',
      areaServed: [
        { '@type': 'City', name: 'Bendigo' },
        { '@type': 'State', name: 'Victoria' },
        { '@type': 'Country', name: 'Australia' },
      ],
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Bendigo',
        addressRegion: 'VIC',
        addressCountry: 'AU',
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: -36.757,
        longitude: 144.2794,
      },
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
          opens: '09:00',
          closes: '17:00',
        },
      ],
      sameAs: [
        'https://www.instagram.com/pulsesocialmedia',
        'https://www.linkedin.com/company/pulse-social-media',
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Social Media Management Services',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Social Media Management', areaServed: 'AU' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Content Strategy', areaServed: 'AU' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Community Management', areaServed: 'AU' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Paid Social Campaigns', areaServed: 'AU' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'AI Caption Writing (CaptionCraft)', areaServed: 'AU' } },
        ],
      },
    },
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: 'Pulse Social Media',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'en-AU',
    },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Fraunces:opsz,wght@9..144,300;9..144,400;9..144,500;9..144,600&family=JetBrains+Mono:wght@300;400;500&display=swap"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_JSONLD) }}
        />
      </head>
      <body className={`${plusJakarta.variable} font-body`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {children}
          <Toaster
            position="bottom-right"
            toastOptions={{
              success: { style: { background: '#22c55e', color: '#fff' } },
              error: { style: { background: '#ef4444', color: '#fff' } },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  )
}
