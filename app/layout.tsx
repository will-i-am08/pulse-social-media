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

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsesocialmedia.com.au'),
  title: {
    default: 'Pulse Social Media | Founder-led Social Media Agency',
    template: '%s',
  },
  description: 'Founder-led social media management — strategy, community, content and AI tooling. Based in Bendigo, Victoria. Working with brands that want to sound like themselves.',
  keywords: ['social media agency', 'social media management', 'AI social media', 'content strategy', 'Bendigo social media agency', 'Pulse Social Media'],
  authors: [{ name: 'Pulse Social Media' }],
  creator: 'Pulse Social Media',
  openGraph: {
    type: 'website',
    siteName: 'Pulse Social Media',
    title: 'Pulse Social Media | Founder-led Social Media Agency',
    description: 'Founder-led social media management — strategy, community, content and AI tooling. Based in Bendigo, Victoria.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Social Media' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Social Media | Founder-led Social Media Agency',
    description: 'Founder-led social media management — strategy, community, content and AI tooling.',
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
    languages: { 'en': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsesocialmedia.com.au' },
  },
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
