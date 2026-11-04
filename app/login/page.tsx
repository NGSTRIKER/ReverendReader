"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSafeRedirectUrl } from "@/lib/auth/redirect";
import { ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

function DiscordIcon({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

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
      const msg = err instanceof Error ? err.message : "An unexpected error occurred during sign-in.";
      setErrorMessage(msg);
      setIsLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#414559] bg-[#303446]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
      {/* Subtle top ambient accent */}
      <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-48 -translate-x-1/2 rounded-full bg-[#8caaee]/10 blur-3xl" />

      {/* Novel Brand Header */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center space-x-3 transition-transform hover:scale-105"
        >
          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-xl border border-[#51576d] bg-[#292c3c] p-1.5 shadow-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt="Reverend Insanity"
              width="48"
              height="48"
              className="h-full w-full object-cover"
            />
          </div>
        </Link>

        <h1 className="mt-4 font-serif text-2xl font-bold tracking-tight text-[#c6d0f5] sm:text-3xl">
          Reverend Reader
        </h1>
        <p className="mt-1 font-mono text-xs uppercase tracking-widest text-[#8caaee]">
          [ 蛊真人 &bull; Gu Zhenren ]
        </p>
        <p className="mt-3 text-xs text-[#a5adce]">
          Sign in to access your cultivator profile and synced preferences.
        </p>
      </div>

      {/* Error Alert Box */}
      {errorMessage && (
        <div className="mt-6 flex items-start space-x-2.5 rounded-lg border border-[#e78284]/40 bg-[#e78284]/10 p-3.5 text-left text-xs text-[#e78284]">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <div className="flex-1">
            <span className="font-semibold">Authentication Notice: </span>
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-xs text-[#e78284]/70 hover:text-[#e78284]"
            aria-label="Dismiss error"
          >
            &times;
          </button>
        </div>
      )}

      {/* Discord OAuth Action */}
      <div className="mt-8 space-y-4">
        <button
          onClick={handleDiscordSignIn}
          disabled={isLoading}
          type="button"
          className="group relative flex w-full items-center justify-center space-x-3 rounded-xl bg-[#5865F2] px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-[#5865F2]/25 transition-all duration-200 hover:bg-[#4752c4] hover:shadow-[#5865F2]/40 focus:outline-none focus:ring-2 focus:ring-[#8caaee] focus:ring-offset-2 focus:ring-offset-[#303446] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin text-white" />
              <span>Connecting to Discord...</span>
            </>
          ) : (
            <>
              <DiscordIcon className="h-5 w-5 transition-transform group-hover:scale-110" />
              <span>Continue with Discord</span>
            </>
          )}
        </button>

        <p className="text-center text-[11px] leading-relaxed text-[#737994]">
          By continuing, you agree to connect your Discord identity. All reading chapters remain publicly accessible.
        </p>
      </div>

      {/* Return Navigation */}
      <div className="mt-8 border-t border-[#414559]/60 pt-6 text-center">
        <Link
          href={safeNext}
          className="inline-flex items-center space-x-1.5 font-mono text-xs text-[#a5adce] transition-colors hover:text-white"
        >
          <ArrowLeft className="h-3 w-3" />
          <span>Return to {safeNext === "/" ? "Home" : "Reading"}</span>
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#292c3c] px-4 py-12 text-[#c6d0f5] selection:bg-[#8caaee]/30">
      {/* Background radial atmosphere */}
      <div
        className="pointer-events-none fixed inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(circle at 50% 30%, rgba(140, 170, 238, 0.08) 0%, transparent 60%)",
        }}
      />

      <Suspense
        fallback={
          <div className="flex h-96 w-full max-w-md items-center justify-center rounded-2xl border border-[#414559] bg-[#303446]/50 p-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#8caaee]" />
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
