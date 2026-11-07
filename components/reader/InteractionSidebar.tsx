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
}: InteractionSidebarProps) {
  const [activePopover, setActivePopover] = useState<"reactions" | "account" | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  return (
    <div
      ref={sidebarRef}
      className="fixed right-0 top-1/2 z-40 -translate-y-1/2 select-none pointer-events-none"
      style={{
        paddingRight: "env(safe-area-inset-right, 0px)",
      }}
    >
      {/* Edge Reveal Handle (visible when sidebar is hidden) */}
      <button
        type="button"
        onClick={() => onToggleVisible(true)}
        aria-label="Reveal interaction sidebar"
        title="Reveal sidebar"
        data-testid="sidebar-reveal-handle"
        className={`pointer-events-auto fixed right-0 top-1/2 -translate-y-1/2 flex h-11 w-5 items-center justify-center border border-r-0 border-line bg-surface text-muted shadow-pop transition-all duration-200 hover:w-6 hover:text-ink ${
          visible
            ? "translate-x-full opacity-0 pointer-events-none"
            : "translate-x-0 opacity-95 hover:opacity-100"
        }`}
      >
        <ChevronLeft className="h-3.5 w-3.5" />
      </button>

      {/* Main Vertical Interaction Rail */}
      <aside
        aria-label="Chapter interactions"
        aria-hidden={!visible}
        data-testid="interaction-sidebar"
        data-state={visible ? "visible" : "hidden"}
        className={`mr-1.5 sm:mr-3 flex flex-col items-center border border-line bg-surface/95 px-1.5 py-2.5 shadow-pop backdrop-blur-sm transition-all duration-200 ${
          visible
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex flex-col items-center space-y-2 sm:space-y-2.5">
          {/* 1. Like current chapter */}
          <div className="flex flex-col items-center">
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
              className={`group flex h-9 w-9 items-center justify-center rounded-[3px] border transition-colors ${
                social.viewerLiked
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <Heart
                className={`h-4 w-4 ${social.viewerLiked ? "fill-current" : ""}`}
                strokeWidth={1.75}
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

          {/* 2. Open comments */}
          <div className="flex flex-col items-center">
            <button
              type="button"
              onClick={() => {
                setActivePopover(null);
                onOpenComments();
              }}
              aria-label="Open chapter comments"
              aria-expanded={isCommentsOpen}
              title="Chapter comments"
              data-testid="sidebar-comments-btn"
              className={`group flex h-9 w-9 items-center justify-center rounded-[3px] border transition-colors ${
                isCommentsOpen
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <MessageCircle className="h-4 w-4" strokeWidth={1.75} />
            </button>
            {commentCountLabel && (
              <span
                data-testid="sidebar-comment-count"
                className={`mt-0.5 text-[10px] leading-tight tnum ${
                  isCommentsOpen ? "text-accent font-semibold" : "text-muted"
                }`}
              >
                {commentCountLabel}
              </span>
            )}
          </div>

          {/* 3. Bookmark current chapter */}
          <div className="flex flex-col items-center">
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
              className={`group flex h-9 w-9 items-center justify-center rounded-[3px] border transition-colors ${
                isBookmarked
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              <Bookmark
                className={`h-4 w-4 ${isBookmarked ? "fill-current" : ""}`}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {/* 4. Open reaction picker */}
          <div className="relative flex flex-col items-center">
            <button
              type="button"
              onClick={() =>
                setActivePopover((prev) => (prev === "reactions" ? null : "reactions"))
              }
              aria-label="Open chapter reactions"
              aria-expanded={activePopover === "reactions"}
              aria-haspopup="true"
              title="React to chapter"
              data-testid="sidebar-reaction-btn"
              className={`group relative flex h-9 w-9 items-center justify-center rounded-[3px] border transition-colors ${
                activePopover === "reactions" || activeReactionDef
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-transparent text-muted hover:bg-sunken hover:text-ink"
              }`}
            >
              {ActiveReactionIcon ? (
                <ActiveReactionIcon className="h-4 w-4" strokeWidth={1.75} />
              ) : (
                <Smile className="h-4 w-4" strokeWidth={1.75} />
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

            {/* Floating Reaction Picker */}
            {activePopover === "reactions" && (
              <div
                role="dialog"
                aria-label="Chapter reactions"
                data-testid="reaction-picker-popover"
                className="absolute right-full mr-2.5 top-1/2 -translate-y-1/2 z-50 flex items-center gap-1 border border-line bg-surface p-1.5 shadow-pop"
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
                      className={`flex flex-col items-center rounded-[3px] px-2.5 py-1.5 transition-colors ${
                        selected
                          ? "bg-accent/10 text-accent border border-accent"
                          : "border border-transparent text-muted hover:bg-sunken hover:text-ink"
                      }`}
                    >
                      <Icon className="h-4 w-4" strokeWidth={1.75} />
                      <span className="mt-1 text-[10px] leading-none">{item.label}</span>
                      <span
                        className={`mt-0.5 text-[10px] leading-none tnum ${
                          selected ? "text-accent font-semibold" : "text-faint"
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
        </div>

        {/* Separator before bottom Account button */}
        <div className="my-2.5 h-px w-6 border-t border-line" />

        {/* 5. Open account menu */}
        <div className="relative flex flex-col items-center">
          <button
            type="button"
            onClick={() =>
              setActivePopover((prev) => (prev === "account" ? null : "account"))
            }
            aria-label="Open account menu"
            aria-expanded={activePopover === "account"}
            aria-haspopup="true"
            title={userIdentity ? `Account: ${userIdentity.displayName}` : "Account menu"}
            data-testid="sidebar-account-btn"
            className={`group relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-[3px] border transition-colors ${
              activePopover === "account"
                ? "border-accent bg-accent/10 text-accent"
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
              <UserRound className="h-4 w-4" strokeWidth={1.75} />
            )}
            {user && (
              <span
                aria-hidden="true"
                className="absolute bottom-0.5 right-0.5 h-1.5 w-1.5 rounded-full bg-accent"
              />
            )}
          </button>

          {/* Account Menu Popover */}
          {activePopover === "account" && (
            <div
              role="menu"
              aria-label="Account menu"
              data-testid="sidebar-account-popover"
              className="absolute right-full mr-2.5 bottom-0 z-50 w-56 border border-line bg-surface p-1.5 shadow-pop"
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

        {/* Hide sidebar button */}
        <button
          type="button"
          onClick={() => onToggleVisible(false)}
          aria-label="Hide interaction sidebar"
          title="Hide sidebar"
          data-testid="sidebar-hide-btn"
          className="mt-2 flex h-6 w-7 items-center justify-center rounded-[3px] text-muted hover:bg-sunken hover:text-ink transition-colors"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </aside>
    </div>
  );
}
