import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

export function Footer() {
  return (
    <footer className="w-full border-t border-line bg-paper font-sans text-muted">
      <div className="mx-auto max-w-[1250px] px-4 sm:px-8 lg:px-12 py-6 sm:py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 text-center md:text-left">
            <span className="font-times font-semibold text-ink text-sm">
              Reverend Insanity
            </span>
            <span>by Gu Zhenren (蛊真人)</span>
            <span className="text-faint tabular-nums">· 2,334 chapters · 4.86M words</span>
          </div>

          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1 sm:gap-x-4">
            <Link
              href="/read"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
            >
              Read Online
            </Link>
            <Link
              href="/#synopsis"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
            >
              Synopsis
            </Link>
            <Link
              href="/#volumes"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
            >
              Volumes
            </Link>
            <Link
              href="/#faq"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
            >
              FAQ
            </Link>
            <a
              href="/downloads/Reverend_Insanity.epub"
              download="Reverend_Insanity.epub"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
              title="Download English EPUB (25 MB)"
            >
              EN EPUB (25 MB)
            </a>
            <a
              href="/downloads/Gu_Zhen_Ren_Raw.epub"
              download="Gu_Zhen_Ren_Raw.epub"
              className="inline-flex min-h-[44px] items-center px-2.5 text-xs hover:text-ink transition-colors"
              title="Download Chinese Raw EPUB (19 MB)"
            >
              中文 EPUB (19 MB)
            </a>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] items-center gap-1 px-2.5 text-xs hover:text-ink transition-colors"
            >
              <span>Discord</span>
              <ArrowUpRight className="h-3 w-3" aria-hidden="true" />
            </a>
          </nav>
        </div>

        <div className="mt-4 pt-4 border-t border-line/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-muted">
          <span>
            Editorial inspiration from{" "}
            <a
              href="https://twatf.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-[44px] sm:min-h-0 items-center gap-0.5 text-ink hover:text-accent underline underline-offset-2 transition-colors"
            >
              <span>twatf.pages.dev</span>
              <ArrowUpRight className="h-2.5 w-2.5" aria-hidden="true" />
            </a>
          </span>
          <span className="text-faint">Fan-made reader for <span className="font-times">Reverend Insanity</span>.</span>
        </div>
      </div>
    </footer>
  );
}
