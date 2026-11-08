"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Download, Layers } from "lucide-react";
import { SpinningOrbsSphere } from "@/components/landing/SpinningOrbsSphere";

interface HeroSectionProps {
  continueChapter?: number | null;
}

interface VolumeOption {
  id: string;
  number: string;
  title: string;
  range: string;
  startChapter: number;
  chapterCount: number;
}

const VOLUMES: VolumeOption[] = [
  {
    id: "vol-1",
    number: "I",
    title: "Nature Does Not Change",
    range: "Chapters 1–199",
    startChapter: 1,
    chapterCount: 199,
  },
  {
    id: "vol-2",
    number: "II",
    title: "The Demon Leaves the Mountain",
    range: "Chapters 200–405",
    startChapter: 200,
    chapterCount: 206,
  },
  {
    id: "vol-3",
    number: "III",
    title: "The Demon's Rampage",
    range: "Chapters 406–649",
    startChapter: 406,
    chapterCount: 244,
  },
  {
    id: "vol-4",
    number: "IV",
    title: "The Demon Sovereign Rises",
    range: "Chapters 650–1,021",
    startChapter: 650,
    chapterCount: 372,
  },
  {
    id: "vol-5",
    number: "V",
    title: "A Demon King's Might",
    range: "Chapters 1,022–1,966",
    startChapter: 1022,
    chapterCount: 945,
  },
  {
    id: "vol-6",
    number: "VI",
    title: "Eternal Life",
    range: "Chapters 1,967–2,334",
    startChapter: 1967,
    chapterCount: 368,
  },
];

