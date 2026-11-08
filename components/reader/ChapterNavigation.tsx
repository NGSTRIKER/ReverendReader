"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ChapterMetadata, ReaderSettings, NovelEdition } from "@/types/novel";
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
  settings?: ReaderSettings;
  edition?: NovelEdition;
  onToggleEdition?: (newEdition?: NovelEdition) => void;
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
  onToggleEdition,
}: ChapterNavigationProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
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

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-paper/95 backdrop-blur-md font-mono">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-2 px-3 sm:px-6 py-2">
        {/* Left: Brand return & Contents */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/"
            title="Return to Index"
            className="inline-flex items-center gap-2 rounded-xl px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-sunken transition-colors"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="hidden sm:inline">Reverend Insanity</span>
            <span className="sm:hidden">Home</span>
            <span className="chinese-seal text-[10px]">蛊</span>
          </Link>

          <span className="h-4 w-px bg-line" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenToc}
            title="Table of contents and bookmarks"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2.5 py-1.5 text-xs text-ink hover:border-accent hover:bg-sunken transition-colors shadow-sm"
          >
            <List className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
            <span className="font-semibold">&gt;_ Index</span>
            <span className="hidden md:inline text-muted tabular-nums">
              · {currentChapter.number}/{totalChapters}
            </span>
          </button>
        </div>

        {/* Center: Running header */}
        <div className="hidden sm:flex items-center gap-2 min-w-0 max-w-md md:max-w-lg truncate text-center px-2">
          <span className="text-[11px] text-muted tabular-nums flex-shrink-0">
            [CH.{currentChapter.number.toString().padStart(4, "0")}]
          </span>
          <span className="truncate text-xs font-medium text-ink">
            {currentChapter.title}
          </span>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            title="Previous chapter (Left Arrow)"
            className="icon-btn rounded-xl"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <span className="sm:hidden px-1 text-xs text-muted tabular-nums">
            {currentChapter.number}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next chapter"
            title="Next chapter (Right Arrow)"
            className="icon-btn rounded-xl"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-pressed={isBookmarked}
            className={`icon-btn rounded-xl ${
              isBookmarked ? "text-accent bg-accent/15 border border-accent/30" : ""
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {onToggleEdition && (
            <button
              type="button"
              onClick={() => onToggleEdition()}
              title={edition === "zh" ? "Switch to English Translation" : "Switch to Chinese Raw (中文原版)"}
              aria-label="Toggle language edition"
              className="inline-flex items-center gap-1 rounded-xl border border-line bg-surface px-2 sm:px-2.5 py-1 sm:py-1.5 text-[11px] font-bold hover:border-line-strong hover:bg-sunken transition-colors"
            >
              <span className={edition === "en" ? "text-ink font-bold" : "text-muted font-normal"}>EN</span>
              <span className="text-line-strong text-[10px]">/</span>
              <span className={edition === "zh" ? "text-ink font-bold" : "text-muted font-normal"}>中文</span>
            </button>
          )}

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Reading preferences"
            title="Reading preferences"
            className="icon-btn rounded-xl"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <ThemeToggle className="rounded-xl" />

          <span className="mx-0.5 h-4 w-px bg-line" aria-hidden="true" />

          <UserNav compact />
        </div>
      </div>
    </header>
  );
}
