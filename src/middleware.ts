import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const PUBLIC_ADMIN_ROUTES = ['/admin/login']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Allow public admin routes
  if (PUBLIC_ADMIN_ROUTES.includes(pathname)) {
    // If logged in and trying to access login, redirect to dashboard
    const adminSession = request.cookies.get('admin_session')
    if (adminSession?.value) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return NextResponse.next()
  }

  // Check for admin session cookie
  const adminSession = request.cookies.get('admin_session')

  if (!adminSession?.value) {
    // Redirect to login with return URL
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Session exists, allow request
  // Full validation happens in API routes/pages
  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
