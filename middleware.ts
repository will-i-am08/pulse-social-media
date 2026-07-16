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

  // Verify the session JWT locally (WebCrypto + cached JWKS) instead of a
  // network round-trip to Supabase Auth on every request. Falls back to a
  // server check only for legacy HS256-signed projects, and getClaims()
  // still auto-refreshes expired sessions (cookies written via setAll above).
  // Route handlers and RLS remain the real enforcement layer.
  const { data } = await supabase.auth.getClaims()
  const user = data?.claims ?? null

  const { pathname } = request.nextUrl
  const isAppRoute = APP_ROUTES.some(r => pathname === r || pathname.startsWith(r + '/'))

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
