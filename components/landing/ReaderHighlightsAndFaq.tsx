import React from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { FAQ_ITEMS } from "@/lib/seo";

const LORE_INDEX: readonly { term: string; detail: string }[] = [
  {
    term: "Fang Yuan & Titles",
    detail:
      "Gu Yue Fang Yuan—known across the Five Regions as Great Love Immortal Venerable and Heaven Refining Demon Venerable—relies on five hundred years of hard-won experience after regressing with the Spring Autumn Cicada.",
  },
  {
    term: "Core Gu & Artifacts",
    detail:
      "Iconic living vessels of Dao including Spring Autumn Cicada, Moonlight Gu, Wine Insect, Fixed Immortal Travel, Perseverance Gu, Reverse Flow River, and Fate Gu.",
  },
  {
    term: "Cultivation Ranks & Paths",
    detail:
      "Mortal Gu Masters (Ranks 1–5) and Gu Immortals (Ranks 6–9) advancing through Refinement, Wisdom, Time, Space, Strength, Enslavement, Soul, Transformation, and Blood paths.",
  },
  {
    term: "Five Regions & Landmarks",
    detail:
      "Southern Border (Qing Mao Mountain, Shang Clan City, Yi Tian Mountain), Northern Plains (Hu Immortal & Imperial Court), Central Continent (Heavenly Court), Eastern Sea, Western Desert, and Crazed Demon Cave.",
  },
  {
    term: "The Legends of Ren Zu",
    detail:
      "The mythic philosophical parable woven throughout Reverend Insanity (RI), exploring human nature through Hope Gu, Rules and Regulations, Self Gu, and Freedom Gu.",
  },
];

export function ReaderHighlightsAndFaq() {
  return (
    <section
      aria-labelledby="sanctuary-heading"
      className="border-t border-line py-10 sm:py-16 lg:py-20 font-sans"
    >
      <div className="mx-auto max-w-[1250px] px-4 sm:px-8 lg:px-12">
        {/* Editorial Sanctuary & Lore Index */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-12 sm:pb-16 border-b border-line">
          <div className="lg:col-span-5 space-y-4">
            <h2
              id="sanctuary-heading"
              className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink"
            >
              Read Reverend Insanity Online Free
            </h2>

            <p className="max-w-[65ch] text-sm sm:text-base leading-[1.75] text-muted">
              Reverend Reader is built to be the best quiet, ad-free place to read{" "}
              <strong className="font-semibold text-ink">Reverend Insanity (RI)</strong> online.
              Every chapter—from Chapter 1 on Mount Qing Mao to Chapter 2,334—loads instantly in
              your browser in both the complete English translation and the original Chinese raw (
              <em>Gu Zhenren</em> / 蛊真人).
            </p>

            <p className="max-w-[65ch] text-sm sm:text-base leading-[1.75] text-muted">
              Customize Bookerly, EB Garamond, Literata, or OpenDyslexic typography, switch cleanly
              between warm paper and dark night themes, save bookmarks, or download the full EPUB
              for offline reading—with zero paywalls or mandatory sign-in.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/read?c=1"
                className="btn-quiet min-h-[44px] rounded-lg px-4 py-2 text-xs font-medium"
              >
                <span>Start Chapter 1</span>
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
              <Link
                href="/read?toc=1"
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs font-medium text-muted hover:text-accent transition-colors underline underline-offset-4 decoration-line-strong"
              >
                <span>Full 2,334-Chapter Index</span>
              </Link>
              <Link
                href="/read?edition=zh"
                className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-xs font-medium text-muted hover:text-accent transition-colors underline underline-offset-4 decoration-line-strong"
              >
                <span>阅读中文原版</span>
              </Link>
            </div>
          </div>

          <div className="lg:col-span-7">
            <h3 className="font-serif text-xl sm:text-2xl font-normal tracking-tight text-ink mb-4">
              World, Characters &amp; Cultivation Guide
            </h3>

            <dl className="divide-y divide-line border-t border-b border-line">
              {LORE_INDEX.map((entry) => (
                <div
                  key={entry.term}
                  className="py-3.5 grid grid-cols-1 sm:grid-cols-[175px_1fr] gap-1 sm:gap-4"
                >
                  <dt className="text-xs font-medium text-ink pt-0.5">{entry.term}</dt>
                  <dd className="text-xs sm:text-sm leading-[1.7] text-muted">
                    {entry.detail}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* Frequently Asked Questions (1:1 with FAQPage JSON-LD) */}
        <div id="faq" className="pt-10 sm:pt-14">
          <div className="max-w-3xl">
            <h2 className="font-serif text-2xl sm:text-3xl font-normal tracking-tight text-ink mb-6">
              Frequently Asked Questions
            </h2>

            <div className="divide-y divide-line border-t border-b border-line">
              {FAQ_ITEMS.map((item) => (
                <details key={item.question} className="group">
                  <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between gap-4 py-3.5 text-left font-serif text-base sm:text-lg font-medium text-ink hover:text-accent transition-colors [&::-webkit-details-marker]:hidden">
                    <span>{item.question}</span>
                    <ChevronDown
                      className="h-4 w-4 flex-shrink-0 text-muted transition-transform duration-150 group-open:rotate-180"
                      aria-hidden="true"
                    />
                  </summary>
                  <p className="pb-4 pr-6 text-sm leading-[1.75] text-muted max-w-[70ch]">
                    {item.answer}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
