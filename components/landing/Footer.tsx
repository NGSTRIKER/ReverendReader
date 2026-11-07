import Link from "next/link";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper py-10 text-muted">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 text-sm">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className="font-semibold text-ink">Reverend Insanity</span>
          <span className="text-xs text-muted">by Gu Zhenren (蛊真人)</span>
          <span className="text-xs text-faint">· 2,334 chapters</span>
        </div>

        <nav aria-label="Footer" className="flex flex-wrap items-center gap-6 text-sm">
          <Link href="/#synopsis" className="hover:text-ink transition-colors">
            Synopsis
          </Link>
          <Link href="/#volumes" className="hover:text-ink transition-colors">
            Volumes
          </Link>
          <a
            href={DISCORD_INVITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink transition-colors"
          >
            Discord
          </a>
          <Link href="/read" className="font-medium text-accent hover:text-accent-hover transition-colors">
            Read Chapter 1 &#8594;
          </Link>
        </nav>
      </div>
    </footer>
  );
}
