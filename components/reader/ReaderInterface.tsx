"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import { ManifestData, ReaderSettings, Bookmark, ChapterMetadata } from "@/types/novel";
import { ChapterNavigation } from "./ChapterNavigation";
import { ChapterContent } from "./ChapterContent";
import { fetchChapterContent, preloadChapter } from "@/lib/chapterFetcher";
import {
  loadThemeSettings,
  saveThemeSettings,
  loadBookmarks,
  saveBookmarks,
  toggleBookmarkStorage,
  setCookie,
  DEFAULT_SETTINGS,
} from "@/lib/storage";

// Lazy-load modals with dynamic imports to strip them from the initial JS bundle
const ChapterSelectorModal = dynamic(
  () => import("./ChapterSelectorModal").then((mod) => mod.ChapterSelectorModal),
  { ssr: false }
);

const SettingsModal = dynamic(
  () => import("./SettingsModal").then((mod) => mod.SettingsModal),
  { ssr: false }
);

export interface InitialChapterInfo {
  id: number;
  number: number;
  title: string;
  wordCount: number;
}

interface ReaderInterfaceProps {
  manifest?: ManifestData;
  initialChapter?: InitialChapterInfo;
  totalChapters?: number;
  initialContent?: string | null;
  initialChapterId?: number;
  initialSettings?: ReaderSettings;
}

