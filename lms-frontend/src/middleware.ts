import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value?.toLowerCase();
  const { pathname } = request.nextUrl;

  // 1. Auth routes (login/register): redirect already logged in users away
  if (pathname.startsWith('/login') || pathname.startsWith('/register')) {
    if (token) {
      return NextResponse.redirect(new URL('/courses', request.url));
    }
    return NextResponse.next();
  }

  // 2. Protected Student / General Learning routes
  if (pathname.startsWith('/learn') || pathname.startsWith('/dashboard') || pathname.startsWith('/my-courses')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Protected Instructor routes
  if (pathname.startsWith('/instructor')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'instructor' && userRole !== 'admin') {
      return NextResponse.redirect(new URL('/courses', request.url));
    }
  }

  // 4. Protected Admin routes
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    if (userRole !== 'admin') {
      return NextResponse.redirect(new URL('/courses', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/login',
    '/register',
    '/dashboard/:path*',
    '/my-courses/:path*',
    '/learn/:path*',
    '/instructor/:path*',
    '/admin/:path*',
  ],
};

