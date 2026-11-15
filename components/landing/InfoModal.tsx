"use client";

import React, { useRef, useState } from "react";
import { X, BookOpen, User, Compass, MessageSquare, ExternalLink, Download } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";
import { useDialogAccessibility } from "@/components/ui/useDialogAccessibility";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INFO_TABS = [
  { id: "novel" as const, shortLabel: "Novel", label: "The Novel", icon: BookOpen },
  { id: "author" as const, shortLabel: "Author", label: "The Author", icon: User },
  { id: "guide" as const, shortLabel: "Guide", label: "Reader Guide", icon: Compass },
  { id: "community" as const, shortLabel: "Community", label: "Community", icon: MessageSquare },
];

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<"novel" | "author" | "guide" | "community">("novel");
  const modalRef = useRef<HTMLDivElement>(null);

  useDialogAccessibility(isOpen, onClose, modalRef);

  if (!isOpen) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/75 backdrop-blur-sm p-0 sm:p-6 font-sans"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="info-modal-title"
        tabIndex={-1}
        className="relative flex max-h-[88dvh] sm:max-h-[82vh] w-full max-w-xl flex-col rounded-t-2xl sm:rounded-2xl border border-line bg-surface text-ink overflow-hidden shadow-sheet focus:outline-none"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 sm:px-6 py-3.5 sm:py-4 bg-paper">
          <div className="min-w-0">
            <h2 id="info-modal-title" className="font-serif text-lg sm:text-xl font-medium text-ink truncate">
              About Reverend Reader
            </h2>
            <p className="text-[11px] text-muted truncate">
              Gu Zhenren · Complete 2,334 Chapters
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="circle-icon-btn flex-shrink-0"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          role="tablist"
          aria-label="About sections"
          className="flex border-b border-line bg-sunken px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto text-xs font-medium"
        >
          {INFO_TABS.map(({ id, shortLabel, label, icon: Icon }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                id={`info-tab-${id}`}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-controls={`info-panel-${id}`}
                onClick={() => setActiveTab(id)}
                className={`min-h-[44px] py-2 px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                  isSelected
                    ? "border-accent text-ink font-semibold"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                <span className="sm:hidden">{shortLabel}</span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div
          id={`info-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`info-tab-${activeTab}`}
          className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 text-sm leading-relaxed text-muted"
        >
          {activeTab === "novel" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-paper p-4">
                <span className="text-[10px] uppercase tracking-widest text-muted font-medium">
                  Premise &amp; World
                </span>
                <h3 className="font-serif text-lg sm:text-xl font-medium text-ink mt-1">
                  Reverend Insanity (蛊真人)
                </h3>
                <p className="mt-2 font-serif text-sm text-muted leading-relaxed">
                  Humans are clever in tens of thousands of ways; Gu are the true refined essences
                  of Heaven and Earth. In a universe governed by Dao marks and living mystical
                  insects, mortal Gu Masters cultivate their primeval sea to achieve immortality.
                </p>
              </div>

              <div className="space-y-3 font-serif text-sm sm:text-[15px]">
                <h4 className="font-sans text-xs uppercase tracking-wider text-ink font-semibold">
                  The Demonic Journey
                </h4>
                <p>
                  Cornered by righteous sects at the end of five turbulent centuries, the demonic
                  cultivator <strong className="text-ink">Gu Yue Fang Yuan</strong> detonates the supreme
                  Rank 6 Spring Autumn Cicada, awakening inside his teenage body on Mount Qing Mao.
                </p>
                <p>
                  Unshackled by secular morality, sentimentality, or hypocrisy, Fang Yuan marches
                  alone through five massive regions (Central Continent, Northern Plains, Southern
                  Border, Western Desert, Eastern Sea) and two heavens, single-mindedly seeking
                  eternal life.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                <div className="rounded-lg border border-line p-3 bg-paper">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Canon Extent</span>
                  <p className="font-semibold text-ink mt-0.5 tabular-nums">2,334 Chapters</p>
                </div>
                <div className="rounded-lg border border-line p-3 bg-paper">
                  <span className="text-[10px] text-muted uppercase tracking-wider">Total Words</span>
                  <p className="font-semibold text-ink mt-0.5 tabular-nums">4,861,604 Words</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "author" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <h3 className="font-serif text-lg sm:text-xl font-medium text-ink">
                  Gu Zhenren (蛊真人)
                </h3>
                <p className="mt-2 font-serif text-sm text-muted leading-relaxed">
                  Gu Zhenren (literally &ldquo;The Gu Master&rdquo; or &ldquo;The True Person&rdquo;) is a
                  renowned Chinese web novelist born in Guizhou, China. He serialized <em>Reverend Insanity</em>
                  over seven years starting in December 2012.
                </p>
              </div>

              <div className="space-y-3 font-serif text-sm sm:text-[15px]">
                <h4 className="font-sans text-xs uppercase tracking-wider text-ink font-semibold">
                  Writing &amp; Other Works
                </h4>
                <p>
                  Unlike typical cultivation stories driven by emotional vendettas or righteous posturing,
                  Gu Zhenren&apos;s magnum opus is characterized by meticulous internal logic, cold
                  strategic maneuvering, and Fang Yuan&apos;s unflinching philosophical clarity.
                </p>
                <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm">
                  <li>
                    <strong className="text-ink">Infinite Bloodcore (无限血核)</strong> — A high-stakes survival and mystery fantasy.
                  </li>
                  <li>
                    <strong className="text-ink">Mysteries of Immortal Puppet Master (仙工开物)</strong> — Mechanical cultivation epic.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "guide" && (
            <div className="space-y-4 text-xs sm:text-sm">
              <h3 className="font-serif text-lg font-medium text-ink">
                Reader Guide
              </h3>

              <div className="space-y-3">
                <div className="rounded-xl border border-line p-3.5 bg-paper space-y-1">
                  <h4 className="text-xs font-semibold text-ink">Reading Comfort &amp; Typography</h4>
                  <p className="text-xs text-muted">
                    Use the bottom bar on mobile or top bar on desktop to switch between English and Chinese editions, change reading paper surfaces, adjust text size, or enable OpenDyslexic font.
                  </p>
                </div>

                <div className="rounded-xl border border-line p-3.5 bg-paper space-y-1">
                  <h4 className="text-xs font-semibold text-ink">Progress Sync &amp; Bookmarks</h4>
                  <p className="text-xs text-muted">
                    Your last chapter, scroll depth, and typography choices are saved automatically on this device. Sign in with Discord to sync across devices.
                  </p>
                </div>

                <div className="rounded-xl border border-line p-3.5 bg-paper space-y-1">
                  <h4 className="text-xs font-semibold text-ink">Offline EPUB Downloads</h4>
                  <p className="text-xs text-muted">
                    Download the complete 2,334-chapter English translation (25 MB) or Chinese raw edition (19 MB) directly for offline e-readers.
                  </p>
                </div>

                <div className="hidden sm:block rounded-xl border border-line p-3.5 bg-paper space-y-1">
                  <h4 className="text-xs font-semibold text-ink">Keyboard Shortcuts</h4>
                  <p className="text-xs text-muted">
                    Use <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink bg-surface">←</kbd> and{" "}
                    <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink bg-surface">→</kbd> arrow keys
                    to switch between chapters, and <kbd className="rounded border border-line px-1.5 py-0.5 text-[11px] text-ink bg-surface">Esc</kbd> to close modals.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-4">
              <h3 className="font-serif text-lg font-medium text-ink">
                Community &amp; Resources
              </h3>
              <p className="text-xs sm:text-sm">
                Connect with fellow readers across the community:
              </p>

              <div className="space-y-2.5 pt-1">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper hover:border-line-strong transition-colors text-ink group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink font-semibold text-xs">
                      #
                    </span>
                    <div>
                      <p className="text-xs font-semibold">Discord Community</p>
                      <p className="text-[11px] text-muted">Chapter discussions, lore debates, and updates</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted group-hover:text-ink transition-colors" />
                </a>

                <a
                  href="https://www.reddit.com/r/ReverendInsanity/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper hover:border-line-strong transition-colors text-ink group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink font-semibold text-xs">
                      r/
                    </span>
                    <div>
                      <p className="text-xs font-semibold">r/ReverendInsanity Subreddit</p>
                      <p className="text-[11px] text-muted">Reader community on Reddit</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted group-hover:text-ink transition-colors" />
                </a>
              </div>

              <p className="text-[11px] text-faint pt-2">
                Reverend Reader is a non-commercial fan project for the Reverend Insanity reading community.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 sm:px-6 py-2.5 sm:py-3 bg-paper text-xs">
          <div className="flex items-center gap-1 sm:gap-2">
            <a
              href="/downloads/Reverend_Insanity.epub"
              download="Reverend_Insanity.epub"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-muted hover:text-ink transition-colors"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>EN EPUB</span>
            </a>
            <span className="text-line" aria-hidden="true">|</span>
            <a
              href="/downloads/Gu_Zhen_Ren_Raw.epub"
              download="Gu_Zhen_Ren_Raw.epub"
              className="inline-flex min-h-[44px] items-center gap-1.5 px-2 text-muted hover:text-ink transition-colors"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>中文 EPUB</span>
            </a>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-4 py-2 rounded-lg border border-line bg-surface hover:bg-sunken text-ink font-medium transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
