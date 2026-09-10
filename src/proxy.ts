import { NextResponse, type NextFetchEvent, type NextMiddleware } from 'next/server';
import type { NextAuthRequest } from 'next-auth';
import { auth } from './lib/auth';

// The explicit middleware signature selects Auth.js's middleware overload,
// rather than its otherwise-compatible App Route Handler overload.
const authorizePrivateRoutes: (req: NextAuthRequest, event: NextFetchEvent) => ReturnType<NextMiddleware> = (req) => {
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
};
const guardPrivateRoutes = auth(authorizePrivateRoutes);

export default async function proxy(...args: Parameters<NextMiddleware>) {
  const response = await guardPrivateRoutes(...args);
  // This guard only authorizes requests; cookie writes belong to /api/auth/*.
  // Auth.js renews cookies after its callback, so remove them from the final
  // response: an in-flight prefetch must never restore a cookie after sign-out.
  if (response) response.headers.delete('set-cookie');
  return response;
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};