export function HeroSection({ continueChapter = null }: HeroSectionProps) {
  const [selectedEdition, setSelectedEdition] = useState<"complete" | string>("complete");
  const [isArtHovered, setIsArtHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 });

  const activeVolume =
    selectedEdition === "complete"
      ? null
      : VOLUMES.find((v) => v.id === selectedEdition) || null;

  let primaryHref = "/read";
  let primaryLabel = "Chapters";

  if (activeVolume) {
    primaryHref = `/read?c=${activeVolume.startChapter}`;
    primaryLabel = `Read Book ${activeVolume.number}`;
  } else if (continueChapter && continueChapter >= 1) {
    primaryHref = `/read?c=${continueChapter}`;
    primaryLabel = `Continue Chapter ${continueChapter}`;
  } else {
    primaryHref = "/read?c=1";
    primaryLabel = "Begin Chapter 1";
  }

  const handlePointerMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    setPointerTilt({ x: nx, y: ny });
  };

  const handlePointerLeave = () => {
    setIsArtHovered(false);
    setIsCardHovered(false);
    setPointerTilt({ x: 0, y: 0 });
  };

  const sphereActive = isArtHovered || isCardHovered;

  return (
    <section
      className="relative overflow-hidden py-7 sm:py-16 lg:py-24 font-times"
      onMouseMove={handlePointerMove}
      onMouseLeave={handlePointerLeave}
    >
      <div className="mx-auto max-w-[1250px] px-3.5 sm:px-8 lg:px-12">
        {/* 2-Column Grid — Phone-Optimized & Desktop Balanced */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.18fr] items-center gap-8 sm:gap-12 lg:gap-16">
          {/* Left Column: Book Cover with Interactive Spinning Orbs Sphere Behind It */}
          <div
            className="relative flex flex-col items-center text-center"
            onMouseEnter={() => setIsArtHovered(true)}
            onMouseLeave={() => setIsArtHovered(false)}
            onTouchStart={() => setIsArtHovered(true)}
            onTouchEnd={() => setIsArtHovered(false)}
          >
            <div className="relative w-full max-w-[290px] sm:max-w-[420px] aspect-square flex items-center justify-center">
              {/* Interactive Spinning Orbs Sphere (Replaces Glow & Static Orbit) */}
              <SpinningOrbsSphere
                isHovered={sphereActive}
                tiltX={pointerTilt.x}
                tiltY={pointerTilt.y}
                className="absolute inset-0 w-full h-full z-0"
              />

              {/* 3D Tilted Official Book Cover — Zero Glow */}
              <picture className="relative z-10 block">
                <source type="image/webp" srcSet="/images/book-cover.webp" />
                <img
                  id="cover"
                  src="/images/book-cover.jpg"
                  alt="Reverend Insanity official book cover featuring Fang Yuan"
                  width={800}
                  height={1170}
                  loading="eager"
                  fetchPriority="high"
                  className="twatf-book-cover w-[168px] sm:w-[255px] md:w-[290px] max-h-[420px] object-cover mx-auto"
                />
              </picture>
            </div>

            {/* Art Caption */}
            <span className="art-caption mt-3 sm:mt-6 inline-block rounded border border-line bg-surface px-3 sm:px-4 py-1 sm:py-1.5 text-[10px] sm:text-xs tracking-[0.18em] sm:tracking-[0.22em] uppercase text-muted">
              A WORLD GOVERNED BY GU &amp; HEAVENLY DAO
            </span>
          </div>

          {/* Right Column: Main Intro Card (Also triggers Spinning Sphere on Hover) */}
          <div
            className="relative"
            onMouseEnter={() => setIsCardHovered(true)}
            onMouseLeave={() => setIsCardHovered(false)}
            onTouchStart={() => setIsCardHovered(true)}
            onTouchEnd={() => setIsCardHovered(false)}
          >
            <div className="intro relative z-10 rounded-xl sm:rounded-2xl border border-line bg-surface/95 p-5 sm:p-9 lg:p-10">
              {/* Eyebrow */}
              <p className="eyebrow text-[11px] sm:text-xs font-semibold tracking-[0.18em] sm:tracking-[0.22em] uppercase text-muted mb-2.5 sm:mb-3">
                GU ZHEN REN · 蛊真人 · FANTASY EPIC
              </p>

              {/* Main Title in Times New Roman */}
              <h1 className="font-times text-4xl sm:text-6xl lg:text-[4.4rem] font-bold tracking-tight text-ink leading-[1.04] mb-3.5 sm:mb-4">
                Reverend<br />
                <em className="italic text-accent font-normal">Insanity.</em>
              </h1>

              {/* Summary */}
              <p className="summary text-muted text-sm sm:text-base leading-relaxed mb-5 sm:mb-6">
                The tower of destiny collapses before the demonic path. Reborn five hundred years
                into his youth with the supreme Spring Autumn Cicada, Fang Yuan walks an uncompromising
                road through the five regions and nine heavens—indifferent to worldly morality,
                relentlessly pursuing eternal life.
              </p>

              {/* Choose Your Volume / Edition Selector — Symmetrical on Phone */}
              <fieldset className="editions mb-5 sm:mb-6 border-0 p-0">
                <legend className="text-[11px] tracking-[0.16em] uppercase text-muted mb-2.5 font-semibold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-ink" />
                  CHOOSE YOUR EDITION OR VOLUME
                </legend>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {/* Complete Canon Button — Full Width Row on Phone */}
                  <button
                    type="button"
                    onClick={() => setSelectedEdition("complete")}
                    className={`col-span-2 sm:col-span-1 text-left rounded-lg p-2.5 sm:p-3 transition-colors border ${
                      selectedEdition === "complete"
                        ? "border-accent bg-sunken text-ink"
                        : "border-line bg-paper hover:border-line-strong"
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-bold text-ink">
                      Complete Canon
                    </span>
                    <span className="block text-[11px] text-muted mt-0.5">
                      2,334 chapters
                    </span>
                  </button>

                  {/* Volumes 1 to 6 */}
                  {VOLUMES.map((vol) => {
                    const isSelected = selectedEdition === vol.id;
                    return (
                      <button
                        key={vol.id}
                        type="button"
                        onClick={() => setSelectedEdition(vol.id)}
                        className={`text-left rounded-lg p-2.5 sm:p-3 transition-colors border ${
                          isSelected
                            ? "border-accent bg-sunken text-ink"
                            : "border-line bg-paper hover:border-line-strong"
                        }`}
                      >
                        <span className="block text-xs sm:text-sm font-bold text-ink truncate">
                          Book {vol.number}
                        </span>
                        <span className="block text-[11px] text-muted mt-0.5">
                          {vol.chapterCount} chapters
                        </span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Primary Action Row — Full-Width CTA on Phone */}
              <div className="actions flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-6 pt-1">
                <Link
                  id="start"
                  href={primaryHref}
                  className="primary group inline-flex w-full sm:w-auto sm:min-w-[200px] items-center justify-between gap-4 rounded-lg bg-accent px-5 sm:px-6 py-3.5 text-sm sm:text-base font-bold text-on-accent transition-colors hover:bg-accent-hover"
                >
                  <span>{primaryLabel}</span>
                  <span className="text-base transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                    ↗
                  </span>
                </Link>

                <div className="flex items-center justify-between sm:justify-start gap-4 px-1 sm:px-0">
                  {/* Download EPUB Link */}
                  <a
                    id="download"
                    href="/downloads/Reverend_Insanity.epub"
                    download="Reverend_Insanity.epub"
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted hover:text-ink border-b border-line hover:border-ink py-1.5 transition-colors whitespace-nowrap"
                    title="Download complete 2,334 chapters EPUB (25 MB)"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download EPUB ↓</span>
                  </a>

                  {/* Read from Ch 1 if continuing */}
                  {continueChapter && continueChapter > 1 && (
                    <Link
                      href="/read?c=1"
                      className="text-xs uppercase tracking-wider text-muted hover:text-ink border-b border-line hover:border-ink py-1.5 transition-colors whitespace-nowrap"
                    >
                      Read Chapter 1
                    </Link>
                  )}
                </div>
              </div>

              {/* Resume Note */}
              <p id="resume-note" className="text-xs text-muted mt-4 sm:mt-5">
                Your place is saved automatically on this device.
              </p>

              {/* Quick Volume Links — Clean 3-Col Grid on Phone */}
              <nav
                className="browse-editions mt-3 grid grid-cols-3 sm:flex sm:flex-wrap gap-2 sm:gap-x-4 sm:gap-y-2 text-xs"
                aria-label="Resume reading by volume"
              >
                {VOLUMES.map((vol) => (
                  <Link
                    key={vol.id}
                    href={`/read?c=${vol.startChapter}`}
                    className="text-muted hover:text-ink border-b border-dashed border-line hover:border-ink pb-0.5 transition-colors truncate"
                  >
                    Book {vol.number} (Ch {vol.startChapter})
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
