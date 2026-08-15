import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/auth';

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;
  const isAuthenticated = !!req.auth;

  // ── REGION BLOCKING ──────────────────────────────────────────────────────
  const country = req.headers.get('x-vercel-ip-country') || req.headers.get('cf-ipcountry');
  if (country && country !== 'IN') {
    return new NextResponse(
      `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Access Restricted</title>
          <style>
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              display: flex; 
              flex-direction: column; 
              align-items: center; 
              justify-content: center; 
              height: 100vh; 
              margin: 0; 
              background: #09090b; /* Zinc 950 */
              color: #f4f4f5; /* Zinc 50 */
              text-align: center; 
              padding: 20px; 
            }
            .container {
              max-width: 480px;
              padding: 40px;
              border-radius: 24px;
              background: #18181b; /* Zinc 900 */
              border: 1px solid rgba(255,255,255,0.05);
              box-shadow: 0 20px 40px rgba(0,0,0,0.4);
            }
            h1 { 
              font-size: 1.75rem; 
              margin-top: 0;
              margin-bottom: 12px; 
              color: #ef4444; /* Red 500 */
            }
            p { 
              color: #a1a1aa; /* Zinc 400 */
              line-height: 1.6; 
              margin: 0;
            }
            .icon {
              font-size: 48px;
              margin-bottom: 16px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="icon">🌍</div>
            <h1>Not Available in Your Region</h1>
            <p>Eromify is currently only available to users located in India. We apologize for any inconvenience this may cause.</p>
          </div>
        </body>
      </html>
      `,
      { 
        status: 403,
        headers: { 'Content-Type': 'text/html; charset=utf-8' }
      }
    );
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

