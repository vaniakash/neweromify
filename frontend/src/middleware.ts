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
          <title>eromify.in</title>
          <style>
            body {
              font-family: "Segoe UI", Tahoma, sans-serif;
              background-color: #fff;
              color: #202124;
              display: flex;
              justify-content: center;
              padding-top: 10vh;
              margin: 0;
            }
            .interstitial-wrapper {
              max-width: 600px;
              padding: 0 24px;
              box-sizing: border-box;
              width: 100%;
              text-align: left;
            }
            .icon {
              width: 48px;
              height: 48px;
              margin-bottom: 24px;
              fill: #5f6368;
            }
            h1 {
              font-size: 1.6em;
              font-weight: 500;
              margin: 0 0 15px 0;
              color: #202124;
            }
            p {
              font-size: 15px;
              line-height: 1.5;
              color: #5f6368;
              margin: 0 0 20px 0;
            }
            .error-code {
              font-size: 12px;
              color: #5f6368;
              text-transform: uppercase;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="interstitial-wrapper">
            <svg viewBox="0 0 48 48" class="icon">
              <path d="M28 4H10C8.9 4 8 4.9 8 6V42C8 43.1 8.9 44 10 44H38C39.1 44 40 43.1 40 42V16L28 4ZM26 8L36 18H26V8ZM36 40H12V8H22V22H36V40Z"/>
              <rect x="16" y="24" width="4" height="4"/>
              <rect x="28" y="24" width="4" height="4"/>
              <path d="M16 34C16 34 20 30 24 30C28 30 32 34 32 34" stroke="#5f6368" stroke-width="2" fill="none"/>
            </svg>
            <h1>This site can’t be reached</h1>
            <p>The webpage at <strong>https://www.eromify.in/</strong> might be temporarily down or it may have moved permanently to a new web address.</p>
            <div class="error-code">ERR_CONNECTION_REFUSED</div>
          </div>
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

