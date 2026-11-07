"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ChapterMetadata, ReaderSettings } from "@/types/novel";
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
    <header className="sticky top-0 z-30 w-full border-b border-line bg-paper/95 backdrop-blur-sm">
      <div className="mx-auto flex h-13 max-w-[1180px] items-center justify-between gap-2 px-3 sm:px-6 py-2">
        {/* Left: Brand return & Contents */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <Link
            href="/"
            title="Return to Index"
            className="inline-flex items-center gap-2 rounded-[3px] px-2.5 py-1.5 text-sm font-semibold text-ink hover:bg-sunken transition-colors"
          >
            <span className="h-2 w-2 bg-accent" aria-hidden="true" />
            <span className="hidden sm:inline">Reverend Insanity</span>
            <span className="sm:hidden">Home</span>
          </Link>

          <span className="h-4 w-px bg-line" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenToc}
            title="Table of contents and bookmarks"
            className="inline-flex items-center gap-1.5 rounded-[3px] border border-line-strong bg-surface px-2.5 py-1 text-xs sm:text-sm text-ink hover:border-ink/40 hover:bg-sunken transition-colors"
          >
            <List className="h-3.5 w-3.5 text-accent" strokeWidth={1.75} />
            <span>Index</span>
            <span className="hidden md:inline text-muted tnum">
              · {currentChapter.number}/{totalChapters}
            </span>
          </button>
        </div>

        {/* Center: Running header */}
        <div className="hidden sm:block min-w-0 max-w-md md:max-w-lg truncate text-center px-2">
          <div className="truncate text-sm font-medium text-ink">
            {currentChapter.title}
          </div>
        </div>

        {/* Right: Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            title="Previous chapter (Left Arrow)"
            className="icon-btn"
          >
            <ChevronLeft className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <span className="sm:hidden px-1 text-xs text-muted tnum">
            {currentChapter.number}
          </span>

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next chapter"
            title="Next chapter (Right Arrow)"
            className="icon-btn"
          >
            <ChevronRight className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <button
            type="button"
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-pressed={isBookmarked}
            className={`icon-btn ${
              isBookmarked ? "text-accent bg-accent/10" : ""
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Reading preferences"
            title="Reading preferences"
            className="icon-btn"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </button>

          <ThemeToggle />

          <span className="mx-0.5 h-4 w-px bg-line" aria-hidden="true" />

          <UserNav compact />
        </div>
      </div>
    </header>
  );
}
