"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeAvatarUrl, cleanPublicUsername } from "@/lib/supabase/social";
import { Profile, ReadingProgress, DatabaseBookmark } from "@/types/database";
import type { User } from "@supabase/supabase-js";
import {
  ArrowRight,
  Bookmark,
  Calendar,
  LogOut,
  Trash2,
  AlertCircle,
  CheckCircle2,
  Loader2,
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

  const metadata = user.user_metadata || {};
  const discordUsername = cleanPublicUsername(
    profile?.username ||
      profile?.display_name ||
      metadata.preferred_username ||
      metadata.user_name ||
      metadata.custom_claims?.global_name ||
      metadata.name ||
      metadata.full_name ||
      user.email?.split("@")[0]
  );

  const displayName = discordUsername || "Cultivator";
  const username = discordUsername;
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
        message: "Couldn't sign out right now. Please try again.",
      });
    }
  };

  const handleRemoveBookmark = async (bookmark: DatabaseBookmark) => {
    setDeletingBookmarkId(bookmark.id);
    setFeedback(null);

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
    <div className="mx-auto max-w-[1120px] px-4 sm:px-8">
      {feedback && (
        <div
          className={`mb-6 flex items-start gap-3 border p-4 text-xs ${
            feedback.type === "error"
              ? "border-danger/50 bg-danger/5 text-danger"
              : "border-success/50 bg-success/5 text-ink"
          }`}
        >
          {feedback.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-danger" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-success" />
          )}
          <div className="flex-1">{feedback.message}</div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs text-muted hover:text-ink"
            aria-label="Close notification"
          >
            &times;
          </button>
        </div>
      )}

      {/* Profile Header */}
      <div
        id="profile"
        className="scroll-mt-20 border border-line bg-surface p-6 sm:p-8"
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-[3px] border border-line-strong bg-sunken">
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
                <div className="flex h-full w-full items-center justify-center text-2xl font-semibold text-accent">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>

            <div>
              <p className="label text-accent">Reader Profile · Discord</p>
              <h1 className="mt-0.5 text-xl sm:text-2xl font-semibold text-ink">
                {displayName}
              </h1>

              {username && username.toLowerCase() !== displayName.toLowerCase() && (
                <p className="text-xs text-muted mt-0.5">@{username.replace(/^@/, "")}</p>
              )}

              <div className="mt-2 flex items-center gap-2 text-xs text-muted">
                <Calendar className="h-3.5 w-3.5 text-faint" />
                <span>Joined {joinDate}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut}
              className="btn-quiet text-xs text-danger border-danger/40 hover:bg-danger/10"
            >
              {isLoggingOut ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <LogOut className="h-3.5 w-3.5" />
              )}
              <span>Sign out</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reading Progress & Bookmarks Summary */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div
          id="progress"
          className="scroll-mt-20 lg:col-span-2 border border-line bg-surface p-6"
        >
          <div className="flex items-baseline justify-between border-b border-line pb-4">
            <div>
              <p className="label text-accent">Reading Position</p>
              <h2 className="mt-0.5 text-lg font-semibold text-ink">
                Current Chapter
              </h2>
            </div>
            {initialProgress && (
              <span className="text-xs font-medium text-accent tnum">
                {progressPercent}% through chapter
              </span>
            )}
          </div>

          <div className="mt-5">
            {initialProgress ? (
              <div>
                <div className="flex items-baseline justify-between gap-4">
                  <div className="text-base font-medium text-ink">
                    {initialProgress.chapter_title || `Chapter ${initialProgress.chapter_number}`}
                  </div>
                  <span className="text-xs text-muted tnum flex-shrink-0">
                    Ch. {initialProgress.chapter_number || initialProgress.chapter_id} of 2,334
                  </span>
                </div>

                <div className="mt-3 h-1.5 w-full overflow-hidden bg-sunken">
                  <div
                    className="h-full bg-accent transition-all duration-200"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div className="mt-2 flex items-center justify-between text-xs text-muted tnum">
                  <span>
                    Synced{" "}
                    {new Date(initialProgress.progress_updated_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <span>{progressPercent}%</span>
                </div>

                <div className="mt-6">
                  <Link href={continueUrl} className="btn-primary text-xs font-medium px-4 py-2.5">
                    <span>Continue reading</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center">
                <p className="text-sm font-medium text-ink">No reading history recorded yet</p>
                <p className="mt-1 text-xs text-muted">
                  Open any chapter to start syncing your reading position.
                </p>
                <div className="mt-5">
                  <Link href="/read?id=1" className="btn-primary text-xs font-medium px-4 py-2.5">
                    <span>Begin Chapter 1</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border border-line bg-surface p-6 flex flex-col justify-between">
          <div>
            <div className="border-b border-line pb-4">
              <p className="label text-accent">Library</p>
              <h2 className="mt-0.5 text-lg font-semibold text-ink">
                Saved Bookmarks
              </h2>
            </div>
            <div className="mt-6">
              <span className="text-4xl sm:text-5xl font-semibold text-accent tnum">
                {bookmarks.length}
              </span>
              <p className="mt-1 text-xs text-muted">
                Bookmarked chapters
              </p>
            </div>
          </div>

          <div className="mt-6 border-t border-line pt-4 text-xs text-muted">
            Synced with the chapter index in the reader.
          </div>
        </div>
      </div>

      {/* Bookmarked Chapters */}
      <div
        id="bookmarks"
        className="mt-8 scroll-mt-20 border border-line bg-surface p-6"
      >
        <div className="flex items-center justify-between border-b border-line pb-4">
          <div>
            <p className="label text-accent">Saved Places</p>
            <h2 className="mt-0.5 text-lg font-semibold text-ink tnum">
              Bookmarked Chapters ({bookmarks.length})
            </h2>
          </div>
        </div>

        <div className="mt-4">
          {bookmarks.length > 0 ? (
            <div className="divide-y divide-line">
              {bookmarks.map((b) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between py-3.5 px-2 hover:bg-sunken transition-colors"
                >
                  <div className="min-w-0 pr-4">
                    <Link
                      href={`/read?id=${b.chapter_id}`}
                      className="block truncate text-sm font-medium text-ink hover:text-accent transition-colors"
                    >
                      {b.chapter_title || `Chapter ${b.chapter_number || b.chapter_id}`}
                    </Link>
                    <div className="mt-0.5 flex items-center gap-3 text-xs text-muted tnum">
                      <span>Chapter {b.chapter_number || b.chapter_id}</span>
                      <span>·</span>
                      <span>Saved {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/read?id=${b.chapter_id}`}
                      className="btn-quiet px-3 py-1 text-xs"
                    >
                      Read
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleRemoveBookmark(b)}
                      disabled={deletingBookmarkId === b.id}
                      className="icon-btn hover:text-danger"
                      title="Remove bookmark"
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
            <div className="py-10 text-center">
              <Bookmark className="mx-auto h-8 w-8 text-faint mb-2" strokeWidth={1.5} />
              <p className="text-sm font-medium text-ink">No bookmarks saved yet</p>
              <p className="mt-1 text-xs text-muted">
                Use the bookmark button in the reader header to save any chapter.
              </p>
              <div className="mt-5">
                <Link href="/read" className="btn-quiet text-xs px-4 py-2">
                  Open Reader
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
