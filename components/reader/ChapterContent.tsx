/* Hallmark · macrostructure: reading-canvas · theme: seal-ink · genre: editorial
 * pre-emit critique: P5 H5 E5 S5 R5 V5
 * slop test: pass
 */

"use client";

import React from "react";
import { ChapterMetadata, NovelEdition, ReaderSettings } from "@/types/novel";
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
  onOpenToc?: () => void;
  settings: ReaderSettings;
  hasCustomBg?: boolean;
  edition?: NovelEdition;
}

const SURFACE_WRAPPER_CLASSES: Record<string, string> = {
  "matte-terminal": "bg-paper text-ink border border-line shadow-sm",
  "catppuccin-latte": "bg-paper text-ink border border-line shadow-sm",
  "sepia": "bg-paper text-ink border border-line shadow-xl",
  "catppuccin-jade": "bg-paper text-ink border border-line shadow-xl",
  "catppuccin-coffee": "bg-paper text-ink border border-line shadow-xl",
  "catppuccin": "bg-paper text-ink border border-line shadow-xl",
  "catppuccin-mocha": "bg-paper text-ink border border-line shadow-xl",
  "catppuccin-pink": "bg-paper text-ink border border-line shadow-xl",
  "terminal-grey": "bg-paper text-ink border border-line shadow-xl",
  "slate": "bg-paper text-ink border border-line shadow-xl",
  "black": "bg-paper text-ink border border-line shadow-2xl",
  "acrylic": "bg-surface/65 text-ink backdrop-blur-md border border-line shadow-lg",
  "blur": "bg-surface/45 text-ink backdrop-blur-md border border-line shadow-lg",
  "transparent": "bg-transparent text-ink border border-line/70 shadow-none",
};

