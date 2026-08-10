import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Extract country from Vercel or Cloudflare headers
  const country = request.headers.get('x-vercel-ip-country') || request.headers.get('cf-ipcountry');

  // If a country is detected and it is NOT India ('IN'), block access
  if (country && country !== 'IN') {
    // Return a 403 Forbidden response with a styled blocked page
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

  // Otherwise, allow the request to proceed
  return NextResponse.next();
}

export const config = {
  // Apply this middleware to all routes except api webhooks and static assets
  matcher: [
    '/((?!api/webhook|_next/static|_next/image|favicon.ico).*)',
  ],
};
