import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

interface HeroSectionProps {
  continueChapter?: number | null;
}

export function HeroSection({ continueChapter = null }: HeroSectionProps) {
  return (
    <section className="border-b border-line bg-paper">
      <div className="mx-auto max-w-[1120px] px-4 sm:px-8 py-12 sm:py-20">
        {/* Top publication rule & issue line */}
        <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-line pb-4 mb-10 sm:mb-14">
          <p className="label">Gu Zhenren · 蛊真人 · Complete Web Novel Edition</p>
          <p className="label tnum">Six Volumes · 2,334 Chapters · 4.86M Words</p>
        </div>

        {/* Main 2-column editorial layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Left column: Title, opening verse, premise, primary actions */}
          <div className="lg:col-span-7">
            <p className="label text-accent mb-3">Master of Gu</p>

            <h1 className="text-4xl sm:text-6xl lg:text-[4.25rem] font-semibold tracking-[-0.025em] leading-[1.03] text-ink">
              Reverend Insanity
            </h1>

            <blockquote className="mt-7 border-l-2 border-accent pl-4 sm:pl-5 py-0.5">
              <p className="text-lg sm:text-xl italic leading-relaxed text-ink">
                &ldquo;Humans are clever in tens of thousands of ways; Gu are the true refined
                essences of Heaven and Earth.&rdquo;
              </p>
            </blockquote>

            <p className="mt-6 max-w-[60ch] text-base sm:text-[1.0625rem] leading-[1.75] text-muted">
              Five centuries of demonic cultivation end in encirclement on Demon Suppression
              Mountain. By activating the Spring Autumn Cicada, Gu Yue Fang Yuan returns five
              hundred years to his youth on Qing Mao Mountain, with every memory intact and only
              one goal: eternal life.
            </p>

            {/* Primary actions */}
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href={continueChapter ? `/read?c=${continueChapter}` : "/read"}
                className="btn-primary px-5 py-3 text-[0.95rem] font-medium"
              >
                <span>
                  {continueChapter ? `Continue Chapter ${continueChapter}` : "Begin Chapter 1"}
                </span>
                <ArrowRight className="h-4 w-4" strokeWidth={1.75} />
              </Link>

              {continueChapter && continueChapter > 1 ? (
                <Link href="/read?c=1" className="btn-quiet px-4 py-3">
                  Read from Chapter 1
                </Link>
              ) : (
                <Link href="/#volumes" className="btn-quiet px-4 py-3">
                  Browse Six Volumes
                </Link>
              )}

              <a
                href={DISCORD_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 text-sm text-muted hover:text-accent transition-colors"
              >
                Community Discord &#8599;
              </a>
            </div>

            {/* Colophon facts table */}
            <dl className="mt-12 grid grid-cols-2 sm:grid-cols-4 border-t border-line pt-6 gap-y-5 gap-x-6">
              <div>
                <dt className="label">Author</dt>
                <dd className="mt-1 text-sm font-medium text-ink">Gu Zhenren (蛊真人)</dd>
              </div>
              <div>
                <dt className="label">Protagonist</dt>
                <dd className="mt-1 text-sm font-medium text-ink">Gu Yue Fang Yuan</dd>
              </div>
              <div>
                <dt className="label">Extent</dt>
                <dd className="mt-1 text-sm font-medium text-ink tnum">2,334 Chapters</dd>
              </div>
              <div>
                <dt className="label">Genre</dt>
                <dd className="mt-1 text-sm font-medium text-ink">Dark Xianxia</dd>
              </div>
            </dl>
          </div>

          {/* Right column: Framed plate illustration with book caption */}
          <figure className="lg:col-span-5 border border-line bg-sunken p-3 sm:p-4">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-line bg-surface">
              <picture>
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
                  alt="Illustration of Gu Yue Fang Yuan"
                  loading="eager"
                  fetchPriority="high"
                  decoding="async"
                  width={960}
                  height={720}
                  className="h-full w-full object-cover object-center"
                />
              </picture>
            </div>
            <figcaption className="mt-3 flex items-baseline justify-between gap-4 text-xs text-muted">
              <span>Plate I. Gu Yue Fang Yuan, Spring Autumn Cicada rebirth.</span>
              <span className="tnum text-accent">Ch. 1 to 2,334</span>
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
