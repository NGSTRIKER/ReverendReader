/* Hallmark · macrostructure: editorial-frontispiece · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

import Link from "next/link";
import { UserNav } from "@/components/auth/UserNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur-sm font-mono">
      <div className="mx-auto flex h-14 max-w-[1120px] items-center justify-between px-4 sm:px-8">
        <Link href="/" className="group flex items-baseline gap-2.5 text-ink">
          <span className="inline-block h-2 w-2 translate-y-[-1px] bg-accent" aria-hidden="true" />
          <span className="text-[0.95rem] sm:text-base font-bold tracking-tight group-hover:text-accent transition-colors">
            Reverend Insanity
          </span>
          <span className="hidden sm:inline font-light text-xs text-muted tracking-wide">蛊真人</span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
          <Link
            href="/#synopsis"
            className="hidden md:inline-flex px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            Synopsis
          </Link>
          <Link
            href="/#volumes"
            className="hidden md:inline-flex px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            Volumes
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex px-2.5 py-1.5 text-xs font-medium uppercase tracking-wider text-muted hover:text-ink transition-colors"
          >
            Discord
          </a>
          <Link
            href="/read"
            className="px-2.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
          >
            Read
          </Link>

          <span className="mx-1 h-4 w-px bg-line" aria-hidden="true" />

          <ThemeToggle />
          <UserNav />
        </nav>
      </div>
    </header>
  );
}
