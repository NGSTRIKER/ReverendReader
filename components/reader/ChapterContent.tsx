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

const FONT_CLASSES: Record<string, string> = {
  serif: "font-choice-serif",
  sans: "font-choice-sans",
  mono: "font-choice-mono",
  literary: "font-choice-literary",
};

const THEME_ACCENTS: Record<
  string,
  {
    badgeBorder: string;
    badgeBg: string;
    badgeText: string;
    nextBtnBg: string;
    nextBtnHover: string;
    nextBtnText: string;
  }
> = {
  catppuccin: {
    badgeBorder: "border-[#89b4fa]/40",
    badgeBg: "bg-[#89b4fa]/10",
    badgeText: "text-[#89b4fa]",
    nextBtnBg: "bg-[#89b4fa]",
    nextBtnHover: "hover:bg-[#b4befe]",
    nextBtnText: "text-[#11111b]",
  },
  "catppuccin-mocha": {
    badgeBorder: "border-[#cba6f7]/40",
    badgeBg: "bg-[#cba6f7]/10",
    badgeText: "text-[#cba6f7]",
    nextBtnBg: "bg-[#cba6f7]",
    nextBtnHover: "hover:bg-[#f5c2e7]",
    nextBtnText: "text-[#11111b]",
  },
  "catppuccin-pink": {
    badgeBorder: "border-[#f5c2e7]/40",
    badgeBg: "bg-[#f5c2e7]/10",
    badgeText: "text-[#f5c2e7]",
    nextBtnBg: "bg-[#f5c2e7]",
    nextBtnHover: "hover:bg-[#f2cdcd]",
    nextBtnText: "text-[#181119]",
  },
  "catppuccin-coffee": {
    badgeBorder: "border-[#fab387]/40",
    badgeBg: "bg-[#fab387]/10",
    badgeText: "text-[#fab387]",
    nextBtnBg: "bg-[#fab387]",
    nextBtnHover: "hover:bg-[#f9e2af]",
    nextBtnText: "text-[#1c1512]",
  },
  "catppuccin-jade": {
    badgeBorder: "border-[#a6e3a1]/40",
    badgeBg: "bg-[#a6e3a1]/10",
    badgeText: "text-[#a6e3a1]",
    nextBtnBg: "bg-[#a6e3a1]",
    nextBtnHover: "hover:bg-[#94e2d5]",
    nextBtnText: "text-[#111c16]",
  },
  "catppuccin-latte": {
    badgeBorder: "border-[#1e66f5]/40",
    badgeBg: "bg-[#1e66f5]/10",
    badgeText: "text-[#1e66f5]",
    nextBtnBg: "bg-[#1e66f5]",
    nextBtnHover: "hover:bg-[#04a5e5]",
    nextBtnText: "text-white",
  },
};

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
  const fontClass = FONT_CLASSES[settings.font] || FONT_CLASSES.serif;

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
  } else if (settings.surfaceTheme === "catppuccin-mocha") {
    surfaceBackground = `rgba(24, 24, 37, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#45475a]";
  } else if (settings.surfaceTheme === "catppuccin-pink") {
    surfaceBackground = `rgba(40, 24, 39, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#683f5e]";
  } else if (settings.surfaceTheme === "catppuccin-coffee") {
    surfaceBackground = `rgba(36, 26, 22, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#5c3e32]";
  } else if (settings.surfaceTheme === "catppuccin-jade") {
    surfaceBackground = `rgba(20, 35, 27, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#2f5544]";
  } else if (settings.surfaceTheme === "catppuccin-latte") {
    surfaceBackground = `rgba(239, 241, 245, ${settings.surfaceOpacity})`;
    backdropClass = "backdrop-blur-sm";
    borderClass = "border-[#ccd0da]";
    containerShadow = "shadow-lg";
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

  const isLatte = settings.surfaceTheme === "catppuccin-latte";
  const defaultFontColor = isLatte ? "#4c4f69" : "#cdd6f4";
  const activeFontColor = settings.fontColor || defaultFontColor;

  const dividerBorderClass = isLatte ? "border-[#ccd0da]" : "border-[#313244]";
  const subtextClass = isLatte ? "text-[#6c6f85]" : "text-[#a6adc8]";
  const navBtnClass = isLatte
    ? "border-[#ccd0da] bg-[#e6e9ef] text-[#4c4f69] hover:bg-[#dce0e8]"
    : "border-[#313244] bg-[#181825] text-[#cdd6f4] hover:bg-[#313244] hover:text-white";

  // Coordinated theme accents
  const accent = THEME_ACCENTS[settings.surfaceTheme] || THEME_ACCENTS.catppuccin;

  // Split plain text by double newlines into clean paragraphs
  // NEVER use innerHTML - render as react string children
  const paragraphs = React.useMemo(() => {
    if (!content) return [];
    return content
      .split(/\n\s*\n/)
      .map((p) => p.trim())
      .filter((p) => p.length > 0);
  }, [content]);

  const isFullWidth = settings.maxWidth >= 9999;
  const maxWidthStyle = isFullWidth ? "100%" : `${settings.maxWidth}px`;

  return (
    <article
      style={{
        maxWidth: maxWidthStyle,
        backgroundColor: surfaceBackground,
        ...textShadowStyle,
      }}
      className={`relative mx-auto my-6 sm:my-10 rounded-xl border ${borderClass} px-6 sm:px-12 md:px-16 py-10 sm:py-16 ${containerShadow} transition-all duration-200 ${backdropClass} ${fontClass} ${
        isFullWidth ? "w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] max-w-full" : ""
      }`}
    >
      {/* Chapter Heading */}
      <header className={`mb-10 sm:mb-14 border-b ${dividerBorderClass} pb-8 text-center`}>
        <div className={`mb-3 inline-block rounded-full border ${accent.badgeBorder} ${accent.badgeBg} px-3.5 py-1 font-mono text-xs tracking-wider ${accent.badgeText} uppercase`}>
          Chapter {chapter.number}
        </div>
        <h1
          className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight"
          style={{ color: activeFontColor }}
        >
          {chapter.title}
        </h1>
        <div className={`mt-3 text-xs ${subtextClass} font-mono`}>
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
          className="reader-content selection:bg-[#89b4fa]/30 selection:text-white"
          style={{
            fontSize: `${settings.fontSize}px`,
            lineHeight: settings.lineHeight,
            letterSpacing: typeof settings.letterSpacing === "number" ? `${settings.letterSpacing}px` : "0.01em",
            color: activeFontColor,
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
      <footer className={`mt-14 pt-8 border-t ${dividerBorderClass} flex flex-col sm:flex-row items-center justify-between gap-4`}>
        <button
          onClick={onPrev}
          disabled={!hasPrev}
          className={`flex w-full sm:w-auto items-center justify-center space-x-2 rounded border px-5 py-2.5 text-xs font-medium disabled:opacity-30 disabled:pointer-events-none transition-colors ${navBtnClass}`}
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Previous Chapter</span>
        </button>

        <span className={`text-xs ${subtextClass} font-mono`}>
          Chapter {chapter.number}
        </span>

        <button
          onClick={onNext}
          disabled={!hasNext}
          className={`flex w-full sm:w-auto items-center justify-center space-x-2 rounded px-5 py-2.5 text-xs font-semibold disabled:opacity-30 disabled:pointer-events-none transition-colors ${accent.nextBtnBg} ${accent.nextBtnHover} ${accent.nextBtnText}`}
        >
          <span>Next Chapter</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </footer>
    </article>
  );
}
