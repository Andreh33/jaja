import { NextResponse } from 'next/server';
import { auth } from './lib/auth';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    if (!session) return NextResponse.redirect(new URL('/admin/login', req.url));
    if (session.user?.role !== 'ADMIN') return NextResponse.redirect(new URL('/login', req.url));
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
