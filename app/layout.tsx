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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au'),
  title: {
    default: 'Pulse Digital Agency | Social Media That Works',
    template: '%s | Pulse Digital Agency',
  },
  description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and content that connects with your audience.',
  keywords: ['social media agency', 'social media management', 'AI social media', 'content strategy', 'digital marketing agency'],
  authors: [{ name: 'Pulse Digital Agency' }],
  creator: 'Pulse Digital Agency',
  openGraph: {
    type: 'website',
    siteName: 'Pulse Digital Agency',
    title: 'Pulse Digital Agency | Social Media That Works',
    description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and content that connects with your audience.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Pulse Digital Agency' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pulse Digital Agency | Social Media That Works',
    description: 'Pulse Digital helps brands grow through smart social media strategy, AI-powered tools, and content that connects with your audience.',
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
    languages: { 'en': process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsedigital.com.au' },
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
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
