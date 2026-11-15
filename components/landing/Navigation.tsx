"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Info, BookOpen } from "lucide-react";
import { UserNav } from "@/components/auth/UserNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DiscordIcon, DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";
import { InfoModal } from "@/components/landing/InfoModal";

export function Navigation() {
  const [isInfoOpen, setIsInfoOpen] = useState(false);

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-3.5 focus:py-2 focus:text-xs focus:font-semibold focus:text-on-accent focus:shadow-sheet"
      >
        Skip to content
      </a>

      <header className="sticky top-0 z-40 border-b border-line bg-paper/90 backdrop-blur-md font-sans transition-colors duration-200">
        <div className="mx-auto flex h-14 sm:h-16 w-full max-w-[1250px] items-center justify-between gap-2 px-3.5 sm:px-8 lg:px-12">
          {/* Brand Logo */}
          <Link href="/" className="group flex flex-col justify-center select-none min-w-0 pr-1">
            <span className="font-times text-[15px] sm:text-xl font-semibold tracking-[0.07em] sm:tracking-[0.12em] uppercase text-ink transition-colors group-hover:text-muted whitespace-nowrap">
              REVEREND INSANITY
            </span>
            <span className="font-sans text-[9px] tracking-[0.18em] sm:tracking-[0.22em] uppercase text-muted mt-0.5 whitespace-nowrap">
              GU ZHENREN · 蛊真人
            </span>
          </Link>

          {/* Navigation Controls — 44px+ Mobile Touch Targets */}
          <nav aria-label="Primary" className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* About / Info Modal Button */}
            <button
              type="button"
              onClick={() => setIsInfoOpen(true)}
              aria-label="About this reader"
              title="About this reader & novel"
              className="circle-icon-btn"
            >
              <Info className="h-4 w-4" aria-hidden="true" />
            </button>

            {/* Discord Community Button — Shown in tablet+ header; accessible via Info & Footer on mobile */}
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Discord Community"
              title="Join our Discord community"
              className="circle-icon-btn hidden sm:inline-flex"
            >
              <DiscordIcon className="h-4 w-4" />
            </a>

            {/* Read Link */}
            <Link
              href="/read"
              className="hidden sm:inline-flex min-h-[36px] items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium tracking-wide text-ink transition-colors hover:border-line-strong hover:bg-sunken"
            >
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Read</span>
            </Link>

            <span className="hidden sm:inline-block mx-1 h-4 w-px bg-line" aria-hidden="true" />

            {/* Theme Toggle & User Account */}
            <ThemeToggle className="h-11 w-11 sm:h-9 sm:w-9 rounded-full border border-line" />
            <UserNav compactMobile />
          </nav>
        </div>
      </header>

      {/* About Modal */}
      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />
    </>
  );
}
