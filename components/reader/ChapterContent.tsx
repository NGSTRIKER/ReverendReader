/* Hallmark · macrostructure: reading-canvas · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

"use client";

import React from "react";
import { ChapterMetadata, ReaderSettings } from "@/types/novel";
import { getReaderFontClass } from "@/lib/storage";
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
  hasCustomBg?: boolean;
}

const SURFACE_THEME_CLASSES: Record<string, string> = {
  "matte-terminal": "bg-[#16181d] text-[#e4e8f0] border border-[#2a2e38] shadow-2xl",
  "terminal-grey": "bg-[#1c1f26] text-[#e4e8f0] border border-[#343a46] shadow-xl",
  "black": "bg-[#09090b] text-[#f4f4f5] border border-zinc-800 shadow-2xl",
  "slate": "bg-[#0f172a] text-[#e2e8f0] border border-slate-700 shadow-xl",
  "catppuccin": "bg-[#1e1e2e] text-[#cdd6f4] border border-[#89b4fa]/40 shadow-xl",
  "catppuccin-mocha": "bg-[#11111b] text-[#cdd6f4] border border-[#cba6f7]/40 shadow-xl",
  "catppuccin-jade": "bg-[#14231b] text-[#a6e3a1] border border-[#a6e3a1]/40 shadow-xl",
  "catppuccin-pink": "bg-[#281827] text-[#f5c2e7] border border-[#f5c2e7]/40 shadow-xl",
  "catppuccin-coffee": "bg-[#241a16] text-[#f4dbd6] border border-[#fab387]/40 shadow-xl",
  "sepia": "bg-[#181512] text-[#e6d5b8] border border-amber-950/60 shadow-xl",
  "catppuccin-latte": "bg-[#eff1f5] text-[#4c4f69] border border-[#bcc0cc] shadow-md",
  "acrylic": "bg-surface/50 backdrop-blur-md border border-line shadow-lg",
  "blur": "bg-[#0e0f12]/60 backdrop-blur-md border border-line shadow-lg",
  "transparent": "bg-transparent border border-dashed border-line/40",
};

function splitChapterHeading(number: number, rawTitle: string): {
  kicker: string;
  headline: string;
} {
  const cleaned = rawTitle.replace(/^Chapter\s+\d+\s*[-:]\s*/i, "").trim();
  if (cleaned && cleaned.toLowerCase() !== `chapter ${number}`) {
    return {
      kicker: `Chapter ${number}`,
      headline: cleaned,
    };
  }
  return {
    kicker: "Reverend Insanity",
    headline: rawTitle || `Chapter ${number}`,
  };
}

export const ChapterContent = React.memo(function ChapterContent({
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
  hasCustomBg = false,
}: ChapterContentProps) {
  const paragraphs = React.useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  const isFullWidth = settings.maxWidth >= 9999;
  const maxWidthStyle = isFullWidth ? "100%" : `min(100%, ${settings.maxWidth}px)`;
  const { kicker, headline } = splitChapterHeading(chapter.number, chapter.title);

  const themeClass = settings.surfaceTheme
    ? SURFACE_THEME_CLASSES[settings.surfaceTheme] || "bg-surface border border-line"
    : "bg-surface border border-line";

  const surfaceStyle: React.CSSProperties = {
    maxWidth: maxWidthStyle,
  };

  if (hasCustomBg) {
    surfaceStyle.backgroundColor = `rgb(var(--surface) / ${settings.surfaceOpacity})`;
  }

  const fontClass = getReaderFontClass(settings.font);

  const alignmentClass = settings.textAlign === "justify" ? "text-justify" : "text-left";

  return (
    <article
      style={surfaceStyle}
      className={`relative mx-auto my-4 sm:my-10 px-3.5 sm:px-10 md:px-14 py-6 sm:py-12 rounded-xl sm:rounded-2xl transition-all duration-200 w-full max-w-full ${themeClass}`}
    >
      {/* Modern Terminal Header with Chinese Touch */}
      <header className="mb-6 sm:mb-12 border-b border-line pb-5 sm:pb-6">
        {/* Terminal Titlebar Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 mb-4 font-mono text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-accent" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
              <span className="h-2 w-2 rounded-full bg-line-strong" />
            </div>
            <span className="text-muted tracking-wider uppercase">
              &gt;_ [SYS: ONLINE · CH.{chapter.number.toString().padStart(4, "0")}]
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="chinese-seal text-[10px]">印 蛊真人</span>
            <span className="terminal-chip text-[11px] tabular-nums">
              第 {chapter.number} 章
            </span>
            {chapter.wordCount > 0 && (
              <span className="terminal-chip text-[11px] tabular-nums hidden sm:inline-flex">
                {chapter.wordCount.toLocaleString()} words
              </span>
            )}
          </div>
        </div>

        {/* Chapter Title In Traditional Brackets */}
        <div className="mt-3">
          <p className="text-xs font-mono font-semibold uppercase tracking-wider text-accent mb-1.5">
            {kicker}
          </p>
          <h1 className="text-2xl sm:text-3xl md:text-[2.2rem] font-bold tracking-tight leading-[1.25] text-ink font-mono sm:font-sans break-words">
            「 {headline} 」
          </h1>
        </div>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 py-8 font-mono" aria-live="polite" aria-busy="true">
          <div className="h-4 bg-sunken rounded-lg w-3/4 animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-full animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-5/6 animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-full animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-2/3 animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-4/5 mt-6 animate-pulse" />
          <div className="h-4 bg-sunken rounded-lg w-full animate-pulse" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="my-8 rounded-2xl border border-danger/40 bg-danger/10 p-6 font-mono">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-ink mb-4">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry loading chapter</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chapter Prose */}
      {!loading && !error && (
        <div
          className={`reader-content ${fontClass} ${alignmentClass} break-words`}
          style={{
            color: settings.fontColor || undefined,
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing:
              typeof settings.letterSpacing === "number" && settings.letterSpacing !== 0
                ? `${settings.letterSpacing}px`
                : undefined,
          }}
        >
          {paragraphs.map((para, index) => (
            <p key={index}>{para}</p>
          ))}
        </div>
      )}

      {/* Bottom Chapter Navigation Footer */}
      <footer className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 font-mono">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="btn-quiet py-2.5 px-4 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider font-semibold"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Chapter</span>
        </button>

        <div className="flex items-center justify-center gap-2 text-center text-xs text-muted">
          <span className="chinese-seal text-[10px]">终</span>
          <span className="tabular-nums">End of Chapter {chapter.number} · 第 {chapter.number} 章 终</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="btn-primary py-2.5 px-5 rounded-xl flex items-center gap-2 text-xs uppercase tracking-wider font-semibold"
        >
          <span>Next Chapter</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
});
