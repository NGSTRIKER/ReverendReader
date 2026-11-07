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
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/50 backdrop-blur-[2px] p-4 sm:p-6"
    >
      <div
        className="relative flex h-[85vh] w-full max-w-2xl flex-col border border-line bg-surface text-ink shadow-sheet overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-line px-6 py-3.5 bg-paper">
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => setActiveTab("chapters")}
              className={`pb-1 border-b-2 text-sm font-semibold transition-colors tnum ${
                activeTab === "chapters"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Chapters ({chapters.length.toLocaleString()})
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("bookmarks")}
              className={`pb-1 border-b-2 text-sm font-semibold transition-colors tnum ${
                activeTab === "bookmarks"
                  ? "border-accent text-accent"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close table of contents"
            className="icon-btn"
          >
            <X className="h-4 w-4" />
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
                  placeholder="Search chapters by title or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="field pl-9 py-1.5 text-sm"
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
                  className="field py-1.5 text-sm tnum"
                />
                <button
                  type="submit"
                  className="btn-primary px-3.5 py-1.5 text-xs font-medium whitespace-nowrap"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  title={sortAsc ? "Sort descending" : "Sort ascending"}
                  aria-label={sortAsc ? "Sort descending" : "Sort ascending"}
                  className="btn-quiet bg-paper px-2.5 py-1.5"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto divide-y divide-line">
              {filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-sm text-muted">
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
                          ? "bg-accent/10 text-accent border-l-2 border-accent font-medium"
                          : "text-ink hover:bg-sunken"
                      }`}
                    >
                      <div className="flex items-baseline gap-3 truncate pr-4">
                        <span className="text-xs text-muted w-12 flex-shrink-0 tnum">
                          #{chapter.number}
                        </span>
                        <span className="truncate text-sm">
                          {chapter.title}
                        </span>
                      </div>

                      <span className="text-xs text-faint flex-shrink-0 tnum">
                        {chapter.wordCount.toLocaleString()} w
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-line px-6 py-3 bg-paper flex justify-between items-center text-xs text-muted tnum">
              <span>Press Esc to close</span>
              <span>
                Showing {filteredChapters.length.toLocaleString()} of{" "}
                {chapters.length.toLocaleString()}
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
                <p className="text-sm font-medium text-ink mb-1">No bookmarks saved</p>
                <p className="text-xs text-muted max-w-xs mx-auto">
                  Use the bookmark button in the top bar while reading any chapter to save your
                  place.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-line border-y border-line">
                {bookmarks.map((b) => (
                  <div
                    key={b.chapterId}
                    className="flex items-center justify-between py-3 px-2 hover:bg-sunken transition-colors"
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
                        <span className="text-xs font-medium text-accent tnum">
                          Ch. {b.chapterNumber}
                        </span>
                        <span className="text-sm font-medium text-ink truncate">
                          {b.chapterTitle}
                        </span>
                      </div>
                      <div className="text-xs text-muted mt-0.5 tnum">
                        Saved {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => onRemoveBookmark(b.chapterId)}
                      title="Remove bookmark"
                      aria-label="Remove bookmark"
                      className="icon-btn hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-3 mt-4 flex justify-between items-center text-xs text-muted tnum">
              <span>Bookmarks</span>
              <span>{bookmarks.length} saved</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
