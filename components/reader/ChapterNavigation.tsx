"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ChapterMetadata } from "@/types/novel";
import {
  ChevronLeft,
  ChevronRight,
  List,
  SlidersHorizontal,
  Home,
  Bookmark,
} from "lucide-react";

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
  // Arrow key navigation listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
    <header className="sticky top-0 z-30 w-full border-b border-[#313244]/80 bg-[#181825]/95 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Home & TOC */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            title="Return to Home"
            className="flex items-center space-x-1.5 rounded border border-[#313244] bg-[#1e1e2e]/80 px-2.5 py-1.5 text-xs text-[#cdd6f4] hover:border-[#89b4fa]/50 hover:text-white transition-colors"
          >
            <Home className="h-3.5 w-3.5 text-[#89b4fa]" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            onClick={onOpenToc}
            title="Open Table of Contents & Bookmarks"
            className="flex items-center space-x-1.5 rounded border border-[#313244] bg-[#1e1e2e]/80 px-2.5 py-1.5 text-xs text-[#cdd6f4] hover:border-[#89b4fa]/50 hover:text-white transition-colors"
          >
            <List className="h-3.5 w-3.5 text-[#89b4fa]" />
            <span className="hidden sm:inline">Chapters</span>
          </button>
        </div>

        {/* Center: Current Chapter Metadata */}
        <div className="mx-2 max-w-[200px] sm:max-w-md md:max-w-lg truncate text-center">
          <div className="truncate text-xs sm:text-sm font-serif font-medium text-[#cdd6f4]">
            {currentChapter.title}
          </div>
          <div className="text-[10px] sm:text-[11px] text-[#a6adc8] font-mono">
            Chapter {currentChapter.number} of {totalChapters.toLocaleString()}
          </div>
        </div>

        {/* Right: Bookmark / Prev / Next / Settings */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <button
            onClick={onToggleBookmark}
            title={isBookmarked ? "Remove Bookmark" : "Bookmark this Chapter"}
            aria-label={isBookmarked ? "Remove Bookmark" : "Bookmark this Chapter"}
            className={`rounded border p-1.5 transition-colors ${
              isBookmarked
                ? "border-[#89b4fa] bg-[#89b4fa]/20 text-[#89b4fa]"
                : "border-[#313244] bg-[#1e1e2e]/80 text-[#a6adc8] hover:border-[#89b4fa]/50 hover:text-[#cdd6f4]"
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#89b4fa]" : ""}`} />
          </button>

          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            title="Previous chapter (← Arrow Left)"
            className="rounded border border-[#313244] bg-[#1e1e2e]/80 p-1.5 text-[#cdd6f4] hover:bg-[#313244] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next chapter"
            title="Next chapter (→ Arrow Right)"
            className="rounded border border-[#313244] bg-[#1e1e2e]/80 p-1.5 text-[#cdd6f4] hover:bg-[#313244] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Reader appearance settings"
            title="Appearance and typography settings"
            className="rounded border border-[#313244] bg-[#1e1e2e]/80 p-1.5 text-[#cdd6f4] hover:bg-[#313244] hover:text-white transition-colors ml-1"
          >
            <SlidersHorizontal className="h-4 w-4 text-[#89b4fa]" />
          </button>
        </div>
      </div>
    </header>
  );
}
