"use client";

import React, { useState, useMemo, useEffect, useRef, useDeferredValue, useCallback } from "react";
import { ChapterMetadata, Bookmark } from "@/types/novel";
import { useDialogAccessibility } from "@/components/ui/useDialogAccessibility";
import {
  Search,
  X,
  ArrowUpDown,
  Bookmark as BookmarkIcon,
  Trash2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

interface ChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterMetadata[];
  isLoading?: boolean;
  currentChapterId: number;
  onSelectChapter: (id: number) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (chapterId: number) => void;
  initialTab?: "chapters" | "bookmarks";
  bookmarkError?: string | null;
  onRetryBookmarks?: () => void;
}

const BOOK_JUMPS = [
  { label: "Book I", start: 1 },
  { label: "II", start: 200 },
  { label: "III", start: 406 },
  { label: "IV", start: 650 },
  { label: "V", start: 1022 },
  { label: "VI", start: 1967 },
] as const;

const ROW_HEIGHT = 56;
const OVERSCAN = 6;

export function ChapterSelectorModal({
  isOpen,
  onClose,
  chapters,
  isLoading = false,
  currentChapterId,
  onSelectChapter,
  bookmarks,
  onRemoveBookmark,
  initialTab = "chapters",
  bookmarkError = null,
  onRetryBookmarks,
}: ChapterSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "bookmarks">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const deferredSearchQuery = useDeferredValue(searchQuery);
  const [jumpInput, setJumpInput] = useState("");
  const [jumpError, setJumpError] = useState<string | null>(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [scrollTop, setScrollTop] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(420);

  const modalRef = useRef<HTMLDivElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility(isOpen, onClose, modalRef);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setJumpError(null);
    }
  }, [isOpen, initialTab]);

  // Measure list viewport height for virtualized window slicing
  useEffect(() => {
    const el = listContainerRef.current;
    if (!isOpen || activeTab !== "chapters" || !el) return;

    const updateSize = () => {
      if (el.clientHeight > 0) {
        setViewportHeight(el.clientHeight);
      }
    };
    updateSize();

    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, [isOpen, activeTab]);

  const filteredChapters = useMemo(() => {
    let result = chapters;
    if (deferredSearchQuery.trim()) {
      const q = deferredSearchQuery.toLowerCase().trim();
      result = chapters.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          String(c.number).includes(q)
      );
    }

    if (!sortAsc) {
      return [...result].reverse();
    }
    return result;
  }, [chapters, deferredSearchQuery, sortAsc]);

  const scrollToChapterIndex = useCallback(
    (index: number) => {
      const el = listContainerRef.current;
      if (!el || index < 0) return;
      const height = el.clientHeight || viewportHeight;
      const targetTop = Math.max(0, index * ROW_HEIGHT - height / 2 + ROW_HEIGHT / 2);
      el.scrollTop = targetTop;
      setScrollTop(targetTop);
    },
    [viewportHeight]
  );

  // Center currently active chapter when opening Chapters tab
  useEffect(() => {
    if (!isOpen || activeTab !== "chapters") return;
    const rafId = requestAnimationFrame(() => {
      const idx = filteredChapters.findIndex((c) => c.id === currentChapterId);
      if (idx >= 0) {
        scrollToChapterIndex(idx);
      }
    });
    return () => cancelAnimationFrame(rafId);
  }, [isOpen, activeTab, currentChapterId, filteredChapters, scrollToChapterIndex]);

  const handleBookJump = (startChapter: number) => {
    setSearchQuery("");
    setSortAsc(true);
    setJumpError(null);
    requestAnimationFrame(() => {
      const idx = chapters.findIndex((c) => c.number >= startChapter);
      if (idx >= 0 && listContainerRef.current) {
        const targetTop = idx * ROW_HEIGHT;
        listContainerRef.current.scrollTop = targetTop;
        setScrollTop(targetTop);
      }
    });
  };

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = jumpInput.trim();
    const num = parseInt(trimmed, 10);
    if (!trimmed || isNaN(num) || num < 1 || num > chapters.length) {
      setJumpError(`Enter a chapter number between 1 and ${chapters.length.toLocaleString()}.`);
      return;
    }
    setJumpError(null);
    onSelectChapter(num);
    onClose();
  };

  if (!isOpen) return null;

  const totalRows = filteredChapters.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(totalRows, Math.ceil((scrollTop + viewportHeight) / ROW_HEIGHT) + OVERSCAN);
  const visibleChapters = filteredChapters.slice(startIndex, endIndex);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="toc-modal-title"
        tabIndex={-1}
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        className="relative flex h-[88dvh] sm:h-[82vh] w-full max-w-2xl flex-col rounded-t-2xl sm:rounded-2xl border border-line bg-surface text-ink shadow-2xl overflow-hidden font-sans focus:outline-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 sm:px-5 py-3.5 bg-paper">
          <h2 id="toc-modal-title" className="font-serif text-lg sm:text-xl font-bold text-ink truncate">
            Table of Contents
          </h2>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close table of contents"
            className="circle-icon-btn flex-shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div
          role="tablist"
          aria-label="Chapter index and bookmarks"
          className="flex border-b border-line bg-sunken px-4 sm:px-5 gap-1.5 sm:gap-2 pt-2 overflow-x-auto items-center"
        >
          <button
            id="toc-tab-chapters"
            type="button"
            role="tab"
            aria-selected={activeTab === "chapters"}
            aria-controls="toc-panel-chapters"
            onClick={() => setActiveTab("chapters")}
            className={`flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-t-xl px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "chapters"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span>Chapters ({chapters.length.toLocaleString()})</span>
          </button>

          <button
            id="toc-tab-bookmarks"
            type="button"
            role="tab"
            aria-selected={activeTab === "bookmarks"}
            aria-controls="toc-panel-bookmarks"
            onClick={() => setActiveTab("bookmarks")}
            className={`flex min-h-[44px] sm:min-h-[38px] items-center gap-1.5 rounded-t-xl px-3.5 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "bookmarks"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span>Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        {/* Chapters Tab View */}
        {activeTab === "chapters" && (
          <div
            id="toc-panel-chapters"
            role="tabpanel"
            aria-labelledby="toc-tab-chapters"
            className="flex flex-1 flex-col min-h-0"
          >
            {/* Filter, Jump & Book Quick-Jump Strip */}
            <div className="border-b border-line p-3 sm:p-4 bg-sunken space-y-2.5">
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 sm:gap-3">
                <div className="relative sm:col-span-7">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted pointer-events-none"
                    aria-hidden="true"
                  />
                  <input
                    type="text"
                    placeholder="Search title or number..."
                    aria-label="Filter chapters by title or number"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setScrollTop(0);
                      if (listContainerRef.current) {
                        listContainerRef.current.scrollTop = 0;
                      }
                    }}
                    className="field min-h-[44px] sm:min-h-[38px] pl-9 py-2 text-base sm:text-xs rounded-xl"
                  />
                </div>

                <form onSubmit={handleJump} className="flex gap-2 sm:col-span-5" noValidate>
                  <input
                    type="number"
                    min={1}
                    max={chapters.length}
                    placeholder="Jump to #"
                    aria-label="Jump to chapter number"
                    value={jumpInput}
                    onChange={(e) => {
                      setJumpInput(e.target.value);
                      if (jumpError) setJumpError(null);
                    }}
                    className="field min-h-[44px] sm:min-h-[38px] py-2 text-base sm:text-xs font-mono tnum rounded-xl"
                  />
                  <button
                    type="submit"
                    className="btn-primary min-h-[44px] sm:min-h-[38px] px-4 py-2 text-xs font-semibold rounded-xl whitespace-nowrap"
                  >
                    Go
                  </button>
                  <button
                    type="button"
                    onClick={() => setSortAsc(!sortAsc)}
                    title={sortAsc ? "Sort descending" : "Sort ascending"}
                    aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
                    className="btn-quiet min-h-[44px] sm:min-h-[38px] bg-paper px-3 py-2 rounded-xl"
                  >
                    <ArrowUpDown className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </form>
              </div>

              {jumpError && (
                <p role="alert" className="text-xs text-danger font-medium">
                  {jumpError}
                </p>
              )}

              {/* Book Quick-Jump Strip */}
              {chapters.length > 0 && (
                <div
                  className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
                  aria-label="Scroll index by book"
                >
                  {BOOK_JUMPS.filter((b) => b.start <= chapters.length).map((book) => (
                    <button
                      key={book.start}
                      type="button"
                      onClick={() => handleBookJump(book.start)}
                      title={`Scroll index to Chapter ${book.start}`}
                      className="inline-flex min-h-[34px] items-center rounded-lg border border-line bg-paper px-2.5 py-1 text-[11px] font-medium text-muted hover:border-line-strong hover:text-ink transition-colors whitespace-nowrap tnum"
                    >
                      {book.label} ({book.start})
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Virtualized Chapter List */}
            <div
              ref={listContainerRef}
              onScroll={(e) => setScrollTop(e.currentTarget.scrollTop)}
              className="flex-1 overflow-y-auto"
            >
              {isLoading && chapters.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted">
                  Loading chapter index...
                </div>
              ) : filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted">
                  No matching chapters found.
                </div>
              ) : (
                <div style={{ height: totalRows * ROW_HEIGHT, position: "relative" }}>
                  <div
                    style={{
                      transform: `translateY(${startIndex * ROW_HEIGHT}px)`,
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                    }}
                    className="divide-y divide-line"
                  >
                    {visibleChapters.map((chapter) => {
                      const isCurrent = chapter.id === currentChapterId;
                      return (
                        <button
                          key={chapter.id}
                          type="button"
                          onClick={() => {
                            onSelectChapter(chapter.id);
                            onClose();
                          }}
                          style={{ height: ROW_HEIGHT }}
                          className={`flex w-full items-center justify-between px-4 sm:px-5 text-left transition-colors ${
                            isCurrent
                              ? "bg-accent/15 text-accent border-l-2 border-accent font-semibold"
                              : "text-ink hover:bg-sunken"
                          }`}
                        >
                          <div className="flex items-baseline gap-3 truncate pr-3">
                            <span className="font-mono text-xs text-muted w-12 flex-shrink-0 tnum">
                              {chapter.number.toString().padStart(4, "0")}
                            </span>
                            <span
                              className={`truncate font-serif text-[15px] sm:text-base ${
                                isCurrent ? "text-accent font-semibold" : "text-ink"
                              }`}
                            >
                              {chapter.title}
                            </span>
                          </div>

                          {chapter.wordCount > 0 && (
                            <span className="font-mono text-[11px] text-muted tnum flex-shrink-0">
                              {chapter.wordCount.toLocaleString()} w
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-4 sm:px-5 py-2.5 bg-paper flex justify-between items-center text-xs text-muted tnum">
              <span className="hidden sm:inline">Press Esc to close</span>
              <span>
                Showing {filteredChapters.length.toLocaleString()} of{" "}
                {chapters.length.toLocaleString()} chapters
              </span>
            </div>
          </div>
        )}

        {/* Bookmarks Tab View */}
        {activeTab === "bookmarks" && (
          <div
            id="toc-panel-bookmarks"
            role="tabpanel"
            aria-labelledby="toc-tab-bookmarks"
            className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col justify-between"
          >
            {bookmarkError && (
              <div
                role="alert"
                className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-danger/40 bg-danger/10 p-3 text-xs text-danger"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  <span>{bookmarkError}</span>
                </div>
                {onRetryBookmarks && (
                  <button
                    type="button"
                    onClick={onRetryBookmarks}
                    className="btn-quiet min-h-[36px] px-3 py-1 text-xs inline-flex items-center gap-1.5 flex-shrink-0"
                  >
                    <RefreshCw className="h-3 w-3" aria-hidden="true" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            {bookmarks.length === 0 ? (
              <div className="my-auto py-16 text-center text-muted">
                <BookmarkIcon className="mx-auto h-8 w-8 text-faint mb-3" strokeWidth={1.5} aria-hidden="true" />
                <p className="text-sm font-semibold text-ink mb-1">No bookmarks recorded</p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Tap the bookmark icon while reading any chapter to save your place.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line border-y border-line rounded-xl overflow-hidden">
                {bookmarks.map((b) => (
                  <div
                    key={b.chapterId}
                    className="flex items-center justify-between py-3 px-3.5 hover:bg-sunken transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChapter(b.chapterId);
                        onClose();
                      }}
                      className="flex-1 min-h-[44px] text-left truncate mr-3"
                    >
                      <div className="flex items-baseline gap-2.5 truncate">
                        <span className="font-mono text-xs font-semibold text-accent tnum">
                          Ch. {b.chapterNumber}
                        </span>
                        <span className="font-serif text-sm font-medium text-ink truncate">
                          {b.chapterTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-muted mt-0.5 tnum">
                        Pinned {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(b.chapterId)}
                      title="Remove bookmark"
                      aria-label={`Remove bookmark for Chapter ${b.chapterNumber}`}
                      className="icon-btn rounded-full h-11 w-11 sm:h-9 sm:w-9 hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-3 mt-4 flex justify-between items-center text-xs text-muted tnum">
              <span>Cloud &amp; Local Storage</span>
              <span>{bookmarks.length} bookmarks</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
