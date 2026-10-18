"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ManifestData, ReaderSettings, Bookmark } from "@/types/novel";
import { ChapterNavigation } from "./ChapterNavigation";
import { ChapterContent } from "./ChapterContent";
import { ChapterSelectorModal } from "./ChapterSelectorModal";
import { SettingsModal } from "./SettingsModal";
import { fetchChapterContent, preloadChapter } from "@/lib/chapterFetcher";
import {
  loadThemeSettings,
  saveThemeSettings,
  loadBookmarks,
  saveBookmarks,
  toggleBookmarkStorage,
  DEFAULT_SETTINGS,
} from "@/lib/storage";

interface ReaderInterfaceProps {
  manifest: ManifestData;
  initialChapterId?: number;
}

export function ReaderInterface({
  manifest,
  initialChapterId = 1,
}: ReaderInterfaceProps) {
  // Current Chapter State
  const [currentChapterId, setCurrentChapterId] = useState<number>(initialChapterId);
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Modals State
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Preferences & Bookmarks State (Cookie + LocalStorage backed)
  const [settings, setSettings] = useState<ReaderSettings>(DEFAULT_SETTINGS);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const prevCustomBgRef = useRef<string | null>(null);

  // Load saved preferences and bookmarks on mount from cookies/localStorage
  useEffect(() => {
    try {
      const initialSettings = loadThemeSettings();
      setSettings(initialSettings);

      const initialBookmarks = loadBookmarks();
      setBookmarks(initialBookmarks);

      // If no initialChapterId was passed via URL, check last read
      const lastRead = localStorage.getItem("reverend_last_read");
      if (lastRead && initialChapterId === 1) {
        const id = parseInt(lastRead, 10);
        if (!isNaN(id) && id >= 1 && id <= manifest.chapters.length) {
          setCurrentChapterId(id);
        }
      }
    } catch {
      // Ignore local storage / cookie read errors
    }
  }, [initialChapterId, manifest.chapters.length]);

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

  // Update Settings and persist to cookies and localStorage
  const handleUpdateSettings = (newPartial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      saveThemeSettings(updated);
      return updated;
    });
  };

  const currentChapter =
    manifest.chapters.find((c) => c.id === currentChapterId) || manifest.chapters[0];
  const hasPrev = currentChapterId > 1;
  const hasNext = currentChapterId < manifest.chapters.length;

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
      const chapter = manifest.chapters.find((c) => c.id === id);
      if (!chapter) {
        setError(`Chapter #${id} not found.`);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const text = await fetchChapterContent(chapter);
        setContent(text);
        setLoading(false);

        // Save last read position
        try {
          localStorage.setItem("reverend_last_read", String(id));
        } catch {}

        // Update URL query parameter without triggering full reload
        const url = new URL(window.location.href);
        url.searchParams.set("c", String(id));
        window.history.replaceState({}, "", url.toString());

        // Scroll smoothly to top
        window.scrollTo({ top: 0, behavior: "smooth" });

        // Preload next and previous chapters in background
        const nextChapter = manifest.chapters.find((c) => c.id === id + 1);
        const prevChapter = manifest.chapters.find((c) => c.id === id - 1);
        preloadChapter(nextChapter);
        preloadChapter(prevChapter);
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load chapter content.";
        setError(message);
        setLoading(false);
      }
    },
    [manifest.chapters]
  );

  useEffect(() => {
    loadChapter(currentChapterId);
  }, [currentChapterId, loadChapter]);

  const handlePrev = () => {
    if (hasPrev) setCurrentChapterId((prev) => prev - 1);
  };

  const handleNext = () => {
    if (hasNext) setCurrentChapterId((prev) => prev + 1);
  };

  return (
    <div className="relative min-h-screen bg-[#1e1e2e] text-[#cdd6f4]">
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
          totalChapters={manifest.totalChapters}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenToc={() => setIsTocOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
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

      {/* Table of Contents & Bookmarks Modal */}
      <ChapterSelectorModal
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        chapters={manifest.chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={(id) => setCurrentChapterId(id)}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
      />

      {/* Settings Modal */}
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
