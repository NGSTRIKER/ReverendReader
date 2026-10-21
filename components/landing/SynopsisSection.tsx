import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-b border-[#313244] bg-[#1e1e2e] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section Heading with Archcraft Accent */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[#313244] pb-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#89b4fa] uppercase">
              // 01 · OFFICIAL SYNOPSIS
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Reverend Insanity · 蛊真人
            </h2>
            <div className="w-10 h-[2px] bg-[#89b4fa] mt-3 mb-1" />
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-xs text-[#a6adc8]">
            Author: <span className="text-[#89b4fa]">Gu Zhenren (蛊真人)</span>
          </div>
        </div>

        {/* Dossier Card - Clean Matte Surface */}
        <div className="rounded-md border border-[#313244] bg-[#181825] p-6 sm:p-8 mb-8">
          {/* Metadata Bar */}
          <div className="flex items-center justify-between border-b border-[#313244] pb-3 mb-6 text-[11px] font-mono text-[#a6adc8]">
            <span className="text-[#89b4fa]">[ CANONICAL COMMUNITY TRANSLATION ]</span>
            <span>2,334 CHAPTERS · COMPLETE</span>
          </div>

          {/* Classical Couplet */}
          <div className="border-l-2 border-[#89b4fa] pl-4 sm:pl-6 py-1 mb-7">
            <p className="font-serif text-base sm:text-lg text-[#cdd6f4] italic leading-relaxed">
              &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.&rdquo;
            </p>
            <div className="mt-2 space-y-1 font-serif text-xs sm:text-sm text-[#a6adc8]">
              <p>The Three Temples are unrighteous, the demon is reborn.</p>
              <p>Former days are but an old dream, an identical name is made anew.</p>
            </div>
          </div>

          {/* Authentic Synopsis Body */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#cdd6f4]">
            <p className="font-medium text-white">
              A story of a time traveler who keeps on being reborn.
            </p>
            <p className="text-[#bac2de]">
              A unique world that grows, cultivates, and uses Gu.
            </p>
            <p className="text-[#a6adc8] italic text-xs sm:text-sm font-serif">
              The Spring and Autumn Cicada, the Venomous Moonlight Gu, the Wine Insect, All-Encompassing Golden Light Insect, Slender Black Hair Gu, Gu of Hope…
            </p>
            <p className="font-serif text-base sm:text-lg text-[#89b4fa] pt-1 font-medium">
              And a great demon of the world that does exactly as his heart pleases!
            </p>
          </div>

          {/* Narrative Context */}
          <div className="mt-8 pt-6 border-t border-[#313244] text-xs sm:text-sm text-[#a6adc8] leading-relaxed space-y-3">
            <p>
              Fang Yuan, a transmigrator who walked the demonic path for five hundred years, was cornered by righteous sects at the summit of his mortal life. In his final breath, he activated the legendary Time-path treasure—the <strong className="text-white">Spring Autumn Cicada</strong>—reversing the flow of time and awakening as his fifteen-year-old self on Mount Qing Mao.
            </p>
            <p>
              With five centuries of cunning, boundless ambition, and profound experience intact, he sets out to cultivate Gu and conquer the five regions, unhindered by mortal morality, in his unrelenting quest for <strong className="text-[#89b4fa]">eternal life</strong>.
            </p>
          </div>
        </div>

        {/* Community Alliance Invitation Banner - Archcraft Matte Finish */}
        <div className="rounded-md border border-[#313244] bg-[#181825] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-[#89b4fa]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6e3a1]" />
              <span>Official Discord Community</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-white">
              Heaven And Earth Great Love Alliance • Reverend Insanity [ 蛊真人 ]
            </h3>
            <p className="text-xs text-[#a6adc8]">
              Connect with fellow cultivators, discuss chapters, explore theories, and join the alliance.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-md border border-[#45475a] bg-[#313244] px-5 py-2.5 text-xs font-mono font-medium text-white hover:bg-[#45475a] hover:border-[#585b70] transition-colors focus:outline-none focus:ring-1 focus:ring-[#89b4fa]"
            >
              <span>Join Discord ↗</span>
            </a>
            <Link
              href="/read"
              className="inline-flex items-center space-x-1.5 rounded-md border border-[#313244] bg-[#1e1e2e] px-4 py-2.5 text-xs font-mono text-[#cdd6f4] hover:bg-[#313244] hover:text-white transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#89b4fa]" />
              <span>Read Ch. 1</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
