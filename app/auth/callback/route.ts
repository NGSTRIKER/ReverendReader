import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";
import { getSafeBaseOrigin } from "@/lib/auth/origin";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const safeNext = getSafeRedirectUrl(next, "/");
  const safeBaseOrigin = getSafeBaseOrigin(
    request.url,
    request.headers.get("x-forwarded-host")
  );

  // Handle OAuth provider error or cancellation (e.g., user clicked "Cancel" in Discord dialog)
  if (error || errorDescription) {
    const errorMsg = errorDescription || error || "Discord authorization was cancelled.";
    return NextResponse.redirect(
      `${safeBaseOrigin}/login?error=${encodeURIComponent(errorMsg)}&next=${encodeURIComponent(safeNext)}`
    );
  }

  if (code) {
    const supabase = await createClient();
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

    if (!exchangeError) {
      return NextResponse.redirect(`${safeBaseOrigin}${safeNext}`);
    }

    // Exchange code failed
    return NextResponse.redirect(
      `${safeBaseOrigin}/login?error=${encodeURIComponent(exchangeError.message)}&next=${encodeURIComponent(safeNext)}`
    );
  }

  // Fallback if neither code nor error parameter was provided
  return NextResponse.redirect(`${safeBaseOrigin}/login`);
}
