import { NextResponse } from 'next/server';
import { auth } from './lib/auth';

const guardPrivateRoutes = auth((req) => {
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

export default async function proxy(...args: Parameters<typeof guardPrivateRoutes>) {
  const response = await guardPrivateRoutes(...args);
  // This guard only authorizes requests; cookie writes belong to /api/auth/*.
  // Auth.js renews cookies after its callback, so remove them from the final
  // response: an in-flight prefetch must never restore a cookie after sign-out.
  response?.headers.delete('set-cookie');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
