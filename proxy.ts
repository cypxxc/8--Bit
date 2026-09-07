import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "node:crypto";

export function proxy(request: NextRequest) {
  const nonce = randomBytes(24).toString("base64");
  const development = process.env.NODE_ENV === "development";
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${development ? " 'unsafe-eval'" : ""}`,
    // Motion and existing components use inline styles, but scripts stay strict.
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://profile.line-scdn.net https://obs.line-scdn.net",
    "font-src 'self'",
    `connect-src 'self'${development ? " ws: wss:" : ""}`,
    "media-src 'self' blob:",
    "worker-src 'self' blob:",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");
  const headers = new Headers(request.headers);
  // Replace caller-supplied values; Next attaches this nonce during rendering.
  headers.set("Content-Security-Policy", policy);
  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = { matcher: ["/", "/admin/:path*"] };
