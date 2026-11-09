"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { ChapterMetadata, ReaderSettings } from "@/types/novel";
import {
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  Bookmark,
  MoreVertical,
  Palette,
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mobileMenuOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        mobileMenuOpen
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
  }, [hasPrev, hasNext, onPrev, onNext, mobileMenuOpen]);

  return (
    <header className="sticky top-0 z-30 w-full border-b border-line bg-paper/95 backdrop-blur-md font-mono">
      <div className="mx-auto flex h-14 max-w-[1240px] items-center justify-between gap-1.5 sm:gap-2 px-2.5 sm:px-6 py-2">
        {/* Left: Brand return & Contents */}
        <div className="flex items-center gap-1 sm:gap-2.5 min-w-0">
          <Link
            href="/"
            title="Return to Index"
            className="inline-flex items-center gap-1.5 sm:gap-2 rounded-xl px-2 sm:px-2.5 py-1.5 text-xs font-bold text-ink hover:bg-sunken transition-colors flex-shrink-0"
          >
            <span className="h-2 w-2 rounded-full bg-accent" aria-hidden="true" />
            <span className="hidden sm:inline">Reverend Insanity</span>
            <span className="chinese-seal text-[10px]">蛊</span>
          </Link>

          <span className="h-4 w-px bg-line flex-shrink-0" aria-hidden="true" />

          <button
            type="button"
            onClick={onOpenToc}
            title="Table of contents and bookmarks"
            className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-2 sm:px-2.5 py-1.5 text-xs text-ink hover:border-accent hover:bg-sunken transition-colors shadow-sm flex-shrink-0"
          >
            <List className="h-3.5 w-3.5 text-accent flex-shrink-0" strokeWidth={1.75} />
            <span className="font-semibold hidden sm:inline">&gt;_ Index</span>
            <span className="font-semibold sm:hidden">Index</span>
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
        <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
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

          <button
            type="button"
            onClick={onOpenToc}
            title="Current chapter - Click to open chapter index"
            aria-label={`Chapter ${currentChapter.number}. Click to open index`}
            className="sm:hidden px-1.5 py-1 rounded-lg text-xs font-semibold text-muted hover:text-ink hover:bg-sunken tabular-nums transition-colors"
          >
            {currentChapter.number}
          </button>

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

          {/* Reader Customization / Preferences Button (ALWAYS visible & prioritized on mobile & desktop) */}
          <button
            type="button"
            onClick={onOpenSettings}
            aria-label="Customize reader dimensions and typography"
            title="Customize reader (Typography, font size, theme, dimensions)"
            data-testid="reader-customization-btn"
            className="icon-btn rounded-xl text-accent bg-accent/10 border border-accent/25 hover:border-accent hover:bg-accent/20 transition-colors"
          >
            <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} />
          </button>

          {/* Bookmark Button (Desktop and wide mobile screens) */}
          <button
            type="button"
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this chapter"}
            aria-pressed={isBookmarked}
            className={`hidden min-[420px]:inline-flex icon-btn rounded-xl ${
              isBookmarked ? "text-accent bg-accent/15 border border-accent/30" : ""
            }`}
          >
            <Bookmark
              className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
              strokeWidth={1.75}
            />
          </button>

          {/* Theme Toggle (Desktop inline) */}
          <ThemeToggle className="hidden sm:inline-flex rounded-xl" />

          <span className="hidden sm:inline-block mx-0.5 h-4 w-px bg-line" aria-hidden="true" />

          {/* User Nav (Compact) */}
          <UserNav compact />

          {/* Mobile Quick Actions More Menu Toggle (Mobile only) */}
          <div className="relative sm:hidden" ref={mobileMenuRef}>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="More reader options"
              title="More reader options"
              aria-expanded={mobileMenuOpen}
              aria-haspopup="true"
              className={`icon-btn rounded-xl ${
                mobileMenuOpen ? "bg-sunken text-ink border border-line" : ""
              }`}
            >
              <MoreVertical className="h-4 w-4" strokeWidth={1.75} />
            </button>

            {/* Mobile Dropdown Popover */}
            {mobileMenuOpen && (
              <div
                role="menu"
                aria-label="Reader mobile options"
                className="absolute right-0 top-full mt-2 w-52 rounded-2xl border border-line bg-surface p-1.5 shadow-pop z-50 font-mono text-xs animate-in fade-in zoom-in-95 duration-150"
              >
                <button
                  type="button"
                  onClick={() => {
                    onToggleBookmark();
                    setMobileMenuOpen(false);
                  }}
                  className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-ink hover:bg-sunken transition-colors text-left"
                >
                  <span className="flex items-center gap-2">
                    <Bookmark
                      className={`h-3.5 w-3.5 ${
                        isBookmarked ? "text-accent fill-current" : "text-muted"
                      }`}
                    />
                    <span>{isBookmarked ? "Remove Bookmark" : "Bookmark Chapter"}</span>
                  </span>
                  {isBookmarked && (
                    <span className="text-[10px] text-accent font-semibold">Saved</span>
                  )}
                </button>

                <div className="flex w-full items-center justify-between rounded-xl px-3 py-1.5 text-ink hover:bg-sunken transition-colors">
                  <span className="flex items-center gap-2">
                    <Palette className="h-3.5 w-3.5 text-accent" />
                    <span>Theme</span>
                  </span>
                  <ThemeToggle className="rounded-lg h-7 w-7" />
                </div>

                <div className="my-1 border-t border-line" />

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-accent font-semibold hover:bg-accent/10 transition-colors text-left"
                >
                  <SlidersHorizontal className="h-3.5 w-3.5" />
                  <span>Customize Reader...</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
