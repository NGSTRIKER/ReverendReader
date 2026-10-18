import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Navigation() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#313244]/80 bg-[#181825]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6 sm:px-8">
        <Link
          href="/"
          className="group flex items-center space-x-3 text-[#cdd6f4] hover:text-white transition-colors"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded border border-[#89b4fa]/40 bg-[#89b4fa]/10 text-[#89b4fa] group-hover:border-[#89b4fa] transition-colors">
            <span className="font-serif text-sm font-bold">蛊</span>
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-base font-semibold tracking-wider uppercase text-[#cdd6f4] group-hover:text-white">
              Reverend Insanity
            </span>
            <span className="text-[10px] tracking-widest text-[#a6adc8] uppercase">
              Gu Zhen Ren · 蛊真人
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-8 text-sm tracking-wide text-[#a6adc8]">
          <Link href="#synopsis" className="hover:text-[#89b4fa] transition-colors">
            Synopsis
          </Link>
          <Link href="#themes" className="hover:text-[#89b4fa] transition-colors">
            Themes
          </Link>
          <Link href="#artwork" className="hover:text-[#89b4fa] transition-colors">
            Art Gallery
          </Link>
          <Link href="/read" className="hover:text-[#89b4fa] transition-colors">
            Table of Contents
          </Link>
        </nav>

        <div className="flex items-center space-x-4">
          <Link
            href="/read"
            className="inline-flex items-center space-x-2 rounded border border-[#89b4fa]/60 bg-[#89b4fa]/20 px-4 py-2 text-xs font-medium tracking-wider uppercase text-[#89b4fa] transition-all hover:bg-[#89b4fa] hover:text-[#11111b] focus:outline-none focus:ring-2 focus:ring-[#89b4fa] focus:ring-offset-2 focus:ring-offset-[#181825]"
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Start Reading</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
