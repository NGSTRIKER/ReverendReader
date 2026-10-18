import Link from "next/link";
import { BookOpen } from "lucide-react";

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-b border-[#313244]/80 bg-[#1e1e2e] py-20 sm:py-28">
      <div className="mx-auto max-w-4xl px-6 sm:px-8">
        {/* Section Heading */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-[#89b4fa] uppercase">
            Official Synopsis
          </span>
          <h2 className="mt-2 font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#cdd6f4]">
            Reverend Insanity · 蛊真人
          </h2>
          <p className="mt-2 text-sm text-[#a6adc8]">
            Author: <span className="text-[#89b4fa] font-medium">Gu Zhenren (蛊真人)</span>
          </p>
        </div>

        {/* The Widely Used Accurate Community Synopsis Card */}
        <div className="relative rounded-2xl border border-[#313244] bg-[#181825]/90 p-8 sm:p-12 shadow-2xl backdrop-blur-md mb-12">
          <div className="absolute top-0 right-0 -mr-1 -mt-1 h-24 w-24 overflow-hidden pointer-events-none rounded-tr-2xl">
            <div className="absolute transform rotate-45 bg-[#89b4fa]/15 text-[#89b4fa] text-[10px] font-mono py-1 right-[-35px] top-[18px] w-[120px] text-center border border-[#89b4fa]/30 uppercase tracking-wider">
              Original
            </div>
          </div>

          {/* Chinese Classic Verse */}
          <div className="border-b border-[#313244] pb-6 mb-8 text-center sm:text-left">
            <p className="font-serif text-lg sm:text-xl text-[#89b4fa] leading-relaxed italic">
              &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined essences of Heaven and Earth.&rdquo;
            </p>
            <div className="mt-4 space-y-1.5 text-sm sm:text-base font-serif text-[#cdd6f4]">
              <p>The Three Temples are unrighteous, the demon is reborn.</p>
              <p>Former days are but an old dream, an identical name is made anew.</p>
            </div>
          </div>

          {/* Core Body of the Authentic Synopsis */}
          <div className="space-y-4 text-base sm:text-lg leading-relaxed text-[#bac2de]">
            <p className="font-medium text-[#cdd6f4]">
              A story of a time traveler who keeps on being reborn.
            </p>
            <p>
              A unique world that grows, cultivates, and uses Gu.
            </p>
            <p className="text-[#a6adc8] italic text-sm sm:text-base">
              The Spring and Autumn Cicada, the Venomous Moonlight Gu, the Wine Insect, All-Encompassing Golden Light Insect, Slender Black Hair Gu, Gu of Hope…
            </p>
            <p className="font-serif text-lg sm:text-xl font-bold text-[#89b4fa] pt-2">
              And a great demon of the world that does exactly as his heart pleases!
            </p>
          </div>

          {/* Synopsis Narrative Context */}
          <div className="mt-8 pt-6 border-t border-[#313244] text-sm text-[#a6adc8] leading-relaxed space-y-3">
            <p>
              Fang Yuan, a transmigrator who walked the demonic path for five hundred years, was cornered by righteous sects at the summit of his mortal life. In his final breath, he activated the legendary Time-path treasure—the <strong className="text-[#cdd6f4]">Spring Autumn Cicada</strong>—reversing the flow of time and awakening as his fifteen-year-old self on Mount Qing Mao.
            </p>
            <p>
              With five centuries of cunning, boundless ambition, and profound experience intact, he sets out to cultivate Gu and conquer the five regions, unhindered by mortal morality, in his unrelenting quest for <strong className="text-[#89b4fa]">eternal life</strong>.
            </p>
          </div>
        </div>

        {/* Discord Alliance Community Invitation Card */}
        <div className="rounded-2xl border border-[#5865F2]/40 bg-gradient-to-r from-[#181825] via-[#5865F2]/10 to-[#181825] p-8 shadow-xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center space-x-2 text-xs font-semibold uppercase tracking-wider text-[#89b4fa]">
              <span className="h-2 w-2 rounded-full bg-[#a6e3a1]"></span>
              <span>Official Discord Community</span>
            </div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-white">
              Heaven And Earth Great Love Alliance • Reverend Insanity [ 蛊真人 ]
            </h3>
            <p className="text-xs sm:text-sm text-[#a6adc8]">
              Connect with fellow Gu cultivators, discuss chapters, share theories, and experience the journey together.
            </p>
          </div>

          <div className="flex-shrink-0 flex flex-col sm:flex-row items-center gap-3">
            <a
              href="https://discord.gg/YbwBb6DjXH"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2.5 rounded-lg bg-[#5865F2] px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-[#5865F2]/30 hover:bg-[#4752c4] transition-all"
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
              <span>Join Alliance</span>
            </a>
            <Link
              href="/read"
              className="inline-flex items-center space-x-1.5 rounded-lg border border-[#313244] bg-[#11111b] px-5 py-3 text-sm font-medium text-[#cdd6f4] hover:bg-[#313244] hover:text-white transition-colors"
            >
              <BookOpen className="h-4 w-4 text-[#89b4fa]" />
              <span>Read Chapter 1</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
