import type { NextRequest } from "next/server";
import { refreshSessionAndGuard } from "@/lib/supabase/proxy-session-guard";

// Next.js 16: "proxy" replaces the former middleware file convention.
export async function proxy(request: NextRequest) {
  return refreshSessionAndGuard(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
