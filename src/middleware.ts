import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/documents', '/templates', '/settings']

// Routes that are always public
const publicRoutes = ['/', '/login', '/sign', '/api/auth']

export default auth((req) => {
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

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
