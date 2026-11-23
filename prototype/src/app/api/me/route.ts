import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/require-role";

// Per-user data: never cached.
export const dynamic = "force-dynamic";

// GET /api/me — profile, role, authorities and current 業務日 of the signed-in user (SC-00-03).
export async function GET() {
  const auth = await requireUser();
  if (!auth.ok) return auth.response;
  return NextResponse.json({ user: auth.user });
}
