import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_COOKIE = 'ai_auth';
const ROLE_COOKIE = 'ai_role';

const PUBLIC_ROUTES = ['/', '/about-us', '/contact-us', '/how-it-works', '/auth'];

function getHomeForRole(role: string): string {
  if (role === 'ADMIN') return '/admin/dashboard';
  if (role === 'RECRUITER') return '/recruiter/dashboard';
  return '/dashboard';
}

function roleCanAccessPath(role: string, path: string): boolean {
  if (path.startsWith('/admin')) return role === 'ADMIN';
  if (path.startsWith('/recruiter')) return role === 'RECRUITER' || role === 'ADMIN';
  if (path.startsWith('/dashboard')) return role === 'CANDIDATE';
  if (path.startsWith('/interview')) return role === 'CANDIDATE';
  if (path.startsWith('/jobs')) return role === 'CANDIDATE';
  if (path.startsWith('/profile')) return role === 'CANDIDATE';
  return true;
}

function sanitizeNextPath(value: string | null): string {
  if (!value) return '';
  if (!value.startsWith('/') || value.startsWith('//')) return '';
  return value;
}

function redirectToAuth(request: NextRequest): NextResponse {
  const loginUrl = new URL('/auth', request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  loginUrl.searchParams.set('next', nextPath);
  return NextResponse.redirect(loginUrl);
}

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.get(AUTH_COOKIE)?.value === '1';
  const role = String(request.cookies.get(ROLE_COOKIE)?.value || 'CANDIDATE').toUpperCase();

  const isPublic = PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(`${route}/`));

  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/interview') ||
    pathname.startsWith('/jobs') ||
    pathname.startsWith('/report') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/recruiter') ||
    pathname.startsWith('/profile') ||
    pathname.startsWith('/hiring');

  if (isProtectedPath && !isAuthenticated) {
    return redirectToAuth(request);
  }

  if (isPublic) {
    if (pathname === '/auth' && isAuthenticated) {
      const nextPath = sanitizeNextPath(request.nextUrl.searchParams.get('next'));
      if (nextPath && roleCanAccessPath(role, nextPath)) {
        return NextResponse.redirect(new URL(nextPath, request.url));
      }
      return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
    }

    // Home and public marketing pages are intentionally public for everyone.
    return NextResponse.next();
  }

  if (pathname.startsWith('/admin') && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  if (pathname.startsWith('/recruiter') && role !== 'RECRUITER' && role !== 'ADMIN') {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  if (!roleCanAccessPath(role, pathname)) {
    return NextResponse.redirect(new URL(getHomeForRole(role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|manifest.json).*)'],
};
