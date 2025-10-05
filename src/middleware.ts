import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Authentication Middleware
 *
 * Protects routes based on authentication and role requirements
 *
 * Route Protection:
 * - /dashboard/* - Requires authentication
 * - /api/* - Public (individual endpoints handle auth)
 * - /auth/* - Public (auth pages)
 * - / - Public (redirects based on session)
 *
 * Note: With database sessions, we rely on the session cookie presence
 * and let server-side session checks handle role-based redirects.
 */

const publicPaths = ['/auth/signin', '/auth/signup', '/auth/verify', '/auth/error', '/api'];

const protectedPaths = ['/dashboard', '/onboarding'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths (including all /api routes)
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication for protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const sessionToken =
      request.cookies.get('next-auth.session-token')?.value ||
      request.cookies.get('__Secure-next-auth.session-token')?.value;

    // Redirect to signin if not authenticated
    if (!sessionToken) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Let the page components handle role-based redirects
    // since we can't easily access the database from middleware
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
