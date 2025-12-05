import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// List of public routes (accessible to everyone)
const publicPaths = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/api',
]

// Routes only for authenticated users
const protectedPaths = [
  '/onboarding',
  '/dashboard',
  '/teams',
]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get sessionToken from cookies
  const sessionToken = request.cookies.get('session_token')?.value

  // Check if route is public
  const isPublic = publicPaths.some(path =>
    pathname === path || pathname.startsWith(`${path}/`)
  )

  // If public route - allow access
  if (isPublic) {
    return NextResponse.next()
  }

  // Check if route is protected
  const isProtected = protectedPaths.some(path =>
    pathname.startsWith(path)
  )

  if (isProtected) {
    // No token → redirect to login
    if (!sessionToken) {
      const loginUrl = new URL('/auth/login', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }

    // Has token - allow access
    // hasCompletedOnboarding check is done on client side (AuthProvider)
    return NextResponse.next()
  }

  // All other routes - allow access
  return NextResponse.next()
}

// Matcher configuration for optimization
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
