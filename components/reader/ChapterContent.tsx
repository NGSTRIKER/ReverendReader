"use client";

import React from "react";
import { ChapterMetadata, ReaderSettings } from "@/types/novel";
import { ChevronLeft, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

interface ChapterContentProps {
  chapter: ChapterMetadata;
  content: string | null;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  onPrev: () => void;
  onNext: () => void;
  settings: ReaderSettings;
}

export function ChapterContent({
  chapter,
  content,
  loading,
  error,
  onRetry,
  hasPrev,
  hasNext,
  onPrev,
  onNext,
  settings,
}: ChapterContentProps) {
  // Map font settings to class
  const fontClass = {
    serif: "font-choice-serif",
    sans: "font-choice-sans",
    mono: "font-choice-mono",
    literary: "font-choice-literary",
  }[settings.font];

  // Map surface theme to styles
  let surfaceBackground = `rgba(30, 30, 46, ${settings.surfaceOpacity})`; // default Catppuccin Base
  let backdropClass = "backdrop-blur-sm";
  let borderClass = "border-[#313244]";
  let containerShadow = "shadow-2xl";
  let textShadowStyle: React.CSSProperties = {};

  if (settings.surfaceTheme === "catppuccin") {
    surfaceBackground = `rgba(30, 30, 46, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#313244]";
  } else if (settings.surfaceTheme === "acrylic") {
    // Frosted acrylic glass: intense blur, frosted sheen, luminous subtle border
    surfaceBackground = `rgba(24, 24, 37, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-2xl backdrop-saturate-150";
    borderClass = "border-white/15";
    containerShadow = "shadow-[0_8px_32px_0_rgba(0,0,0,0.5)]";
  } else if (settings.surfaceTheme === "blur") {
    // Soft blur: gentle frosted tint
    surfaceBackground = `rgba(17, 17, 27, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-md";
    borderClass = "border-[#45475a]/50";
  } else if (settings.surfaceTheme === "transparent") {
    // Full transparency: no background box, text shadow for crystal readability over any wallpaper
    surfaceBackground = "transparent";
    backdropClass = "backdrop-blur-none";
    borderClass = "border-transparent";
    containerShadow = "shadow-none";
    textShadowStyle = {
      textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.85), 0 0 20px rgba(0,0,0,0.7)",
    };
  } else if (settings.surfaceTheme === "black") {
    surfaceBackground = `rgba(9, 9, 11, ${settings.surfaceOpacity})`;
    borderClass = "border-zinc-800";
  } else if (settings.surfaceTheme === "slate") {
    surfaceBackground = `rgba(15, 23, 42, ${settings.surfaceOpacity})`;
    borderClass = "border-slate-800";
  } else if (settings.surfaceTheme === "sepia") {
    surfaceBackground = `rgba(23, 20, 18, ${settings.surfaceOpacity})`;
    borderClass = "border-amber-950/60";
  } else {
    // dark / charcoal
    surfaceBackground = `rgba(24, 24, 37, ${settings.surfaceOpacity})`;
    borderClass = "border-[#313244]";
  }

  // If opacity is 0 on any theme, enable text shadow for readability
  if (settings.surfaceOpacity === 0 && !textShadowStyle.textShadow) {
    surfaceBackground = "transparent";
    borderClass = "border-transparent";
    textShadowStyle = {
      textShadow: "0 1px 3px rgba(0,0,0,0.95), 0 2px 10px rgba(0,0,0,0.85)",
    };
  }

  // Split plain text by double newlines into clean paragraphs
  // NEVER use innerHTML - render as react string children
  const paragraphs = React.useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  return (
    <article
      style={{
        maxWidth: `${settings.maxWidth}px`,
        backgroundColor: surfaceBackground,
        ...textShadowStyle,
      }}
      className={`relative mx-auto my-6 sm:my-10 rounded-xl border ${borderClass} px-6 sm:px-12 md:px-16 py-10 sm:py-16 ${containerShadow} transition-all duration-200 ${backdropClass} ${fontClass}`}
    >
      {/* Chapter Heading */}
      <header className="mb-10 sm:mb-14 border-b border-[#313244] pb-8 text-center">
        <div className="mb-3 inline-block rounded-full border border-[#89b4fa]/40 bg-[#89b4fa]/10 px-3.5 py-1 font-mono text-xs tracking-wider text-[#89b4fa] uppercase">
          Chapter {chapter.number}
        </div>
        <h1 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-[#cdd6f4]">
          {chapter.title}
        </h1>
        <div className="mt-3 text-xs text-[#a6adc8] font-mono">
          {chapter.wordCount.toLocaleString()} words
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 py-8 animate-pulse">
          <div className="h-4 bg-[#313244]/80 rounded w-3/4"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-full"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-5/6"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-full"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-2/3"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-4/5 pt-6"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-full"></div>
          <div className="h-4 bg-[#313244]/80 rounded w-3/4"></div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="my-8 rounded-lg border border-[#f38ba8]/60 bg-[#f38ba8]/10 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-[#f38ba8] mb-3" />
          <p className="text-sm text-[#f38ba8] mb-4">{error}</p>
          <button
            onClick={onRetry}
            className="inline-flex items-center space-x-2 rounded bg-[#89b4fa] px-4 py-2 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Loading Chapter</span>
          </button>
        </div>
      )}

      {/* Chapter Text - Rendered purely as plaintext paragraphs */}
      {!loading && !error && (
        <div
          className="reader-content text-[#cdd6f4] selection:bg-[#89b4fa]/30 selection:text-white"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
          }}
        >
          {paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      )}

      {/* Bottom Chapter Navigation Footer */}
      <footer className="mt-14 pt-8 border-t border-[#313244] flex flex-col sm:flex-row items-center justify-between gap-4">
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded border border-[#313244] bg-[#181825] px-5 py-2.5 text-xs font-medium text-[#cdd6f4] hover:bg-[#313244] hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Chapter</span>
        </button>

        <span className="text-xs text-[#a6adc8] font-mono">
          Chapter {chapter.number}
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className="flex w-full sm:w-auto items-center justify-center space-x-2 rounded bg-[#89b4fa] px-5 py-2.5 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] disabled:opacity-30 disabled:pointer-events-none transition-colors"
        >
          <span>Next Chapter</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
