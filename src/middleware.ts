import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

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
 */

const publicPaths = ['/auth/signin', '/auth/signup', '/auth/verify', '/auth/error', '/api/auth'];

const protectedPaths = ['/dashboard', '/onboarding'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // Check authentication for protected paths
  if (protectedPaths.some((path) => pathname.startsWith(path))) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // Redirect to signin if not authenticated
    if (!token) {
      const url = new URL('/auth/signin', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    // Redirect to onboarding if role not set
    if (!token.role && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', request.url));
    }

    // Redirect from onboarding if role already set
    if (token.role && pathname === '/onboarding') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
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
