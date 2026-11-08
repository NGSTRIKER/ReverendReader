import React from "react";
import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

const VOLUMES = [
  {
    number: "I",
    title: "A Demon's Nature Does Not Change",
    range: "Chapters 1 to 199",
    startChapter: 1,
    chapterCount: 199,
    note: "Qing Mao Mountain, the awakening of the aperture, and the blood of the Gu Yue clan.",
  },
  {
    number: "II",
    title: "The Demon Leaves the Mountain",
    range: "Chapters 200 to 405",
    startChapter: 200,
    chapterCount: 206,
    note: "Southern Border caravans, Shang Clan City, and the Three Kings Inheritance.",
  },
  {
    number: "III",
    title: "The Demon's Rampage",
    range: "Chapters 406 to 649",
    startChapter: 406,
    chapterCount: 244,
    note: "Hu Immortal Blessed Land, Northern Plains disguised as Chang Shan Yin, and Imperial Court.",
  },
  {
    number: "IV",
    title: "The Demon Sovereign Rises",
    range: "Chapters 650 to 1,021",
    startChapter: 650,
    chapterCount: 372,
    note: "Immortal zombie years, the refinement convention, and the battle of Yi Tian Mountain.",
  },
  {
    number: "V",
    title: "A Demon King's Might",
    range: "Chapters 1,022 to 1,966",
    startChapter: 1022,
    chapterCount: 945,
    note: "The Sovereign Immortal Body, Shadow Sect's legacy, and the War of Fate in Heavenly Court.",
  },
  {
    number: "VI",
    title: "A Demon Venerable's Eternal Life",
    range: "Chapters 1,967 to 2,334",
    startChapter: 1967,
    chapterCount: 368,
    note: "Crazed Demon Cave, refinement to Rank Nine, and the contest of the Venerables.",
  },
] as const;

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-t border-line py-10 sm:py-20 lg:py-24 font-times">
      <div className="mx-auto max-w-[1250px] px-3.5 sm:px-8 lg:px-12">
        {/* Top Section: Synopsis & Epigraph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 pb-12 sm:pb-20 border-b border-line">
          <div className="lg:col-span-5 space-y-3 sm:space-y-4">
            <p className="font-semibold text-[11px] tracking-[0.2em] uppercase text-muted">
              Section I · The Premise
            </p>
            <h2 className="font-times text-2xl sm:text-4xl font-bold tracking-tight text-ink">
              The Gu Cultivation World
            </h2>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Translated from the Chinese masterpiece <em>Gu Zhen Ren</em> (蛊真人). Complete up to the
              final published chapter.
            </p>

            <div className="mt-4 sm:mt-6 border-l-2 border-line-strong pl-4 py-1.5 space-y-1.5 text-sm italic text-ink leading-relaxed bg-surface/60 rounded-r-lg">
              <p>&ldquo;The Three Temples are unrighteous; the demon is reborn.</p>
              <p>Former days are but an old dream; an identical name is made anew.&rdquo;</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-4 text-sm sm:text-base leading-[1.8] text-muted">
            <p className="font-semibold text-ink">
              A story of a reincarnator who keeps returning through time in a brutal world that grows,
              refines, and uses <strong className="font-bold text-ink">Gu</strong>: living vessels
              of Heavenly Dao and essence scattered across five regions and nine heavens.
            </p>
            <p>
              The Spring Autumn Cicada, the Moonlight Gu, the Wine Insect, All-Encompassing Golden
              Light Insect, Slender Black Hair Gu, Gu of Hope. And a legendary demon of the mortal realm
              who acts strictly according to his own unbending will.
            </p>
            <p>
              Cornered by the righteous factions at the end of five hundred turbulent years, Fang Yuan
              detonates the rank six Spring Autumn Cicada and awakens inside his fifteen-year-old body
              on Mount Qing Mao. Without clan sentiment, hypocrisy, or fear of death, he measures every
              alliance and betrayal by a single absolute standard: whether it brings him one step closer
              to eternal life.
            </p>
          </div>
        </div>

        {/* Middle Section: Author Card — No GitHub Repo Listed, Zero Glow */}
        <div className="py-10 sm:py-16 border-b border-line">
          <div className="rounded-xl sm:rounded-2xl border border-line bg-surface p-5 sm:p-9">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
              <div className="space-y-3 max-w-3xl">
                <div className="flex items-center gap-2 text-ink">
                  <span className="text-lg sm:text-xl">✒</span>
                  <h3 className="font-times text-xl sm:text-2xl font-bold text-ink">
                    About the Author · Gu Zhenren (蛊真人)
                  </h3>
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-muted">
                  <strong className="text-ink">Gu Zhenren</strong> (蛊真人) is a celebrated Chinese fantasy author born in Guizhou, China.
                  Writing over the course of nearly a decade, Gu Zhenren established himself as one of the most
                  uncompromising storytellers in modern web literature, refusing moral platitudes in favor of
                  rigorous philosophical consistency and strategic depth.
                </p>
                <p className="text-sm sm:text-base leading-relaxed text-muted">
                  Beyond <em>Reverend Insanity</em> (his defining masterpiece with 2,334 chapters), he is also known
                  for acclaimed works such as <em>Infinite Bloodcore (无限血核)</em> and his mechanical cultivation
                  epic <em>Mysteries of Immortal Puppet Master (仙工开物)</em>.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 flex-shrink-0 text-xs">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-between gap-3 px-4 py-2.5 rounded-lg border border-line bg-paper hover:border-line-strong text-ink transition-colors"
                >
                  <span>Discord Community</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section: The Six Volumes Grid */}
        <div id="volumes" className="pt-10 sm:pt-18">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div>
              <p className="font-semibold text-[11px] tracking-[0.2em] uppercase text-muted">
                Section II · The Canon
              </p>
              <h2 className="font-times text-2xl sm:text-4xl font-bold tracking-tight text-ink mt-1">
                The Six Volumes
              </h2>
            </div>
            <Link
              href="/read"
              className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold uppercase tracking-wider text-ink hover:text-muted transition-colors"
            >
              <span>Open full chapter index (2,334)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {/* Volume Cards — Zero Glow, Clean Borders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {VOLUMES.map((vol) => (
              <Link
                key={vol.number}
                href={`/read?c=${vol.startChapter}`}
                className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-6 transition-colors duration-200 hover:border-line-strong hover:bg-sunken"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2.5 sm:mb-3">
                    <span className="text-[11px] font-bold tracking-wider uppercase text-ink border border-line-strong bg-paper px-2.5 py-0.5 rounded">
                      Book {vol.number}
                    </span>
                    <span className="text-xs text-muted tabular-nums">
                      {vol.chapterCount} chapters
                    </span>
                  </div>

                  <h3 className="font-times text-lg sm:text-xl font-bold text-ink leading-snug">
                    {vol.title}
                  </h3>

                  <p className="mt-2 sm:mt-3 text-xs sm:text-sm text-muted leading-relaxed">
                    {vol.note}
                  </p>
                </div>

                <div className="mt-4 sm:mt-5 flex items-center justify-between border-t border-line pt-3 text-xs">
                  <span className="text-muted tabular-nums">
                    {vol.range}
                  </span>
                  <span className="inline-flex items-center gap-1 font-bold text-ink group-hover:translate-x-1 transition-transform">
                    <span>Read</span>
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Community Callout Card — Phone-Friendly Stacked Buttons */}
        <div className="mt-10 sm:mt-16 rounded-xl sm:rounded-2xl border border-line bg-surface p-5 sm:p-9 flex flex-col sm:flex-row sm:items-center justify-between gap-5 sm:gap-6">
          <div className="space-y-1.5 max-w-2xl">
            <p className="font-semibold text-[11px] tracking-[0.2em] uppercase text-muted">
              Reader Alliance
            </p>
            <h3 className="font-times text-xl sm:text-2xl font-bold text-ink">
              Join the Great Love Alliance Discord
            </h3>
            <p className="text-xs sm:text-sm text-muted leading-relaxed">
              Discuss chapters, lore discoveries, Gu refinement theories, or sign in to sync
              your reading progress and bookmarks seamlessly across all devices.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 flex-shrink-0">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-lg border border-line bg-paper text-ink font-bold text-xs uppercase tracking-wider hover:border-line-strong transition-colors text-center"
            >
              Join Discord ↗
            </a>
            <Link
              href="/read"
              className="px-5 py-3 rounded-lg bg-accent text-on-accent font-bold text-xs uppercase tracking-wider hover:bg-accent-hover transition-colors inline-flex items-center justify-center gap-1.5"
            >
              <span>Start Reading</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
