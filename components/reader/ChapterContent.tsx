/* Hallmark · macrostructure: reading-canvas · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

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
  hasCustomBg?: boolean;
}

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
  const maxWidthStyle = isFullWidth ? "100%" : `${settings.maxWidth}px`;
  const { kicker, headline } = splitChapterHeading(chapter.number, chapter.title);

  const surfaceStyle: React.CSSProperties = {
    maxWidth: maxWidthStyle,
  };

  if (hasCustomBg) {
    surfaceStyle.backgroundColor = `rgb(var(--surface) / ${settings.surfaceOpacity})`;
  }

  return (
    <article
      style={surfaceStyle}
      className={`relative mx-auto my-6 sm:my-12 px-3 sm:px-8 md:px-12 py-6 sm:py-10 ${
        hasCustomBg ? "border border-line backdrop-blur-sm" : ""
      } ${isFullWidth ? "w-full max-w-full" : ""}`}
    >
      {/* Chapter Header */}
      <header className="mb-10 sm:mb-14 border-b border-line pb-8">
        <div className="flex items-baseline justify-between gap-4 mb-3">
          <span className="label text-accent tnum">{kicker}</span>
          {chapter.wordCount > 0 && (
            <span className="label tnum">
              {chapter.wordCount.toLocaleString()} words
            </span>
          )}
        </div>

        <h1 className="text-2xl sm:text-3xl md:text-[2.25rem] font-semibold tracking-[-0.015em] leading-[1.2] text-ink">
          {headline}
        </h1>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 py-8" aria-live="polite" aria-busy="true">
          <div className="h-4 bg-sunken w-3/4" />
          <div className="h-4 bg-sunken w-full" />
          <div className="h-4 bg-sunken w-5/6" />
          <div className="h-4 bg-sunken w-full" />
          <div className="h-4 bg-sunken w-2/3" />
          <div className="h-4 bg-sunken w-4/5 mt-6" />
          <div className="h-4 bg-sunken w-full" />
          <div className="h-4 bg-sunken w-3/4" />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="my-8 border border-danger/40 bg-danger/5 p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm text-ink mb-4">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary text-xs px-3.5 py-2"
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
          className="reader-content text-ink"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing:
              typeof settings.letterSpacing === "number" && settings.letterSpacing !== 0
                ? `${settings.letterSpacing}px`
                : undefined,
          }}
        >
          {paragraphs.map((para, index) => (
            <p key={index} style={{ lineHeight: settings.lineHeight }}>
              {para}
            </p>
          ))}
        </div>
      )}

      {/* Bottom Chapter Navigation Footer */}
      <footer className="mt-14 pt-8 border-t border-line flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onPrev}
          disabled={!hasPrev}
          className="btn-quiet py-2.5 px-4"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Chapter</span>
        </button>

        <span className="label text-center tnum">
          End of Chapter {chapter.number}
        </span>

        <button
          type="button"
          onClick={onNext}
          disabled={!hasNext}
          className="btn-primary py-2.5 px-5 font-medium"
        >
          <span>Next Chapter</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
