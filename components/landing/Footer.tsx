import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#313244]/80 bg-[#181825] py-16 text-[#a6adc8]">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-lg border border-[#45475a] shadow-sm">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/icon.svg" alt="Reverend Insanity" className="h-full w-full object-cover" />
              </div>
              <span className="font-serif text-lg font-semibold tracking-wider uppercase text-[#cdd6f4]">
                Reverend Insanity Reader
              </span>
            </div>
            <p className="text-xs text-[#a6adc8] max-w-md">
              A bespoke, distraction-free reading sanctuary for the epic xianxia novel by Gu Zhenren (蛊真人).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs uppercase tracking-wider text-[#bac2de]">
            <Link href="#synopsis" className="hover:text-[#89b4fa] transition-colors">
              Synopsis
            </Link>
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 text-[#89b4fa] hover:text-[#b4befe] transition-colors"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Discord Alliance</span>
            </a>
            <Link href="/read" className="hover:text-[#89b4fa] transition-colors">
              Table of Contents
            </Link>
          </div>
        </div>

        {/* Discord Alliance Highlight */}
        <div className="mb-8 rounded-lg border border-[#313244] bg-[#11111b]/60 p-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs text-[#a6adc8]">
            <span className="font-semibold text-white">Community: </span>
            Heaven And Earth Great Love Alliance • Reverend Insanity [ 蛊真人 ]
          </div>
          <a
            href="https://discord.gg/YbwBb6DjXH"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-semibold text-[#89b4fa] hover:text-white transition-colors flex items-center space-x-1"
          >
            <span>discord.gg/YbwBb6DjXH &rarr;</span>
          </a>
        </div>

        <div className="border-t border-[#313244] pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-[#6c7086]">
          <div>
            Crafted for literary immersion · Catppuccin Blue Edition
          </div>
          <div className="flex items-center space-x-2">
            <Link
              href="/read"
              className="inline-flex items-center space-x-1.5 text-[#89b4fa] hover:text-[#b4befe] transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>Begin Chapter 1 &rarr;</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
