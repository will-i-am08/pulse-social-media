import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://pulsesocialmedia.com.au'

  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/services',
          '/insights',
          '/insights/',
          '/captioncraft',
          '/contact',
          '/privacy',
          '/terms',
          '/cookies',
        ],
        disallow: [
          '/dashboard',
          '/analytics',
          '/posts',
          '/create-post',
          '/calendar',
          '/photos',
          '/brands',
          '/clients',
          '/team',
          '/profile',
          '/settings',
          '/automations',
          '/proposals',
          '/geo',
          '/creative-studio',
          '/blog-engine',
          '/brand-research',
          '/account',
          '/apps',
          '/login',
          '/api/',
          '/auth/',
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
