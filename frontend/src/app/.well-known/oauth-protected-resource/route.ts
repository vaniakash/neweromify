/**
 * /.well-known/oauth-protected-resource
 *
 * RFC 9728 — OAuth 2.0 Protected Resource Metadata
 *
 * Claude's MCP client calls this endpoint (and the path-scoped variant at
 * /.well-known/oauth-protected-resource/api/mcp) to discover WHICH
 * authorization server protects the MCP endpoint.
 *
 * Without this endpoint Claude cannot complete OAuth and will keep sending
 * every tools/call request with Authorization: MISSING ❌
 *
 * Fix for bug: tools/call always gets 401 because Claude never acquires a token.
 * Root cause: /.well-known/oauth-protected-resource returned 404 → OAuth dead-end.
 */

import { NextResponse } from "next/server";
import { getBaseUrl }   from "@/lib/oauth-config";

function buildMetadata(base: string) {
  return {
    resource:               `${base}/api/mcp`,
    authorization_servers:  [`${base}`],
    bearer_methods_supported: ["header"],
    scopes_supported:        ["mcp"],
    resource_documentation:  `${base}/mcp-keys`,
  };
}

export async function GET(request: Request) {
  const base = getBaseUrl();
  console.log(`[well-known/oauth-protected-resource] GET from ${request.headers.get("user-agent") ?? "unknown"}`);
  return NextResponse.json(
    buildMetadata(base),
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
