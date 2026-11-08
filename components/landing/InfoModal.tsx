"use client";

import React, { useEffect, useState } from "react";
import { X, BookOpen, User, Sparkles, Download, MessageSquare, ExternalLink } from "lucide-react";
import { DISCORD_INVITE_URL } from "@/components/ui/DiscordIcon";

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function InfoModal({ isOpen, onClose }: InfoModalProps) {
  const [activeTab, setActiveTab] = useState<"novel" | "author" | "features" | "community">("novel");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="info-modal-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 font-times"
    >
      <div
        className="relative flex h-[86vh] sm:h-[82vh] w-full max-w-2xl flex-col rounded-xl sm:rounded-2xl border border-line bg-surface text-ink overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-4 sm:px-6 py-3.5 sm:py-4 bg-paper">
          <div className="flex items-center gap-3 min-w-0">
            <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink font-times font-bold text-sm">
              RI
            </span>
            <div className="min-w-0">
              <h2 id="info-modal-title" className="font-times text-base sm:text-lg font-bold text-ink truncate">
                About Reverend Reader
              </h2>
              <p className="text-[10px] sm:text-[11px] tracking-wider uppercase text-muted truncate">
                Gu Zhenren · Complete 2,334 Chapters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="twatf-circle-btn text-muted hover:text-ink flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-line bg-sunken px-3 sm:px-6 gap-1 sm:gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab("novel")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "novel"
                ? "border-ink text-ink font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>The Novel</span>
          </button>
          <button
            onClick={() => setActiveTab("author")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "author"
                ? "border-ink text-ink font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <User className="h-3.5 w-3.5" />
            <span>The Author</span>
          </button>
          <button
            onClick={() => setActiveTab("features")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "features"
                ? "border-ink text-ink font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>Features</span>
          </button>
          <button
            onClick={() => setActiveTab("community")}
            className={`py-2.5 sm:py-3 px-2.5 sm:px-3 border-b-2 flex items-center gap-1.5 transition-colors whitespace-nowrap ${
              activeTab === "community"
                ? "border-ink text-ink font-bold"
                : "border-transparent text-muted hover:text-ink"
            }`}
          >
            <MessageSquare className="h-3.5 w-3.5" />
            <span>Community</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-5 text-sm leading-relaxed text-muted">
          {activeTab === "novel" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-paper p-4">
                <span className="text-[10px] uppercase tracking-widest text-muted font-semibold">
                  Premise &amp; World
                </span>
                <h3 className="font-times text-lg sm:text-xl font-bold text-ink mt-1">
                  Reverend Insanity (蛊真人)
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  Humans are clever in tens of thousands of ways; Gu are the true refined essences
                  of Heaven and Earth. In a universe governed by Dao marks and living mystical
                  insects, mortal Gu Masters cultivate their primeval sea to achieve immortality.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-ink font-bold">
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

              <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                <div className="rounded-lg border border-line p-3 bg-paper">
                  <span className="text-[10px] text-muted uppercase">Canon Extent</span>
                  <p className="font-bold text-ink mt-0.5">2,334 Chapters</p>
                </div>
                <div className="rounded-lg border border-line p-3 bg-paper">
                  <span className="text-[10px] text-muted uppercase">Total Words</span>
                  <p className="font-bold text-ink mt-0.5">4,861,604 Words</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "author" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-line bg-paper p-4 sm:p-5">
                <div className="flex items-center gap-2 text-ink text-lg">
                  <span>✒</span>
                  <h3 className="font-times text-lg sm:text-xl font-bold text-ink">
                    Gu Zhenren (蛊真人)
                  </h3>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-muted leading-relaxed">
                  Gu Zhenren (literally &ldquo;The Gu Master&rdquo; or &ldquo;The True Person&rdquo;) is a
                  renowned Chinese web novelist born in Guizhou, China. He serialized <em>Reverend Insanity</em>
                  over seven years starting in December 2012.
                </p>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs uppercase tracking-wider text-ink font-bold">
                  Literary Philosophy &amp; Protagonist
                </h4>
                <p>
                  Unlike typical cultivation stories driven by emotional vendettas or righteous posturing,
                  Gu Zhenren&apos;s magnum opus is characterized by meticulous internal logic, cold
                  game-theoretic maneuvering, and Fang Yuan&apos;s unflinching philosophical clarity.
                </p>
                <p>
                  Other notable works by Gu Zhenren include:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-xs sm:text-sm">
                  <li><strong className="text-ink">Infinite Bloodcore (无限血核)</strong> — A high-stakes survival and mystery fantasy.</li>
                  <li><strong className="text-ink">Mysteries of Immortal Puppet Master (仙工开物)</strong> — His latest ongoing mechanical cultivation epic.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "features" && (
            <div className="space-y-4">
              <h3 className="font-times text-lg font-bold text-ink">
                Engineered for Reader Immersion
              </h3>
              <p className="text-xs sm:text-sm">
                Reverend Reader is built to provide the cleanest, fastest, and most distraction-free
                reading experience possible.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div className="rounded-xl border border-line p-3.5 sm:p-4 bg-paper space-y-1">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-ink" />
                    Zero Lag Reading
                  </h4>
                  <p className="text-xs text-muted">
                    Server-rendered byte streaming loads any chapter in under 1ms with instant pagination.
                  </p>
                </div>

                <div className="rounded-xl border border-line p-3.5 sm:p-4 bg-paper space-y-1">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <Download className="h-3.5 w-3.5 text-ink" />
                    Full EPUB &amp; Chinese Raw
                  </h4>
                  <p className="text-xs text-muted">
                    Read online or download the complete 2,334 chapters in English translation (25 MB) and Chinese original raw (19 MB).
                  </p>
                </div>

                <div className="rounded-xl border border-line p-3.5 sm:p-4 bg-paper space-y-1">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-ink" />
                    Saved Reading Progress
                  </h4>
                  <p className="text-xs text-muted">
                    Your reading place and bookmarks are preserved across visits on this device and synced with cloud account.
                  </p>
                </div>

                <div className="rounded-xl border border-line p-3.5 sm:p-4 bg-paper space-y-1">
                  <h4 className="text-xs font-bold text-ink flex items-center gap-1.5">
                    <User className="h-3.5 w-3.5 text-ink" />
                    Custom Typography
                  </h4>
                  <p className="text-xs text-muted">
                    Adjust font family, sizing, margins, and themes for comfortable reading.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "community" && (
            <div className="space-y-4">
              <h3 className="font-times text-lg font-bold text-ink">
                Community &amp; Resources
              </h3>
              <p className="text-xs sm:text-sm">
                Connect with thousands of fellow Gu cultivators across the web:
              </p>

              <div className="space-y-2.5 pt-1">
                <a
                  href={DISCORD_INVITE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3.5 rounded-xl border border-line bg-paper hover:border-line-strong transition-colors text-ink group"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink font-bold">
                      #
                    </span>
                    <div>
                      <p className="text-xs font-bold">Official Discord Alliance</p>
                      <p className="text-[11px] text-muted">Chapter discussions, lore debates, and announcements</p>
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
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-line bg-surface text-ink font-bold">
                      r/
                    </span>
                    <div>
                      <p className="text-xs font-bold">r/ReverendInsanity Subreddit</p>
                      <p className="text-[11px] text-muted">Reddit community with over 30k cultivators</p>
                    </div>
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted group-hover:text-ink transition-colors" />
                </a>
              </div>

              <p className="text-[11px] text-faint italic pt-2">
                Disclaimer: Reverend Reader is a non-commercial fan project created for the Reverend Insanity reading community.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 sm:px-6 py-3 sm:py-3.5 bg-paper text-xs">
          <div className="flex items-center gap-3">
            <a
              href="/downloads/Reverend_Insanity.epub"
              download="Reverend_Insanity.epub"
              className="flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>EN EPUB (25 MB)</span>
            </a>
            <span className="text-line">|</span>
            <a
              href="/downloads/Gu_Zhen_Ren_Raw.epub"
              download="Gu_Zhen_Ren_Raw.epub"
              className="flex items-center gap-1.5 text-muted hover:text-ink transition-colors"
            >
              <Download className="h-3.5 w-3.5" />
              <span>中文原版 (19 MB)</span>
            </a>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-line bg-surface hover:bg-sunken text-ink font-semibold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