function splitChapterHeading(
  number: number,
  rawTitle: string,
  isZh: boolean
): {
  kicker: string;
  headline: string;
} {
  const cleaned = rawTitle.replace(/^Chapter\s+\d+\s*[-:]\s*/i, "").trim();
  if (cleaned && cleaned.toLowerCase() !== `chapter ${number}`) {
    return {
      kicker: isZh ? `第 ${number} 节` : `Chapter ${number}`,
      headline: cleaned,
    };
  }
  return {
    kicker: isZh ? "蛊真人" : "Reverend Insanity",
    headline: rawTitle || (isZh ? `第 ${number} 节` : `Chapter ${number}`),
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
  onOpenToc,
  settings,
  hasCustomBg = false,
  edition = "en",
}: ChapterContentProps) {
  const isZh = edition === "zh";

  const paragraphs = React.useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  const isFullWidth = settings.maxWidth >= 9999;
  const maxWidthStyle = isFullWidth ? "100%" : `min(100%, ${settings.maxWidth}px)`;
  const { kicker, headline } = splitChapterHeading(chapter.number, chapter.title, isZh);

  const effectiveSurface = settings.surfaceTheme || "matte-terminal";
  const isDefaultSurface = effectiveSurface === "matte-terminal";

  const themeClass = isDefaultSurface
    ? hasCustomBg
      ? "text-ink border border-line shadow-lg backdrop-blur-sm"
      : "bg-transparent text-ink border-0 shadow-none"
    : SURFACE_WRAPPER_CLASSES[effectiveSurface] || "bg-paper text-ink border border-line";

  const surfaceStyle: React.CSSProperties = {
    maxWidth: maxWidthStyle,
  };

  if (hasCustomBg && effectiveSurface !== "transparent") {
    surfaceStyle.backgroundColor = `rgb(var(--paper) / ${settings.surfaceOpacity})`;
  }

  // #e4e8f0 acts as the Auto Ink sentinel; any other color explicitly overrides --ink
  const isAutoInkColor =
    !settings.fontColor || settings.fontColor.toLowerCase() === "#e4e8f0";
  const effectiveFontColor = isAutoInkColor ? undefined : settings.fontColor;

  const fontClass = getReaderFontClass(settings.font);

  const alignmentClass = settings.textAlign === "justify" ? "text-justify" : "text-left";

  return (
    <article
      data-reader-surface={effectiveSurface}
      style={surfaceStyle}
      className={`relative mx-auto w-full max-w-full transition-colors duration-200 ${
        isDefaultSurface && !hasCustomBg
          ? "my-2 sm:my-8 px-1 sm:px-8 md:px-12 py-4 sm:py-10"
          : "my-4 sm:my-10 px-4 sm:px-10 md:px-14 py-6 sm:py-12 rounded-xl sm:rounded-2xl"
      } ${themeClass}`}
    >
      {/* Editorial Chapter Header */}
      <header className="mb-7 sm:mb-10 border-b border-line pb-5 sm:pb-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-muted mb-2.5">
          <span className="uppercase tracking-[0.14em] text-accent font-semibold">
            {kicker}
          </span>
          <div className="flex items-center gap-2 tnum">
            <span>{isZh ? `第 ${chapter.number} 节` : `Ch. ${chapter.number}`}</span>
            {chapter.wordCount > 0 && (
              <>
                <span aria-hidden="true">·</span>
                <span>
                  {isZh
                    ? `${chapter.wordCount.toLocaleString()} 字`
                    : `${chapter.wordCount.toLocaleString()} words`}
                </span>
              </>
            )}
          </div>
        </div>

        <h1
          lang={isZh ? "zh-Hans" : "en"}
          className="text-2xl sm:text-3xl md:text-[2.25rem] font-bold tracking-tight leading-[1.25] text-ink font-serif break-words"
        >
          {headline}
        </h1>
      </header>

      {/* Loading State */}
      {loading && (
        <div className="space-y-4 py-8 font-sans" aria-live="polite" aria-busy="true">
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
        <div className="my-8 rounded-2xl border border-danger/40 bg-danger/10 p-6 font-sans">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-danger flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm text-ink mb-4">{error}</p>
              <button
                type="button"
                onClick={onRetry}
                className="btn-primary min-h-[44px] text-xs px-4 py-2 rounded-xl flex items-center gap-1.5"
              >
                <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{isZh ? "重试加载本节" : "Retry loading chapter"}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Content Fallback */}
      {!loading && !error && paragraphs.length === 0 && (
        <div className="my-8 rounded-2xl border border-line bg-sunken p-6 text-center font-sans">
          <p className="text-sm text-muted mb-4">
            {isZh
              ? "本节正文暂未加载，请重试或切换阅读版本。"
              : "This chapter has no readable text right now. Try reloading or switching editions."}
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="btn-quiet min-h-[44px] text-xs px-4 py-2 rounded-xl inline-flex items-center gap-1.5"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
            <span>{isZh ? "重新加载" : "Reload chapter"}</span>
          </button>
        </div>
      )}

      {/* Chapter Prose */}
      {!loading && !error && paragraphs.length > 0 && (
        <div
          lang={isZh ? "zh-Hans" : "en"}
          className={`reader-content ${fontClass} ${alignmentClass} break-words text-ink`}
          style={{
            color: effectiveFontColor,
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
      <footer className="mt-12 sm:mt-14 pt-6 sm:pt-8 pb-24 sm:pb-6 border-t border-line font-sans">
        <div className="grid grid-cols-3 items-center gap-2 sm:flex sm:justify-between sm:gap-4">
          <button
            type="button"
            onClick={onPrev}
            disabled={!hasPrev}
            className="btn-quiet min-h-[44px] py-2.5 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <ChevronLeft className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
            <span className="truncate">
              <span className="sm:hidden">{isZh ? "上节" : "Prev"}</span>
              <span className="hidden sm:inline">{isZh ? "上一节" : "Previous Chapter"}</span>
            </span>
          </button>

          {onOpenToc ? (
            <button
              type="button"
              onClick={onOpenToc}
              className="btn-quiet min-h-[44px] py-2.5 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
            >
              <span>{isZh ? "目录" : "Chapters"}</span>
            </button>
          ) : (
            <span className="text-center text-xs text-muted tnum">
              {isZh ? `第 ${chapter.number} 节` : `Ch. ${chapter.number}`}
            </span>
          )}

          <button
            type="button"
            onClick={onNext}
            disabled={!hasNext}
            className="btn-primary min-h-[44px] py-2.5 px-3 sm:px-5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <span className="truncate">
              <span className="sm:hidden">{isZh ? "下节" : "Next"}</span>
              <span className="hidden sm:inline">{isZh ? "下一节" : "Next Chapter"}</span>
            </span>
            <ChevronRight className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
          </button>
        </div>
      </footer>
    </article>
  );
});
