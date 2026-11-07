/* Hallmark · macrostructure: literary-colophon · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

const VOLUMES = [
  {
    number: "I",
    title: "A Demon's Nature Does Not Change",
    range: "Chapters 1 to 199",
    startChapter: 1,
    note: "Qing Mao Mountain, the awakening of the aperture, and the blood of the Gu Yue clan.",
  },
  {
    number: "II",
    title: "The Demon Leaves the Mountain",
    range: "Chapters 200 to 405",
    startChapter: 200,
    note: "Southern Border caravans, Shang Clan City, and the Three Kings Inheritance.",
  },
  {
    number: "III",
    title: "The Demon's Rampage",
    range: "Chapters 406 to 649",
    startChapter: 406,
    note: "Hu Immortal Blessed Land, Northern Plains disguised as Chang Shan Yin, and Imperial Court.",
  },
  {
    number: "IV",
    title: "The Demon Sovereign Rises",
    range: "Chapters 650 to 1,021",
    startChapter: 650,
    note: "Immortal zombie years, the refinement convention, and the battle of Yi Tian Mountain.",
  },
  {
    number: "V",
    title: "A Demon King's Might",
    range: "Chapters 1,022 to 1,966",
    startChapter: 1022,
    note: "The Sovereign Immortal Body, Shadow Sect's legacy, and the War of Fate in Heavenly Court.",
  },
  {
    number: "VI",
    title: "A Demon Venerable's Eternal Life",
    range: "Chapters 1,967 to 2,334",
    startChapter: 1967,
    note: "Crazed Demon Cave, refinement to Rank Nine, and the contest of the Venerables.",
  },
] as const;

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-b border-line bg-paper py-14 sm:py-20">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-8">
        {/* Synopsis & Epigraph Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 pb-14 sm:pb-20 border-b border-line">
          <div className="lg:col-span-4">
            <p className="label text-accent">Section I · Synopsis</p>
            <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.015em] text-ink">
              The Book &amp; Its Premise
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-muted">
              Translated from the Chinese original <em>Gu Zhen Ren</em> (蛊真人). Complete up to the
              final published chapter.
            </p>

            <div className="mt-6 border-t border-line pt-5 space-y-2 text-sm italic text-muted">
              <p>The Three Temples are unrighteous; the demon is reborn.</p>
              <p>Former days are but an old dream; an identical name is made anew.</p>
            </div>
          </div>

          <div className="lg:col-span-8 space-y-5 text-base sm:text-[1.0625rem] leading-[1.8] text-ink">
            <p>
              A story of a time traveler who keeps on being reborn in a world that grows, refines,
              and uses <strong>Gu</strong>: living vessels of law and essence scattered across five
              regions and nine heavens.
            </p>
            <p className="text-muted">
              The Spring Autumn Cicada, the Moonlight Gu, the Wine Insect, All-Encompassing Golden
              Light Insect, Slender Black Hair Gu, Gu of Hope. And a great demon of the world who
              acts strictly as his heart pleases.
            </p>
            <p className="text-muted">
              Cornered by the righteous sects at the end of five hundred turbulent years, Fang Yuan
              detonates the rank six Spring Autumn Cicada and wakes inside his fifteen-year-old body
              on Mount Qing Mao. Without clan loyalty, sentiment, or fear of death, he measures
              every alliance and betrayal by a single standard: whether it brings him closer to
              eternal life.
            </p>
          </div>
        </div>

        {/* Six Volumes Index */}
        <div id="volumes" className="pt-14 sm:pt-20">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <p className="label text-accent">Section II · Contents</p>
              <h2 className="mt-2 text-2xl sm:text-3xl font-semibold tracking-[-0.015em] text-ink">
                The Six Volumes
              </h2>
            </div>
            <Link
              href="/read"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              <span>Open full chapter index (2,334)</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-line border-y border-line">
            {VOLUMES.map((vol) => (
              <Link
                key={vol.number}
                href={`/read?c=${vol.startChapter}`}
                className="group grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-6 py-5 px-2 -mx-2 hover:bg-sunken transition-colors items-baseline"
              >
                <div className="sm:col-span-2 flex items-baseline gap-2">
                  <span className="label text-accent">Book {vol.number}</span>
                </div>
                <div className="sm:col-span-4">
                  <h3 className="text-base sm:text-lg font-medium text-ink group-hover:text-accent transition-colors">
                    {vol.title}
                  </h3>
                </div>
                <div className="sm:col-span-4 text-sm text-muted leading-relaxed">
                  {vol.note}
                </div>
                <div className="sm:col-span-2 sm:text-right">
                  <span className="text-xs text-muted tnum group-hover:text-ink transition-colors">
                    {vol.range} &#8594;
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Quiet Community Note */}
        <div className="mt-14 sm:mt-16 border border-line bg-sunken p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <p className="label text-accent">Reader Community</p>
            <h3 className="mt-1 text-lg sm:text-xl font-medium text-ink">
              Heaven and Earth Great Love Alliance · Discord
            </h3>
            <p className="mt-1 text-sm text-muted">
              Discuss chapters, lore, and Gu refinement theories with fellow readers, or sign in
              with Discord to sync your reading position and bookmarks across devices.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-quiet bg-paper"
            >
              Join Discord &#8599;
            </a>
            <Link href="/read" className="btn-primary">
              <span>Start Reading</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
