import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { getOptionalSupabaseEnv } from "./config";
import { createContentSecurityPolicy } from "@/lib/security/csp";

/**
 * Updates user session cookie on incoming requests.
 * Uses the official @supabase/ssr approach for Next.js 15 App Router.
 * Keeps all reading and public routes publicly accessible while keeping
 * authenticated sessions cleanly refreshed in the background.
 */
export async function updateSession(request: NextRequest) {
  const nonce = btoa(crypto.randomUUID());
  const env = getOptionalSupabaseEnv();
  const supabaseUrl = env?.url || "https://placeholder.supabase.co";
  const csp = createContentSecurityPolicy(nonce, supabaseUrl, process.env.NODE_ENV !== "production");
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);

  let supabaseResponse = NextResponse.next({
    request: { headers: requestHeaders },
  });

  supabaseResponse.headers.set("Content-Security-Policy", csp);
  if (!env) {
    return supabaseResponse;
  }
  const { url, key } = env;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        requestHeaders.set("cookie", request.cookies.toString());
        supabaseResponse = NextResponse.next({
          request: { headers: requestHeaders },
        });
        supabaseResponse.headers.set("Content-Security-Policy", csp);
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // Calling getUser() refreshes expired auth cookies securely
  // All public routes remain accessible if user is not logged in.
  try {
    await supabase.auth.getUser();
  } catch {
    // Auth refresh is best-effort; public reading must still work during a
    // transient Supabase outage. Protected data operations still fail closed.
  }

  return supabaseResponse;
}
