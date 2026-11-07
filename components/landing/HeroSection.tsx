/* Hallmark · macrostructure: editorial-frontispiece · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

interface HeroSectionProps {
  continueChapter?: number | null;
}

export function HeroSection({ continueChapter = null }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper py-14 sm:py-24">
      {/* Background illustration with flat solid tint overlay (no gradient, no glow) */}
      <div className="absolute inset-0 pointer-events-none select-none overflow-hidden" aria-hidden="true">
        <picture className="absolute inset-0 w-full h-full">
          <source
            media="(max-width: 639px) and (orientation: portrait)"
            type="image/webp"
            srcSet="/images/fang-yuan-snow.webp"
          />
          <source
            media="(max-width: 639px) and (orientation: portrait)"
            srcSet="/images/fang-yuan-snow.jpg"
          />
          <source type="image/webp" srcSet="/images/fang-yuan-creation.webp" />
          <img
            src="/images/fang-yuan-creation.png"
            alt=""
            loading="eager"
            fetchPriority="high"
            decoding="async"
            className="h-full w-full object-cover object-center filter grayscale contrast-[1.08]"
          />
        </picture>
        {/* Flat solid tint overlay: strict zero gradient, zero glow */}
        <div className="absolute inset-0 bg-paper/88" />
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 mx-auto max-w-[1040px] px-4 sm:px-8">
        {/* Top publication rule and classification */}
        <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-3.5 mb-8 sm:mb-12">
          <span className="label">Gu Zhenren · 蛊真人 · Complete Web Novel</span>
          <span className="label tnum">2,334 Chapters · 4,861,604 Words</span>
        </div>

        {/* Title, Monogram and Inscription */}
        <div className="max-w-3xl">
          <div className="inline-block border border-accent/40 bg-accent/10 px-2.5 py-1 mb-4">
            <span className="label text-accent font-semibold">Master of Gu</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-[4.5rem] font-semibold tracking-[-0.025em] leading-[1.02] text-ink wrap-break">
            Reverend Insanity
          </h1>

          <div className="mt-6 border-l-2 border-accent pl-4 sm:pl-5 py-0.5">
            <p className="text-lg sm:text-2xl italic leading-relaxed text-ink">
              &ldquo;Humans are clever in tens of thousands of ways, Gu are the true refined
              essences of Heaven and Earth.&rdquo;
            </p>
          </div>

          <p className="mt-6 text-base sm:text-[1.125rem] leading-[1.75] text-muted max-w-[65ch]">
            Five centuries of demonic cultivation end in encirclement on Mount Qing Mao. By
            activating the supreme Spring Autumn Cicada, Fang Yuan reverses temporal flow five
            hundred years into the past, indifferent to worldly morality, relentlessly pursuing
            eternal life.
          </p>

          {/* Action Row */}
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href={continueChapter ? `/read?c=${continueChapter}` : "/read"}
              className="btn-primary px-5 py-3 text-[0.95rem] font-medium"
            >
              <BookOpen className="h-4 w-4" strokeWidth={1.75} />
              <span>
                {continueChapter ? `Continue Chapter ${continueChapter}` : "Begin Chapter 1"}
              </span>
              <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
            </Link>

            {continueChapter && continueChapter > 1 ? (
              <Link href="/read?c=1" className="btn-quiet px-4 py-3 bg-paper/90">
                Read from Chapter 1
              </Link>
            ) : (
              <Link href="#volumes" className="btn-quiet px-4 py-3 bg-paper/90">
                Browse Six Volumes
              </Link>
            )}

            <a
              href={DISCORD_INVITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 text-xs font-mono text-muted hover:text-accent transition-colors whitespace-nowrap"
            >
              Discord Alliance &#8599;
            </a>
          </div>
        </div>

        {/* Telemetry and Colophon Table */}
        <div className="mt-12 sm:mt-16 border-t border-line pt-6">
          <dl className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 gap-x-6">
            <div>
              <dt className="label">Author</dt>
              <dd className="mt-1 text-sm font-medium text-ink">Gu Zhenren (蛊真人)</dd>
            </div>
            <div>
              <dt className="label">Protagonist</dt>
              <dd className="mt-1 text-sm font-medium text-ink">Gu Yue Fang Yuan (方源)</dd>
            </div>
            <div>
              <dt className="label">Canon Extent</dt>
              <dd className="mt-1 text-sm font-medium text-ink tnum">2,334 Chapters</dd>
            </div>
            <div>
              <dt className="label">Total Words</dt>
              <dd className="mt-1 text-sm font-medium text-ink tnum">4,861,604 Words</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
