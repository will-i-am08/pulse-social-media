import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_ROUTES = [
  '/dashboard',
  '/create-post',
  '/posts',
  '/calendar',
  '/brands',
  '/photos',
  '/analytics',
  '/clients',
  '/team',
  '/holidays',
  '/settings',
  '/profile',
  '/account',
  '/apps',
  '/automations',
  '/creative-studio',
  '/blog-engine',
  '/brand-research',
  '/geo',
  '/proposals',
]

function buildCsp(nonce: string): string {
  const directives = [
    `default-src 'self'`,
    // 'strict-dynamic' trusts scripts loaded by a nonced script (Next.js chunks etc.)
    // 'nonce-...' trusts only scripts that carry this per-request token
    `script-src 'nonce-${nonce}' 'strict-dynamic'`,
    `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
    `font-src 'self' https://fonts.gstatic.com data:`,
    `img-src 'self' data: blob: https://images.unsplash.com https://*.supabase.co https://lh3.googleusercontent.com https://*.supabase.in`,
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://*.supabase.in wss://*.supabase.in`,
    `frame-ancestors 'self'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `object-src 'none'`,
    `upgrade-insecure-requests`,
  ]
  return directives.join('; ')
}

export async function middleware(request: NextRequest) {
  // Generate a fresh cryptographic nonce for every request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session
  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl
  const isAppRoute = APP_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

  // Gate /login to desktop app only (identified by PulseDesktop user-agent)
  const userAgent = request.headers.get('user-agent') ?? ''
  const isLocalhost = request.nextUrl.hostname === 'localhost'
  if (pathname === '/login' && !userAgent.includes('PulseDesktop') && !isLocalhost) {
    const url = request.nextUrl.clone()
    url.pathname = '/'
    return NextResponse.redirect(url)
  }

  // Unauthenticated → redirect to /login
  if (!user && isAppRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Authenticated → redirect away from /login
  if (user && pathname === '/login') {
    const url = request.nextUrl.clone()
    url.pathname = '/apps'
    return NextResponse.redirect(url)
  }

  // Attach nonce + CSP to response headers
  supabaseResponse.headers.set('x-nonce', nonce)
  supabaseResponse.headers.set('Content-Security-Policy', buildCsp(nonce))

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
