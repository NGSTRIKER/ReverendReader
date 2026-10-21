import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-b border-[#414559] bg-[#303446] py-20 sm:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6">
        {/* Section Heading with Archcraft Accent */}
        <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-baseline sm:justify-between border-b border-[#414559] pb-4">
          <div>
            <span className="font-mono text-[11px] tracking-[0.2em] text-[#8caaee] uppercase">
              // 01 · OFFICIAL SYNOPSIS
            </span>
            <h2 className="mt-1 font-serif text-2xl sm:text-3xl font-normal tracking-tight text-white">
              Reverend Insanity · 蛊真人
            </h2>
            <div className="w-10 h-[2px] bg-[#8caaee] mt-3 mb-1" />
          </div>
          <div className="mt-2 sm:mt-0 font-mono text-xs text-[#a5adce]">
            Author: <span className="text-[#8caaee]">Gu Zhenren (蛊真人)</span>
          </div>
        </div>

        {/* Dossier Card - Clean Matte Surface */}
        <div className="rounded-md border border-[#414559] bg-[#292c3c] p-6 sm:p-8 mb-8">
          {/* Metadata Bar */}
          <div className="flex items-center justify-between border-b border-[#414559] pb-3 mb-6 text-[11px] font-mono text-[#a5adce]">
            <span className="text-[#8caaee]">[ CANONICAL COMMUNITY TRANSLATION ]</span>
            <span>2,334 CHAPTERS · COMPLETE</span>
          </div>

          {/* Classical Couplet */}
          <div className="border-l-2 border-[#8caaee] pl-4 sm:pl-6 py-1 mb-7">
            <p className="font-serif text-base sm:text-lg text-[#c6d0f5] italic leading-relaxed">
              &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.&rdquo;
            </p>
            <div className="mt-2 space-y-1 font-serif text-xs sm:text-sm text-[#a5adce]">
              <p>The Three Temples are unrighteous, the demon is reborn.</p>
              <p>Former days are but an old dream, an identical name is made anew.</p>
            </div>
          </div>

          {/* Authentic Synopsis Body */}
          <div className="space-y-4 text-sm sm:text-base leading-relaxed text-[#c6d0f5]">
            <p className="font-medium text-white">
              A story of a time traveler who keeps on being reborn.
            </p>
            <p className="text-[#b5bfe2]">
              A unique world that grows, cultivates, and uses Gu.
            </p>
            <p className="text-[#a5adce] italic text-xs sm:text-sm font-serif">
              The Spring and Autumn Cicada, the Venomous Moonlight Gu, the Wine Insect, All-Encompassing Golden Light Insect, Slender Black Hair Gu, Gu of Hope…
            </p>
            <p className="font-serif text-base sm:text-lg text-[#8caaee] pt-1 font-medium">
              And a great demon of the world that does exactly as his heart pleases!
            </p>
          </div>

          {/* Narrative Context */}
          <div className="mt-8 pt-6 border-t border-[#414559] text-xs sm:text-sm text-[#a5adce] leading-relaxed space-y-3">
            <p>
              Fang Yuan, a transmigrator who walked the demonic path for five hundred years, was cornered by righteous sects at the summit of his mortal life. In his final breath, he activated the legendary Time-path treasure—the <strong className="text-white">Spring Autumn Cicada</strong>—reversing the flow of time and awakening as his fifteen-year-old self on Mount Qing Mao.
            </p>
            <p>
              With five centuries of cunning, boundless ambition, and profound experience intact, he sets out to cultivate Gu and conquer the five regions, unhindered by mortal morality, in his unrelenting quest for <strong className="text-[#8caaee]">eternal life</strong>.
            </p>
          </div>
        </div>

        {/* Community Alliance Invitation Banner - Archcraft Matte Finish */}
        <div className="rounded-md border border-[#414559] bg-[#292c3c] p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center sm:text-left">
            <div className="inline-flex items-center space-x-2 text-[11px] font-mono uppercase tracking-wider text-[#8caaee]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
              <span>Official Discord Community</span>
            </div>
            <h3 className="font-serif text-lg sm:text-xl font-normal text-white">
              Heaven And Earth Great Love Alliance • Reverend Insanity [ 蛊真人 ]
            </h3>
            <p className="text-xs text-[#a5adce]">
              Connect with fellow cultivators, discuss chapters, explore theories, and join the alliance.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-shrink-0">
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-md border border-[#51576d] bg-[#414559] px-5 py-2.5 text-xs font-mono font-medium text-white hover:bg-[#51576d] hover:border-[#626880] transition-colors focus:outline-none focus:ring-1 focus:ring-[#8caaee]"
            >
              <span>Join Discord ↗</span>
            </a>
            <Link
              href="/read"
              className="inline-flex items-center space-x-1.5 rounded-md border border-[#414559] bg-[#303446] px-4 py-2.5 text-xs font-mono text-[#c6d0f5] hover:bg-[#414559] hover:text-white transition-colors"
            >
              <BookOpen className="h-3.5 w-3.5 text-[#8caaee]" />
              <span>Read Ch. 1</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
