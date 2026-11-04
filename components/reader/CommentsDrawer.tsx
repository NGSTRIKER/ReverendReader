"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  X,
  Heart,
  MessageSquareReply,
  MoreHorizontal,
  Send,
  Eye,
  EyeOff,
  AlertTriangle,
  Flag,
  Pencil,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  LogIn,
  RefreshCw,
  User as UserIcon,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import type { ChapterMetadata, ReaderSettings } from "@/types/novel";
import { createClient } from "@/lib/supabase/client";
import {
  COMMENTS_PAGE_SIZE,
  REPLIES_PAGE_SIZE,
  COMMENT_MAX_LENGTH,
  REPORT_DETAILS_MAX_LENGTH,
  REPORT_REASON_DEFINITIONS,
  fetchChapterComments,
  fetchCommentReplies,
  createChapterComment,
  editOwnComment,
  deleteOwnComment,
  setCommentLike,
  reportComment,
  formatRelativeTimestamp,
  validateCommentText,
  withActionLock,
  type CommentRow,
  type CommentSortOrder,
  type CommentCursor,
  type ReplyCursor,
  type CommentReportReason,
} from "@/lib/supabase/social";
import { extractUserIdentity } from "@/components/auth/UserNav";

interface CommentsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  chapter: ChapterMetadata;
  totalCommentCount: number;
  onCommentCountDelta: (delta: number) => void;
  user: User | null;
  settings: ReaderSettings;
  onShowToast: (notice: {
    type: "error" | "success" | "info";
    message: string;
    action?: { label: string; href?: string; onClick?: () => void };
  }) => void;
}

interface ReplyThreadState {
  expanded: boolean;
  loading: boolean;
  items: CommentRow[];
  cursor: ReplyCursor | null;
  hasMore: boolean;
  initialized: boolean;
  error?: string;
}

