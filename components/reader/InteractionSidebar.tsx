"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  MessageCircle,
  Bookmark,
  Smile,
  UserRound,
  ChevronRight,
  ChevronLeft,
  SlidersHorizontal,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { ReaderSettings } from "@/types/novel";
import {
  REACTION_DEFINITIONS,
  formatCompactCount,
  type ChapterSocialState,
  type ReactionType,
} from "@/lib/supabase/social";
import { REACTION_ICONS } from "./reactionIcons";
import { AccountMenuContent, extractUserIdentity } from "@/components/auth/UserNav";

interface InteractionSidebarProps {
  visible: boolean;
  onToggleVisible: (nextVisible: boolean) => void;
  social: ChapterSocialState;
  isBookmarked: boolean;
  isCommentsOpen: boolean;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onToggleBookmark: () => void;
  onSelectReaction: (reaction: ReactionType | null) => void;
  onOpenBookmarksModal: () => void;
  user: User | null;
  currentChapterId: number;
  currentChapterNumber?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onOpenToc?: () => void;
  onOpenSettings?: () => void;
  settings: ReaderSettings;
}

export function InteractionSidebar({
  visible,
  onToggleVisible,
  social,
  isBookmarked,
  isCommentsOpen,
  onToggleLike,
  onOpenComments,
  onToggleBookmark,
  onSelectReaction,
  onOpenBookmarksModal,
  user,
  currentChapterId,
  currentChapterNumber,
  hasPrev = false,
  hasNext = false,
  onPrev,
  onNext,
  onOpenToc,
  onOpenSettings,
}: InteractionSidebarProps) {
  const [activePopover, setActivePopover] = useState<"reactions" | "account" | "engage" | null>(
    null
  );
  const sidebarRef = useRef<HTMLDivElement>(null);
  const asideRef = useRef<HTMLElement>(null);
  const revealBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) {
      setActivePopover(null);
    }
  }, [visible, currentChapterId]);

  useEffect(() => {
    if (!activePopover) return;

    const handleMouseDown = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setActivePopover(null);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setActivePopover(null);
      }
    };

    document.addEventListener("mousedown", handleMouseDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [activePopover]);

  const likeCountLabel = formatCompactCount(social.likeCount);
  const commentCountLabel = formatCompactCount(social.commentCount);
  const reactionCountLabel = formatCompactCount(social.totalReactions);

  const activeReactionDef = social.viewerReaction
    ? REACTION_DEFINITIONS.find((r) => r.type === social.viewerReaction)
    : null;
  const ActiveReactionIcon = activeReactionDef
    ? REACTION_ICONS[activeReactionDef.type]
    : null;

  const userIdentity = user ? extractUserIdentity(user) : null;
  const loginUrl = `/login?next=${encodeURIComponent(`/read?c=${currentChapterId}`)}`;
  const chapterBadgeNumber = currentChapterNumber ?? currentChapterId;

  const handleHide = () => {
    setActivePopover(null);
    onToggleVisible(false);
    requestAnimationFrame(() => {
      revealBtnRef.current?.focus();
    });
  };

  const handleReveal = () => {
    onToggleVisible(true);
    requestAnimationFrame(() => {
      const firstInteractive = asideRef.current?.querySelector<HTMLElement>(
        "button:not([disabled])"
      );
      firstInteractive?.focus();
    });
  };

  return (
    <div
      ref={sidebarRef}
      className="fixed inset-0 z-40 select-none pointer-events-none font-sans"
    >
      {/* Edge / Corner Reveal Handle (visible when dock is hidden) */}
      <button
        ref={revealBtnRef}
        type="button"
        onClick={handleReveal}
        aria-label="Show reading bar"
        title="Show reading bar"
        data-testid="sidebar-reveal-handle"
        tabIndex={visible ? -1 : 0}
        className={`pointer-events-auto fixed bottom-4 right-4 [margin-bottom:env(safe-area-inset-bottom,0px)] sm:mb-0 sm:bottom-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2 flex h-11 w-11 sm:h-12 sm:w-7 items-center justify-center rounded-full sm:rounded-none sm:rounded-l-xl border sm:border-r-0 border-line bg-surface/95 backdrop-blur-md text-muted shadow-pop transition-all duration-200 hover:text-ink ${
          visible
            ? "opacity-0 scale-90 sm:scale-100 sm:translate-x-full pointer-events-none"
            : "opacity-95 scale-100 sm:translate-x-0 hover:opacity-100"
        }`}
      >
        <ChevronLeft className="h-4 w-4 rotate-90 sm:rotate-0" aria-hidden="true" />
      </button>

      {/* Unified Mobile Bottom Thumb Bar (< sm) + Slim Desktop Right Rail (sm:) */}
      <aside
        ref={asideRef}
        aria-label="Chapter navigation and interactions"
        aria-hidden={!visible}
        inert={!visible}
        data-testid="interaction-sidebar"
        data-state={visible ? "visible" : "hidden"}
        className={`fixed bottom-0 left-0 right-0 sm:bottom-auto sm:left-auto sm:right-0 sm:top-1/2 sm:-translate-y-1/2 sm:mr-3 flex flex-row sm:flex-col items-center justify-between sm:justify-center gap-0.5 sm:gap-0 border-t sm:border border-line bg-surface/95 px-2 pt-1.5 [padding-bottom:max(0.375rem,env(safe-area-inset-bottom,0px))] sm:!p-0 sm:rounded-2xl sm:px-1.5 sm:py-2.5 shadow-pop backdrop-blur-md transition-all duration-200 ${
          visible
            ? "translate-y-0 opacity-100 pointer-events-auto"
            : "translate-y-full sm:translate-y-[-50%] sm:translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
        }`}
      >
        {/* Mobile Navigation: Prev | Ch. X | Next */}
        <div className="flex sm:hidden items-center gap-0.5">
          {onPrev && (
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onPrev();
              }}
              disabled={!hasPrev}
              aria-label="Previous chapter"
              data-testid="mobile-prev-btn"
              className="flex h-11 min-w-[44px] items-center justify-center rounded-xl text-ink hover:bg-sunken disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}

          {onOpenToc && (
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onOpenToc();
              }}
              aria-label={`Open chapters (currently Chapter ${chapterBadgeNumber})`}
              data-testid="mobile-toc-btn"
              className="flex h-11 min-w-[54px] px-1.5 items-center justify-center rounded-xl font-mono text-xs font-semibold text-ink hover:bg-sunken transition-colors tnum"
            >
              Ch.{chapterBadgeNumber}
            </button>
          )}

          {onNext && (
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onNext();
              }}
              disabled={!hasNext}
              aria-label="Next chapter"
              data-testid="mobile-next-btn"
              className="flex h-11 min-w-[44px] items-center justify-center rounded-xl text-ink hover:bg-sunken disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Social & Engagement Controls */}
        <div className="flex flex-row sm:flex-col items-center gap-0.5 sm:gap-0 sm:space-y-2.5">
          {/* Desktop Only: Direct Like */}
          <div className="hidden sm:flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onToggleLike();
              }}
              aria-label={social.viewerLiked ? "Unlike chapter" : "Like chapter"}
              aria-pressed={social.viewerLiked}
              title={social.viewerLiked ? "Unlike chapter" : "Like chapter"}
              data-testid="sidebar-like-btn"
              className={`group flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                social.viewerLiked
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${social.viewerLiked ? "fill-current" : ""}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
            {likeCountLabel && (
              <span
                data-testid="sidebar-like-count"
                className={`mt-0.5 text-[10px] leading-tight tnum ${
                  social.viewerLiked ? "text-accent font-semibold" : "text-muted"
                }`}
              >
                {likeCountLabel}
              </span>
            )}
          </div>

          {/* Comments (Shared Mobile 44px + Desktop 36px) */}
          <div className="flex items-center sm:flex-col">
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onOpenComments();
              }}
              aria-label={
                commentCountLabel
                  ? `Open chapter comments (${commentCountLabel})`
                  : "Open chapter comments"
              }
              aria-expanded={isCommentsOpen}
              title="Chapter comments"
              data-testid="sidebar-comments-btn"
              className={`group flex h-11 min-w-[44px] sm:h-9 sm:w-9 sm:min-w-0 flex-col items-center justify-center rounded-xl border px-1 sm:px-0 transition-colors ${
                isCommentsOpen
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              {commentCountLabel && (
                <span className="sm:hidden mt-0.5 text-[10px] leading-none tnum">
                  {commentCountLabel}
                </span>
              )}
            </button>
            {commentCountLabel && (
              <span
                data-testid="sidebar-comment-count"
                className={`hidden sm:block mt-0.5 text-[10px] leading-tight tnum ${
                  isCommentsOpen ? "text-accent font-semibold" : "text-muted"
                }`}
              >
                {commentCountLabel}
              </span>
            )}
          </div>

          {/* Mobile Only: Unified Engage Popover (Like + Bookmark + Reactions) */}
          <div className="flex sm:hidden items-center">
            <button
              type="button"
              onClick={() =>
                setActivePopover((prev) => (prev === "engage" ? null : "engage"))
              }
              aria-label="Like, bookmark, or react to chapter"
              aria-expanded={activePopover === "engage"}
              aria-haspopup="dialog"
              data-testid="mobile-engage-btn"
              className={`relative flex h-11 min-w-[44px] flex-col items-center justify-center rounded-xl border transition-colors ${
                activePopover === "engage" ||
                social.viewerLiked ||
                isBookmarked ||
                activeReactionDef
                  ? "border-accent/50 bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              {ActiveReactionIcon ? (
                <ActiveReactionIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              ) : social.viewerLiked ? (
                <Heart className="h-4 w-4 fill-current" strokeWidth={1.75} aria-hidden="true" />
              ) : isBookmarked ? (
                <Bookmark className="h-4 w-4 fill-current" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Smile className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              {(likeCountLabel || reactionCountLabel) && (
                <span className="mt-0.5 text-[10px] leading-none tnum">
                  {likeCountLabel || reactionCountLabel}
                </span>
              )}
            </button>

            {activePopover === "engage" && (
              <div
                role="dialog"
                aria-label="Chapter engagement actions"
                data-testid="mobile-engage-popover"
                className="fixed bottom-16 left-3 right-3 [margin-bottom:env(safe-area-inset-bottom,0px)] z-50 rounded-2xl border border-line bg-surface p-3 shadow-pop space-y-2.5"
              >
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onToggleLike();
                      setActivePopover(null);
                    }}
                    aria-pressed={social.viewerLiked}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                      social.viewerLiked
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-line bg-sunken text-ink hover:border-line-strong"
                    }`}
                  >
                    <Heart
                      className={`h-4 w-4 ${social.viewerLiked ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                    <span>
                      {social.viewerLiked ? "Liked" : "Like"}
                      {likeCountLabel ? ` (${likeCountLabel})` : ""}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onToggleBookmark();
                      setActivePopover(null);
                    }}
                    aria-pressed={isBookmarked}
                    className={`flex min-h-[44px] items-center justify-center gap-2 rounded-xl border px-3 text-xs font-semibold transition-colors ${
                      isBookmarked
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-line bg-sunken text-ink hover:border-line-strong"
                    }`}
                  >
                    <Bookmark
                      className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                      aria-hidden="true"
                    />
                    <span>{isBookmarked ? "Bookmarked" : "Bookmark"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-5 gap-1 pt-1 border-t border-line">
                  {REACTION_DEFINITIONS.map((item) => {
                    const selected = social.viewerReaction === item.type;
                    const itemCount = social.reactionCounts[item.type] || 0;
                    const Icon = REACTION_ICONS[item.type];
                    return (
                      <button
                        key={item.type}
                        type="button"
                        onClick={() => {
                          onSelectReaction(selected ? null : item.type);
                          setActivePopover(null);
                        }}
                        aria-label={`${item.label} reaction (${itemCount})`}
                        aria-pressed={selected}
                        className={`flex min-h-[52px] flex-col items-center justify-center rounded-xl py-1.5 transition-colors ${
                          selected
                            ? "bg-accent/15 text-accent border border-accent"
                            : "border border-transparent text-muted hover:bg-sunken hover:text-ink"
                        }`}
                      >
                        <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                        <span className="mt-1 text-[10px] leading-none">{item.label}</span>
                        <span
                          className={`mt-0.5 text-[10px] leading-none tnum ${
                            selected ? "text-accent font-semibold" : "text-muted"
                          }`}
                        >
                          {itemCount}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Desktop Only: Bookmark */}
          <div className="hidden sm:flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onToggleBookmark();
              }}
              aria-label={isBookmarked ? "Remove chapter bookmark" : "Bookmark chapter"}
              aria-pressed={isBookmarked}
              title={isBookmarked ? "Remove bookmark" : "Bookmark chapter"}
              data-testid="sidebar-bookmark-btn"
              className={`group flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                isBookmarked
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                strokeWidth={1.75}
                aria-hidden="true"
              />
            </button>
          </div>

          {/* Desktop Only: Reaction Picker */}
          <div className="hidden sm:flex relative flex-col items-center">
            <button
              type="button"
              onClick={() =>
                setActivePopover((prev) => (prev === "reactions" ? null : "reactions"))
              }
              aria-label="Open chapter reactions"
              aria-expanded={activePopover === "reactions"}
              aria-haspopup="dialog"
              title="React to chapter"
              data-testid="sidebar-reaction-btn"
              className={`group relative flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
                activePopover === "reactions" || activeReactionDef
                  ? "border-accent bg-accent/15 text-accent shadow-sm"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              {ActiveReactionIcon ? (
                <ActiveReactionIcon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              ) : (
                <Smile className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
              )}
              {activeReactionDef && (
                <span
                  aria-hidden="true"
                  data-testid="sidebar-active-reaction-badge"
                  className="absolute -bottom-0.5 -right-0.5 h-2 w-2 rounded-full bg-accent"
                />
              )}
            </button>
            {reactionCountLabel && (
              <span
                data-testid="sidebar-reaction-count"
                className={`mt-0.5 text-[10px] leading-tight tnum ${
                  activeReactionDef ? "text-accent font-semibold" : "text-muted"
                }`}
              >
                {reactionCountLabel}
              </span>
            )}

            {activePopover === "reactions" && (
              <div
                role="dialog"
                aria-label="Chapter reactions"
                data-testid="reaction-picker-popover"
                className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 rounded-2xl border border-line bg-surface p-1.5 shadow-pop w-max"
              >
                {REACTION_DEFINITIONS.map((item) => {
                  const selected = social.viewerReaction === item.type;
                  const itemCount = social.reactionCounts[item.type] || 0;
                  const Icon = REACTION_ICONS[item.type];
                  return (
                    <button
                      key={item.type}
                      type="button"
                      onClick={() => {
                        onSelectReaction(selected ? null : item.type);
                        setActivePopover(null);
                      }}
                      aria-label={`${item.label} reaction (${itemCount})`}
                      aria-pressed={selected}
                      title={`${item.label}${itemCount ? ` (${itemCount})` : ""}`}
                      data-testid={`reaction-option-${item.type}`}
                      className={`flex flex-col items-center rounded-xl px-2.5 py-1.5 transition-colors ${
                        selected
                          ? "bg-accent/15 text-accent border border-accent shadow-sm"
                          : "border border-transparent text-muted hover:bg-sunken hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                      <span className="mt-1 text-[10px] leading-none">{item.label}</span>
                      <span
                        className={`mt-0.5 text-[10px] leading-none tnum ${
                          selected ? "text-accent font-semibold" : "text-muted"
                        }`}
                      >
                        {itemCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Mobile Only: Settings trigger */}
          {onOpenSettings && (
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onOpenSettings();
              }}
              aria-label="Reading settings"
              data-testid="mobile-reader-settings-btn"
              className="flex sm:hidden h-11 min-w-[44px] items-center justify-center rounded-xl text-accent hover:bg-accent/10 transition-colors"
            >
              <SlidersHorizontal className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            </button>
          )}
        </div>

        {/* Desktop Only: Separator + Account Button */}
        <div
          className="hidden sm:block my-2.5 h-px w-6 bg-line"
          aria-hidden="true"
        />

        <div className="hidden sm:flex relative flex-col items-center">
          <button
            type="button"
            onClick={() =>
              setActivePopover((prev) => (prev === "account" ? null : "account"))
            }
            aria-label="Open account menu"
            aria-expanded={activePopover === "account"}
            aria-haspopup="dialog"
            title={userIdentity ? `Account: ${userIdentity.displayName}` : "Account menu"}
            data-testid="sidebar-account-btn"
            className={`group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl border transition-colors ${
              activePopover === "account"
                ? "border-accent bg-accent/15 text-accent shadow-sm"
                : "border-transparent text-muted hover:bg-sunken hover:text-ink"
            }`}
          >
            {userIdentity?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={userIdentity.avatarUrl}
                alt={userIdentity.displayName}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            ) : (
              <UserRound className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
            )}
            {user && (
              <span
                aria-hidden="true"
                className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-accent"
              />
            )}
          </button>

          {activePopover === "account" && (
            <div
              role="dialog"
              aria-label="Account menu"
              data-testid="sidebar-account-popover"
              className="absolute right-full mr-2.5 bottom-0 z-50 w-56 rounded-2xl border border-line bg-surface p-1.5 shadow-pop overflow-hidden"
            >
              <AccountMenuContent
                user={user}
                loginUrl={loginUrl}
                onClose={() => setActivePopover(null)}
                onOpenBookmarks={onOpenBookmarksModal}
              />
            </div>
          )}
        </div>

        {/* Hide dock / sidebar button */}
        <button
          type="button"
          onClick={handleHide}
          aria-label="Hide reading bar"
          title="Hide reading bar"
          data-testid="sidebar-hide-btn"
          className="ml-0.5 sm:ml-0 sm:mt-2 flex h-11 min-w-[32px] sm:h-8 sm:w-8 sm:min-w-0 items-center justify-center rounded-xl sm:rounded-lg text-muted hover:bg-sunken hover:text-ink transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5 rotate-90 sm:rotate-0" aria-hidden="true" />
        </button>
      </aside>
    </div>
  );
}
