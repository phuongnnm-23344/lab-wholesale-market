// Reads Supabase settings from environment variables. Values are never hard-coded.
// NEXT_PUBLIC_* are referenced literally so Next.js can inline them into the browser bundle.
// The secret key has no NEXT_PUBLIC_ prefix and is read only by server-only modules.

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing environment variable ${name}. See .env.local.example and README.`);
  }
  return value;
}

export function getPublicSupabaseEnv(): { url: string; publishableKey: string } {
  return {
    url: required("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: required(
      "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}

export function getSecretSupabaseKey(): string {
  return required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);
}
