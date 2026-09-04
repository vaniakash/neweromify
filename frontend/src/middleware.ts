import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import NextAuth from 'next-auth';
import { authConfig } from '@/auth.config';

const { auth } = NextAuth(authConfig);
export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // ── REGION BLOCKING ────────
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  if (country && country !== 'IN') {
    return new NextResponse(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Not available</title>
          <style>
            body {
              margin: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              background-color: #ffffff;
              color: #000000;
            }
            h1 {
              font-size: 24px;
              font-weight: normal;
            }
          </style>
        </head>
        <body>
          <h1>Not available</h1>
        </body>
      </html>
    `, {
      status: 200,
      headers: {
        'content-type': 'text/html',
      },
    });
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
    '/((?!_next/static|_next/image|favicon.ico|images|video|eromifylogo.png|apple-touch-icon.png|site.webmanifest|sitemap.xml|robots.txt|api|.well-known).*)',
  ],
};

