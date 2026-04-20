import { type NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const APP_ROUTES = [
  // New Buffer-style routes
  '/queue',
  '/drafts',
  '/approvals',
  '/sent',
  '/overview',
  '/compose',
  '/library',
  // Legacy routes kept for redirect stubs
  '/dashboard',
  '/create-post',
  '/posts',
  '/photos',
  // Unchanged
  '/calendar',
  '/brands',
  '/analytics',
  '/clients',
  '/team',
  '/holidays',
  '/refurb-stock',
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

export async function middleware(request: NextRequest) {
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

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|logo.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
