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

interface SidebarThemeTokens {
  railBg: string;
  railBorder: string;
  btnBg: string;
  btnHover: string;
  iconText: string;
  countText: string;
  divider: string;
  popoverBg: string;
  popoverBorder: string;
  accentText: string;
  accentRing: string;
}

function getSidebarTheme(surfaceTheme: ReaderSettings["surfaceTheme"]): SidebarThemeTokens {
  if (surfaceTheme === "catppuccin-latte") {
    return {
      railBg: "bg-[#e6e9ef]/90",
      railBorder: "border-[#ccd0da]",
      btnBg: "bg-[#dce0e8]/70",
      btnHover: "hover:bg-[#ccd0da] hover:text-[#1e66f5]",
      iconText: "text-[#4c4f69]",
      countText: "text-[#5c5f77]",
      divider: "border-[#ccd0da]",
      popoverBg: "bg-[#eff1f5]/95",
      popoverBorder: "border-[#ccd0da]",
      accentText: "text-[#1e66f5]",
      accentRing: "ring-[#1e66f5]/40",
    };
  }
  if (surfaceTheme === "catppuccin-pink") {
    return {
      railBg: "bg-[#231522]/90",
      railBorder: "border-[#56324e]/80",
      btnBg: "bg-[#2d1c2b]/75",
      btnHover: "hover:bg-[#3f273c] hover:text-[#f5c2e7]",
      iconText: "text-[#f5e0dc]",
      countText: "text-[#f5c2e7]/80",
      divider: "border-[#56324e]/70",
      popoverBg: "bg-[#231522]/95",
      popoverBorder: "border-[#56324e]",
      accentText: "text-[#f5c2e7]",
      accentRing: "ring-[#f5c2e7]/40",
    };
  }
  if (surfaceTheme === "catppuccin-coffee" || surfaceTheme === "sepia") {
    return {
      railBg: "bg-[#201713]/90",
      railBorder: "border-[#483329]/80",
      btnBg: "bg-[#2b1f1a]/75",
      btnHover: "hover:bg-[#3b2b24] hover:text-[#fab387]",
      iconText: "text-[#f4ebd0]",
      countText: "text-[#fab387]/80",
      divider: "border-[#483329]/70",
      popoverBg: "bg-[#201713]/95",
      popoverBorder: "border-[#483329]",
      accentText: "text-[#fab387]",
      accentRing: "ring-[#fab387]/40",
    };
  }
  if (surfaceTheme === "catppuccin-jade") {
    return {
      railBg: "bg-[#111c16]/90",
      railBorder: "border-[#274235]/80",
      btnBg: "bg-[#192b21]/75",
      btnHover: "hover:bg-[#223a2d] hover:text-[#a6e3a1]",
      iconText: "text-[#e8f5e9]",
      countText: "text-[#a6e3a1]/80",
      divider: "border-[#274235]/70",
      popoverBg: "bg-[#111c16]/95",
      popoverBorder: "border-[#274235]",
      accentText: "text-[#a6e3a1]",
      accentRing: "ring-[#a6e3a1]/40",
    };
  }
  return {
    railBg: "bg-[#181825]/90",
    railBorder: "border-[#313244]/90",
    btnBg: "bg-[#1e1e2e]/80",
    btnHover: "hover:bg-[#313244] hover:text-white",
    iconText: "text-[#cdd6f4]",
    countText: "text-[#a6adc8]",
    divider: "border-[#313244]",
    popoverBg: "bg-[#181825]/95",
    popoverBorder: "border-[#313244]",
    accentText: "text-[#89b4fa]",
    accentRing: "ring-[#89b4fa]/40",
  };
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
  settings,
}: InteractionSidebarProps) {
  const [activePopover, setActivePopover] = useState<"reactions" | "account" | null>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);

  const theme = getSidebarTheme(settings.surfaceTheme);

  // Close popovers when sidebar hides or chapter changes
  useEffect(() => {
    if (!visible) {
      setActivePopover(null);
    }
  }, [visible, currentChapterId]);

  // Close popovers on outside click or Escape key
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
      {/* Edge Reveal Handle (ONLY element visible when sidebar is hidden) */}
      <button
        type="button"
        onClick={() => onToggleVisible(true)}
        aria-label="Reveal interaction sidebar"
        title="Reveal sidebar"
        data-testid="sidebar-reveal-handle"
        className={`pointer-events-auto fixed right-0 top-1/2 -translate-y-1/2 flex h-11 w-5 items-center justify-center rounded-l-lg border border-r-0 ${theme.railBorder} ${theme.railBg} ${theme.iconText} shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:w-6 focus:outline-none focus:ring-1 ${theme.accentRing} ${
          visible
            ? "translate-x-full opacity-0 pointer-events-none"
            : "translate-x-0 opacity-90 hover:opacity-100"
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
        className={`mr-1.5 sm:mr-3 flex flex-col items-center rounded-2xl border ${theme.railBorder} ${theme.railBg} px-1.5 py-2.5 shadow-2xl backdrop-blur-xl transition-all duration-300 ease-out ${
          visible
            ? "translate-x-0 opacity-100 pointer-events-auto"
            : "translate-x-[calc(100%+1.5rem)] opacity-0 pointer-events-none"
        }`}
      >
        {/* Top 4 Chapter Action Buttons */}
        <div className="flex flex-col items-center space-y-2 sm:space-y-2.5">
          {/* 1. Heart — Like current chapter */}
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
              className={`group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 ${theme.accentRing} ${
                social.viewerLiked
                  ? "border-[#f38ba8]/60 bg-[#f38ba8]/15 text-[#f38ba8]"
                  : `border-transparent ${theme.btnBg} ${theme.iconText} ${theme.btnHover}`
              }`}
            >
              <Heart
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-150 group-active:scale-90 ${
                  social.viewerLiked ? "fill-[#f38ba8] text-[#f38ba8]" : ""
                }`}
              />
            </button>
            {likeCountLabel && (
              <span
                data-testid="sidebar-like-count"
                className={`mt-0.5 font-mono text-[10px] leading-tight ${
                  social.viewerLiked ? "text-[#f38ba8] font-semibold" : theme.countText
                }`}
              >
                {likeCountLabel}
              </span>
            )}
          </div>

          {/* 2. Message Circle — Open comments */}
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
              className={`group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 ${theme.accentRing} ${
                isCommentsOpen
                  ? "border-[#89b4fa]/60 bg-[#89b4fa]/15 text-[#89b4fa]"
                  : `border-transparent ${theme.btnBg} ${theme.iconText} ${theme.btnHover}`
              }`}
            >
              <MessageCircle className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-150 group-active:scale-90" />
            </button>
            {commentCountLabel && (
              <span
                data-testid="sidebar-comment-count"
                className={`mt-0.5 font-mono text-[10px] leading-tight ${
                  isCommentsOpen ? "text-[#89b4fa] font-semibold" : theme.countText
                }`}
              >
                {commentCountLabel}
              </span>
            )}
          </div>

          {/* 3. Bookmark — Bookmark current chapter */}
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
              className={`group flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 ${theme.accentRing} ${
                isBookmarked
                  ? "border-[#fab387]/60 bg-[#fab387]/15 text-[#fab387]"
                  : `border-transparent ${theme.btnBg} ${theme.iconText} ${theme.btnHover}`
              }`}
            >
              <Bookmark
                className={`h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-150 group-active:scale-90 ${
                  isBookmarked ? "fill-[#fab387] text-[#fab387]" : ""
                }`}
              />
            </button>
          </div>

          {/* 4. Smile — Open reaction picker */}
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
              className={`group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 ${theme.accentRing} ${
                activePopover === "reactions" || activeReactionDef
                  ? "border-[#cba6f7]/60 bg-[#cba6f7]/15 text-[#cba6f7]"
                  : `border-transparent ${theme.btnBg} ${theme.iconText} ${theme.btnHover}`
              }`}
            >
              <Smile className="h-4 w-4 sm:h-[18px] sm:w-[18px] transition-transform duration-150 group-active:scale-90" />
              {activeReactionDef && (
                <span
                  aria-hidden="true"
                  data-testid="sidebar-active-reaction-badge"
                  className=" -bottom-0.5 -right-0.5 absolute flex h-4 w-4 items-center justify-center rounded-full bg-[#181825] text-[10px] shadow ring-1 ring-[#313244]"
                >
                  {activeReactionDef.emoji}
                </span>
              )}
            </button>
            {reactionCountLabel && (
              <span
                data-testid="sidebar-reaction-count"
                className={`mt-0.5 font-mono text-[10px] leading-tight ${
                  activeReactionDef ? "text-[#cba6f7] font-semibold" : theme.countText
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
                className={`absolute right-full mr-2.5 top-1/2 -translate-y-1/2 z-50 flex items-center space-x-1 rounded-2xl border ${theme.popoverBorder} ${theme.popoverBg} p-1.5 shadow-2xl backdrop-blur-xl`}
              >
                {REACTION_DEFINITIONS.map((item) => {
                  const selected = social.viewerReaction === item.type;
                  const itemCount = social.reactionCounts[item.type] || 0;
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
                      className={`flex flex-col items-center rounded-xl px-2 py-1.5 transition-all duration-150 focus:outline-none ${
                        selected
                          ? "bg-[#cba6f7]/20 ring-1 ring-[#cba6f7]/60 scale-105"
                          : "hover:bg-[#313244]/70 hover:scale-105"
                      }`}
                    >
                      <span className="text-base sm:text-lg leading-none">{item.emoji}</span>
                      <span
                        className={`mt-1 font-mono text-[10px] leading-none ${
                          selected ? "text-[#cba6f7] font-semibold" : theme.countText
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
        <div className={`my-2.5 h-px w-6 border-t ${theme.divider}`} />

        {/* 5. User Round — Open account menu (Always last action at bottom) */}
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
            className={`group relative flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center overflow-hidden rounded-full border transition-all duration-150 focus:outline-none focus:ring-2 ${theme.accentRing} ${
              activePopover === "account"
                ? "border-[#89b4fa] bg-[#89b4fa]/20 text-[#89b4fa]"
                : `border-transparent ${theme.btnBg} ${theme.iconText} ${theme.btnHover}`
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
              <UserRound className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            )}
            {user && (
              <span
                aria-hidden="true"
                className="absolute bottom-0.5 right-0.5 h-2 w-2 rounded-full bg-[#a6d189] ring-1 ring-[#181825]"
              />
            )}
          </button>

          {/* Account Menu Popover */}
          {activePopover === "account" && (
            <div
              role="menu"
              aria-label="Account menu"
              data-testid="sidebar-account-popover"
              className={`absolute right-full mr-2.5 bottom-0 z-50 w-56 rounded-xl border border-[#414559] bg-[#303446] p-1.5 shadow-2xl backdrop-blur-xl ring-1 ring-black/25`}
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

        {/* Small Arrow Control at the bottom to hide sidebar */}
        <button
          type="button"
          onClick={() => onToggleVisible(false)}
          aria-label="Hide interaction sidebar"
          title="Hide sidebar"
          data-testid="sidebar-hide-btn"
          className={`mt-2 flex h-6 w-7 items-center justify-center rounded-lg ${theme.countText} hover:bg-[#313244]/50 hover:text-white transition-colors focus:outline-none`}
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </aside>
    </div>
  );
}
