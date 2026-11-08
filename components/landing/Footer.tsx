import React from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

export function Footer() {
  return (
    <footer className="w-full pb-10 pt-4 px-4 sm:px-8 font-dmsans">
      <div className="mx-auto max-w-[1250px] rounded-xl border border-line bg-surface/85 px-6 py-5 text-muted shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-mono">
          {/* Brand Info */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-x-3 gap-y-1 text-center md:text-left">
            <span className="font-playfair font-bold text-ink text-sm">
              Reverend Insanity
            </span>
            <span className="text-muted">by Gu Zhenren (蛊真人)</span>
            <span className="text-faint tabular-nums">· 2,334 chapters · 4.86M words</span>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer" className="flex flex-wrap items-center justify-center gap-5 sm:gap-6">
            <Link
              href="/#synopsis"
              className="text-muted hover:text-accent transition-colors uppercase tracking-wider text-[11px]"
            >
              Synopsis
            </Link>
            <Link
              href="/#volumes"
              className="text-muted hover:text-accent transition-colors uppercase tracking-wider text-[11px]"
            >
              Volumes
            </Link>
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors uppercase tracking-wider text-[11px] inline-flex items-center gap-0.5"
            >
              <span>Discord</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="https://github.com/NGSTRIKER/ReverendReader"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-accent transition-colors uppercase tracking-wider text-[11px] inline-flex items-center gap-0.5"
            >
              <span>GitHub</span>
              <ArrowUpRight className="h-3 w-3" />
            </a>
            <a
              href="/downloads/Reverend_Insanity.epub"
              download="Reverend_Insanity.epub"
              className="text-muted hover:text-accent transition-colors uppercase tracking-wider text-[11px]"
            >
              EPUB ↓
            </a>
            <Link
              href="/read?c=1"
              className="font-semibold text-accent hover:brightness-125 transition-all uppercase tracking-wider text-[11px]"
            >
              Read Ch 1 &#8594;
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}
