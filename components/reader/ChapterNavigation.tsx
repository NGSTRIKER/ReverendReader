"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ChapterMetadata, NovelEdition, ReaderSettings } from "@/types/novel";
import {
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  Bookmark,
} from "lucide-react";
import { UserNav } from "@/components/auth/UserNav";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

interface ChapterNavigationProps {
  currentChapter: ChapterMetadata;
  totalChapters: number;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  onOpenToc: () => void;
  onOpenSettings: () => void;
  isBookmarked: boolean;
  onToggleBookmark: () => void;
  edition?: NovelEdition;
  onChangeEdition?: (edition: NovelEdition) => void;
  settings?: ReaderSettings;
}

export function ChapterNavigation({
  currentChapter,
  totalChapters,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  onOpenToc,
  onOpenSettings,
  isBookmarked,
  onToggleBookmark,
  edition = "en",
  onChangeEdition,
}: ChapterNavigationProps) {
  // Mobile: hide header while scrolling down, reveal on scroll up (rAF-throttled).
  const [hidden, setHidden] = useState(false);
  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;
    let rafId: number | null = null;
    const update = () => {
      ticking = false;
      rafId = null;
      const y = window.scrollY;
      const delta = y - lastY;
      if (Math.abs(delta) < 8) return;
      setHidden(delta > 0 && y > 80);
      lastY = y;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        rafId = requestAnimationFrame(update);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  // Reveal header when chapter changes
  useEffect(() => {
    setHidden(false);
  }, [currentChapter.number]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) {
        return;
      }
      const target = e.target as HTMLElement | null;
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target?.isContentEditable
      ) {
        return;
      }
      if (document.querySelector('[aria-modal="true"]')) {
        return;
      }

      if (e.key === "ArrowLeft" && hasPrev) {
        e.preventDefault();
        onPrev();
      } else if (e.key === "ArrowRight" && hasNext) {
        e.preventDefault();
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [hasPrev, hasNext, onPrev, onNext]);

  const isZh = edition === "zh";

  return (
    <header
      className={`sticky top-0 z-30 w-full border-b border-line bg-paper sm:bg-paper/95 sm:backdrop-blur-md font-sans transition-transform duration-200 sm:!translate-y-0 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="mx-auto flex h-[52px] sm:h-14 max-w-[1240px] items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-6">
        {/* Left: Editorial brand return & compact chapter jump */}
        <div className="flex items-center gap-1 sm:gap-2 min-w-0">
          <Link
            href="/"
            title="Return to Home"
            aria-label="Reverend Insanity - Return to Home"
            className="inline-flex h-11 min-w-[44px] sm:h-9 sm:min-w-0 items-center justify-center rounded-full px-2 sm:px-2.5 text-sm sm:text-base font-times font-bold tracking-tight text-ink hover:bg-sunken transition-colors flex-shrink-0"
          >
            <span className="sm:hidden">RI</span>
            <span className="hidden sm:inline">Reverend Insanity</span>
          </Link>
          <span className="text-line-strong text-xs select-none" aria-hidden="true">
            /
          </span>
          <button
            type="button"
            onClick={onOpenToc}
            title={`Table of contents (Chapter ${currentChapter.number}/${totalChapters})`}
            aria-label={`Chapter ${currentChapter.number} of ${totalChapters} — Open chapters`}
            className="inline-flex h-11 sm:h-8 items-center rounded-full px-2 sm:px-2.5 font-mono text-xs font-medium text-muted hover:bg-sunken hover:text-ink transition-colors tnum flex-shrink-0"
          >
            {isZh ? `第 ${currentChapter.number} 节` : `Ch. ${currentChapter.number}`}
          </button>
        </div>

        {/* Right: Slim mobile controls (navigation/settings live in bottom thumb bar on <640px) + Full desktop controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Mid-Chapter Language Edition Switch */}
          {onChangeEdition && (
            <div
              role="radiogroup"
              aria-label="Language edition"
              className="inline-flex items-center rounded-full border border-line bg-sunken p-0.5 mr-0.5"
            >
              <button
                type="button"
                role="radio"
                aria-checked={!isZh}
                aria-label="English edition"
                onClick={() => onChangeEdition("en")}
                className={`inline-flex h-9 sm:h-7 min-w-[34px] sm:min-w-[30px] items-center justify-center rounded-full px-2 text-[11px] font-semibold transition-colors ${
                  !isZh
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                EN
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={isZh}
                aria-label="Chinese raw edition"
                onClick={() => onChangeEdition("zh")}
                className={`inline-flex h-9 sm:h-7 min-w-[34px] sm:min-w-[30px] items-center justify-center rounded-full px-2 text-[11px] font-semibold transition-colors ${
                  isZh
                    ? "bg-surface text-ink shadow-sm"
                    : "text-muted hover:text-ink"
                }`}
              >
                中
              </button>
            </div>
          )}

          {/* Table of contents / Index (Desktop) */}
          <button
            type="button"
            onClick={onOpenToc}
            title={`Table of contents (Chapter ${currentChapter.number}/${totalChapters})`}
            aria-label="Table of contents"
            className="hidden sm:inline-flex icon-btn rounded-full h-9 w-9"
          >
            <List className="h-4 w-4 text-accent flex-shrink-0" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* Previous chapter (Desktop) */}
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            title="Previous chapter (Left Arrow)"
            className="hidden sm:inline-flex icon-btn rounded-full h-9 w-9"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* Next chapter (Desktop) */}
          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next chapter"
            title="Next chapter (Right Arrow)"
            className="hidden sm:inline-flex icon-btn rounded-full h-9 w-9"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* Reader Customization / Preferences Button (Desktop) */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Customize reader dimensions and typography"
            title="Customize reader (Typography, font size, theme, dimensions)"
            data-testid="reader-customization-btn"
            className="hidden sm:inline-flex icon-btn rounded-full h-9 w-9 text-accent bg-accent/10 border border-accent/25 hover:border-accent hover:bg-accent/20 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
          </button>

          {/* Bookmark Button (Desktop) */}
          <button
            type="button"
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-pressed={isBookmarked}
            className={`hidden sm:inline-flex icon-btn rounded-full h-9 w-9 ${
              isBookmarked ? "text-accent bg-accent/15 border border-accent/30" : ""
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              strokeWidth={1.75}
              aria-hidden="true"
            />
          </button>

          {/* Theme Toggle (Mobile 44px & Desktop 36px) */}
          <ThemeToggle className="rounded-full h-11 w-11 sm:h-9 sm:w-9" />

          <span className="hidden sm:inline-block mx-0.5 h-4 w-px bg-line" aria-hidden="true" />

          {/* User Nav (Compact) */}
          <UserNav compact />
        </div>
      </div>
    </header>
  );
}
