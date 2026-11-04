/**
 * Shared Supabase environment configuration.
 * Validates and retrieves the Supabase URL and Publishable/Anon key.
 */
export function getOptionalSupabaseEnv(): { url: string; key: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export function getSupabaseEnv() {
  const env = getOptionalSupabaseEnv();

  if (!env) {
    throw new Error(
      "Missing Supabase configuration: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY are defined in .env.local"
    );
  }

  return env;
}
