import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // ── GEO-BLOCK: India only ─────────────────────────────────────────────────
  // Vercel sets x-vercel-ip-country at the edge (MaxMind GeoIP).
  // In local dev the header is absent — we skip blocking so you can code normally.
  // To remove geo-blocking: delete the block below and the /blocked page.
  if (process.env.NODE_ENV === 'production' && !pathname.startsWith('/blocked')) {
    const country = (req as NextRequest).headers.get('x-vercel-ip-country');
    // null = unresolved IP → allow (safe default)
    if (country && country !== 'IN') {
      const blockedUrl = req.nextUrl.clone();
      blockedUrl.pathname = '/blocked';
      return NextResponse.rewrite(blockedUrl);
    }
  }

  // ── ADMIN PROTECTION ─────────────────────────────────────────────────────
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const session = req.cookies.get('admin_session');
    if (!session || session.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // ── USER PROTECTION ───────────────────────────────────────────────────────
  const protectedRoutes = ['/dashboard', '/creator', '/gallery', '/account', '/api/payment', '/api/user', '/api/generate-image'];
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // ── LOGIN REDIRECT ────────────────────────────────────────────────────────
  if (pathname === '/login' && isAuthenticated) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|video|eromifylogo.png|apple-touch-icon.png|site.webmanifest|sitemap.xml|robots.txt).*)',
  ],
};
