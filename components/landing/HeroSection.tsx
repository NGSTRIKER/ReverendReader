"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Download, Layers } from "lucide-react";
import { SpinningOrbsSphere } from "@/components/landing/SpinningOrbsSphere";
import { setCookie } from "@/lib/storage";

interface HeroSectionProps {
  continueChapter?: number | null;
  initialEdition?: "en" | "zh";
}

interface VolumeOption {
  id: string;
  number: string;
  numberZh: string;
  title: string;
  titleZh: string;
  range: string;
  startChapter: number;
  chapterCount: number;
}

const VOLUMES: VolumeOption[] = [
  {
    id: "vol-1",
    number: "I",
    numberZh: "卷一",
    title: "Nature Does Not Change",
    titleZh: "魔性不改",
    range: "Chapters 1–199",
    startChapter: 1,
    chapterCount: 199,
  },
  {
    id: "vol-2",
    number: "II",
    numberZh: "卷二",
    title: "The Demon Leaves the Mountain",
    titleZh: "魔头出山",
    range: "Chapters 200–405",
    startChapter: 200,
    chapterCount: 206,
  },
  {
    id: "vol-3",
    number: "III",
    numberZh: "卷三",
    title: "The Demon's Rampage",
    titleZh: "魔乱天下",
    range: "Chapters 406–649",
    startChapter: 406,
    chapterCount: 244,
  },
  {
    id: "vol-4",
    number: "IV",
    numberZh: "卷四",
    title: "The Demon Sovereign Rises",
    titleZh: "魔皇称雄",
    range: "Chapters 650–1,021",
    startChapter: 650,
    chapterCount: 372,
  },
  {
    id: "vol-5",
    number: "V",
    numberZh: "卷五",
    title: "A Demon King's Might",
    titleZh: "魔尊纵横",
    range: "Chapters 1,022–1,966",
    startChapter: 1022,
    chapterCount: 945,
  },
  {
    id: "vol-6",
    number: "VI",
    numberZh: "卷六",
    title: "Eternal Life",
    titleZh: "宿命天成",
    range: "Chapters 1,967–2,334",
    startChapter: 1967,
    chapterCount: 368,
  },
];

