import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./config";

/**
 * Creates a browser-side Supabase client for Client Components.
 */
export function createClient() {
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
