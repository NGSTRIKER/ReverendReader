import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const VOLUMES = [
  {
    number: "I",
    title: "A Demon's Nature Does Not Change",
    range: "Ch. 1–199",
    startChapter: 1,
    note: "Qing Mao Mountain, the awakening of the aperture, and the blood of the Gu Yue clan.",
  },
  {
    number: "II",
    title: "The Demon Leaves the Mountain",
    range: "Ch. 200–405",
    startChapter: 200,
    note: "Southern Border caravans, Shang Clan City, and the Three Kings Inheritance.",
  },
  {
    number: "III",
    title: "The Demon's Rampage",
    range: "Ch. 406–649",
    startChapter: 406,
    note: "Hu Immortal Blessed Land, Northern Plains disguised as Chang Shan Yin, and Imperial Court.",
  },
  {
    number: "IV",
    title: "The Demon Sovereign Rises",
    range: "Ch. 650–1,021",
    startChapter: 650,
    note: "Immortal zombie years, the refinement convention, and the battle of Yi Tian Mountain.",
  },
  {
    number: "V",
    title: "A Demon King's Might",
    range: "Ch. 1,022–1,966",
    startChapter: 1022,
    note: "An unmatched immortal body, Shadow Sect's millennia-old schemes, and the grand clash in Central Continent.",
  },
  {
    number: "VI",
    title: "A Demon Venerable's Eternal Life",
    range: "Ch. 1,967–2,334",
    startChapter: 1967,
    note: "Crazed Demon Cave, the pinnacle of refinement, and the final contest across the five regions.",
  },
] as const;

export function SynopsisSection() {
  return (
    <section id="synopsis" className="border-t border-line py-10 sm:py-16 lg:py-20 font-sans">
      <div className="mx-auto max-w-[1250px] px-4 sm:px-8 lg:px-12">
        {/* Synopsis & Author Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 sm:pb-16 border-b border-line">
          <div className="lg:col-span-5 space-y-5">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink">
                About the Novel
              </h2>
              <p className="mt-1.5 text-xs text-muted">
                Translated from the Chinese web novel <em>Gu Zhen Ren</em> (蛊真人).
              </p>
            </div>

            <blockquote className="font-serif italic text-sm sm:text-[15px] text-ink/90 border-l-2 border-accent/60 pl-4 py-1 space-y-1 leading-relaxed">
              <p>&ldquo;The Three Temples are unrighteous; the demon is reborn.</p>
              <p>Former days are but an old dream; an identical name is made anew.&rdquo;</p>
            </blockquote>

            <dl className="space-y-2.5 pt-1 text-xs border-t border-line/70">
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <dt className="text-muted font-medium min-w-[84px]">Author</dt>
                <dd className="text-ink">Gu Zhenren (蛊真人)</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <dt className="text-muted font-medium min-w-[84px]">Extent</dt>
                <dd className="text-ink tabular-nums">2,334 chapters (4.86M words)</dd>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2">
                <dt className="text-muted font-medium min-w-[84px]">Other works</dt>
                <dd className="text-muted">
                  <em>Infinite Bloodcore</em>, <em>Mysteries of Immortal Puppet Master</em>
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7 space-y-4 font-serif text-[15px] sm:text-base leading-[1.85] text-muted">
            <p className="text-ink">
              A story of a reincarnator who keeps returning through time in a brutal world that grows,
              refines, and uses <strong className="font-semibold text-ink">Gu</strong>: living vessels
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

        {/* The Six Volumes */}
        <div id="volumes" className="pt-10 sm:pt-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink">
              The Six Volumes
            </h2>
            <Link
              href="/read?toc=1"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 -mx-2 text-xs font-medium text-muted hover:text-accent transition-colors"
            >
              <span>Browse all 2,334 chapters</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {VOLUMES.map((vol) => (
              <Link
                key={vol.number}
                href={`/read?c=${vol.startChapter}`}
                className="group flex flex-col justify-between rounded-xl border border-line bg-surface p-4 sm:p-5 transition-colors duration-150 hover:border-line-strong hover:bg-sunken"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-2">
                    <span className="font-serif text-xs tracking-[0.14em] uppercase text-accent">
                      Volume {vol.number}
                    </span>
                    <span className="text-[11px] text-muted tabular-nums">
                      {vol.range}
                    </span>
                  </div>

                  <h3 className="font-serif text-lg font-medium text-ink leading-snug group-hover:text-accent transition-colors">
                    {vol.title}
                  </h3>

                  <p className="mt-2 text-xs text-muted leading-relaxed">
                    {vol.note}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-line/70 flex items-center justify-between text-xs text-muted">
                  <span>Start Book {vol.number}</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
