"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { ManifestData, ReaderSettings, Bookmark, ChapterMetadata } from "@/types/novel";
import { ChapterNavigation } from "./ChapterNavigation";
import { ChapterContent } from "./ChapterContent";
import { fetchChapterContent, preloadChapter } from "@/lib/chapterFetcher";
import {
  loadThemeSettings,
  saveThemeSettings,
  loadBookmarks,
  saveBookmarks,
  toggleBookmarkStorage,
  setCookie,
  DEFAULT_SETTINGS,
} from "@/lib/storage";
import { createClient } from "@/lib/supabase/client";
import {
  syncReadingProgress,
  fetchReadingProgress,
  fetchCloudBookmarks,
  addCloudBookmark,
  removeCloudBookmark,
  ERROR_SAVE_FAILED,
  type ProgressPayload,
  type PendingProgressRecord,
  getProgressWriterId,
  queueProgress,
  getPendingProgress,
  listPendingProgress,
  rebasePendingProgress,
  markPendingProgressConflict,
  clearPendingProgress,
} from "@/lib/supabase/sync";
import type { User } from "@supabase/supabase-js";
import { AlertCircle, CheckCircle2, LogIn, RefreshCw, X } from "lucide-react";

// Lazy-load modals with dynamic imports to strip them from the initial JS bundle
const ChapterSelectorModal = dynamic(
  () => import("./ChapterSelectorModal").then((mod) => mod.ChapterSelectorModal),
  { ssr: false }
);

const SettingsModal = dynamic(
  () => import("./SettingsModal").then((mod) => mod.SettingsModal),
  { ssr: false }
);

export interface InitialChapterInfo {
  id: number;
  number: number;
  title: string;
  wordCount: number;
}

interface ReaderInterfaceProps {
  manifest?: ManifestData;
  initialChapter?: InitialChapterInfo;
  totalChapters?: number;
  initialContent?: string | null;
  initialChapterId?: number;
  initialSettings?: ReaderSettings;
  initialScroll?: number;
  initialVersion?: number;
  initialUserId?: string;
}

