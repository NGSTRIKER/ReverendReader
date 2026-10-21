import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#313244] bg-[#181825]/95 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <Link
          href="/"
          className="group flex items-center space-x-3 text-[#cdd6f4] hover:text-white transition-colors"
        >
          <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-md border border-[#313244] bg-[#1e1e2e]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icon.svg"
              alt="Reverend Insanity"
              width="32"
              height="32"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="flex items-baseline space-x-2">
            <span className="font-sans text-sm font-medium tracking-wide text-[#cdd6f4] group-hover:text-white">
              Reverend Insanity
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] tracking-widest text-[#89b4fa] uppercase">
              [ 蛊真人 ]
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="hidden md:flex items-center space-x-7 text-xs font-mono tracking-wider text-[#a6adc8]">
          <Link href="#synopsis" className="hover:text-white transition-colors">
            Synopsis
          </Link>
          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1.5 hover:text-white transition-colors"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1]" />
            <span>Discord</span>
          </a>
          <Link href="/read" className="hover:text-white transition-colors">
            Chapters (2,334)
          </Link>
        </nav>

        {/* Right CTA */}
        <div className="flex items-center space-x-2.5">
          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="md:hidden inline-flex items-center p-2 text-[#a6adc8] hover:text-white"
            aria-label="Discord Server"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
            </svg>
          </a>
          <Link
            href="/read"
            className="inline-flex items-center space-x-1.5 rounded-md border border-[#45475a] bg-[#313244] px-3.5 py-1.5 text-xs font-mono font-medium tracking-wide text-[#cdd6f4] hover:bg-[#45475a] hover:text-white transition-colors focus:outline-none focus:ring-1 focus:ring-[#89b4fa]"
          >
            <BookOpen className="h-3 w-3" />
            <span>Read Ch. 1</span>
            <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </header>
  );
}
