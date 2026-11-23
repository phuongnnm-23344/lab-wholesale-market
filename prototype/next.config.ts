import type { NextConfig } from "next";

// cacheComponents / partialPrefetching (create-next-app defaults) are left OFF on purpose:
// every screen shows per-user data behind authentication, so nothing should be prerendered or
// cached across users, and route handlers use `dynamic = "force-dynamic"`.
// Security headers (code review S6). CSP is limited to frame-ancestors: a full script CSP needs nonces.
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