interface ToastNotice {
  id: string;
  type: "error" | "success" | "info";
  message: string;
  actions?: Array<{ label: string; onClick: () => void }>;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

const THEME_PAGE_STYLES: Record<string, { bg: string; text: string }> = {
  catppuccin: { bg: "bg-[#1e1e2e]", text: "text-[#cdd6f4]" },
  "catppuccin-mocha": { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  "catppuccin-pink": { bg: "bg-[#1d101a]", text: "text-[#f5e0dc]" },
  "catppuccin-coffee": { bg: "bg-[#1a120e]", text: "text-[#f4ebd0]" },
  "catppuccin-jade": { bg: "bg-[#0f1b14]", text: "text-[#e0ede4]" },
  "catppuccin-latte": { bg: "bg-[#dce0e8]", text: "text-[#4c4f69]" },
  acrylic: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  blur: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  transparent: { bg: "bg-[#11111b]", text: "text-[#cdd6f4]" },
  black: { bg: "bg-[#09090b]", text: "text-zinc-100" },
  slate: { bg: "bg-[#0f172a]", text: "text-slate-100" },
  sepia: { bg: "bg-[#171412]", text: "text-[#f4ebd0]" },
  dark: { bg: "bg-[#121212]", text: "text-[#e0e0e0]" },
};

export function ReaderInterface({
  manifest,
  initialChapter,
  totalChapters,
  initialContent,
  initialChapterId = 1,
  initialSettings = DEFAULT_SETTINGS,
  initialScroll,
  initialVersion,
  initialUserId,
}: ReaderInterfaceProps) {
  const totalChaptersCount = totalChapters ?? manifest?.totalChapters ?? 2334;
  const initialId = initialChapter?.id ?? initialChapterId ?? 1;

  // Current Chapter State
  const [currentChapterId, setCurrentChapterId] = useState<number>(initialId);
  const [content, setContent] = useState<string | null>(initialContent ?? null);
  const [loading, setLoading] = useState<boolean>(!initialContent);
  const [error, setError] = useState<string | null>(null);

  // User Auth State
  const [user, setUser] = useState<User | null>(null);
  const userRef = useRef<User | null>(null);

  // Lazy-loaded chapters manifest (avoids embedding 520KB in SSR HTML)
  const [chapters, setChapters] = useState<ChapterMetadata[]>(() => manifest?.chapters || []);

  // Modals State
  const [isTocOpen, setIsTocOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Toast / Feedback State
  const [toastNotice, setToastNotice] = useState<ToastNotice | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Preferences & Bookmarks State
  const [settings, setSettings] = useState<ReaderSettings>(() => {
    if (typeof window !== "undefined") {
      try {
        return loadThemeSettings();
      } catch {
        return initialSettings;
      }
    }
    return initialSettings;
  });
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [customBgUrl, setCustomBgUrl] = useState<string | null>(null);
  const prevCustomBgRef = useRef<string | null>(null);

  // Progress sync tracking refs
  const currentVersionRef = useRef<number | null>(initialUserId ? initialVersion ?? null : null);
  const versionOwnerRef = useRef<string | null>(initialUserId ?? null);
  const progressWriterIdRef = useRef(getProgressWriterId());
  const progressSessionIdRef = useRef<string>(
    `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
  );
  const progressPipelineRef = useRef<Promise<void>>(Promise.resolve());
  const lastAcceptedSequenceRef = useRef(new Map<string, number>());
  const scrollDebounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedScrollRef = useRef<number>(-1);
  const targetRestorationScrollRef = useRef<number | undefined>(initialScroll);

  const showToast = useCallback((notice: Omit<ToastNotice, "id">) => {
    const id = String(Date.now());
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);

    setToastNotice({ ...notice, id });

    // Only auto-dismiss non-error notices
    if (notice.type !== "error" && !notice.actions?.length) {
      toastTimeoutRef.current = setTimeout(() => {
        setToastNotice(null);
      }, 4000);
    }
  }, []);

  // Check auth and load account-scoped cloud data.
  useEffect(() => {
    const supabase = createClient();
    let disposed = false;
    let authEventReceived = false;

    const applyUser = (activeUser: User | null) => {
      userRef.current = activeUser;
      setUser(activeUser);

      if (!activeUser) {
        currentVersionRef.current = null;
        versionOwnerRef.current = null;
        setBookmarks(loadBookmarks());
        return;
      }

      if (versionOwnerRef.current !== activeUser.id) {
        currentVersionRef.current = null;
        versionOwnerRef.current = null;
      }
      setBookmarks([]);

      fetchCloudBookmarks(supabase, activeUser.id).then((cloud) => {
        if (!disposed && userRef.current?.id === activeUser.id) {
          setBookmarks(cloud);
        }
      });

      fetchReadingProgress(supabase, activeUser.id).then((snapshot) => {
        if (!disposed && userRef.current?.id === activeUser.id && snapshot.success) {
          currentVersionRef.current = snapshot.progress?.version ?? 0;
          versionOwnerRef.current = activeUser.id;
        }
      });
    };

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      authEventReceived = true;
      applyUser(session?.user ?? null);
    });

    supabase.auth.getUser().then(({ data: { user: fetchedUser } }) => {
      if (!disposed && !authEventReceived) applyUser(fetchedUser);
    }).catch(() => {
      if (!disposed && !authEventReceived) applyUser(null);
    });

    return () => {
      disposed = true;
      subscription.unsubscribe();
    };
  }, []);

  // Load saved preferences and bookmarks on mount from cookies/localStorage
  useEffect(() => {
    try {
      const stored = loadThemeSettings();
      setSettings(stored);

      // If no initialChapterId was passed via URL and no cloud progress set it
      const lastRead = localStorage.getItem("reverend_last_read");
      if (lastRead && initialId === 1 && !initialChapter) {
        const id = parseInt(lastRead, 10);
        if (!isNaN(id) && id >= 1 && id <= totalChaptersCount) {
          setCurrentChapterId(id);
        }
      }
    } catch {
      // Ignore local storage / cookie read errors
    }
  }, [initialId, totalChaptersCount, initialChapter]);

  // Asynchronously fetch chapters manifest in the background (prevents 520KB SSR HTML payload)
  useEffect(() => {
    if (chapters.length > 0) return;
    let isMounted = true;
    fetch("/chapters.json")
      .then((res) => res.json())
      .then((data: ManifestData) => {
        if (isMounted && data?.chapters) {
          setChapters(data.chapters);
        }
      })
      .catch(() => {});
    return () => {
      isMounted = false;
    };
  }, [chapters.length]);

  // Clean up object URLs when custom background changes or unmounts
  const handleSetCustomBg = useCallback((newUrl: string | null) => {
    if (prevCustomBgRef.current && prevCustomBgRef.current.startsWith("blob:")) {
      URL.revokeObjectURL(prevCustomBgRef.current);
    }
    prevCustomBgRef.current = newUrl;
    setCustomBgUrl(newUrl);
  }, []);

  useEffect(() => {
    return () => {
      if (prevCustomBgRef.current && prevCustomBgRef.current.startsWith("blob:")) {
        URL.revokeObjectURL(prevCustomBgRef.current);
      }
    };
  }, []);

  // Update Settings immediately and persist to cookies and localStorage
  const handleUpdateSettings = useCallback((newPartial: Partial<ReaderSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newPartial };
      saveThemeSettings(updated);
      return updated;
    });
  }, []);

  useEffect(() => {
    saveThemeSettings(settings);
  }, [settings]);

  const currentChapter: ChapterMetadata =
    chapters.find((c) => c.id === currentChapterId) ||
    (initialChapter && currentChapterId === initialChapter.id
      ? {
          id: initialChapter.id,
          number: initialChapter.number,
          title: initialChapter.title,
          wordCount: initialChapter.wordCount,
          startByte: 0,
          endByte: 0,
          length: 0,
        }
      : {
          id: currentChapterId,
          number: currentChapterId,
          title: `Chapter ${currentChapterId}`,
          startByte: 0,
          endByte: 0,
          length: 0,
          wordCount: 0,
        });

  const hasPrev = currentChapterId > 1;
  const hasNext = currentChapterId < totalChaptersCount;

  const isCurrentBookmarked = bookmarks.some((b) => b.chapterId === currentChapterId);

  const showProgressConflict = useCallback(
    (
      pending: PendingProgressRecord,
      authoritative: PendingProgressRecord["authoritative"]
    ) => {
      const activeUser = userRef.current;
      if (!activeUser || activeUser.id !== pending.userId) return;

      showToast({
        type: "error",
        message: "Progress changed on another device. Your position is saved on this device.",
        actions: [
          {
            label: "Keep this device's position",
            onClick: () => {
              const nextVersion = authoritative?.record_exists ? authoritative.version : 0;
              const rebased = rebasePendingProgress(
                pending.userId,
                pending.writerId,
                pending.id,
                nextVersion
              );
              if (rebased) window.dispatchEvent(new Event("online"));
            },
          },
          {
            label: "Use cloud progress",
            onClick: () => {
              clearPendingProgress(pending.userId, pending.writerId, pending.id);
              if (authoritative?.record_exists && authoritative.chapter_number) {
                currentVersionRef.current = authoritative.version;
                versionOwnerRef.current = pending.userId;
                targetRestorationScrollRef.current = authoritative.scroll_position ?? 0;
                setCurrentChapterId(authoritative.chapter_number);
                if (authoritative.chapter_number === currentChapterId) {
                  window.setTimeout(() => {
                    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                    window.scrollTo({
                      top: (authoritative.scroll_position ?? 0) * Math.max(0, maxScroll),
                      behavior: "instant",
                    });
                  }, 100);
                }
              } else {
                currentVersionRef.current = 0;
                versionOwnerRef.current = pending.userId;
              }
              setToastNotice(null);
            },
          },
        ],
      });
    },
    [currentChapterId, showToast]
  );

  const dispatchProgressSave = useCallback(
    (payload: ProgressPayload, existingRecord?: PendingProgressRecord): Promise<void> => {
      const activeUser = userRef.current;
      if (!activeUser) return Promise.resolve();
      const isNewAction = !existingRecord;

      const currentVersion =
        versionOwnerRef.current === activeUser.id ? currentVersionRef.current : null;
      const preparedPayload = existingRecord
        ? payload
        : { ...payload, expected_version: payload.expected_version ?? currentVersion };
      const record =
        existingRecord ||
        queueProgress(
          activeUser.id,
          progressWriterIdRef.current,
          progressSessionIdRef.current,
          preparedPayload
        );

      if (!record) {
        showToast({ type: "error", message: ERROR_SAVE_FAILED });
        return Promise.resolve();
      }

      const syncOne = async () => {
        if (userRef.current?.id !== record.userId) return;

        const currentRecord = getPendingProgress(record.userId, record.writerId);
        if (currentRecord && currentRecord.id !== record.id) return;
        if (record.status === "conflict") {
          showProgressConflict(record, record.authoritative ?? null);
          return;
        }

        let requestRecord = currentRecord ?? record;
        if (requestRecord.payload.expected_version === null) {
          const supabase = createClient();
          const snapshot = await fetchReadingProgress(supabase, requestRecord.userId);
          if (!snapshot.success) {
            showToast({
              type: "error",
              message: ERROR_SAVE_FAILED,
              action: {
                label: "Retry",
                onClick: () => window.dispatchEvent(new Event("online")),
              },
            });
            return;
          }

          const authoritative = snapshot.progress
            ? {
                id: snapshot.progress.id,
                user_id: snapshot.progress.user_id,
                chapter_id: snapshot.progress.chapter_id,
                chapter_number: snapshot.progress.chapter_number,
                chapter_title: snapshot.progress.chapter_title,
                scroll_position: snapshot.progress.scroll_position,
                progress_updated_at: snapshot.progress.progress_updated_at,
                version: snapshot.progress.version,
                updated: false,
                record_exists: true,
              }
            : null;

          if (userRef.current?.id === requestRecord.userId) {
            currentVersionRef.current = snapshot.progress?.version ?? 0;
            versionOwnerRef.current = requestRecord.userId;
          }

          if (isNewAction && requestRecord.sessionId === progressSessionIdRef.current) {
            const rebased = rebasePendingProgress(
              requestRecord.userId,
              requestRecord.writerId,
              requestRecord.id,
              snapshot.progress?.version ?? 0
            );
            if (!rebased) return;
            requestRecord = rebased;
          } else {
            // An old offline record has no known baseline. Preserve it until the
            // user chooses whether to keep it or restore the current cloud state.
            const conflictRecord = markPendingProgressConflict(
              requestRecord.userId,
              requestRecord.writerId,
              requestRecord.id,
              authoritative
            );
            if (conflictRecord) showProgressConflict(conflictRecord, authoritative);
            return;
          }
        }

        if (
          requestRecord.sessionId === progressSessionIdRef.current &&
          versionOwnerRef.current === requestRecord.userId &&
          currentVersionRef.current !== null
        ) {
          const lastAccepted = lastAcceptedSequenceRef.current.get(requestRecord.writerId) ?? 0;
          if (
            requestRecord.sequence > lastAccepted &&
            requestRecord.payload.expected_version !== currentVersionRef.current
          ) {
            requestRecord =
              rebasePendingProgress(
                requestRecord.userId,
                requestRecord.writerId,
                requestRecord.id,
                currentVersionRef.current
              ) ?? requestRecord;
          }
        }

        const supabase = createClient();
        const result = await syncReadingProgress(supabase, requestRecord.userId, requestRecord.payload);
        if (!result.success || !result.authoritativeRecord) {
          if (userRef.current?.id === requestRecord.userId) {
            showToast({
              type: "error",
              message: ERROR_SAVE_FAILED,
              action: {
                label: "Retry",
                onClick: () => window.dispatchEvent(new Event("online")),
              },
            });
          }
          return;
        }

        const authoritative = result.authoritativeRecord;
        if (userRef.current?.id === requestRecord.userId) {
          currentVersionRef.current = authoritative.version;
          versionOwnerRef.current = requestRecord.userId;
        }

        if (result.updated) {
          clearPendingProgress(requestRecord.userId, requestRecord.writerId, requestRecord.id);
          lastAcceptedSequenceRef.current.set(requestRecord.writerId, requestRecord.sequence);
          if (userRef.current?.id === requestRecord.userId) {
            lastSavedScrollRef.current = requestRecord.payload.scroll_position;
          }
          return;
        }

        const alreadyCommitted =
          authoritative.record_exists &&
          authoritative.chapter_id === requestRecord.payload.chapter_id &&
          authoritative.chapter_number === requestRecord.payload.chapter_number &&
          authoritative.chapter_title === requestRecord.payload.chapter_title &&
          authoritative.scroll_position === requestRecord.payload.scroll_position;

        if (alreadyCommitted) {
          clearPendingProgress(requestRecord.userId, requestRecord.writerId, requestRecord.id);
          lastAcceptedSequenceRef.current.set(requestRecord.writerId, requestRecord.sequence);
          return;
        }

        const conflictRecord = markPendingProgressConflict(
          requestRecord.userId,
          requestRecord.writerId,
          requestRecord.id,
          authoritative
        );
        if (conflictRecord) showProgressConflict(conflictRecord, authoritative);
      };

      const scheduled = progressPipelineRef.current.then(syncOne, syncOne);
      progressPipelineRef.current = scheduled.then(() => undefined, () => undefined);
      return scheduled;
    },
    [showProgressConflict, showToast]
  );

  const drainPendingProgress = useCallback(
    (userId: string) => {
      const records = listPendingProgress(userId);
      for (const record of records) {
        if (record.status === "conflict") {
          showProgressConflict(record, record.authoritative ?? null);
        } else {
          void dispatchProgressSave(record.payload, record);
        }
      }
    },
    [dispatchProgressSave, showProgressConflict]
  );

  // Flush any pending progress immediately (on unload, visibility change, chapter switch)
  const flushProgressNow = useCallback(() => {
    if (!currentChapter) return;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const currentScrollPos =
      maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

    const payload: ProgressPayload = {
      chapter_id: String(currentChapter.id),
      chapter_number: currentChapter.number,
      chapter_title: currentChapter.title,
      scroll_position: currentScrollPos,
      expected_version:
        versionOwnerRef.current === userRef.current?.id ? currentVersionRef.current : null,
    };

    dispatchProgressSave(payload);
  }, [currentChapter, dispatchProgressSave]);

  // Retry only this authenticated user's queues when connectivity returns.
  useEffect(() => {
    const handleOnline = () => {
      const activeUser = userRef.current;
      if (activeUser) drainPendingProgress(activeUser.id);
    };

    const handleStorage = (event: StorageEvent) => {
      const activeUser = userRef.current;
      if (
        activeUser &&
        event.key?.startsWith(`reverend_pending_progress_v2_${encodeURIComponent(activeUser.id)}_`)
      ) {
        drainPendingProgress(activeUser.id);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("storage", handleStorage);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("storage", handleStorage);
    };
  }, [drainPendingProgress]);

  // Recover durable records after login or refresh, scoped by authenticated user.
  useEffect(() => {
    if (user) drainPendingProgress(user.id);
  }, [user?.id, drainPendingProgress]);

  // Visibility change listener: save progress when leaving tab
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === "hidden" && userRef.current) {
        flushProgressNow();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, [flushProgressNow]);

  // Scroll listener: debounced progress sync
  useEffect(() => {
    const handleScroll = () => {
      if (!userRef.current || !currentChapter) return;

      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }

      scrollDebounceTimerRef.current = setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        const normalized =
          maxScroll > 0 ? Math.min(1, Math.max(0, window.scrollY / maxScroll)) : 0;

        // Only save if scroll changed by at least 1%
        if (Math.abs(normalized - lastSavedScrollRef.current) >= 0.01) {
          const payload: ProgressPayload = {
            chapter_id: String(currentChapter.id),
            chapter_number: currentChapter.number,
            chapter_title: currentChapter.title,
            scroll_position: normalized,
              expected_version:
                versionOwnerRef.current === userRef.current?.id ? currentVersionRef.current : null,
          };
          dispatchProgressSave(payload);
        }
      }, 1500);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollDebounceTimerRef.current) {
        clearTimeout(scrollDebounceTimerRef.current);
      }
    };
  }, [currentChapter, dispatchProgressSave]);

  // Toggle Bookmark with optimistic UI, cloud sync, and rollback
  const handleToggleBookmark = useCallback(async () => {
    if (!currentChapter) return;

    const previousBookmarks = [...bookmarks];
    const willBookmark = !isCurrentBookmarked;

    const targetBookmark: Bookmark = {
      chapterId: currentChapter.id,
      chapterNumber: currentChapter.number,
      chapterTitle: currentChapter.title,
      createdAt: new Date().toISOString(),
    };

    // 1. If not logged in, save locally and offer login
    if (!user) {
      const { bookmarks: updated } = toggleBookmarkStorage(targetBookmark);
      setBookmarks(updated);

      const returnUrl = `/read?c=${currentChapter.id}`;
      showToast({
        type: "info",
        message: willBookmark
          ? "Bookmark saved locally. Sign in with Discord to sync bookmarks across all devices."
          : "Bookmark removed locally.",
        action: willBookmark
          ? {
              label: "Sign In",
              href: `/login?next=${encodeURIComponent(returnUrl)}`,
            }
          : undefined,
      });
      return;
    }

    // 2. Optimistic update
    let updatedBookmarks: Bookmark[];
    if (willBookmark) {
      updatedBookmarks = [targetBookmark, ...previousBookmarks];
    } else {
      updatedBookmarks = previousBookmarks.filter((b) => b.chapterId !== currentChapter.id);
    }
    setBookmarks(updatedBookmarks);

    // 3. Cloud update
    const supabase = createClient();
    let res: { success: boolean; error?: string };

    if (willBookmark) {
      res = await addCloudBookmark(supabase, user.id, targetBookmark);
    } else {
      res = await removeCloudBookmark(supabase, user.id, currentChapter.id);
    }

    if (!res.success) {
      // Rollback optimistic update
      if (userRef.current?.id === user.id) setBookmarks(previousBookmarks);
      showToast({
        type: "error",
        message: ERROR_SAVE_FAILED,
        action: {
          label: "Retry",
          onClick: () => handleToggleBookmark(),
        },
      });
    } else {
      if (userRef.current?.id !== user.id) return;
      showToast({
        type: "success",
        message: willBookmark ? "Bookmark saved to your cloud library." : "Bookmark removed.",
      });
    }
  }, [currentChapter, isCurrentBookmarked, bookmarks, user, showToast]);

  // Remove a specific bookmark (from modal or list) with optimistic rollback
  const handleRemoveBookmark = useCallback(
    async (chapterId: number) => {
      const previousBookmarks = [...bookmarks];
      const updated = previousBookmarks.filter((b) => b.chapterId !== chapterId);
      setBookmarks(updated);

      if (!user) {
        // The guest cache is not used to stage signed-in account bookmarks.
        const stored = loadBookmarks().filter((b) => b.chapterId !== chapterId);
        saveBookmarks(stored);
        showToast({
          type: "info",
          message: "Bookmark removed.",
        });
        return;
      }

      const supabase = createClient();
      const res = await removeCloudBookmark(supabase, user.id, chapterId);

      if (!res.success) {
        if (userRef.current?.id === user.id) setBookmarks(previousBookmarks);
        showToast({
          type: "error",
          message: ERROR_SAVE_FAILED,
        });
      } else {
        if (userRef.current?.id !== user.id) return;
        showToast({
          type: "success",
          message: "Bookmark removed.",
        });
      }
    },
    [bookmarks, user, showToast]
  );

  // Restore scroll position after content renders
  useEffect(() => {
    if (loading || !content) return;

    if (targetRestorationScrollRef.current !== undefined) {
      const scrollRatio = targetRestorationScrollRef.current;
      targetRestorationScrollRef.current = undefined;

      // Small tick to ensure layout measurement is accurate
      const timer = setTimeout(() => {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll > 0) {
          window.scrollTo({
            top: scrollRatio * maxScroll,
            behavior: "instant",
          });
        }
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [loading, content]);

  // Load Chapter Content
  const loadChapter = useCallback(
    async (id: number) => {
      if (id < 1 || id > totalChaptersCount) {
        setError(`Chapter #${id} not found.`);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const text = await fetchChapterContent({ id });
        setContent(text);
        setLoading(false);

        // Save last read position to cookie and localStorage
        try {
          localStorage.setItem("reverend_last_read", String(id));
          setCookie("reverend_last_read", String(id));
        } catch {}

        // Update URL query parameter without triggering full reload
        const url = new URL(window.location.href);
        url.searchParams.set("c", String(id));
        url.searchParams.delete("scroll");
        window.history.replaceState({}, "", url.toString());

        // If not restoring scroll, scroll to top
        if (targetRestorationScrollRef.current === undefined) {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }

        // Preload next and previous chapters in background
        if (id + 1 <= totalChaptersCount) {
          preloadChapter({ id: id + 1 });
        }
        if (id - 1 >= 1) {
          preloadChapter({ id: id - 1 });
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load chapter content.";
        setError(message);
        setLoading(false);
      }
    },
    [totalChaptersCount]
  );

  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      if (initialContent && currentChapterId === initialId) {
        // Content was pre-rendered by SSR; preload adjacent chapters
        if (currentChapterId + 1 <= totalChaptersCount) {
          preloadChapter({ id: currentChapterId + 1 });
        }
        if (currentChapterId > 1) {
          preloadChapter({ id: currentChapterId - 1 });
        }
        return;
      }
    }
    loadChapter(currentChapterId);
  }, [currentChapterId, loadChapter, initialContent, initialId, totalChaptersCount]);

  const handlePrev = () => {
    if (hasPrev) {
      flushProgressNow();
      setCurrentChapterId((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      flushProgressNow();
      setCurrentChapterId((prev) => prev + 1);
    }
  };

  const handleSelectChapterFromModal = (id: number) => {
    flushProgressNow();
    setCurrentChapterId(id);
  };

  const activeThemeStyle =
    THEME_PAGE_STYLES[settings.surfaceTheme] || THEME_PAGE_STYLES.catppuccin;

  return (
    <div className={`relative min-h-screen ${activeThemeStyle.bg} ${activeThemeStyle.text} transition-colors duration-200`}>
      {/* Custom Background Image Layer */}
      {customBgUrl && (
        <div
          aria-hidden="true"
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat pointer-events-none transition-all duration-300"
          style={{ backgroundImage: `url(${customBgUrl})` }}
        />
      )}

      {/* Main Container */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <ChapterNavigation
          currentChapter={currentChapter}
          totalChapters={totalChaptersCount}
          hasPrev={hasPrev}
          hasNext={hasNext}
          onPrev={handlePrev}
          onNext={handleNext}
          onOpenToc={() => setIsTocOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          isBookmarked={isCurrentBookmarked}
          onToggleBookmark={handleToggleBookmark}
          settings={settings}
        />

        {/* Reading Canvas */}
        <main className="flex-1 px-4 sm:px-6">
          <ChapterContent
            chapter={currentChapter}
            content={content}
            loading={loading}
            error={error}
            onRetry={() => loadChapter(currentChapterId)}
            hasPrev={hasPrev}
            hasNext={hasNext}
            onPrev={handlePrev}
            onNext={handleNext}
            settings={settings}
          />
        </main>
      </div>

      {/* Table of Contents & Bookmarks Modal (Lazy Loaded) */}
      <ChapterSelectorModal
        isOpen={isTocOpen}
        onClose={() => setIsTocOpen(false)}
        chapters={chapters}
        currentChapterId={currentChapterId}
        onSelectChapter={handleSelectChapterFromModal}
        bookmarks={bookmarks}
        onRemoveBookmark={handleRemoveBookmark}
      />

      {/* Settings Modal (Lazy Loaded) */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onChangeSettings={handleUpdateSettings}
        customBgUrl={customBgUrl}
        onSetCustomBg={handleSetCustomBg}
      />

      {/* Floating Toast Notification */}
      {toastNotice && (
        <div className="fixed bottom-5 right-5 z-50 max-w-sm animate-in fade-in slide-in-from-bottom-5 duration-200">
          <div
            className={`flex items-start space-x-3 rounded-xl border p-3.5 shadow-2xl backdrop-blur-md text-xs ${
              toastNotice.type === "error"
                ? "border-[#e78284]/60 bg-[#292c3c]/95 text-[#e78284]"
                : toastNotice.type === "success"
                ? "border-[#a6d189]/60 bg-[#292c3c]/95 text-[#a6d189]"
                : "border-[#8caaee]/60 bg-[#292c3c]/95 text-[#c6d0f5]"
            }`}
          >
            {toastNotice.type === "error" ? (
              <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#e78284]" />
            ) : toastNotice.type === "success" ? (
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#a6d189]" />
            ) : (
              <LogIn className="mt-0.5 h-4 w-4 flex-shrink-0 text-[#8caaee]" />
            )}

            <div className="flex-1">
              <p className="leading-relaxed">{toastNotice.message}</p>
              {toastNotice.action && (
                <div className="mt-2">
                  {toastNotice.action.href ? (
                    <Link
                      href={toastNotice.action.href}
                      className="inline-flex items-center space-x-1 font-mono text-[11px] font-semibold text-[#8caaee] hover:underline"
                    >
                      <span>{toastNotice.action.label}</span>
                      <span>&rarr;</span>
                    </Link>
                  ) : toastNotice.action.onClick ? (
                    <button
                      onClick={toastNotice.action.onClick}
                      className="inline-flex items-center space-x-1 font-mono text-[11px] font-semibold text-[#8caaee] hover:underline"
                    >
                      <RefreshCw className="h-3 w-3" />
                      <span>{toastNotice.action.label}</span>
                    </button>
                  ) : null}
                </div>
              )}
              {toastNotice.actions?.length ? (
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1">
                  {toastNotice.actions.map((action) => (
                    <button
                      key={action.label}
                      onClick={action.onClick}
                      className="font-mono text-[11px] font-semibold text-[#8caaee] hover:underline"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>

            <button
              onClick={() => setToastNotice(null)}
              className="text-[#a5adce] hover:text-white focus:outline-none p-0.5"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
