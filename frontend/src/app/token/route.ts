/**
 * POST /token  (and GET /token for discovery probes)
 *
 * Claude's OAuth client sometimes constructs the token endpoint URL as
 * {issuer}/token (using the issuer field from .well-known/oauth-authorization-server)
 * instead of reading token_endpoint directly.
 *
 * This route proxies all requests transparently to the real handler at
 * /api/oauth/token so that both URL patterns work.
 */

import { type NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const headers = new Headers();

  // Forward all relevant headers
  request.headers.forEach((value, key) => {
    if (
      key.toLowerCase() !== "host" &&
      key.toLowerCase() !== "connection"
    ) {
      headers.set(key, value);
    }
  });

  const origin = request.nextUrl.origin;
  const res = await fetch(`${origin}/api/oauth/token`, {
    method: "POST",
    headers,
    body,
  });

  const resBody = await res.text();
  const resHeaders = new Headers();
  res.headers.forEach((value, key) => {
    resHeaders.set(key, value);
  });

  return new Response(resBody, {
    status: res.status,
    headers: resHeaders,
  });
}

export async function OPTIONS(request: NextRequest) {
  const reqHeaders = request.headers.get("access-control-request-headers") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": reqHeaders,
    },
  });
}
