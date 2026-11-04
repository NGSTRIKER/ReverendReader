"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAvatarUrl, cleanPublicUsername } from "@/lib/supabase/social";
import { Profile, ReadingProgress, DatabaseBookmark } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import {
  BookOpen,
  Bookmark,
  Calendar,
  LogOut,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Compass,
} from "lucide-react";

interface AccountViewProps {
  user: User;
  profile: Profile | null;
  initialProgress: ReadingProgress | null;
  initialBookmarks: DatabaseBookmark[];
}

export function AccountView({
  user,
  profile,
  initialProgress,
  initialBookmarks,
}: AccountViewProps) {
  const router = useRouter();
  const [bookmarks, setBookmarks] = useState<DatabaseBookmark[]>(initialBookmarks);
  const [deletingBookmarkId, setDeletingBookmarkId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "error" | "success"; message: string } | null>(
    null
  );
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Metadata fallbacks - keep emails private, allow usernames
  const metadata = user.user_metadata || {};
  const username = cleanPublicUsername(
    profile?.username ||
      metadata.preferred_username ||
      metadata.user_name ||
      user.email?.split("@")[0]
  );

  let rawDisplayName =
    profile?.display_name ||
    metadata.custom_claims?.global_name ||
    metadata.full_name ||
    metadata.name ||
    metadata.preferred_username;

  if (typeof rawDisplayName === "string" && rawDisplayName.includes("@")) {
    rawDisplayName = null;
  }

  const displayName = rawDisplayName || username || "Cultivator";
  const avatarUrl = sanitizeAvatarUrl(
    profile?.avatar_url || metadata.avatar_url || metadata.picture
  );

  const joinDate = user.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "Unknown";

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push("/");
      router.refresh();
    } catch {
      setIsLoggingOut(false);
      setFeedback({
        type: "error",
        message: "Couldn't save this right now. Please try again.",
      });
    }
  };

  const handleRemoveBookmark = async (bookmark: DatabaseBookmark) => {
    setDeletingBookmarkId(bookmark.id);
    setFeedback(null);

    // Optimistic removal
    const previousBookmarks = [...bookmarks];
    setBookmarks((prev) => prev.filter((b) => b.id !== bookmark.id));

    try {
      const supabase = createClient();
      const { error } = await supabase
        .from("bookmarks")
        .delete()
        .eq("id", bookmark.id)
        .eq("user_id", user.id);

      if (error) {
        throw error;
      }

      setFeedback({
        type: "success",
        message: `Removed bookmark for Chapter ${bookmark.chapter_number || bookmark.chapter_id}.`,
      });
    } catch (err) {
      console.error("Failed to delete bookmark:", err);
      // Rollback optimistic update
      setBookmarks(previousBookmarks);
      setFeedback({
        type: "error",
        message: "Couldn't save this right now. Please try again.",
      });
    } finally {
      setDeletingBookmarkId(null);
    }
  };

  const progressPercent = initialProgress
    ? Math.min(100, Math.max(0, Math.round(initialProgress.scroll_position * 100)))
    : 0;

  const continueUrl = initialProgress
    ? `/read?id=${initialProgress.chapter_id}&scroll=${initialProgress.scroll_position}`
    : "/read?id=1";

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Feedback Toast / Alert */}
      {feedback && (
        <div
          className={`mb-6 flex items-start space-x-3 rounded-xl border p-4 text-xs ${
            feedback.type === "error"
              ? "border-[#e78284]/40 bg-[#e78284]/10 text-[#e78284]"
              : "border-[#a6d189]/40 bg-[#a6d189]/10 text-[#a6d189]"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
          )}
          <div className="flex-1 font-mono">{feedback.message}</div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs hover:opacity-80 focus:outline-none"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Profile Header Card */}
      <div
        id="profile"
        className="relative scroll-mt-20 overflow-hidden rounded-2xl border border-[#414559] bg-[#303446]/80 p-6 shadow-xl backdrop-blur-md sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center space-x-4 sm:space-x-5">
            {/* Avatar */}
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-2xl border-2 border-[#51576d] bg-[#292c3c] shadow-inner">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  width={80}
                  height={80}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-mono text-2xl text-[#8caaee]">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            {/* User Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-bold text-[#c6d0f5]">
                  {displayName}
                </h1>
                <span className="inline-flex items-center space-x-1 rounded-md border border-[#a6d189]/30 bg-[#a6d189]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#a6d189]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#a6d189]" />
                  <span>Discord</span>
                </span>
              </div>

              {username && (
                <p className="font-mono text-xs text-[#a5adce] mt-0.5">@{username.replace(/^@/, "")}</p>
              )}

              <div className="mt-2 flex items-center space-x-2 font-mono text-[11px] text-[#838ba7]">
                <Calendar className="h-3.5 w-3.5" />
                <span>Cultivating since {joinDate}</span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <div className="flex items-center">
            <button
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="inline-flex items-center space-x-2 rounded-lg border border-[#e78284]/40 bg-[#e78284]/10 px-4 py-2 font-mono text-xs font-medium text-[#e78284] hover:bg-[#e78284]/20 transition-all focus:outline-none focus:ring-1 focus:ring-[#e78284] disabled:opacity-50"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Reading Progress & Bookmarks Count */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Reading Progress */}
        <div
          id="progress"
          className="scroll-mt-20 lg:col-span-2 rounded-2xl border border-[#414559] bg-[#303446]/60 p-6 backdrop-blur-md"
        >
          <div className="flex items-center justify-between border-b border-[#414559]/60 pb-4">
            <div className="flex items-center space-x-2">
              <Compass className="h-4 w-4 text-[#8caaee]" />
              <h2 className="font-serif text-base font-semibold text-[#c6d0f5]">
                Current Reading Progress
              </h2>
            </div>
            {initialProgress && (
              <span className="font-mono text-[11px] text-[#8caaee]">
                {progressPercent}% Complete
              </span>
            )}
          </div>

          <div className="mt-5">
            {initialProgress ? (
              <div>
                <div className="flex items-baseline justify-between">
                  <div className="font-serif text-sm sm:text-base font-medium text-[#c6d0f5]">
                    {initialProgress.chapter_title || `Chapter ${initialProgress.chapter_number}`}
                  </div>
                  <span className="font-mono text-xs text-[#a5adce]">
                    Chapter {initialProgress.chapter_number || initialProgress.chapter_id}
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-[#232634]">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-[#8caaee] to-[#babbf1] transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-[11px] font-mono text-[#838ba7]">
                  <span>Last synced: {new Date(initialProgress.progress_updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span>Chapter {initialProgress.chapter_number || initialProgress.chapter_id} of 2,334</span>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <Link
                    href={continueUrl}
                    className="inline-flex items-center space-x-2 rounded-xl bg-[#8caaee] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#232634] hover:bg-[#babbf1] transition-all focus:outline-none focus:ring-1 focus:ring-[#8caaee] shadow-md shadow-[#8caaee]/10"
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Continue Reading</span>
                  </Link>
                </div>
              </div>
            ) : (
              /* Empty Progress State */
              <div className="py-8 text-center">
                <BookOpen className="mx-auto h-10 w-10 text-[#51576d] mb-2" />
                <p className="text-sm font-medium text-[#c6d0f5]">No reading history recorded yet</p>
                <p className="mt-1 font-serif italic text-xs text-[#a5adce]">
                  Begin Fang Yuan&apos;s 500-year demonic rebirth.
                </p>
                <div className="mt-5">
                  <Link
                    href="/read?id=1"
                    className="inline-flex items-center space-x-2 rounded-xl bg-[#8caaee] px-5 py-2.5 font-mono text-xs font-semibold uppercase tracking-wider text-[#232634] hover:bg-[#babbf1] transition-all"
                  >
                    <BookOpen className="h-3.5 w-3.5" />
                    <span>Start Reading Chapter 1</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Library Summary */}
        <div className="rounded-2xl border border-[#414559] bg-[#303446]/60 p-6 backdrop-blur-md flex flex-col justify-between">
          <div>
            <div className="flex items-center space-x-2 border-b border-[#414559]/60 pb-4">
              <Bookmark className="h-4 w-4 text-[#fab387]" />
              <h2 className="font-serif text-base font-semibold text-[#c6d0f5]">
                Saved Bookmarks
              </h2>
            </div>
            <div className="mt-6 text-center sm:text-left">
              <span className="font-mono text-4xl sm:text-5xl font-bold text-[#fab387]">
                {bookmarks.length}
              </span>
              <p className="mt-1 font-mono text-xs text-[#a5adce]">
                Total Bookmarked Chapters
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-[#414559]/40 pt-4 text-[11px] font-mono text-[#838ba7]">
            <span>Bookmarks sync seamlessly with your reader Table of Contents.</span>
          </div>
        </div>
      </div>

      {/* Bookmarked Chapter List */}
      <div
        id="bookmarks"
        className="mt-8 scroll-mt-20 rounded-2xl border border-[#414559] bg-[#303446]/60 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-[#414559]/60 pb-4">
          <div className="flex items-center space-x-2">
            <Bookmark className="h-4 w-4 text-[#8caaee]" />
            <h2 className="font-serif text-base font-semibold text-[#c6d0f5]">
              Bookmarked Chapters ({bookmarks.length})
            </h2>
          </div>
        </div>

        <div className="mt-4">
          {bookmarks.length > 0 ? (
            <div className="divide-y divide-[#414559]/40">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-3.5 transition-colors hover:bg-[#303446]/80 px-2 rounded-lg"
                >
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/read?id=${b.chapter_id}`}
                      className="group flex items-center space-x-2 truncate font-serif text-sm font-medium text-[#c6d0f5] hover:text-[#8caaee] transition-colors"
                    >
                      <span className="truncate">{b.chapter_title || `Chapter ${b.chapter_number || b.chapter_id}`}</span>
                      <ExternalLink className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                    </Link>
                    <div className="mt-0.5 flex items-center space-x-3 font-mono text-[11px] text-[#838ba7]">
                      <span>Chapter {b.chapter_number || b.chapter_id}</span>
                      <span>&bull;</span>
                      <span>Bookmarked on {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Link
                      href={`/read?id=${b.chapter_id}`}
                      className="inline-flex items-center space-x-1 rounded-md border border-[#51576d] bg-[#414559] px-2.5 py-1 font-mono text-xs text-[#c6d0f5] hover:bg-[#51576d] hover:text-white transition-colors"
                      title="Read Chapter"
                    >
                      <span>Read</span>
                    </Link>

                    <button
                      onClick={() => handleRemoveBookmark(b)}
                      disabled={deletingBookmarkId === b.id}
                      className="rounded-md border border-transparent p-1.5 text-[#e78284]/70 hover:border-[#e78284]/30 hover:bg-[#e78284]/10 hover:text-[#e78284] transition-colors focus:outline-none disabled:opacity-40"
                      title="Remove Bookmark"
                      aria-label={`Remove bookmark for Chapter ${b.chapter_number || b.chapter_id}`}
                    >
                      {deletingBookmarkId === b.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Empty Bookmarks State */
            <div className="py-10 text-center">
              <Bookmark className="mx-auto h-10 w-10 text-[#51576d] mb-2" />
              <p className="text-sm font-medium text-[#c6d0f5]">No bookmarks saved yet</p>
              <p className="mt-1 font-serif italic text-xs text-[#a5adce]">
                Click the bookmark icon in the reader navigation bar while reading to bookmark any chapter.
              </p>
              <div className="mt-5">
                <Link
                  href="/read"
                  className="inline-flex items-center space-x-1.5 rounded-md border border-[#51576d] bg-[#414559] px-4 py-2 font-mono text-xs text-[#c6d0f5] hover:bg-[#51576d] hover:text-white transition-colors"
                >
                  <BookOpen className="h-3.5 w-3.5" />
                  <span>Open Reader</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
