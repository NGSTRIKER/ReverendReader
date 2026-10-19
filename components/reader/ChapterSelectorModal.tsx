"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { ChapterMetadata, Bookmark } from "@/types/novel";
import { Search, X, BookOpen, ArrowUpDown, Bookmark as BookmarkIcon, Trash2 } from "lucide-react";

interface ChapterSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  chapters: ChapterMetadata[];
  currentChapterId: number;
  onSelectChapter: (id: number) => void;
  bookmarks: Bookmark[];
  onRemoveBookmark: (chapterId: number) => void;
}

export function ChapterSelectorModal({
  isOpen,
  onClose,
  chapters,
  currentChapterId,
  onSelectChapter,
  bookmarks,
  onRemoveBookmark,
}: ChapterSelectorModalProps) {
  const [activeTab, setActiveTab] = useState<"chapters" | "bookmarks">("chapters");
  const [searchQuery, setSearchQuery] = useState("");
  const [jumpInput, setJumpInput] = useState("");
  const [sortAsc, setSortAsc] = useState(true);
  const activeItemRef = useRef<HTMLButtonElement | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Scroll active chapter into view when opening
  useEffect(() => {
    if (isOpen && activeItemRef.current && activeTab === "chapters") {
      setTimeout(() => {
        activeItemRef.current?.scrollIntoView({ block: "center", behavior: "smooth" });
      }, 50);
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
      aria-labelledby="toc-heading"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 sm:p-6"
    >
      <div
        className="relative flex h-[85vh] w-full max-w-2xl flex-col rounded-xl border border-[#313244] bg-[#181825] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header & Tabs */}
        <div className="flex items-center justify-between border-b border-[#313244] px-6 py-4 bg-[#11111b]/60">
          <div className="flex items-center space-x-6">
            <button
              onClick={() => setActiveTab("chapters")}
              className={`flex items-center space-x-2 pb-1 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === "chapters"
                  ? "border-[#89b4fa] text-[#89b4fa]"
                  : "border-transparent text-[#a6adc8] hover:text-[#cdd6f4]"
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Chapters ({chapters.length.toLocaleString()})</span>
            </button>

            <button
              onClick={() => setActiveTab("bookmarks")}
              className={`flex items-center space-x-2 pb-1 border-b-2 text-sm font-semibold transition-colors ${
                activeTab === "bookmarks"
                  ? "border-[#89b4fa] text-[#89b4fa]"
                  : "border-transparent text-[#a6adc8] hover:text-[#cdd6f4]"
              }`}
            >
              <BookmarkIcon className="h-4 w-4 fill-current" />
              <span>Bookmarks ({bookmarks.length})</span>
            </button>
          </div>

          <button
            onClick={onClose}
            aria-label="Close table of contents"
            className="rounded p-1.5 text-[#a6adc8] hover:bg-[#313244] hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Chapters Tab View */}
        {activeTab === "chapters" && (
          <>
            {/* Filter and Jump Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 border-b border-[#313244] p-4 bg-[#1e1e2e]/50">
              <div className="relative sm:col-span-7">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#9399b2]" />
                <input
                  type="text"
                  placeholder="Search chapters by title or number..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-[#313244] bg-[#11111b] pl-9 pr-3 py-2 text-xs text-[#cdd6f4] placeholder-[#9399b2] focus:border-[#89b4fa] focus:outline-none"
                />
              </div>

              <form onSubmit={handleJump} className="flex space-x-2 sm:col-span-5">
                <input
                  type="number"
                  min={1}
                  max={chapters.length}
                  placeholder="Jump to #"
                  value={jumpInput}
                  onChange={(e) => setJumpInput(e.target.value)}
                  className="w-full rounded border border-[#313244] bg-[#11111b] px-3 py-2 text-xs text-[#cdd6f4] placeholder-[#9399b2] focus:border-[#89b4fa] focus:outline-none"
                />
                <button
                  type="submit"
                  className="rounded bg-[#89b4fa] px-3.5 py-2 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] transition-colors whitespace-nowrap"
                >
                  Go
                </button>
                <button
                  type="button"
                  onClick={() => setSortAsc(!sortAsc)}
                  title={sortAsc ? "Sort Descending" : "Sort Ascending"}
                  className="rounded border border-[#313244] px-2.5 py-2 text-[#a6adc8] hover:bg-[#313244] hover:text-white transition-colors"
                >
                  <ArrowUpDown className="h-3.5 w-3.5" />
                </button>
              </form>
            </div>

            {/* Chapter List */}
            <div className="flex-1 overflow-y-auto divide-y divide-[#313244]/40 p-2">
              {filteredChapters.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#a6adc8]">
                  No matching chapters found.
                </div>
              ) : (
                filteredChapters.map((chapter) => {
                  const isCurrent = chapter.id === currentChapterId;
                  return (
                    <button
                      key={chapter.id}
                      ref={isCurrent ? activeItemRef : null}
                      onClick={() => {
                        onSelectChapter(chapter.id);
                        onClose();
                      }}
                      className={`flex w-full items-center justify-between px-4 py-3 text-left rounded transition-colors ${
                        isCurrent
                          ? "bg-[#89b4fa]/15 text-[#89b4fa] border-l-2 border-[#89b4fa] font-medium"
                          : "text-[#cdd6f4] hover:bg-[#313244]/50 hover:text-white"
                      }`}
                    >
                      <div className="flex items-baseline space-x-3 truncate pr-4">
                        <span className="font-mono text-xs text-[#a6adc8] w-12 flex-shrink-0">
                          #{chapter.number}
                        </span>
                        <span className="truncate text-sm font-serif">
                          {chapter.title}
                        </span>
                      </div>

                      <span className="font-mono text-[11px] text-[#a6adc8] flex-shrink-0">
                        {chapter.wordCount.toLocaleString()} w
                      </span>
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-[#313244] px-6 py-3 bg-[#11111b]/80 flex justify-between items-center text-xs text-[#a6adc8]">
              <span>Press ESC to close</span>
              <span>Showing {filteredChapters.length} of {chapters.length}</span>
            </div>
          </>
        )}

        {/* Bookmarks Tab View */}
        {activeTab === "bookmarks" && (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col justify-between">
            {bookmarks.length === 0 ? (
              <div className="my-auto py-16 text-center text-[#a6adc8]">
                <BookmarkIcon className="mx-auto h-10 w-10 text-[#45475a] mb-3" />
                <p className="text-sm font-medium text-[#cdd6f4] mb-1">No bookmarks saved yet</p>
                <p className="text-xs text-[#a6adc8] max-w-xs mx-auto">
                  Click the bookmark icon on the top navigation bar while reading any chapter to save your place.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {bookmarks.map((b) => (
                  <div
                    key={b.chapterId}
                    className="flex items-center justify-between rounded-lg border border-[#313244] bg-[#1e1e2e] p-3.5 hover:border-[#89b4fa]/40 transition-colors"
                  >
                    <button
                      onClick={() => {
                        onSelectChapter(b.chapterId);
                        onClose();
                      }}
                      className="flex-1 text-left truncate mr-3"
                    >
                      <div className="flex items-baseline space-x-2 truncate">
                        <span className="font-mono text-xs text-[#89b4fa]">
                          Chapter {b.chapterNumber}
                        </span>
                        <span className="font-serif text-sm font-medium text-[#cdd6f4] truncate">
                          {b.chapterTitle}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#a6adc8] mt-0.5">
                        Bookmarked on {new Date(b.createdAt).toLocaleDateString()}
                      </div>
                    </button>

                    <button
                      onClick={() => onRemoveBookmark(b.chapterId)}
                      title="Remove Bookmark"
                      className="rounded p-2 text-[#a6adc8] hover:bg-[#313244] hover:text-[#f38ba8] transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-[#313244] pt-3 mt-4 flex justify-between items-center text-xs text-[#a6adc8]">
              <span>Saved locally in browser cookies</span>
              <span>{bookmarks.length} Bookmarks</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
