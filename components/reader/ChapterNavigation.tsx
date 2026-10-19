"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { ChapterMetadata, ReaderSettings } from "@/types/novel";
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
  settings?: ReaderSettings;
}

const THEME_NAV_STYLES: Record<string, { bg: string; border: string; btnBg: string; btnBorder: string; text: string; subtext: string; accent: string }> = {
  catppuccin: {
    bg: "bg-[#181825]/95",
    border: "border-[#313244]/80",
    btnBg: "bg-[#1e1e2e]/80",
    btnBorder: "border-[#313244]",
    text: "text-[#cdd6f4]",
    subtext: "text-[#a6adc8]",
    accent: "text-[#89b4fa]",
  },
  "catppuccin-mocha": {
    bg: "bg-[#11111b]/95",
    border: "border-[#45475a]/80",
    btnBg: "bg-[#181825]/80",
    btnBorder: "border-[#45475a]",
    text: "text-[#cdd6f4]",
    subtext: "text-[#a6adc8]",
    accent: "text-[#cba6f7]",
  },
  "catppuccin-pink": {
    bg: "bg-[#231522]/95",
    border: "border-[#56324e]/80",
    btnBg: "bg-[#2d1c2b]/80",
    btnBorder: "border-[#56324e]",
    text: "text-[#f5e0dc]",
    subtext: "text-[#f5c2e7]/70",
    accent: "text-[#f5c2e7]",
  },
  "catppuccin-coffee": {
    bg: "bg-[#201713]/95",
    border: "border-[#483329]/80",
    btnBg: "bg-[#2b1f1a]/80",
    btnBorder: "border-[#483329]",
    text: "text-[#f4ebd0]",
    subtext: "text-[#fab387]/70",
    accent: "text-[#fab387]",
  },
  "catppuccin-jade": {
    bg: "bg-[#111c16]/95",
    border: "border-[#274235]/80",
    btnBg: "bg-[#192b21]/80",
    btnBorder: "border-[#274235]",
    text: "text-[#e8f5e9]",
    subtext: "text-[#a6e3a1]/70",
    accent: "text-[#a6e3a1]",
  },
  "catppuccin-latte": {
    bg: "bg-[#e6e9ef]/95",
    border: "border-[#ccd0da]/90",
    btnBg: "bg-[#dce0e8]/80",
    btnBorder: "border-[#ccd0da]",
    text: "text-[#4c4f69]",
    subtext: "text-[#6c6f85]",
    accent: "text-[#1e66f5]",
  },
  black: {
    bg: "bg-[#09090b]/95",
    border: "border-zinc-800",
    btnBg: "bg-zinc-900/80",
    btnBorder: "border-zinc-800",
    text: "text-[#e4e4e7]",
    subtext: "text-zinc-400",
    accent: "text-zinc-200",
  },
  slate: {
    bg: "bg-[#0b1120]/95",
    border: "border-slate-800",
    btnBg: "bg-slate-900/80",
    btnBorder: "border-slate-800",
    text: "text-[#cbd5e1]",
    subtext: "text-slate-400",
    accent: "text-sky-400",
  },
  sepia: {
    bg: "bg-[#161210]/95",
    border: "border-amber-950/80",
    btnBg: "bg-[#221c18]/80",
    btnBorder: "border-amber-950/60",
    text: "text-[#f3ede2]",
    subtext: "text-amber-200/60",
    accent: "text-amber-400",
  },
  dark: {
    bg: "bg-[#121212]/95",
    border: "border-zinc-800",
    btnBg: "bg-zinc-900/80",
    btnBorder: "border-zinc-800",
    text: "text-[#e0e0e0]",
    subtext: "text-zinc-400",
    accent: "text-zinc-200",
  },
  acrylic: {
    bg: "bg-[#181825]/80",
    border: "border-white/10",
    btnBg: "bg-white/5",
    btnBorder: "border-white/15",
    text: "text-[#cdd6f4]",
    subtext: "text-[#a6adc8]",
    accent: "text-[#89b4fa]",
  },
  blur: {
    bg: "bg-[#11111b]/80",
    border: "border-white/10",
    btnBg: "bg-white/5",
    btnBorder: "border-white/15",
    text: "text-[#cdd6f4]",
    subtext: "text-[#a6adc8]",
    accent: "text-[#89b4fa]",
  },
  transparent: {
    bg: "bg-black/50",
    border: "border-white/10",
    btnBg: "bg-black/30",
    btnBorder: "border-white/15",
    text: "text-white",
    subtext: "text-zinc-300",
    accent: "text-[#89b4fa]",
  },
};

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
  settings,
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

  const navTheme = THEME_NAV_STYLES[settings?.surfaceTheme || "catppuccin"] || THEME_NAV_STYLES.catppuccin;

  return (
    <header className={`sticky top-0 z-30 w-full border-b ${navTheme.border} ${navTheme.bg} backdrop-blur-md transition-colors duration-200`}>
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Left: Home & TOC */}
        <div className="flex items-center space-x-2">
          <Link
            href="/"
            title="Return to Home"
            className={`flex items-center space-x-1.5 rounded border ${navTheme.btnBorder} ${navTheme.btnBg} px-2.5 py-1.5 text-xs ${navTheme.text} hover:opacity-80 transition-colors`}
          >
            <Home className={`h-3.5 w-3.5 ${navTheme.accent}`} />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <button
            onClick={onOpenToc}
            title="Open Table of Contents & Bookmarks"
            className={`flex items-center space-x-1.5 rounded border ${navTheme.btnBorder} ${navTheme.btnBg} px-2.5 py-1.5 text-xs ${navTheme.text} hover:opacity-80 transition-colors`}
          >
            <List className={`h-3.5 w-3.5 ${navTheme.accent}`} />
            <span className="hidden sm:inline">Chapters</span>
          </button>
        </div>

        {/* Center: Current Chapter Metadata */}
        <div className="mx-2 max-w-[200px] sm:max-w-md md:max-w-lg truncate text-center">
          <div className={`truncate text-xs sm:text-sm font-serif font-medium ${navTheme.text}`}>
            {currentChapter.title}
          </div>
          <div className={`text-[10px] sm:text-[11px] ${navTheme.subtext} font-mono`}>
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
                : `${navTheme.btnBorder} ${navTheme.btnBg} ${navTheme.subtext} hover:text-white`
            }`}
          >
            <Bookmark className={`h-4 w-4 ${isBookmarked ? "fill-[#89b4fa]" : ""}`} />
          </button>

          <button
            onClick={onPrev}
            disabled={!hasPrev}
            aria-label="Previous chapter"
            title="Previous chapter (← Arrow Left)"
            className={`rounded border ${navTheme.btnBorder} ${navTheme.btnBg} p-1.5 ${navTheme.text} hover:opacity-80 disabled:opacity-30 disabled:pointer-events-none transition-colors`}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <button
            onClick={onNext}
            disabled={!hasNext}
            aria-label="Next chapter"
            title="Next chapter (→ Arrow Right)"
            className={`rounded border ${navTheme.btnBorder} ${navTheme.btnBg} p-1.5 ${navTheme.text} hover:opacity-80 disabled:opacity-30 disabled:pointer-events-none transition-colors`}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Reader appearance settings"
            title="Appearance and typography settings"
            className={`rounded border ${navTheme.btnBorder} ${navTheme.btnBg} p-1.5 ${navTheme.text} hover:opacity-80 transition-colors ml-1`}
          >
            <SlidersHorizontal className={`h-4 w-4 ${navTheme.accent}`} />
          </button>
        </div>
      </div>
    </header>
  );
}
