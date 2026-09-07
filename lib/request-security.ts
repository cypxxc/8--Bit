import { isIP } from "node:net";

// Trust an IP header only after the hosting proxy is configured to overwrite it
// and direct access to the application is blocked. Never guess from XFF.
export function clientIp(request: Request, trustedHeader = ""): string {
  const value = trustedHeader ? request.headers.get(trustedHeader)?.trim() : "";
  if (!value || !isIP(value)) return "unverified";
  // Canonicalize IPv6 so equivalent spellings share one rate-limit bucket.
  return isIP(value) === 6 ? new URL(`http://[${value}]`).hostname : value;
}

export function validRequestOrigin(request: Request, configuredOrigin?: string): boolean {
  if (request.headers.get("sec-fetch-site") === "cross-site") return false;
  const origin = request.headers.get("origin");
  if (!origin || origin === "null") return false;
  if (configuredOrigin) return origin === configuredOrigin;
  const url = new URL(request.url);
  return origin === `${url.protocol}//${request.headers.get("host") || url.host}`;
}
