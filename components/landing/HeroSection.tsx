"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import { setCookie } from "@/lib/storage";

interface HeroSectionProps {
  continueChapter?: number | null;
  initialEdition?: "en" | "zh";
}

export function HeroSection({
  continueChapter = null,
  initialEdition = "en",
}: HeroSectionProps) {
  const [languageEdition, setLanguageEdition] = useState<"en" | "zh">(initialEdition);

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
      document.documentElement.lang = ed === "zh" ? "zh-Hans" : "en";
    } catch {}
  };

  const isZh = languageEdition === "zh";

  const hasResume = Boolean(continueChapter && continueChapter >= 1);
  const primaryHref = hasResume
    ? `/read?c=${continueChapter}&edition=${languageEdition}`
    : `/read?edition=${languageEdition}`;
  const primaryLabel = hasResume
    ? isZh
      ? `继续阅读第 ${continueChapter} 节`
      : `Continue Chapter ${continueChapter}`
    : isZh
      ? "开始阅读"
      : "Start Reading";

  return (
    <section className="relative py-5 sm:py-12 lg:py-16 font-sans">
      <div className="mx-auto max-w-[1250px] px-3.5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-[270px_1fr] items-center gap-4 sm:gap-10 lg:gap-14">
          {/* Left Column: Upright Book Cover & Editorial Seal Meta */}
          <div className="flex flex-row lg:flex-col items-center lg:items-center gap-4 sm:gap-6 text-left lg:text-center px-1 sm:px-0">
            <picture className="relative block flex-shrink-0">
              <source type="image/webp" srcSet="/images/book-cover.webp" />
              <img
                id="cover"
                src="/images/book-cover.jpg"
                alt="Reverend Insanity book cover featuring Fang Yuan"
                width={800}
                height={1170}
                loading="eager"
                fetchPriority="high"
                className="book-cover-frame w-[76px] sm:w-[132px] lg:w-[250px] max-h-[370px] object-cover shadow-sheet"
              />
            </picture>

            <div className="flex flex-col justify-center lg:items-center gap-1.5 min-w-0">
              <div className="inline-flex items-center gap-2 lg:hidden">
                <span className="seal-badge" aria-hidden="true">
                  蛊
                </span>
                <span className="text-[11px] font-medium tracking-[0.16em] uppercase text-muted">
                  {isZh ? "五域九天 · 免费阅读" : "FIVE REGIONS · NINE HEAVENS"}
                </span>
              </div>
              <span className="hidden lg:inline-block mt-1 text-[10px] tracking-[0.24em] uppercase text-muted">
                FIVE REGIONS · NINE HEAVENS
              </span>
              <span className="text-xs text-muted tabular-nums">
                {isZh
                  ? "共 2,334 节 · 无广告 · 纯净排版"
                  : "2,334 chapters · Free & ad-free"}
              </span>
            </div>
          </div>

          {/* Right Column: Warm Manuscript Reading Entry */}
          <div className="relative">
            <div className="intro relative z-10 rounded-xl sm:rounded-2xl border border-line bg-surface p-4 sm:p-8 lg:p-10 shadow-sm">
              <div className="flex items-center gap-2.5 mb-2.5 sm:mb-3">
                <span className="seal-badge" aria-hidden="true">
                  蛊
                </span>
                <p className="eyebrow text-[11px] font-medium tracking-[0.18em] uppercase text-accent">
                  {isZh ? "蛊真人 · 原版典藏" : "GU ZHENREN · 蛊真人 · COMPLETE EDITION"}
                </p>
              </div>

              <h1 className="font-times text-[2rem] sm:text-5xl lg:text-[4rem] font-normal tracking-[-0.02em] text-ink leading-[1.06] mb-3 sm:mb-4">
                Reverend Insanity
              </h1>

              <p className="summary text-muted text-[13.5px] sm:text-[15px] leading-[1.68] sm:leading-[1.8] mb-4 sm:mb-6">
                {isZh
                  ? "五百年风云变幻归于尘土，方源借春秋蝉重生回十五岁少年之时，于残酷修真界中逆天而行，唯求永生。"
                  : "Five hundred years of schemes collapse at Demonic Mountain. Reborn into his fifteen-year-old body with the Spring Autumn Cicada, Fang Yuan walks an uncompromising path toward eternal life."}
              </p>

              {/* Side-by-side 2-Button Edition Selector */}
              <div className="editions mb-4 sm:mb-6">
                <p
                  id="edition-selector-label"
                  className="text-[11px] tracking-[0.16em] uppercase text-muted mb-2 font-medium"
                >
                  {isZh ? "选择阅读版本" : "Choose your edition"}
                </p>

                <div
                  role="radiogroup"
                  aria-labelledby="edition-selector-label"
                  className="grid grid-cols-2 gap-2 sm:gap-3"
                >
                  <button
                    type="button"
                    role="radio"
                    aria-checked={!isZh}
                    onClick={() => handleLanguageEditionChange("en")}
                    className={`min-h-[48px] text-left rounded-lg px-3 py-2.5 sm:p-3.5 transition-colors border ${
                      !isZh
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-line bg-paper hover:border-line-strong"
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-medium text-ink">
                      English Edition
                    </span>
                    <span className="block text-[11px] text-muted mt-0.5 tabular-nums">
                      2,334 Ch. · Translated
                    </span>
                  </button>

                  <button
                    type="button"
                    role="radio"
                    aria-checked={isZh}
                    onClick={() => handleLanguageEditionChange("zh")}
                    className={`min-h-[48px] text-left rounded-lg px-3 py-2.5 sm:p-3.5 transition-colors border ${
                      isZh
                        ? "border-accent bg-accent/10 text-ink"
                        : "border-line bg-paper hover:border-line-strong"
                    }`}
                  >
                    <span className="block text-xs sm:text-sm font-medium text-ink">
                      中文原版 (蛊真人)
                    </span>
                    <span className="block text-[11px] text-muted mt-0.5 tabular-nums">
                      2,334 节 · Original Raw
                    </span>
                  </button>
                </div>
              </div>

              {/* Primary Actions Row */}
              <div className="actions flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2.5 sm:gap-5">
                <Link
                  id="start"
                  href={primaryHref}
                  className="primary group inline-flex w-full sm:w-auto sm:min-w-[210px] min-h-[48px] items-center justify-between gap-4 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-on-accent transition-colors hover:bg-accent-hover shadow-sm"
                >
                  <span>{primaryLabel}</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </Link>

                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <a
                    id="download"
                    href={
                      isZh
                        ? "/downloads/Gu_Zhen_Ren_Raw.epub"
                        : "/downloads/Reverend_Insanity.epub"
                    }
                    download={isZh ? "Gu_Zhen_Ren_Raw.epub" : "Reverend_Insanity.epub"}
                    className="inline-flex min-h-[44px] items-center gap-1.5 px-1 text-xs text-muted hover:text-accent transition-colors whitespace-nowrap"
                    title={
                      isZh
                        ? "Download complete 2,334 chapters Chinese raw EPUB (19 MB)"
                        : "Download complete 2,334 chapters EPUB (25 MB)"
                    }
                  >
                    <Download className="h-3.5 w-3.5" aria-hidden="true" />
                    <span className="underline underline-offset-4 decoration-line-strong">
                      {isZh ? "下载中文 EPUB (19 MB)" : "Download EPUB (25 MB)"}
                    </span>
                  </a>

                  {continueChapter && continueChapter > 1 && (
                    <Link
                      href={`/read?c=1&edition=${languageEdition}`}
                      className="inline-flex min-h-[44px] items-center px-1 text-xs text-muted hover:text-accent underline underline-offset-4 decoration-line-strong transition-colors whitespace-nowrap"
                    >
                      {isZh ? "从第一节开始" : "Chapter 1"}
                    </Link>
                  )}
                </div>
              </div>

              {/* Trust & Auto-Save Assurance Line */}
              <p id="resume-note" className="text-xs text-muted mt-3 sm:mt-4">
                {isZh
                  ? "阅读进度自动保存于当前设备 · 无需账号即可阅读全部章节"
                  : "Progress saved automatically on this device · No account required"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
