/**
 * /.well-known/oauth-protected-resource/api/mcp
 *
 * Path-scoped OAuth Protected Resource Metadata (RFC 9728).
 *
 * Claude tries this path-specific URL FIRST before falling back to the
 * root /.well-known/oauth-protected-resource. Both were returning 404,
 * causing Claude to never complete OAuth and always send requests
 * without a Bearer token (Authorization: MISSING ❌).
 */

import { NextResponse } from "next/server";
import { getBaseUrl }   from "@/lib/oauth-config";

export async function GET(request: Request) {
  const base = getBaseUrl();
  console.log(`[well-known/oauth-protected-resource/api/mcp] GET from ${request.headers.get("user-agent") ?? "unknown"}`);
  return NextResponse.json(
    {
      resource:               `${base}/api/mcp`,
      authorization_servers:  [`${base}`],
      bearer_methods_supported: ["header"],
      scopes_supported:        ["mcp"],
      resource_documentation:  `${base}/mcp-keys`,
    },
    {
      headers: {
        "Content-Type":                "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Expose-Headers": "WWW-Authenticate",
        "Cache-Control":               "no-store",
      },
    }
  );
}

export async function OPTIONS(request: Request) {
  const reqHeaders = request.headers.get("access-control-request-headers") || "*";
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": reqHeaders,
      "Access-Control-Expose-Headers": "WWW-Authenticate",
    },
  });
}
