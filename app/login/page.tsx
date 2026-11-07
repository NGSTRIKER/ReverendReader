"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";
import { DiscordIcon } from "@/components/ui/DiscordIcon";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

function LoginForm() {
  const searchParams = useSearchParams();
  const nextParam = searchParams.get("next") || searchParams.get("redirectedFrom");
  const initialError = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    errorDescription || initialError || null
  );

  const safeNext = getSafeRedirectUrl(nextParam, "/");

  const handleDiscordSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const supabase = createClient();
      const callbackUrl = `${window.location.origin}/auth/callback?next=${encodeURIComponent(safeNext)}`;

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "discord",
        options: {
          redirectTo: callbackUrl,
        },
      });

      if (error) {
        setErrorMessage(error.message);
        setIsLoading(false);
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred during sign-in.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md border border-line bg-surface p-8 sm:p-10 shadow-sheet">
      <div className="flex items-baseline justify-between border-b border-line pb-4 mb-6">
        <Link href="/" className="inline-flex items-baseline gap-2 text-ink">
          <span className="h-2 w-2 bg-accent" aria-hidden="true" />
          <span className="font-semibold">Reverend Insanity</span>
        </Link>
        <span className="label">蛊真人</span>
      </div>

      <p className="label text-accent">Reader Account</p>
      <h1 className="mt-1 text-2xl sm:text-3xl font-semibold tracking-[-0.015em] text-ink">
        Sign in with Discord
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-muted">
        Sync your reading position and bookmarks across devices, and participate in chapter
        discussions.
      </p>

      {errorMessage && (
        <div className="mt-6 flex items-start gap-2.5 border border-danger/50 bg-danger/5 p-3.5 text-left text-xs text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Authentication notice: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-xs text-danger/70 hover:text-danger"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      <div className="mt-7 space-y-4">
        <button
          onClick={handleDiscordSignIn}
          disabled={isLoading}
          type="button"
          className="btn-primary w-full py-3 text-sm font-medium"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Connecting to Discord...</span>
            </>
          ) : (
            <>
              <DiscordIcon className="h-4 w-4" />
              <span>Continue with Discord</span>
            </>
          )}
        </button>

        <p className="text-xs leading-relaxed text-muted">
          All 2,334 chapters remain open to read without an account.
        </p>
      </div>

      <div className="mt-8 border-t border-line pt-5 flex items-center justify-between text-xs">
        <Link
          href={safeNext}
          className="inline-flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Return to {safeNext === "/" ? "Index" : "Reader"}</span>
        </Link>
        <ThemeToggle />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-4 py-12 text-ink">
      <Suspense
        fallback={
          <div className="flex h-80 w-full max-w-md items-center justify-center border border-line bg-surface p-8">
            <Loader2 className="h-6 w-6 animate-spin text-accent" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