export function CommentsDrawer({
  isOpen,
  onClose,
  chapter,
  totalCommentCount,
  onCommentCountDelta,
  user,
  settings,
  onShowToast,
}: CommentsDrawerProps) {
  const [sort, setSort] = useState<CommentSortOrder>("top");
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [cursor, setCursor] = useState<CommentCursor | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Composer state (bottom of drawer)
  const [composerText, setComposerText] = useState("");
  const [composerSpoiler, setComposerSpoiler] = useState(false);
  const [submittingComment, setSubmittingComment] = useState(false);
  const [composerError, setComposerError] = useState<string | null>(null);

  // Reply composer state (one active parent at a time)
  const [replyingToId, setReplyingToId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [replySpoiler, setReplySpoiler] = useState(false);
  const [submittingReply, setSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Replies map keyed by parent comment id
  const [replyThreads, setReplyThreads] = useState<Record<string, ReplyThreadState>>({});

  // Revealed spoiler comment ids
  const [revealedSpoilers, setRevealedSpoilers] = useState<Set<string>>(new Set());

  // Open More menu comment id
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  // Inline Edit state
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [editSpoiler, setEditSpoiler] = useState(false);
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Report modal state
  const [reportingComment, setReportingComment] = useState<CommentRow | null>(null);
  const [reportReason, setReportReason] = useState<CommentReportReason>("spam");
  const [reportDetails, setReportDetails] = useState("");
  const [submittingReport, setSubmittingReport] = useState(false);

  const listContainerRef = useRef<HTMLDivElement>(null);
  const loadedKeyRef = useRef<string | null>(null);

  const isLatte = settings.surfaceTheme === "catppuccin-latte";
  const drawerBg = isLatte ? "bg-[#eff1f5]" : "bg-[#181825]";
  const drawerBorder = isLatte ? "border-[#ccd0da]" : "border-[#313244]";
  const cardBg = isLatte ? "bg-[#e6e9ef]/75" : "bg-[#1e1e2e]/85";
  const textPrimary = isLatte ? "text-[#4c4f69]" : "text-[#cdd6f4]";
  const textSecondary = isLatte ? "text-[#6c6f85]" : "text-[#a6adc8]";
  const inputBg = isLatte ? "bg-[#dce0e8]" : "bg-[#11111b]";

  const loginUrl = `/login?next=${encodeURIComponent(`/read?c=${chapter.id}`)}`;

  // Load initial 20 comments ONLY when drawer is open
  const loadInitialComments = useCallback(
    async (targetChapterId: number, targetSort: CommentSortOrder) => {
      setLoadingInitial(true);
      setLoadError(null);
      try {
        const supabase = createClient();
        const res = await fetchChapterComments(
          supabase,
          targetChapterId,
          targetSort,
          null,
          COMMENTS_PAGE_SIZE
        );

        if (!res.success) {
          setLoadError(res.error || "Couldn't load comments right now.");
          setComments([]);
          setCursor(null);
          setHasMore(false);
        } else {
          setComments(res.comments);
          setCursor(res.nextCursor);
          setHasMore(res.hasMore);
        }
      } catch {
        setLoadError("Comments service is currently unavailable.");
        setComments([]);
        setCursor(null);
        setHasMore(false);
      }
      setLoadingInitial(false);
    },
    []
  );

  // Reset and fetch when drawer opens or chapter/sort/user changes while open
  useEffect(() => {
    if (!isOpen) return;
    const key = `${chapter.id}:${sort}:${user?.id || "anon"}`;
    if (loadedKeyRef.current === key) return;
    loadedKeyRef.current = key;
    setReplyThreads({});
    setRevealedSpoilers(new Set());
    setReplyingToId(null);
    setEditingCommentId(null);
    setOpenMenuId(null);
    void loadInitialComments(chapter.id, sort);
  }, [isOpen, chapter.id, sort, user?.id, loadInitialComments]);

  // Clear loadedKeyRef when chapter changes so next open refreshes
  useEffect(() => {
    loadedKeyRef.current = null;
  }, [chapter.id]);

  // Escape key closes report modal, active menu, or drawer
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (reportingComment) {
          setReportingComment(null);
        } else if (openMenuId) {
          setOpenMenuId(null);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, reportingComment, openMenuId, onClose]);

  const handleLoadMoreComments = useCallback(async () => {
    if (!hasMore || !cursor || loadingMore || loadingInitial) return;
    setLoadingMore(true);
    const supabase = createClient();
    const res = await fetchChapterComments(
      supabase,
      chapter.id,
      sort,
      cursor,
      COMMENTS_PAGE_SIZE
    );
    if (res.success) {
      setComments((prev) => {
        const existingIds = new Set(prev.map((c) => c.id));
        const deduped = res.comments.filter((c) => !existingIds.has(c.id));
        return [...prev, ...deduped];
      });
      setCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } else {
      onShowToast({
        type: "error",
        message: res.error || "Couldn't load more comments.",
      });
    }
    setLoadingMore(false);
  }, [hasMore, cursor, loadingMore, loadingInitial, chapter.id, sort, onShowToast]);

  // Infinite scroll trigger inside comments list
  const handleScrollList = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      if (!hasMore || loadingMore || loadingInitial) return;
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 180) {
        void handleLoadMoreComments();
      }
    },
    [hasMore, loadingMore, loadingInitial, handleLoadMoreComments]
  );

  // Toggle replies for a parent comment
  const handleToggleReplies = useCallback(async (parentId: string) => {
    const current = replyThreads[parentId];
    if (current && current.initialized) {
      setReplyThreads((prev) => ({
        ...prev,
        [parentId]: { ...prev[parentId], expanded: !prev[parentId].expanded },
      }));
      return;
    }

    setReplyThreads((prev) => ({
      ...prev,
      [parentId]: {
        expanded: true,
        loading: true,
        items: prev[parentId]?.items || [],
        cursor: null,
        hasMore: false,
        initialized: false,
      },
    }));

    const supabase = createClient();
    const res = await fetchCommentReplies(supabase, parentId, null, REPLIES_PAGE_SIZE);
    setReplyThreads((prev) => ({
      ...prev,
      [parentId]: {
        expanded: true,
        loading: false,
        items: res.replies,
        cursor: res.nextCursor,
        hasMore: res.hasMore,
        initialized: res.success,
        error: res.error,
      },
    }));
  }, [replyThreads]);

  const handleLoadMoreReplies = useCallback(
    async (parentId: string) => {
      const thread = replyThreads[parentId];
      if (!thread || !thread.hasMore || !thread.cursor || thread.loading) return;

      setReplyThreads((prev) => ({
        ...prev,
        [parentId]: { ...prev[parentId], loading: true },
      }));

      const supabase = createClient();
      const res = await fetchCommentReplies(
        supabase,
        parentId,
        thread.cursor,
        REPLIES_PAGE_SIZE
      );

      setReplyThreads((prev) => {
        const current = prev[parentId];
        if (!current) return prev;
        if (!res.success) {
          return {
            ...prev,
            [parentId]: { ...current, loading: false, error: res.error },
          };
        }
        const existingIds = new Set(current.items.map((r) => r.id));
        const appended = res.replies.filter((r) => !existingIds.has(r.id));
        return {
          ...prev,
          [parentId]: {
            ...current,
            loading: false,
            items: [...current.items, ...appended],
            cursor: res.nextCursor,
            hasMore: res.hasMore,
          },
        };
      });
    },
    [replyThreads]
  );

  // Submit new top-level comment
  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      onShowToast({
        type: "info",
        message: "Sign in with Discord to post a comment.",
        action: { label: "Login", href: loginUrl },
      });
      return;
    }

    const validation = validateCommentText(composerText);
    if (!validation.valid) {
      setComposerError(validation.error || "Invalid comment.");
      return;
    }

    setComposerError(null);
    const outcome = await withActionLock(`post-comment:${chapter.id}`, async () => {
      setSubmittingComment(true);
      try {
        const supabase = createClient();
        return await createChapterComment(supabase, {
          chapterId: chapter.id,
          content: validation.normalized,
          isSpoiler: composerSpoiler,
        });
      } finally {
        setSubmittingComment(false);
      }
    });

    if (outcome.locked) return;
    const res = outcome.result;
    if (!res.success || !res.comment) {
      setComposerError(res.error || "Failed to post comment.");
      return;
    }

    const identity = extractUserIdentity(user);
    const newRow: CommentRow = {
      id: res.comment.id,
      chapter_id: res.comment.chapter_id,
      parent_id: null,
      content: res.comment.content,
      is_spoiler: res.comment.is_spoiler,
      is_deleted: false,
      created_at: res.comment.created_at,
      updated_at: res.comment.updated_at,
      like_count: 0,
      reply_count: 0,
      author_username: identity.username,
      author_display_name: identity.displayName,
      author_avatar_url: identity.avatarUrl,
      viewer_liked: false,
      is_own: true,
    };

    setComments((prev) => (sort === "oldest" && hasMore ? prev : [newRow, ...prev]));
    if (res.comment.is_spoiler) {
      setRevealedSpoilers((prev) => new Set(prev).add(newRow.id));
    }
    setComposerText("");
    setComposerSpoiler(false);
    onCommentCountDelta(1);
  };

  // Submit 1-level reply
  const handleSubmitReply = async (e: React.FormEvent, parentId: string) => {
    e.preventDefault();
    if (!user) {
      onShowToast({
        type: "info",
        message: "Sign in with Discord to reply.",
        action: { label: "Login", href: loginUrl },
      });
      return;
    }

    const validation = validateCommentText(replyText);
    if (!validation.valid) {
      setReplyError(validation.error || "Invalid reply.");
      return;
    }

    setReplyError(null);
    const outcome = await withActionLock(`post-reply:${parentId}`, async () => {
      setSubmittingReply(true);
      try {
        const supabase = createClient();
        return await createChapterComment(supabase, {
          chapterId: chapter.id,
          parentId,
          content: validation.normalized,
          isSpoiler: replySpoiler,
        });
      } finally {
        setSubmittingReply(false);
      }
    });

    if (outcome.locked) return;
    const res = outcome.result;
    if (!res.success || !res.comment) {
      setReplyError(res.error || "Failed to post reply.");
      return;
    }

    const identity = extractUserIdentity(user);
    const newReply: CommentRow = {
      id: res.comment.id,
      chapter_id: res.comment.chapter_id,
      parent_id: parentId,
      content: res.comment.content,
      is_spoiler: res.comment.is_spoiler,
      is_deleted: false,
      created_at: res.comment.created_at,
      updated_at: res.comment.updated_at,
      like_count: 0,
      reply_count: 0,
      author_username: identity.username,
      author_display_name: identity.displayName,
      author_avatar_url: identity.avatarUrl,
      viewer_liked: false,
      is_own: true,
    };

    setComments((prev) =>
      prev.map((c) =>
        c.id === parentId ? { ...c, reply_count: c.reply_count + 1 } : c
      )
    );

    setReplyThreads((prev) => {
      const existing = prev[parentId];
      return {
        ...prev,
        [parentId]: {
          expanded: true,
          loading: false,
          items: existing ? [...existing.items, newReply] : [newReply],
          cursor: existing?.cursor ?? null,
          hasMore: existing?.hasMore ?? false,
          initialized: true,
        },
      };
    });

    if (res.comment.is_spoiler) {
      setRevealedSpoilers((prev) => new Set(prev).add(newReply.id));
    }
    setReplyingToId(null);
    setReplyText("");
    setReplySpoiler(false);
    onCommentCountDelta(1);
  };

  // Toggle Like on a comment or reply (optimistic with rollback)
  const handleToggleCommentLike = async (target: CommentRow) => {
    if (!user) {
      onShowToast({
        type: "info",
        message: "Sign in with Discord to like comments.",
        action: { label: "Login", href: loginUrl },
      });
      return;
    }

    const nextLiked = !target.viewer_liked;
    const delta = nextLiked ? 1 : -1;

    const applyUpdate = (row: CommentRow): CommentRow =>
      row.id === target.id
        ? {
            ...row,
            viewer_liked: nextLiked,
            like_count: Math.max(0, row.like_count + delta),
          }
        : row;

    const rollbackUpdate = (row: CommentRow): CommentRow =>
      row.id === target.id
        ? {
            ...row,
            viewer_liked: target.viewer_liked,
            like_count: target.like_count,
          }
        : row;

    const outcome = await withActionLock(`comment-like:${target.id}`, async () => {
      if (target.parent_id) {
        const pid = target.parent_id;
        setReplyThreads((prev) =>
          prev[pid]
            ? { ...prev, [pid]: { ...prev[pid], items: prev[pid].items.map(applyUpdate) } }
            : prev
        );
      } else {
        setComments((prev) => prev.map(applyUpdate));
      }

      const supabase = createClient();
      const res = await setCommentLike(supabase, target.id, nextLiked);
      if (!res.success) {
        if (target.parent_id) {
          const pid = target.parent_id;
          setReplyThreads((prev) =>
            prev[pid]
              ? { ...prev, [pid]: { ...prev[pid], items: prev[pid].items.map(rollbackUpdate) } }
              : prev
          );
        } else {
          setComments((prev) => prev.map(rollbackUpdate));
        }
        onShowToast({
          type: "error",
          message: res.error || "Couldn't update comment like.",
        });
      }
      return res;
    });

    void outcome;
  };

  // Save edited comment
  const handleSaveEdit = async (target: CommentRow) => {
    const validation = validateCommentText(editText);
    if (!validation.valid) {
      onShowToast({ type: "error", message: validation.error || "Invalid comment." });
      return;
    }

    setSubmittingEdit(true);
    const supabase = createClient();
    const res = await editOwnComment(supabase, {
      commentId: target.id,
      content: validation.normalized,
      isSpoiler: editSpoiler,
    });
    setSubmittingEdit(false);

    if (!res.success || !res.updated) {
      onShowToast({
        type: "error",
        message: res.error || "Couldn't update comment.",
      });
      return;
    }

    const patchRow = (row: CommentRow): CommentRow =>
      row.id === target.id
        ? {
            ...row,
            content: res.updated!.content,
            is_spoiler: res.updated!.is_spoiler,
            updated_at: res.updated!.updated_at,
          }
        : row;

    if (target.parent_id) {
      const pid = target.parent_id;
      setReplyThreads((prev) =>
        prev[pid]
          ? { ...prev, [pid]: { ...prev[pid], items: prev[pid].items.map(patchRow) } }
          : prev
      );
    } else {
      setComments((prev) => prev.map(patchRow));
    }

    setEditingCommentId(null);
    onShowToast({ type: "success", message: "Comment updated." });
  };

  // Soft-delete own comment
  const handleDeleteComment = async (target: CommentRow) => {
    const outcome = await withActionLock(`delete-comment:${target.id}`, async () => {
      const supabase = createClient();
      return await deleteOwnComment(supabase, target.id);
    });

    if (outcome.locked) return;
    if (!outcome.result.success) {
      onShowToast({
        type: "error",
        message: outcome.result.error || "Couldn't delete comment.",
      });
      return;
    }

    if (target.parent_id) {
      const pid = target.parent_id;
      setReplyThreads((prev) =>
        prev[pid]
          ? {
              ...prev,
              [pid]: {
                ...prev[pid],
                items: prev[pid].items.filter((r) => r.id !== target.id),
              },
            }
          : prev
      );
      setComments((prev) =>
        prev.map((c) =>
          c.id === pid ? { ...c, reply_count: Math.max(0, c.reply_count - 1) } : c
        )
      );
    } else {
      setComments((prev) =>
        prev
          .map((c) =>
            c.id === target.id
              ? {
                  ...c,
                  is_deleted: true,
                  content: "",
                  is_spoiler: false,
                  author_username: null,
                  author_display_name: null,
                  author_avatar_url: null,
                  is_own: false,
                }
              : c
          )
          .filter((c) => !c.is_deleted || c.reply_count > 0)
      );
    }

    onCommentCountDelta(-1);
    onShowToast({ type: "success", message: "Comment deleted." });
  };

  // Submit moderation report
  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportingComment || !user) return;

    setSubmittingReport(true);
    const supabase = createClient();
    const res = await reportComment(supabase, {
      commentId: reportingComment.id,
      reason: reportReason,
      details: reportDetails,
    });
    setSubmittingReport(false);

    if (!res.success) {
      onShowToast({
        type: "error",
        message: res.error || "Couldn't submit report.",
      });
      return;
    }

    setReportingComment(null);
    setReportDetails("");
    onShowToast({
      type: "success",
      message: res.alreadyReported
        ? "You have already reported this comment. Thank you."
        : "Report submitted for review. Thank you for keeping the community safe.",
    });
  };

  const toggleRevealSpoiler = (commentId: string) => {
    setRevealedSpoilers((prev) => {
      const next = new Set(prev);
      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }
      return next;
    });
  };

  const renderCommentCard = (item: CommentRow, isReply = false) => {
    const isSpoilerConcealed = item.is_spoiler && !revealedSpoilers.has(item.id);
    const isEditing = editingCommentId === item.id;
    const isMenuOpen = openMenuId === item.id;
    const authorLabel =
      item.author_display_name || item.author_username || "Cultivator";
    const wasEdited =
      !item.is_deleted &&
      new Date(item.updated_at).getTime() - new Date(item.created_at).getTime() > 2000;

    return (
      <div
        key={item.id}
        data-testid={isReply ? "comment-reply-card" : "comment-card"}
        className={`rounded-xl border ${drawerBorder} ${cardBg} p-3 transition-colors ${
          isReply ? "ml-6 mt-2 border-l-2 border-l-[#89b4fa]/40" : ""
        }`}
      >
        {/* Card Header: Avatar, Username, Timestamp, Spoiler badge, More menu */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center space-x-2">
            <div className="relative h-6 w-6 flex-shrink-0 overflow-hidden rounded-full border border-[#45475a] bg-[#313244]">
              {item.author_avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.author_avatar_url}
                  alt={authorLabel}
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-[10px] font-mono text-[#89b4fa]">
                  <UserIcon className="h-3.5 w-3.5" />
                </div>
              )}
            </div>

            <div className="flex min-w-0 flex-wrap items-baseline gap-x-1.5">
              <span className={`truncate text-xs font-semibold ${textPrimary}`}>
                {item.is_deleted ? "[Deleted]" : authorLabel}
              </span>
              {!item.is_deleted && item.author_username && (
                <span className={`truncate font-mono text-[10px] ${textSecondary}`}>
                  @{item.author_username}
                </span>
              )}
              <span className={`font-mono text-[10px] ${textSecondary}`}>
                &bull; {formatRelativeTimestamp(item.created_at)}
              </span>
              {wasEdited && (
                <span className={`font-mono text-[9px] italic ${textSecondary}`}>
                  (edited)
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-1">
            {item.is_spoiler && !item.is_deleted && (
              <span
                data-testid="comment-spoiler-badge"
                className="inline-flex items-center space-x-1 rounded-full border border-[#f9e2af]/40 bg-[#f9e2af]/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#f9e2af]"
              >
                <AlertTriangle className="h-2.5 w-2.5" />
                <span>Spoiler</span>
              </span>
            )}

            {!item.is_deleted && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenuId(isMenuOpen ? null : item.id)}
                  aria-label="Comment actions"
                  aria-expanded={isMenuOpen}
                  data-testid="comment-more-btn"
                  className={`rounded-lg p-1 ${textSecondary} hover:bg-[#313244]/60 hover:text-white focus:outline-none`}
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>

                {isMenuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 top-full z-30 mt-1 w-36 rounded-xl border border-[#45475a] bg-[#181825] p-1 shadow-xl"
                  >
                    {item.is_own && (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            setEditingCommentId(item.id);
                            setEditText(item.content);
                            setEditSpoiler(item.is_spoiler);
                          }}
                          className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#cdd6f4] hover:bg-[#313244]"
                        >
                          <Pencil className="h-3 w-3 text-[#89b4fa]" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setOpenMenuId(null);
                            void handleDeleteComment(item);
                          }}
                          className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#f38ba8] hover:bg-[#f38ba8]/10"
                        >
                          <Trash2 className="h-3 w-3" />
                          <span>Delete</span>
                        </button>
                      </>
                    )}
                    {!item.is_own && (
                      <button
                        type="button"
                        onClick={() => {
                          setOpenMenuId(null);
                          if (!user) {
                            onShowToast({
                              type: "info",
                              message: "Sign in with Discord to report comments.",
                              action: { label: "Login", href: loginUrl },
                            });
                            return;
                          }
                          setReportingComment(item);
                          setReportReason("spam");
                          setReportDetails("");
                        }}
                        className="flex w-full items-center space-x-2 rounded-lg px-2.5 py-1.5 text-left text-xs text-[#f9e2af] hover:bg-[#313244]"
                      >
                        <Flag className="h-3 w-3" />
                        <span>Report</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Body: Deleted notice, Edit form, Spoiler guard, or Plain text */}
        <div className="mt-2">
          {item.is_deleted ? (
            <p className={`text-xs italic ${textSecondary}`}>
              This comment was deleted by its author.
            </p>
          ) : isEditing ? (
            <div className="space-y-2">
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                maxLength={COMMENT_MAX_LENGTH}
                rows={3}
                className={`w-full rounded-lg border ${drawerBorder} ${inputBg} p-2 text-xs ${textPrimary} focus:border-[#89b4fa] focus:outline-none`}
              />
              <div className="flex items-center justify-between gap-2">
                <label className="inline-flex cursor-pointer items-center space-x-1.5 text-[11px] text-[#f9e2af]">
                  <input
                    type="checkbox"
                    checked={editSpoiler}
                    onChange={(e) => setEditSpoiler(e.target.checked)}
                    className="rounded border-[#45475a] bg-[#181825]"
                  />
                  <span>Contains spoilers</span>
                </label>

                <div className="flex items-center space-x-2">
                  <button
                    type="button"
                    onClick={() => setEditingCommentId(null)}
                    className={`rounded-lg px-2.5 py-1 text-xs ${textSecondary} hover:text-white`}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    disabled={submittingEdit}
                    onClick={() => void handleSaveEdit(item)}
                    className="inline-flex items-center space-x-1 rounded-lg bg-[#89b4fa] px-3 py-1 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] disabled:opacity-50"
                  >
                    {submittingEdit && <Loader2 className="h-3 w-3 animate-spin" />}
                    <span>Save</span>
                  </button>
                </div>
              </div>
            </div>
          ) : isSpoilerConcealed ? (
            <button
              type="button"
              onClick={() => toggleRevealSpoiler(item.id)}
              data-testid="reveal-spoiler-btn"
              className="flex w-full items-center justify-between rounded-lg border border-[#f9e2af]/30 bg-[#f9e2af]/10 px-3 py-2 text-left text-xs text-[#f9e2af] hover:bg-[#f9e2af]/15 transition-colors"
            >
              <span className="inline-flex items-center space-x-2 font-medium">
                <Eye className="h-3.5 w-3.5 flex-shrink-0" />
                <span>Spoiler concealed — Click to reveal comment</span>
              </span>
              <span className="font-mono text-[10px] uppercase tracking-wider underline">
                Reveal
              </span>
            </button>
          ) : (
            <div>
              <p
                data-testid="comment-content-text"
                className={`whitespace-pre-wrap break-words text-xs leading-relaxed ${textPrimary}`}
              >
                {item.content}
              </p>
              {item.is_spoiler && (
                <button
                  type="button"
                  onClick={() => toggleRevealSpoiler(item.id)}
                  className="mt-1 inline-flex items-center space-x-1 font-mono text-[10px] text-[#f9e2af]/80 hover:text-[#f9e2af]"
                >
                  <EyeOff className="h-3 w-3" />
                  <span>Hide spoiler</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer actions: Like, Reply (top-level only), Show/Hide replies */}
        {!item.is_deleted && (
          <div className="mt-2.5 flex items-center space-x-4">
            <button
              type="button"
              onClick={() => void handleToggleCommentLike(item)}
              aria-label={item.viewer_liked ? "Unlike comment" : "Like comment"}
              aria-pressed={item.viewer_liked}
              data-testid="comment-like-btn"
              className={`inline-flex items-center space-x-1 font-mono text-[11px] transition-colors ${
                item.viewer_liked
                  ? "text-[#f38ba8] font-semibold"
                  : `${textSecondary} hover:text-[#f38ba8]`
              }`}
            >
              <Heart
                className={`h-3.5 w-3.5 ${
                  item.viewer_liked ? "fill-[#f38ba8] text-[#f38ba8]" : ""
                }`}
              />
              <span>{item.like_count > 0 ? item.like_count : "Like"}</span>
            </button>

            {!isReply && (
              <button
                type="button"
                onClick={() => {
                  if (replyingToId === item.id) {
                    setReplyingToId(null);
                  } else {
                    setReplyingToId(item.id);
                    setReplyText("");
                    setReplySpoiler(false);
                    setReplyError(null);
                  }
                }}
                data-testid="comment-reply-btn"
                className={`inline-flex items-center space-x-1 font-mono text-[11px] ${textSecondary} hover:text-[#89b4fa] transition-colors`}
              >
                <MessageSquareReply className="h-3.5 w-3.5" />
                <span>Reply</span>
              </button>
            )}

            {!isReply && item.reply_count > 0 && (
              <button
                type="button"
                onClick={() => void handleToggleReplies(item.id)}
                data-testid="toggle-replies-btn"
                className="inline-flex items-center space-x-1 font-mono text-[11px] font-medium text-[#89b4fa] hover:underline"
              >
                {replyThreads[item.id]?.expanded ? (
                  <>
                    <ChevronUp className="h-3.5 w-3.5" />
                    <span>Hide replies ({item.reply_count})</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-3.5 w-3.5" />
                    <span>
                      Show {item.reply_count}{" "}
                      {item.reply_count === 1 ? "reply" : "replies"}
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        )}

        {/* Even if parent was soft-deleted, allow viewing its replies */}
        {item.is_deleted && !isReply && item.reply_count > 0 && (
          <div className="mt-2">
            <button
              type="button"
              onClick={() => void handleToggleReplies(item.id)}
              data-testid="toggle-replies-btn"
              className="inline-flex items-center space-x-1 font-mono text-[11px] font-medium text-[#89b4fa] hover:underline"
            >
              {replyThreads[item.id]?.expanded ? (
                <>
                  <ChevronUp className="h-3.5 w-3.5" />
                  <span>Hide replies ({item.reply_count})</span>
                </>
              ) : (
                <>
                  <ChevronDown className="h-3.5 w-3.5" />
                  <span>
                    Show {item.reply_count}{" "}
                    {item.reply_count === 1 ? "reply" : "replies"}
                  </span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Inline 1-level Reply Composer */}
        {!isReply && replyingToId === item.id && (
          <form
            onSubmit={(e) => void handleSubmitReply(e, item.id)}
            data-testid="reply-composer-form"
            className={`mt-3 rounded-xl border ${drawerBorder} ${inputBg} p-2.5`}
          >
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Reply to ${authorLabel}...`}
              maxLength={COMMENT_MAX_LENGTH}
              rows={2}
              className={`w-full resize-none bg-transparent text-xs ${textPrimary} placeholder-[#6c7086] focus:outline-none`}
            />
            {replyError && (
              <p className="mt-1 text-[11px] text-[#f38ba8]">{replyError}</p>
            )}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#313244]/60 pt-2">
              <div className="flex items-center space-x-3">
                <label className="inline-flex cursor-pointer items-center space-x-1.5 text-[11px] text-[#f9e2af]">
                  <input
                    type="checkbox"
                    checked={replySpoiler}
                    onChange={(e) => setReplySpoiler(e.target.checked)}
                    className="rounded border-[#45475a]"
                  />
                  <span>Spoiler</span>
                </label>
                <span className={`font-mono text-[10px] ${textSecondary}`}>
                  {replyText.length}/{COMMENT_MAX_LENGTH}
                </span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={() => setReplyingToId(null)}
                  className={`rounded-lg px-2 py-1 text-[11px] ${textSecondary} hover:text-white`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="inline-flex items-center space-x-1 rounded-lg bg-[#89b4fa] px-2.5 py-1 text-[11px] font-semibold text-[#11111b] hover:bg-[#b4befe] disabled:opacity-40"
                >
                  {submittingReply ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Send className="h-3 w-3" />
                  )}
                  <span>Reply</span>
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Threaded Replies List (1 level) */}
        {!isReply && replyThreads[item.id]?.expanded && (
          <div className="mt-2 space-y-2">
            {replyThreads[item.id].items.map((reply) =>
              renderCommentCard(reply, true)
            )}

            {replyThreads[item.id].loading && (
              <div className="ml-6 flex items-center space-x-2 py-2 text-xs text-[#a6adc8]">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#89b4fa]" />
                <span>Loading replies...</span>
              </div>
            )}

            {replyThreads[item.id].hasMore && !replyThreads[item.id].loading && (
              <button
                type="button"
                onClick={() => void handleLoadMoreReplies(item.id)}
                className="ml-6 font-mono text-[11px] font-medium text-[#89b4fa] hover:underline"
              >
                Load more replies
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end pointer-events-none"
      role="dialog"
      aria-modal="true"
      aria-labelledby="chapter-comments-heading"
      data-testid="comments-drawer"
    >
      {/* Subtle backdrop: click to close while keeping reader visible on desktop */}
      <div
        onClick={onClose}
        aria-hidden="true"
        className="fixed inset-0 bg-black/40 sm:bg-black/25 backdrop-blur-[1px] pointer-events-auto transition-opacity"
      />

      {/* Drawer Panel: Full height overlay on mobile, right-side drawer on desktop */}
      <div
        className={`relative z-10 flex h-full w-full sm:w-[420px] md:w-[450px] flex-col border-l ${drawerBorder} ${drawerBg} ${textPrimary} shadow-2xl pointer-events-auto animate-in slide-in-from-right duration-200`}
        style={{
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
      >
        {/* Header: Chapter number, Chapter title, Total comment count, Close button */}
        <header className={`flex items-start justify-between gap-3 border-b ${drawerBorder} px-4 py-3.5`}>
          <div className="min-w-0 flex-1">
            <div className="flex items-center space-x-2">
              <span className="rounded-md border border-[#89b4fa]/40 bg-[#89b4fa]/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-[#89b4fa]">
                Chapter {chapter.number}
              </span>
              <span
                data-testid="drawer-comment-count"
                className={`font-mono text-xs ${textSecondary}`}
              >
                {totalCommentCount.toLocaleString()}{" "}
                {totalCommentCount === 1 ? "Comment" : "Comments"}
              </span>
            </div>
            <h2
              id="chapter-comments-heading"
              className="mt-1 truncate font-serif text-sm font-semibold"
              title={chapter.title}
            >
              {chapter.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close comments drawer"
            data-testid="close-comments-drawer-btn"
            className={`rounded-lg p-1.5 ${textSecondary} hover:bg-[#313244]/60 hover:text-white focus:outline-none`}
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Sorting Bar: Top, Newest, Oldest */}
        <div
          className={`flex items-center justify-between border-b ${drawerBorder} px-4 py-2 text-xs`}
        >
          <span className={`font-mono text-[11px] ${textSecondary}`}>Sort by</span>
          <div className="flex items-center space-x-1" role="tablist" aria-label="Sort comments">
            {(["top", "newest", "oldest"] as const).map((option) => {
              const active = sort === option;
              return (
                <button
                  key={option}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  data-testid={`sort-comments-${option}`}
                  onClick={() => setSort(option)}
                  className={`rounded-lg px-2.5 py-1 font-mono text-[11px] capitalize transition-colors ${
                    active
                      ? "bg-[#89b4fa]/20 text-[#89b4fa] font-semibold"
                      : `${textSecondary} hover:bg-[#313244]/50 hover:text-white`
                  }`}
                >
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Scrollable Comments List */}
        <div
          ref={listContainerRef}
          onScroll={handleScrollList}
          className="flex-1 overflow-y-auto px-4 py-3 space-y-3"
        >
          {loadingInitial ? (
            <div className="space-y-3 py-4" data-testid="comments-loading-state">
              {[0, 1, 2].map((idx) => (
                <div
                  key={idx}
                  className={`animate-pulse rounded-xl border ${drawerBorder} ${cardBg} p-3 space-y-2`}
                >
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-full bg-[#313244]" />
                    <div className="h-3 w-28 rounded bg-[#313244]" />
                  </div>
                  <div className="h-3 w-full rounded bg-[#313244]" />
                  <div className="h-3 w-3/4 rounded bg-[#313244]" />
                </div>
              ))}
            </div>
          ) : loadError ? (
            <div
              data-testid="comments-error-state"
              className="my-8 rounded-xl border border-[#f38ba8]/40 bg-[#f38ba8]/10 p-5 text-center"
            >
              <p className="text-xs text-[#f38ba8]">{loadError}</p>
              <button
                type="button"
                onClick={() => void loadInitialComments(chapter.id, sort)}
                className="mt-3 inline-flex items-center space-x-1.5 rounded-lg bg-[#89b4fa] px-3 py-1.5 text-xs font-semibold text-[#11111b]"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Retry</span>
              </button>
            </div>
          ) : comments.length === 0 ? (
            <div
              data-testid="comments-empty-state"
              className="flex flex-col items-center justify-center py-14 text-center"
            >
              <p className={`font-serif text-sm font-medium ${textPrimary}`}>
                No thoughts recorded on Chapter {chapter.number} yet.
              </p>
              <p className={`mt-1 text-xs ${textSecondary}`}>
                Be the first cultivator to leave a comment on this chapter.
              </p>
            </div>
          ) : (
            <>
              {comments.map((comment) => renderCommentCard(comment, false))}

              {hasMore && (
                <div className="pt-2 pb-4 text-center">
                  <button
                    type="button"
                    onClick={() => void handleLoadMoreComments()}
                    disabled={loadingMore}
                    data-testid="load-more-comments-btn"
                    className={`inline-flex items-center space-x-2 rounded-xl border ${drawerBorder} ${cardBg} px-4 py-2 font-mono text-xs ${textPrimary} hover:border-[#89b4fa] transition-colors disabled:opacity-50`}
                  >
                    {loadingMore ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-[#89b4fa]" />
                        <span>Loading...</span>
                      </>
                    ) : (
                      <span>Load more comments</span>
                    )}
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Bottom Comment Composer */}
        <footer className={`border-t ${drawerBorder} p-3.5`}>
          {user ? (
            <form
              onSubmit={(e) => void handleSubmitComment(e)}
              data-testid="comment-composer-form"
            >
              <div className={`rounded-xl border ${drawerBorder} ${inputBg} p-2.5 focus-within:border-[#89b4fa]`}>
                <textarea
                  value={composerText}
                  onChange={(e) => {
                    setComposerText(e.target.value);
                    if (composerError) setComposerError(null);
                  }}
                  placeholder={`Share your thoughts on Chapter ${chapter.number}...`}
                  maxLength={COMMENT_MAX_LENGTH}
                  rows={2}
                  data-testid="comment-composer-input"
                  className={`w-full resize-none bg-transparent text-xs ${textPrimary} placeholder-[#6c7086] focus:outline-none`}
                />

                {composerError && (
                  <p className="mt-1 text-[11px] text-[#f38ba8]" role="alert">
                    {composerError}
                  </p>
                )}

                <div className="mt-2 flex items-center justify-between gap-2 border-t border-[#313244]/60 pt-2">
                  <div className="flex items-center space-x-3">
                    <label className="inline-flex cursor-pointer items-center space-x-1.5 text-[11px] text-[#f9e2af]">
                      <input
                        type="checkbox"
                        checked={composerSpoiler}
                        onChange={(e) => setComposerSpoiler(e.target.checked)}
                        data-testid="comment-spoiler-checkbox"
                        className="rounded border-[#45475a]"
                      />
                      <span>Mark as spoiler</span>
                    </label>
                    <span
                      data-testid="comment-char-counter"
                      className={`font-mono text-[10px] ${
                        composerText.length >= COMMENT_MAX_LENGTH
                          ? "text-[#f38ba8]"
                          : textSecondary
                      }`}
                    >
                      {composerText.length}/{COMMENT_MAX_LENGTH}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={submittingComment || !composerText.trim()}
                    data-testid="comment-submit-btn"
                    className="inline-flex items-center space-x-1.5 rounded-lg bg-[#89b4fa] px-3 py-1.5 text-xs font-semibold text-[#11111b] hover:bg-[#b4befe] transition-colors disabled:opacity-40"
                  >
                    {submittingComment ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Send className="h-3.5 w-3.5" />
                    )}
                    <span>Post</span>
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div
              data-testid="comment-auth-prompt"
              className={`flex items-center justify-between rounded-xl border ${drawerBorder} ${cardBg} px-3.5 py-2.5`}
            >
              <span className={`text-xs ${textSecondary}`}>
                Sign in with Discord to join the chapter discussion.
              </span>
              <Link
                href={loginUrl}
                className="inline-flex items-center space-x-1.5 rounded-lg bg-[#5865F2] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#4752c4] transition-colors"
              >
                <LogIn className="h-3.5 w-3.5" />
                <span>Login</span>
              </Link>
            </div>
          )}
        </footer>

        {/* Report Comment Modal Overlay */}
        {reportingComment && (
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Report comment"
            data-testid="report-comment-modal"
            className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <form
              onSubmit={(e) => void handleSubmitReport(e)}
              className={`w-full max-w-sm rounded-2xl border ${drawerBorder} ${drawerBg} p-5 shadow-2xl`}
            >
              <div className="flex items-center justify-between border-b border-[#313244] pb-3">
                <div className="flex items-center space-x-2">
                  <Flag className="h-4 w-4 text-[#f9e2af]" />
                  <h3 className="font-serif text-sm font-semibold">Report Comment</h3>
                </div>
                <button
                  type="button"
                  onClick={() => setReportingComment(null)}
                  className={`${textSecondary} hover:text-white`}
                  aria-label="Close report dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-2">
                <p className={`text-xs ${textSecondary}`}>
                  Select a reason for reporting this comment:
                </p>
                {REPORT_REASON_DEFINITIONS.map((item) => (
                  <label
                    key={item.reason}
                    className={`flex cursor-pointer items-start space-x-2.5 rounded-xl border p-2.5 text-xs transition-colors ${
                      reportReason === item.reason
                        ? "border-[#89b4fa] bg-[#89b4fa]/10"
                        : `${drawerBorder} ${cardBg}`
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-reason"
                      value={item.reason}
                      checked={reportReason === item.reason}
                      onChange={() => setReportReason(item.reason)}
                      className="mt-0.5"
                    />
                    <div>
                      <div className={`font-medium ${textPrimary}`}>{item.label}</div>
                      <div className={`text-[11px] ${textSecondary}`}>
                        {item.description}
                      </div>
                    </div>
                  </label>
                ))}

                <div className="pt-1">
                  <textarea
                    value={reportDetails}
                    onChange={(e) => setReportDetails(e.target.value)}
                    placeholder="Optional details (up to 500 characters)..."
                    maxLength={REPORT_DETAILS_MAX_LENGTH}
                    rows={2}
                    className={`w-full rounded-lg border ${drawerBorder} ${inputBg} p-2 text-xs ${textPrimary} placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none`}
                  />
                </div>
              </div>

              <div className="mt-4 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setReportingComment(null)}
                  className={`rounded-lg px-3 py-1.5 text-xs ${textSecondary} hover:text-white`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReport}
                  data-testid="submit-report-btn"
                  className="inline-flex items-center space-x-1.5 rounded-lg bg-[#f38ba8] px-3.5 py-1.5 text-xs font-semibold text-[#11111b] hover:opacity-90 disabled:opacity-50"
                >
                  {submittingReport && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  <span>Submit Report</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
