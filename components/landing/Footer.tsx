import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#2b303c]/70 bg-[#0d0e15] py-12 text-[#a6adc8]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-md border border-[#3b4252] shadow-sm">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Reverend Insanity" width="28" height="28" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-sm font-semibold tracking-wider uppercase text-white">
                Reverend Insanity Reader
              </span>
              <span className="ml-2 font-mono text-[10px] text-[#74c7ec]">[ 蛊真人 ]</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono tracking-wider text-[#a6adc8]">
            <Link href="#synopsis" className="hover:text-[#89b4fa] transition-colors">
              Synopsis
            </Link>
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 hover:text-[#89b4fa] transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1]" />
              <span>Discord Alliance</span>
            </a>
            <Link href="/read" className="hover:text-[#89b4fa] transition-colors">
              Read (2,334 Ch)
            </Link>
          </div>
        </div>

        <div className="border-t border-[#212430] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#9399b2] font-mono">
          <div>
            Gu Zhenren (蛊真人) · Distraction-free novel reader
          </div>
          <Link
            href="/read"
            className="inline-flex items-center space-x-1.5 text-[#89b4fa] hover:text-[#b4befe] transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            <span>Begin Chapter 1 &rarr;</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
