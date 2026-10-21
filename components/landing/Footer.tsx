import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#414559] bg-[#232634] py-12 text-[#a5adce]">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
          <div className="flex items-center space-x-3">
            <div className="relative h-7 w-7 flex-shrink-0 overflow-hidden rounded-md border border-[#414559] bg-[#292c3c]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/icon.svg" alt="Reverend Insanity" width="28" height="28" className="h-full w-full object-cover" />
            </div>
            <div>
              <span className="font-sans text-sm font-medium tracking-wide text-white">
                Reverend Insanity Reader
              </span>
              <span className="ml-2 font-mono text-[10px] text-[#8caaee]">[ 蛊真人 ]</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs font-mono tracking-wider text-[#a5adce]">
            <Link href="#synopsis" className="hover:text-white transition-colors">
              Synopsis
            </Link>
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1.5 hover:text-white transition-colors"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
              <span>Discord Alliance</span>
            </a>
            <Link href="/read" className="hover:text-white transition-colors">
              Read (2,334 Ch)
            </Link>
          </div>
        </div>

        <div className="border-t border-[#414559] pt-6 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-[#a5adce] font-mono">
          <div>
            Gu Zhenren (蛊真人) · Distraction-free novel reader
          </div>
          <Link
            href="/read"
            className="inline-flex items-center space-x-1.5 text-[#8caaee] hover:text-[#babbf1] transition-colors"
          >
            <BookOpen className="h-3 w-3" />
            <span>Begin Chapter 1 &rarr;</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
