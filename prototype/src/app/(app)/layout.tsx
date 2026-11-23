import { redirect } from "next/navigation";
import { AppShell } from "@/components/app-shell/app-shell";
import { createSupabaseServerClient } from "@/lib/supabase/server-client";

// Every screen inside (app) requires sign-in. The proxy already redirects; this is a second check
// so a misconfigured matcher can never expose a page. Business data is loaded via /api/* only.
export default async function AuthenticatedLayout({ children }: LayoutProps<"/">) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return <AppShell>{children}</AppShell>;
}
