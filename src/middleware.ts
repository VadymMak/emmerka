import createMiddleware from 'next-intl/middleware';
import { NextResponse, type NextRequest } from 'next/server';
import { routing } from './i18n/routing';
import { ADMIN_COOKIE, getAdminSecret, verifyAdminToken } from './lib/adminAuth';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin section: HMAC-verified cookie gate, no locale handling.
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') {
      return NextResponse.next();
    }
    const token = request.cookies.get(ADMIN_COOKIE)?.value;
    const valid = await verifyAdminToken(token, getAdminSecret());
    if (!valid) {
      const url = request.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // Storefront: next-intl drives locale routing off the shared `routing` config.
  return intlMiddleware(request);
}

export const config = {
  // Match storefront + /admin; exclude API routes, Next.js internals, and files
  // with an extension (e.g. favicon.ico).
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
