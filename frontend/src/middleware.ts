import { NextRequest, NextResponse } from "next/server";

/**
 * Geo-blocking middleware — India only.
 *
 * Vercel automatically sets the `x-vercel-ip-country` header at the edge
 * using MaxMind GeoIP data. We read that header and block any request
 * that originates outside India (country code "IN").
 *
 * In local development (`NODE_ENV !== "production"`) the header is absent,
 * so we allow all traffic — you won't be blocked while coding locally.
 *
 * To remove geo-blocking when you go global:
 *   Delete this file (`src/middleware.ts`) and the `/blocked` page.
 */
export function middleware(req: NextRequest) {
  // Always allow in local dev (header is not present outside Vercel)
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next();
  }

  // Vercel injects this at the edge — 2-letter ISO 3166-1 alpha-2 country code
  const country = req.headers.get("x-vercel-ip-country");

  // Allow Indian users and unresolved IPs (country is null → safest to allow)
  if (!country || country === "IN") {
    return NextResponse.next();
  }

  // Block everyone else — redirect to the /blocked page
  const blockedUrl = req.nextUrl.clone();
  blockedUrl.pathname = "/blocked";
  return NextResponse.rewrite(blockedUrl);
}

export const config = {
  // Run on every route EXCEPT:
  // - The /blocked page itself (avoid redirect loop)
  // - Vercel internals (_next/static, _next/image, favicon, etc.)
  // - API routes (some may be called from our servers, not from browsers)
  matcher: [
    "/((?!blocked|_next/static|_next/image|favicon|api/).*)",
  ],
};
