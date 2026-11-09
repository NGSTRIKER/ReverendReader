"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChapterMetadata, Bookmark } from "@/types/novel";
import { Search, X, ArrowUpDown, Bookmark as BookmarkIcon, Trash2 } from "lucide-react";

interface ChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterMetadata[];
  currentChapterId: number;
  onSelectChapter: (id: number) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (chapterId: number) => void;
  initialTab?: "chapters" | "bookmarks";
}

export function ChapterSelectorModal({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  bookmarks,
  onRemoveBookmark,
  initialTab = "chapters",
}: ChapterSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "bookmarks">(initialTab);
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && activeItemRef.current && activeTab === "chapters") {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ block: "center", behavior: "instant" });
      }, 30);
    }
  }, [isOpen, activeTab]);

  const filteredChapters = useMemo(() => {
    let result = chapters;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
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
  }, [chapters, searchQuery, sortAsc]);

  const handleJump = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseInt(jumpInput, 10);
    if (!isNaN(num) && num >= 1 && num <= chapters.length) {
      onSelectChapter(num);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Chapter Index and Bookmarks"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-2.5 sm:p-6"
    >
      <div
        className="relative flex h-[90vh] sm:h-[85vh] w-full max-w-2xl flex-col rounded-2xl border border-line bg-surface text-ink shadow-2xl overflow-hidden font-mono"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-line px-3.5 sm:px-5 py-3 sm:py-3.5 bg-paper">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <div className="flex items-center gap-1.5 flex-shrink-0" aria-hidden="true">
              <span className="h-2.5 w-2.5 rounded-full bg-accent" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
              <span className="h-2.5 w-2.5 rounded-full bg-line-strong" />
            </div>
            <span className="text-xs font-semibold text-ink flex items-center gap-1.5 truncate">
              <span>&gt;_</span>
              <span>INDEX / 章节目录</span>
            </span>
            <span className="chinese-seal text-[10px] flex-shrink-0">卷</span>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close table of contents"
            className="icon-btn rounded-lg h-7 w-7 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-line bg-sunken px-3 sm:px-5 gap-1.5 sm:gap-2 pt-2 overflow-x-auto items-center">
          <button
            type="button"
            onClick={() => setActiveTab("chapters")}
            className={`flex items-center gap-1.5 rounded-t-xl px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "chapters"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span className="hidden sm:inline">[01: CHAPTERS / 章节 ({chapters.length.toLocaleString()})]</span>
            <span className="sm:hidden">Chapters ({chapters.length.toLocaleString()})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookmarks")}
            className={`flex items-center gap-1.5 rounded-t-xl px-3 sm:px-4 py-2 text-xs font-semibold transition-all border-t border-x whitespace-nowrap flex-shrink-0 ${
              activeTab === "bookmarks"
                ? "border-line bg-surface text-accent shadow-sm"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <span className="hidden sm:inline">[02: BOOKMARKS / 书签 ({bookmarks.length})]</span>
            <span className="sm:hidden">Bookmarks ({bookmarks.length})</span>
          </button>
        </div>

        {/* Chapters Tab View */}
        {activeTab === "chapters" && (
          <>
            {/* Filter and Jump Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b border-line p-4 bg-sunken">
              <div className="relative sm:col-span-7">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-faint pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search title, number, or keywords..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field pl-9 py-1.5 text-xs rounded-xl"
                />
              </div>

              <form onSubmit={handleJump} className="flex gap-2 sm:col-span-5">
                <input
                  type="number"
                  min={1}
                  max={chapters.length}
                  placeholder="Jump to #"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="field py-1.5 text-xs tabular-nums rounded-xl"
                />
                <button
                  type="submit"
                  className="btn-primary px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-xl whitespace-nowrap"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  title={sortAsc ? "Sort descending" : "Sort ascending"}
                  aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
                  className="btn-quiet bg-paper px-2.5 py-1.5 rounded-xl"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto divide-y divide-line">
              {filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted">
                  No matching chapters found.
                </div>
              ) : (
                filteredChapters.map((chapter) => {
                  const isCurrent = chapter.id === currentChapterId;
                  return (
                    <button
                      key={chapter.id}
                      type="button"
                      ref={isCurrent ? activeItemRef : null}
                      onClick={() => {
                        onSelectChapter(chapter.id);
                        onClose();
                      }}
                      className={`cv-row flex w-full items-baseline justify-between px-5 py-3 text-left transition-colors ${
                        isCurrent
                          ? "bg-accent/15 text-accent border-l-2 border-accent font-semibold"
                          : "text-ink hover:bg-sunken"
                      }`}
                    >
                      <div className="flex items-baseline gap-3 truncate pr-4">
                        <span className="text-[11px] text-muted w-14 flex-shrink-0 tabular-nums">
                          #{chapter.number.toString().padStart(4, "0")}
                        </span>
                        <span className="truncate text-xs sm:text-sm">
                          {chapter.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-[10px] text-muted tabular-nums">
                          第 {chapter.number} 章
                        </span>
                        <span className="text-[10px] text-faint tabular-nums hidden sm:inline">
                          · {chapter.wordCount.toLocaleString()} w
                        </span>
                      </div>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-5 py-2.5 bg-paper flex justify-between items-center text-[11px] text-muted tabular-nums">
              <span>Press Esc to exit</span>
              <span>
                Showing {filteredChapters.length.toLocaleString()} of{" "}
                {chapters.length.toLocaleString()} chapters
              </span>
            </div>
          </>
        )}

        {/* Bookmarks Tab View */}
        {activeTab === "bookmarks" && (
          <div className="flex-1 overflow-y-auto p-5 flex flex-col justify-between">
            {bookmarks.length === 0 ? (
              <div className="my-auto py-16 text-center text-muted">
                <BookmarkIcon className="mx-auto h-8 w-8 text-faint mb-3" strokeWidth={1.5} />
                <p className="text-xs font-semibold text-ink mb-1">No bookmarks recorded</p>
                <p className="text-[11px] text-muted max-w-xs mx-auto">
                  Click the bookmark icon in the reader header while reading any chapter to pin it.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line border-y border-line rounded-xl overflow-hidden">
                {bookmarks.map((b) => (
                  <div
                    key={b.chapterId}
                    className="flex items-center justify-between py-3 px-3 hover:bg-sunken transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        onSelectChapter(b.chapterId);
                        onClose();
                      }}
                      className="flex-1 text-left truncate mr-3"
                    >
                      <div className="flex items-baseline gap-2.5 truncate">
                        <span className="text-xs font-semibold text-accent tabular-nums">
                          [CH.{b.chapterNumber.toString().padStart(4, "0")}]
                        </span>
                        <span className="text-xs font-medium text-ink truncate">
                          {b.chapterTitle}
                        </span>
                      </div>
                      <div className="text-[10px] text-muted mt-0.5 tabular-nums">
                        Pinned {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(b.chapterId)}
                      title="Remove bookmark"
                      aria-label="Remove bookmark"
                      className="icon-btn rounded-lg hover:text-danger hover:bg-danger/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-3 mt-4 flex justify-between items-center text-[11px] text-muted tabular-nums">
              <span>Cloud &amp; Local Storage</span>
              <span>{bookmarks.length} bookmarks</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
