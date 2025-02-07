import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSessionCookie } from 'better-auth'

const publicPaths = ['/login', '/register']

export async function middleware(request: NextRequest) {
  // Check if the path is public
  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path))

  // Check for session cookie
  const sessionCookie = getSessionCookie(request)
  const isAuthenticated = !!sessionCookie

  // If not logged in and trying to access a protected route
  if (!isAuthenticated && !isPublicPath) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // If logged in and trying to access auth pages
  if (isAuthenticated && isPublicPath) {
    const homeUrl = new URL('/chat', request.url)
    return NextResponse.redirect(homeUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 