const THEME_PAGE_STYLES: Record<string, { bg: string; text: string }> = {
  catppuccin: { bg: "bg-[#1e1e2e]", text: "text-[#cdd6f4]" },
  "catppuccin-mocha": { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  "catppuccin-pink": { bg: "bg-[#1d101a]", text: "text-[#f5e0dc]" },
  "catppuccin-coffee": { bg: "bg-[#1a120e]", text: "text-[#f4ebd0]" },
  "catppuccin-jade": { bg: "bg-[#0f1b14]", text: "text-[#e0ede4]" },
  "catppuccin-latte": { bg: "bg-[#dce0e8]", text: "text-[#4c4f69]" },
  acrylic: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  blur: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  transparent: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  black: { bg: "bg-[#09090b]", text: "text-zinc-100" },
  slate: { bg: "bg-[#0f172a]", text: "text-slate-100" },
  sepia: { bg: "bg-[#171412]", text: "text-[#f4ebd0]" },
  dark: { bg: "bg-[#121212]", text: "text-[#e0e0e0]" },
};

export function ReaderInterface({
  manifest,
  initialChapter,
  totalChapters,
  initialContent,
  initialChapterId = 1,
  initialSettings = DEFAULT_SETTINGS,
}: ReaderInterfaceProps) {
  const totalChaptersCount = totalChapters ?? manifest?.totalChapters ?? 2334;
  const initialId = initialChapter?.id ?? initialChapterId ?? 1;

  // Current Chapter State
  const [currentChapterId, setCurrentChapterId] = useState<number>(initialId);
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [loading, setLoading] = useState<boolean>(!initialContent);
  const [error, setError] = useState<string | null>(null);

  // Lazy-loaded chapters manifest (avoids embedding 520KB in SSR HTML)
  const [chapters, setChapters] = useState<ChapterMetadata[]>(() => manifest?.chapters || []);

  // Modals State
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Preferences & Bookmarks State (Cookie + LocalStorage backed)
  // Initialize lazily to prevent flashing to defaults if saved in client storage or SSR cookies
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        return loadThemeSettings();
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const prevCustomBgRef = useRef<string | null>(null);

  // Load saved preferences and bookmarks on mount from cookies/localStorage
  useEffect(() => {
    try {
      const stored = loadThemeSettings();
      setSettings(stored);

      const initialBookmarks = loadBookmarks();
      setBookmarks(initialBookmarks);

      // If no initialChapterId was passed via URL, check last read
      const lastRead = localStorage.getItem("reverend_last_read");
      if (lastRead && initialId === 1) {
        const id = parseInt(lastRead, 10);
        if (!isNaN(id) && id >= 1 && id <= totalChaptersCount) {
          setCurrentChapterId(id);
        }
      }
    } catch {
      // Ignore local storage / cookie read errors
    }
    // Only run on initial mount
  }, [initialId, totalChaptersCount]);

  // Asynchronously fetch chapters manifest in the background (prevents 520KB SSR HTML payload)
  useEffect(() => {
    if (chapters.length > 0) return;
    let isMounted = true;
    fetch("/chapters.json")
      .then((res) => res.json())
      .then((data: ManifestData) => {
        if (isMounted && data?.chapters) {
          setChapters(data.chapters);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [chapters.length]);

  // Clean up object URLs when custom background changes or unmounts
  const handleSetCustomBg = useCallback((newUrl: string | null) => {
    if (prevCustomBgRef.current && prevCustomBgRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevCustomBgRef.current);
    }
    prevCustomBgRef.current = newUrl;
    setCustomBgUrl(newUrl);
  }, []);

  useEffect(() => {
    return () => {
      if (prevCustomBgRef.current && prevCustomBgRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(prevCustomBgRef.current);
      }
    };
  }, []);

  // Update Settings immediately and persist to cookies and localStorage
  const handleUpdateSettings = useCallback((newPartial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      saveThemeSettings(updated);
      return updated;
    });
  }, []);

  // Update cookies every time settings state changes
  useEffect(() => {
    saveThemeSettings(settings);
  }, [settings]);

  const currentChapter: ChapterMetadata =
    chapters.find((c) => c.id === currentChapterId) ||
    (initialChapter && currentChapterId === initialChapter.id
      ? {
          id: initialChapter.id,
          number: initialChapter.number,
          title: initialChapter.title,
          wordCount: initialChapter.wordCount,
          startByte: 0,
          endByte: 0,
          length: 0,
        }
      : {
          id: currentChapterId,
          number: currentChapterId,
          title: `Chapter ${currentChapterId}`,
          startByte: 0,
          endByte: 0,
          length: 0,
          wordCount: 0,
        });

  const hasPrev = currentChapterId > 1;
  const hasNext = currentChapterId < totalChaptersCount;

  const isCurrentBookmarked = bookmarks.some((b) => b.chapterId === currentChapterId);

  // Toggle Bookmark for current chapter
  const handleToggleBookmark = useCallback(() => {
    if (!currentChapter) return;
    const { bookmarks: updated } = toggleBookmarkStorage({
      chapterId: currentChapter.id,
      chapterNumber: currentChapter.number,
      chapterTitle: currentChapter.title,
      createdAt: new Date().toISOString(),
    });
    setBookmarks(updated);
  }, [currentChapter]);

  // Remove a specific bookmark
  const handleRemoveBookmark = useCallback((chapterId: number) => {
    setBookmarks((prev) => {
      const updated = prev.filter((b) => b.chapterId !== chapterId);
      saveBookmarks(updated);
      return updated;
    });
  }, []);

  // Load Chapter Content
  const loadChapter = useCallback(
    async (id: number) => {
      if (id < 1 || id > totalChaptersCount) {
        setError(`Chapter #${id} not found.`);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const text = await fetchChapterContent({ id });
        setContent(text);
        setLoading(false);

        // Save last read position to cookie and localStorage
        try {
          localStorage.setItem("reverend_last_read", String(id));
          setCookie("reverend_last_read", String(id));
        } catch {}

        // Update URL query parameter without triggering full reload
        const url = new URL(window.location.href);
        url.searchParams.set("c", String(id));
        window.history.replaceState({}, "", url.toString());

        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Preload next and previous chapters in background
        if (id + 1 <= totalChaptersCount) {
          preloadChapter({ id: id + 1 });
        }
        if (id - 1 >= 1) {
          preloadChapter({ id: id - 1 });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load chapter content.";
        setError(message);
        setLoading(false);
      }
    },
    [totalChaptersCount]
  );

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialContent && currentChapterId === initialId) {
        // Content was pre-rendered by SSR; preload adjacent chapters
        if (currentChapterId + 1 <= totalChaptersCount) {
          preloadChapter({ id: currentChapterId + 1 });
        }
        if (currentChapterId > 1) {
          preloadChapter({ id: currentChapterId - 1 });
        }
        return;
      }
    }
    loadChapter(currentChapterId);
  }, [currentChapterId, loadChapter, initialContent, initialId, totalChaptersCount]);

  const handlePrev = () => {
    if (hasPrev) setCurrentChapterId((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentChapterId((prev) => prev + 1);
  };

  const activeThemeStyle =
    THEME_PAGE_STYLES[settings.surfaceTheme] || THEME_PAGE_STYLES.catppuccin;

  return (
    <div className={`relative min-h-screen ${activeThemeStyle.bg} ${activeThemeStyle.text} transition-colors duration-200`}>
      {/* Custom Background Image Layer */}
      {customBgUrl && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url(${customBgUrl})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <ChapterNavigation
          currentChapter={currentChapter}
          totalChapters={totalChaptersCount}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenToc={() => setIsTocOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
          settings={settings}
        />

        {/* Reading Canvas */}
        <main className="flex-1 px-4 sm:px-6">
          <ChapterContent
            chapter={currentChapter}
            content={content}
            loading={loading}
            error={error}
            onRetry={() => loadChapter(currentChapterId)}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrev}
            onNext={handleNext}
            settings={settings}
          />
        </main>
      </div>

      {/* Table of Contents & Bookmarks Modal (Lazy Loaded) */}
      <ChapterSelectorModal
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={(id) => setCurrentChapterId(id)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
      />

      {/* Settings Modal (Lazy Loaded) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleUpdateSettings}
        customBgUrl={customBgUrl}
        onSetCustomBg={handleSetCustomBg}
      />
    </div>
  );
}
