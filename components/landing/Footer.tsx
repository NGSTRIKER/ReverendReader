import Link from "next/link";
import { BookOpen } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-[#313244]/80 bg-[#181825] py-16 text-[#a6adc8]">
      <div className="mx-auto max-w-5xl px-6 sm:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex h-7 w-7 items-center justify-center rounded border border-[#89b4fa]/40 bg-[#89b4fa]/10 text-[#89b4fa] font-serif text-xs font-bold">
                蛊
              </div>
              <span className="font-serif text-lg font-semibold tracking-wider uppercase text-[#cdd6f4]">
                Reverend Insanity Reader
              </span>
            </div>
            <p className="text-xs text-[#a6adc8] max-w-md">
              A bespoke, distraction-free reading sanctuary for the epic xianxia novel by Gu Zhen Ren (蛊真人).
            </p>
          </div>

          <div className="flex flex-wrap gap-6 text-xs uppercase tracking-wider text-[#bac2de]">
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
              Reader
            </Link>
          </div>
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
