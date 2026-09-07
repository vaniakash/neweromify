import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * GET /api/geo
 * Returns { country, currency, gateway } for routing.
 * country: null when header is missing (unknown region).
 * Dev override: GET /api/geo?country=US (local dev only).
 */
export async function GET(request: NextRequest) {
  let country: string | null = null;

  // Dev-only override via query param (?country=US)
  if (process.env.NODE_ENV === "development") {
    const override = new URL(request.url).searchParams.get("country");
    if (override) country = override.toUpperCase();
  }

  // Read from Vercel or Cloudflare header
  if (!country) {
    country =
      request.headers.get("x-vercel-ip-country") ||
      request.headers.get("cf-ipcountry") ||
      null;
  }

  if (!country) {
    return NextResponse.json({ country: null, currency: null, gateway: null });
  }

  if (country === "IN") {
    return NextResponse.json({ country: "IN", currency: "INR", gateway: "payu" });
  }

  return NextResponse.json({ country, currency: "USD", gateway: "paypal" });
}
