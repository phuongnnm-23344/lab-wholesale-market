import type { NextConfig } from "next";

// cacheComponents / partialPrefetching (create-next-app defaults) are left OFF on purpose:
// every screen shows per-user data behind authentication, so nothing should be prerendered or
// cached across users, and route handlers use `dynamic = "force-dynamic"`.
const nextConfig: NextConfig = {
  poweredByHeader: false,
};

export default nextConfig;
