import { auth } from "@/lib/auth"
import { NextResponse, NextRequest } from "next/server"

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/documents', '/templates', '/settings']

// Routes that are always public
const publicRoutes = ['/', '/login', '/sign', '/api/auth']

// Bypass auth entirely for webhooks/cron
function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Webhooks and cron bypass ALL middleware - return immediately
  if (pathname.startsWith('/api/webhooks') || pathname.startsWith('/api/cron')) {
    return NextResponse.next()
  }

  // For all other routes, use auth middleware
  return authMiddleware(req)
}

// Auth-wrapped middleware for protected routes
const authMiddleware = auth((req) => {
  const { pathname } = req.nextUrl

  // Check if the current path is a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )

  // Check if the current path is a public route
  const isPublicRoute =
    publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(`${route}/`)
    ) || pathname.startsWith('/sign/')

  // If user is not authenticated and trying to access a protected route
  if (!req.auth && isProtectedRoute) {
    const url = req.nextUrl.clone()
    url.pathname = '/login'
    url.searchParams.set('callbackUrl', pathname)
    return NextResponse.redirect(url)
  }

  // If user is authenticated and trying to access login page, redirect to dashboard
  if (req.auth && pathname === '/login') {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
})

export default middleware

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api/webhooks (external webhooks from Stripe, Resend, etc.)
     * - api/cron (cron jobs)
     */
    '/((?!_next/static|_next/image|favicon.ico|api/webhooks|api/cron|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
