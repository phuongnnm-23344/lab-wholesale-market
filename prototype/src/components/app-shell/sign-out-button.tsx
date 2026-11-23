"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    try {
      await createSupabaseBrowserClient().auth.signOut();
    } finally {
      router.replace("/login");
      router.refresh();
    }
  }

  return (
    <button type="button" className="button-secondary" onClick={handleSignOut}>
      ログアウト
    </button>
  );
}
