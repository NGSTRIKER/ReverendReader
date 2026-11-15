"use client";

import React from "react";
import Link from "next/link";
import { RefreshCw, ArrowLeft } from "lucide-react";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-paper px-4 py-12 font-sans text-ink">
      <div className="w-full max-w-md rounded-2xl border border-line bg-surface p-6 sm:p-8 text-center shadow-sheet">
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-accent">
          蛊真人 · Reverend Reader
        </p>
        <h1 className="mt-2 font-editorial text-2xl sm:text-3xl font-medium text-ink">
          This page hit an unexpected edge
        </h1>
        <p className="mt-2 text-sm text-muted leading-relaxed">
          Your reading position and preferences remain safely stored. Try reloading the view or return to the main index.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="btn-primary min-h-[44px] rounded-xl px-5 py-2.5 text-sm"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="btn-quiet min-h-[44px] rounded-xl px-5 py-2.5 text-sm"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
