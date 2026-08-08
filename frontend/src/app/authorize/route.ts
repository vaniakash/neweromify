/**
 * GET /authorize
 *
 * Claude's OAuth client constructs the authorization URL as {issuer}/authorize
 * instead of reading the `authorization_endpoint` field from the
 * /.well-known/oauth-authorization-server metadata.
 *
 * This route catches that case and permanently redirects to the real
 * consent page at /oauth/authorize — preserving all query parameters.
 */

import { type NextRequest, NextResponse } from "next/server";

export function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  // Forward every query param Claude sent (response_type, client_id,
  // redirect_uri, code_challenge, code_challenge_method, state, scope)
  const target = new URL("/oauth/authorize", request.nextUrl.origin);
  searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  // 302 (not 301) so Claude doesn't cache the redirect
  return NextResponse.redirect(target.toString(), 302);
}
