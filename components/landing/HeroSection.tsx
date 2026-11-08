"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Download, BookOpen, Layers } from "lucide-react";

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

  const activeVolume =
    selectedEdition === "complete"
      ? null
      : VOLUMES.find((v) => v.id === selectedEdition) || null;

  // Determine target chapter and primary label
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

  return (
    <section className="relative overflow-hidden py-12 sm:py-20 lg:py-24 font-dmsans">
      <div className="mx-auto max-w-[1250px] px-4 sm:px-8 lg:px-12">
        {/* 2-Column Grid matching TWATF Reader */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.18fr] items-center gap-12 lg:gap-16">
          {/* Left Column: 3D Art & Orbit Presentation */}
          <div className="twatf-art-glow flex flex-col items-center text-center">
            <div className="relative w-full max-w-[360px] sm:max-w-[420px] flex justify-center py-4">
              {/* Planetary Orbit Ring */}
              <div className="twatf-orbit" aria-hidden="true" />

              {/* 3D Tilted Official Book Cover */}
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
                  className="twatf-book-cover w-[78%] max-w-[300px] sm:max-w-[340px] max-h-[480px] object-cover mx-auto"
                />
              </picture>
            </div>

            {/* Art Caption */}
            <span className="art-caption mt-7 inline-block rounded-md border border-line bg-surface/85 px-4 py-1.5 text-[10px] font-mono tracking-[0.24em] uppercase text-muted backdrop-blur-md shadow-sm">
              A WORLD GOVERNED BY GU &amp; HEAVENLY DAO
            </span>
          </div>

          {/* Right Column: Frosted Intro Card */}
          <div className="intro rounded-2xl border border-line bg-surface/85 p-6 sm:p-9 lg:p-10 shadow-2xl backdrop-blur-md">
            {/* Eyebrow */}
            <p className="eyebrow text-[10px] sm:text-[11px] font-mono font-semibold tracking-[0.24em] uppercase text-accent mb-3">
              GU ZHEN REN · 蛊真人 · FANTASY EPIC
            </p>

            {/* Main Title */}
            <h1 className="font-playfair text-4xl sm:text-6xl lg:text-[4.4rem] font-medium tracking-tight text-ink leading-[1.06] mb-4">
              Reverend<br />
              <em className="italic text-accent font-semibold">Insanity.</em>
            </h1>

            {/* Summary */}
            <p className="summary text-muted text-sm sm:text-[15px] leading-relaxed mb-6 font-normal">
              The tower of destiny collapses before the demonic path. Reborn five hundred years
              into his youth with the supreme Spring Autumn Cicada, Fang Yuan walks an uncompromising
              road through the five regions and nine heavens—indifferent to worldly morality,
              relentlessly pursuing eternal life.
            </p>

            {/* Choose Your Volume / Edition Selector */}
            <fieldset className="editions mb-6 border-0 p-0">
              <legend className="text-[10px] font-mono tracking-[0.2em] uppercase text-muted mb-2.5 font-medium flex items-center gap-1.5">
                <Layers className="h-3 w-3 text-accent" />
                CHOOSE YOUR EDITION OR VOLUME
              </legend>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {/* Complete Canon Button */}
                <button
                  type="button"
                  onClick={() => setSelectedEdition("complete")}
                  className={`text-left rounded-lg p-3 transition-all border ${
                    selectedEdition === "complete"
                      ? "border-accent bg-accent/10 shadow-sm"
                      : "border-line bg-paper/60 hover:border-line-strong hover:bg-paper"
                  }`}
                >
                  <span className="block text-xs font-semibold text-ink">
                    Complete Canon
                  </span>
                  <span className="block text-[10px] text-muted font-mono mt-1">
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
                      className={`text-left rounded-lg p-3 transition-all border ${
                        isSelected
                          ? "border-accent bg-accent/10 shadow-sm"
                          : "border-line bg-paper/60 hover:border-line-strong hover:bg-paper"
                      }`}
                    >
                      <span className="block text-xs font-semibold text-ink truncate">
                        Book {vol.number}
                      </span>
                      <span className="block text-[10px] text-muted font-mono mt-1">
                        {vol.chapterCount} chs
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            {/* Primary Action Row */}
            <div className="actions flex flex-wrap items-center gap-4 sm:gap-6 pt-1">
              <Link
                id="start"
                href={primaryHref}
                className="primary group inline-flex min-w-[200px] items-center justify-between gap-4 rounded-lg bg-accent px-6 py-3.5 text-sm font-semibold text-on-accent shadow-lg transition-all hover:brightness-110 active:scale-[0.99]"
              >
                <span>{primaryLabel}</span>
                <span className="text-base transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                  ↗
                </span>
              </Link>

              {/* Download EPUB Link */}
              <a
                id="download"
                href="/downloads/Reverend_Insanity.epub"
                download="Reverend_Insanity.epub"
                className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider font-mono text-muted hover:text-accent border-b border-line hover:border-accent py-2 transition-colors whitespace-nowrap"
                title="Download complete 2,334 chapters EPUB (25 MB)"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Download EPUB ↓</span>
              </a>

              {/* Read from Ch 1 if continuing */}
              {continueChapter && continueChapter > 1 && (
                <Link
                  href="/read?c=1"
                  className="text-xs uppercase tracking-wider font-mono text-muted hover:text-accent border-b border-line hover:border-accent py-2 transition-colors whitespace-nowrap"
                >
                  Read from Chapter 1
                </Link>
              )}
            </div>

            {/* Resume Note */}
            <p id="resume-note" className="text-xs font-mono text-muted/80 mt-5">
              Your place is saved automatically on this device.
            </p>

            {/* Quick Volume Links (browse-editions) */}
            <nav
              className="browse-editions mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs font-mono"
              aria-label="Resume reading by volume"
            >
              {VOLUMES.map((vol) => (
                <Link
                  key={vol.id}
                  href={`/read?c=${vol.startChapter}`}
                  className="text-muted hover:text-accent border-b border-dashed border-line hover:border-accent pb-0.5 transition-colors"
                >
                  Book {vol.number} (Ch {vol.startChapter})
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </section>
  );
}