export function HeroSection({
  continueChapter = null,
  initialEdition = "en",
}: HeroSectionProps) {
  const [languageEdition, setLanguageEdition] = useState<"en" | "zh">(initialEdition);
  const [selectedEdition, setSelectedEdition] = useState<"complete" | string>("complete");
  const [isArtHovered, setIsArtHovered] = useState(false);
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [pointerTilt, setPointerTilt] = useState({ x: 0, y: 0 });

  useEffect(() => {
    try {
      const stored = localStorage.getItem("reverend_reader_edition");
      if (stored === "en" || stored === "zh") {
        setLanguageEdition(stored);
      }
    } catch {}
  }, []);

  const handleLanguageEditionChange = (ed: "en" | "zh") => {
    setLanguageEdition(ed);
    try {
      localStorage.setItem("reverend_reader_edition", ed);
      setCookie("reverend_reader_edition", ed);
    } catch {}
  };

  const isZh = languageEdition === "zh";

  const activeVolume =
    selectedEdition === "complete"
      ? null
      : VOLUMES.find((v) => v.id === selectedEdition) || null;

  let primaryHref = `/read?c=1&edition=${languageEdition}`;
  let primaryLabel = isZh ? "章节目录" : "Chapters";

  if (activeVolume) {
    primaryHref = `/read?c=${activeVolume.startChapter}&edition=${languageEdition}`;
    primaryLabel = isZh
      ? `阅读${activeVolume.numberZh} (${activeVolume.titleZh})`
      : `Read Book ${activeVolume.number}`;
  } else if (continueChapter && continueChapter >= 1) {
    primaryHref = `/read?c=${continueChapter}&edition=${languageEdition}`;
    primaryLabel = isZh
      ? `继续阅读第 ${continueChapter} 节`
      : `Continue Chapter ${continueChapter}`;
  } else {
    primaryHref = `/read?c=1&edition=${languageEdition}`;
    primaryLabel = isZh ? "开始阅读第一节 (中文原版)" : "Begin Chapter 1";
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
              <p className="summary text-muted text-sm sm:text-base leading-relaxed mb-4 sm:mb-5">
                The tower of destiny collapses before the demonic path. Reborn five hundred years
                into his youth with the supreme Spring Autumn Cicada, Fang Yuan walks an uncompromising
                road through the five regions and nine heavens—indifferent to worldly morality,
                relentlessly pursuing eternal life.
              </p>

              {/* Language / Edition Switcher */}
              <div className="flex items-center gap-1.5 p-1 rounded-lg border border-line bg-paper w-fit mb-5">
                <button
                  type="button"
                  onClick={() => handleLanguageEditionChange("en")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors ${
                    !isZh
                      ? "bg-surface text-ink border border-line shadow-sm"
                      : "text-muted hover:text-ink border border-transparent"
                  }`}
                >
                  English Translation
                </button>
                <button
                  type="button"
                  onClick={() => handleLanguageEditionChange("zh")}
                  className={`px-3 py-1 rounded text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                    isZh
                      ? "bg-surface text-ink border border-line shadow-sm"
                      : "text-muted hover:text-ink border border-transparent"
                  }`}
                >
                  <span>中文原版 (蛊真人)</span>
                  <span className="text-[10px] text-accent font-bold">RAW</span>
                </button>
              </div>

              {/* Choose Your Volume / Edition Selector — Symmetrical on Phone */}
              <fieldset className="editions mb-5 sm:mb-6 border-0 p-0">
                <legend className="text-[11px] tracking-[0.16em] uppercase text-muted mb-2.5 font-semibold flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-ink" />
                  {isZh ? "选择卷次或完整篇章" : "CHOOSE YOUR EDITION OR VOLUME"}
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
                      {isZh ? "完整原版全本" : "Complete Canon"}
                    </span>
                    <span className="block text-[11px] text-muted mt-0.5">
                      {isZh ? "共 2,334 节" : "2,334 chapters"}
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
                          {isZh ? `${vol.numberZh} · ${vol.titleZh}` : `Book ${vol.number}`}
                        </span>
                        <span className="block text-[11px] text-muted mt-0.5">
                          {isZh ? `${vol.chapterCount} 节` : `${vol.chapterCount} chapters`}
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
                    href={isZh ? "/downloads/Gu_Zhen_Ren_Raw.epub" : "/downloads/Reverend_Insanity.epub"}
                    download={isZh ? "Gu_Zhen_Ren_Raw.epub" : "Reverend_Insanity.epub"}
                    className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted hover:text-ink border-b border-line hover:border-ink py-1.5 transition-colors whitespace-nowrap"
                    title={
                      isZh
                        ? "Download complete 2,334 chapters Chinese raw EPUB (19 MB)"
                        : "Download complete 2,334 chapters EPUB (25 MB)"
                    }
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>{isZh ? "下载中文 EPUB ↓" : "Download EPUB ↓"}</span>
                  </a>

                  {/* Read from Ch 1 if continuing */}
                  {continueChapter && continueChapter > 1 && (
                    <Link
                      href={`/read?c=1&edition=${languageEdition}`}
                      className="text-xs uppercase tracking-wider text-muted hover:text-ink border-b border-line hover:border-ink py-1.5 transition-colors whitespace-nowrap"
                    >
                      {isZh ? "从第一节重读" : "Read Chapter 1"}
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
                    href={`/read?c=${vol.startChapter}&edition=${languageEdition}`}
                    className="text-muted hover:text-ink border-b border-dashed border-line hover:border-ink pb-0.5 transition-colors truncate"
                  >
                    {isZh ? `${vol.numberZh} (${vol.startChapter}节)` : `Book ${vol.number} (Ch ${vol.startChapter})`}
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
