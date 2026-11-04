import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  ReactionType,
  CommentSortOrder,
  CommentReportReason,
  CommentRow,
  ChapterSocialSummaryRow,
} from "../../types/database.ts";

export type {
  ReactionType,
  CommentSortOrder,
  CommentReportReason,
  CommentRow,
};

export const COMMENT_MAX_LENGTH = 1000;
export const REPORT_DETAILS_MAX_LENGTH = 500;
export const COMMENTS_PAGE_SIZE = 20;
export const REPLIES_PAGE_SIZE = 10;

export const REACTION_DEFINITIONS: ReadonlyArray<{
  type: ReactionType;
  emoji: string;
  label: string;
}> = [
  { type: "love", emoji: "❤️", label: "Love" },
  { type: "funny", emoji: "😂", label: "Funny" },
  { type: "shock", emoji: "😮", label: "Shock" },
  { type: "sad", emoji: "😢", label: "Sad" },
  { type: "fire", emoji: "🔥", label: "Fire" },
];

export const REPORT_REASON_DEFINITIONS: ReadonlyArray<{
  reason: CommentReportReason;
  label: string;
  description: string;
}> = [
  { reason: "spam", label: "Spam", description: "Repetitive, promotional, or bot content" },
  { reason: "harassment", label: "Harassment", description: "Abusive or targeted attacks" },
  { reason: "inappropriate", label: "Inappropriate content", description: "NSFW, hateful, or harmful material" },
  { reason: "spoiler", label: "Spoilers", description: "Unmarked spoilers for future chapters" },
  { reason: "other", label: "Other", description: "Something else that violates community standards" },
];

export interface ChapterSocialState {
  chapterId: string;
  likeCount: number;
  commentCount: number;
  reactionCounts: Record<ReactionType, number>;
  totalReactions: number;
  viewerLiked: boolean;
  viewerReaction: ReactionType | null;
}

export interface CommentCursor {
  likeCount: number;
  createdAt: string;
  id: string;
}

export interface ReplyCursor {
  createdAt: string;
  id: string;
}

export interface CommentsPageResult {
  success: boolean;
  comments: CommentRow[];
  nextCursor: CommentCursor | null;
  hasMore: boolean;
  error?: string;
}

export interface RepliesPageResult {
  success: boolean;
  replies: CommentRow[];
  nextCursor: ReplyCursor | null;
  hasMore: boolean;
  error?: string;
}

const VALID_REACTIONS = new Set<ReactionType>(["love", "funny", "shock", "sad", "fire"]);
const VALID_SORTS = new Set<CommentSortOrder>(["top", "newest", "oldest"]);
const VALID_REASONS = new Set<CommentReportReason>([
  "spam",
  "harassment",
  "inappropriate",
  "spoiler",
  "other",
]);
const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const DISCORD_AVATAR_REGEX =
  /^https:\/\/cdn\.discordapp\.com\/[A-Za-z0-9_./-]+(\?[A-Za-z0-9=&_.-]*)?$/;

export function isValidChapterId(chapterId: string | number): boolean {
  const str = String(chapterId);
  if (!/^[1-9][0-9]{0,3}$/.test(str)) return false;
  const num = Number(str);
  return Number.isInteger(num) && num >= 1 && num <= 2334;
}

export function isValidUuid(id: string | null | undefined): id is string {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export function isValidReactionType(value: unknown): value is ReactionType {
  return typeof value === "string" && VALID_REACTIONS.has(value as ReactionType);
}

export function isValidReportReason(value: unknown): value is CommentReportReason {
  return typeof value === "string" && VALID_REASONS.has(value as CommentReportReason);
}

export function sanitizeAvatarUrl(url: string | null | undefined): string | null {
  if (!url || typeof url !== "string" || url.length > 300) return null;
  return DISCORD_AVATAR_REGEX.test(url) ? url : null;
}

export function normalizeCommentText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function validateCommentText(raw: string): {
  valid: boolean;
  normalized: string;
  error?: string;
} {
  const normalized = normalizeCommentText(raw);
  if (!normalized || !/\S/.test(normalized)) {
    return { valid: false, normalized, error: "Comment cannot be empty." };
  }
  if (normalized.length > COMMENT_MAX_LENGTH) {
    return {
      valid: false,
      normalized,
      error: `Comment cannot exceed ${COMMENT_MAX_LENGTH} characters.`,
    };
  }
  return { valid: true, normalized };
}

export function emptyReactionCounts(): Record<ReactionType, number> {
  return { love: 0, funny: 0, shock: 0, sad: 0, fire: 0 };
}

export function createDefaultChapterSocialState(chapterId: string | number): ChapterSocialState {
  return {
    chapterId: String(chapterId),
    likeCount: 0,
    commentCount: 0,
    reactionCounts: emptyReactionCounts(),
    totalReactions: 0,
    viewerLiked: false,
    viewerReaction: null,
  };
}

// Short-lived cache for chapter social summaries to prevent redundant fetches
// when flipping back and forth between chapters.
const SOCIAL_CACHE_TTL_MS = 15_000;
const socialSummaryCache = new Map<
  string,
  { state: ChapterSocialState; expiresAt: number }
>();

function getCacheKey(chapterId: string, viewerScope: string): string {
  return `${viewerScope}:${chapterId}`;
}

export function getCachedChapterSocial(
  chapterId: string | number,
  viewerId?: string | null
): ChapterSocialState | null {
  const key = getCacheKey(String(chapterId), viewerId || "anon");
  const entry = socialSummaryCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    socialSummaryCache.delete(key);
    return null;
  }
  return entry.state;
}

export function setCachedChapterSocial(
  state: ChapterSocialState,
  viewerId?: string | null
): void {
  const key = getCacheKey(state.chapterId, viewerId || "anon");
  if (socialSummaryCache.size > 100) {
    const firstKey = socialSummaryCache.keys().next().value;
    if (firstKey) socialSummaryCache.delete(firstKey);
  }
  socialSummaryCache.set(key, {
    state,
    expiresAt: Date.now() + SOCIAL_CACHE_TTL_MS,
  });
}

export function clearChapterSocialCache(): void {
  socialSummaryCache.clear();
}

// In-flight action lock to prevent duplicate network requests from rapid clicks.
const inFlightLocks = new Set<string>();

export function isActionLocked(lockKey: string): boolean {
  return inFlightLocks.has(lockKey);
}

export async function withActionLock<T>(
  lockKey: string,
  fn: () => Promise<T>
): Promise<{ locked: true } | { locked: false; result: T }> {
  if (inFlightLocks.has(lockKey)) {
    return { locked: true };
  }
  inFlightLocks.add(lockKey);
  try {
    const result = await fn();
    return { locked: false, result };
  } finally {
    inFlightLocks.delete(lockKey);
  }
}

function normalizeSummaryRow(
  chapterId: string,
  row: Partial<ChapterSocialSummaryRow> | null | undefined
): ChapterSocialState {
  const counts = emptyReactionCounts();
  let totalReactions = 0;
  if (row?.reaction_counts && typeof row.reaction_counts === "object") {
    for (const { type } of REACTION_DEFINITIONS) {
      const rawVal = Number(row.reaction_counts[type] ?? 0);
      const safeVal = Number.isFinite(rawVal) && rawVal > 0 ? Math.floor(rawVal) : 0;
      counts[type] = safeVal;
      totalReactions += safeVal;
    }
  }
  const likeCount = Math.max(0, Math.floor(Number(row?.like_count ?? 0) || 0));
  const commentCount = Math.max(0, Math.floor(Number(row?.comment_count ?? 0) || 0));
  const viewerReaction = isValidReactionType(row?.viewer_reaction)
    ? row.viewer_reaction
    : null;

  return {
    chapterId,
    likeCount,
    commentCount,
    reactionCounts: counts,
    totalReactions,
    viewerLiked: Boolean(row?.viewer_liked),
    viewerReaction,
  };
}

function sanitizeCommentRow(row: CommentRow): CommentRow {
  return {
    ...row,
    like_count: Math.max(0, Math.floor(Number(row.like_count ?? 0) || 0)),
    reply_count: Math.max(0, Math.floor(Number(row.reply_count ?? 0) || 0)),
    author_avatar_url: sanitizeAvatarUrl(row.author_avatar_url),
    viewer_liked: Boolean(row.viewer_liked),
    is_own: Boolean(row.is_own),
  };
}

/**
 * Fetches aggregate likes, comment count, reaction counts, and viewer status
 * for a single chapter in one round-trip.
 */
export async function fetchChapterSocial(
  supabase: SupabaseClient<any>,
  chapterId: string | number,
  options?: { viewerId?: string | null; bypassCache?: boolean }
): Promise<{ success: boolean; state: ChapterSocialState; error?: string }> {
  const idStr = String(chapterId);
  const fallback = createDefaultChapterSocialState(idStr);
  if (!isValidChapterId(idStr)) {
    return { success: false, state: fallback, error: "Invalid chapter ID." };
  }

  if (!options?.bypassCache) {
    const cached = getCachedChapterSocial(idStr, options?.viewerId);
    if (cached) {
      return { success: true, state: cached };
    }
  }

  try {
    const { data, error } = await supabase.rpc("get_chapter_social", {
      p_chapter_id: idStr,
    });

    if (error) {
      return {
        success: false,
        state: fallback,
        error: "Unable to load chapter interactions.",
      };
    }

    const row = Array.isArray(data) ? data[0] : data;
    const state = normalizeSummaryRow(idStr, row);
    setCachedChapterSocial(state, options?.viewerId);
    return { success: true, state };
  } catch {
    return {
      success: false,
      state: fallback,
      error: "Network error loading chapter interactions.",
    };
  }
}

/**
 * Likes or unlikes a chapter for the current authenticated user.
 * Ownership is enforced server-side via auth.uid().
 */
export async function setChapterLike(
  supabase: SupabaseClient<any>,
  chapterId: string | number,
  shouldLike: boolean
): Promise<{ success: boolean; error?: string }> {
  const idStr = String(chapterId);
  if (!isValidChapterId(idStr)) {
    return { success: false, error: "Invalid chapter ID." };
  }

  try {
    if (shouldLike) {
      const { error } = await supabase
        .from("chapter_likes")
        .insert({ chapter_id: idStr });
      // 23505 = unique_violation (already liked) -> treat as idempotent success
      if (error && error.code !== "23505") {
        return { success: false, error: "Couldn't update chapter like. Please try again." };
      }
      return { success: true };
    } else {
      const { error } = await supabase
        .from("chapter_likes")
        .delete()
        .eq("chapter_id", idStr);
      if (error) {
        return { success: false, error: "Couldn't update chapter like. Please try again." };
      }
      return { success: true };
    }
  } catch {
    return { success: false, error: "Network error updating chapter like." };
  }
}

/**
 * Sets, changes, or removes (when reaction is null) the current user's reaction
 * on a chapter via the idempotent set_chapter_reaction RPC.
 */
export async function updateChapterReaction(
  supabase: SupabaseClient<any>,
  chapterId: string | number,
  reaction: ReactionType | null
): Promise<{ success: boolean; reaction: ReactionType | null; error?: string }> {
  const idStr = String(chapterId);
  if (!isValidChapterId(idStr)) {
    return { success: false, reaction: null, error: "Invalid chapter ID." };
  }
  if (reaction !== null && !isValidReactionType(reaction)) {
    return { success: false, reaction: null, error: "Invalid reaction type." };
  }

  try {
    const { data, error } = await supabase.rpc("set_chapter_reaction", {
      p_chapter_id: idStr,
      p_reaction_type: reaction,
    });

    if (error) {
      return {
        success: false,
        reaction: null,
        error: "Couldn't save reaction right now. Please try again.",
      };
    }

    const saved = isValidReactionType(data) ? data : null;
    return { success: true, reaction: saved };
  } catch {
    return {
      success: false,
      reaction: null,
      error: "Network error saving reaction.",
    };
  }
}

/**
 * Fetches a cursor-paginated page of top-level comments for a chapter.
 */
export async function fetchChapterComments(
  supabase: SupabaseClient<any>,
  chapterId: string | number,
  sort: CommentSortOrder = "top",
  cursor?: CommentCursor | null,
  pageSize: number = COMMENTS_PAGE_SIZE
): Promise<CommentsPageResult> {
  const idStr = String(chapterId);
  if (!isValidChapterId(idStr)) {
    return {
      success: false,
      comments: [],
      nextCursor: null,
      hasMore: false,
      error: "Invalid chapter ID.",
    };
  }
  const safeSort: CommentSortOrder = VALID_SORTS.has(sort) ? sort : "top";
  const safeLimit = Math.min(Math.max(1, pageSize), 50);

  try {
    const { data, error } = await supabase.rpc("get_chapter_comments", {
      p_chapter_id: idStr,
      p_sort: safeSort,
      p_limit: safeLimit + 1,
      p_cursor_like_count: cursor ? cursor.likeCount : null,
      p_cursor_created_at: cursor ? cursor.createdAt : null,
      p_cursor_id: cursor ? cursor.id : null,
    });

    if (error) {
      return {
        success: false,
        comments: [],
        nextCursor: null,
        hasMore: false,
        error: "Couldn't load comments right now.",
      };
    }

    const rows = (Array.isArray(data) ? data : []) as CommentRow[];
    const hasMore = rows.length > safeLimit;
    const slice = rows.slice(0, safeLimit).map(sanitizeCommentRow);
    const last = slice.at(-1);
    const nextCursor: CommentCursor | null =
      hasMore && last
        ? {
            likeCount: last.like_count,
            createdAt: last.created_at,
            id: last.id,
          }
        : null;

    return {
      success: true,
      comments: slice,
      nextCursor,
      hasMore,
    };
  } catch {
    return {
      success: false,
      comments: [],
      nextCursor: null,
      hasMore: false,
      error: "Network error loading comments.",
    };
  }
}

/**
 * Fetches a cursor-paginated batch of 1-level replies for a parent comment.
 */
export async function fetchCommentReplies(
  supabase: SupabaseClient<any>,
  parentId: string,
  cursor?: ReplyCursor | null,
  pageSize: number = REPLIES_PAGE_SIZE
): Promise<RepliesPageResult> {
  if (!isValidUuid(parentId)) {
    return {
      success: false,
      replies: [],
      nextCursor: null,
      hasMore: false,
      error: "Invalid parent comment ID.",
    };
  }
  const safeLimit = Math.min(Math.max(1, pageSize), 50);

  try {
    const { data, error } = await supabase.rpc("get_comment_replies", {
      p_parent_id: parentId,
      p_limit: safeLimit + 1,
      p_cursor_created_at: cursor ? cursor.createdAt : null,
      p_cursor_id: cursor ? cursor.id : null,
    });

    if (error) {
      return {
        success: false,
        replies: [],
        nextCursor: null,
        hasMore: false,
        error: "Couldn't load replies right now.",
      };
    }

    const rows = (Array.isArray(data) ? data : []) as CommentRow[];
    const hasMore = rows.length > safeLimit;
    const slice = rows.slice(0, safeLimit).map(sanitizeCommentRow);
    const last = slice.at(-1);
    const nextCursor: ReplyCursor | null =
      hasMore && last
        ? {
            createdAt: last.created_at,
            id: last.id,
          }
        : null;

    return {
      success: true,
      replies: slice,
      nextCursor,
      hasMore,
    };
  } catch {
    return {
      success: false,
      replies: [],
      nextCursor: null,
      hasMore: false,
      error: "Network error loading replies.",
    };
  }
}

/**
 * Creates a new top-level comment or 1-level reply on a chapter.
 * Ownership is derived server-side from auth.uid().
 */
export async function createChapterComment(
  supabase: SupabaseClient<any>,
  input: {
    chapterId: string | number;
    content: string;
    isSpoiler?: boolean;
    parentId?: string | null;
  }
): Promise<{
  success: boolean;
  comment?: {
    id: string;
    chapter_id: string;
    parent_id: string | null;
    content: string;
    is_spoiler: boolean;
    is_deleted: boolean;
    like_count: number;
    reply_count: number;
    created_at: string;
    updated_at: string;
  };
  error?: string;
}> {
  const idStr = String(input.chapterId);
  if (!isValidChapterId(idStr)) {
    return { success: false, error: "Invalid chapter ID." };
  }
  if (input.parentId && !isValidUuid(input.parentId)) {
    return { success: false, error: "Invalid parent comment." };
  }

  const check = validateCommentText(input.content);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .insert({
        chapter_id: idStr,
        parent_id: input.parentId ?? null,
        content: check.normalized,
        is_spoiler: Boolean(input.isSpoiler),
      })
      .select(
        "id, chapter_id, parent_id, content, is_spoiler, is_deleted, like_count, reply_count, created_at, updated_at"
      )
      .single();

    if (error || !data) {
      const msg = error?.message?.includes("rate_limited")
        ? "You're commenting too quickly. Please wait a moment and try again."
        : "Couldn't post comment right now. Please try again.";
      return { success: false, error: msg };
    }

    return { success: true, comment: data };
  } catch {
    return { success: false, error: "Network error posting comment." };
  }
}

/**
 * Edits the content and/or spoiler flag of the caller's own comment.
 */
export async function editOwnComment(
  supabase: SupabaseClient<any>,
  input: {
    commentId: string;
    content: string;
    isSpoiler: boolean;
  }
): Promise<{
  success: boolean;
  updated?: { content: string; is_spoiler: boolean; updated_at: string };
  error?: string;
}> {
  if (!isValidUuid(input.commentId)) {
    return { success: false, error: "Invalid comment ID." };
  }

  const check = validateCommentText(input.content);
  if (!check.valid) {
    return { success: false, error: check.error };
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .update({
        content: check.normalized,
        is_spoiler: Boolean(input.isSpoiler),
      })
      .eq("id", input.commentId)
      .select("content, is_spoiler, updated_at")
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: "Couldn't update comment. You can only edit your own comments.",
      };
    }

    return { success: true, updated: data };
  } catch {
    return { success: false, error: "Network error updating comment." };
  }
}

/**
 * Soft-deletes the caller's own comment (scrubbing content server-side while
 * preserving any child replies).
 */
export async function deleteOwnComment(
  supabase: SupabaseClient<any>,
  commentId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUuid(commentId)) {
    return { success: false, error: "Invalid comment ID." };
  }

  try {
    const { data, error } = await supabase
      .from("comments")
      .update({ is_deleted: true, content: "", is_spoiler: false })
      .eq("id", commentId)
      .select("id")
      .maybeSingle();

    if (error || !data) {
      return {
        success: false,
        error: "Couldn't delete comment. You can only delete your own comments.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Network error deleting comment." };
  }
}

/**
 * Likes or unlikes a comment for the current authenticated user.
 */
export async function setCommentLike(
  supabase: SupabaseClient<any>,
  commentId: string,
  shouldLike: boolean
): Promise<{ success: boolean; error?: string }> {
  if (!isValidUuid(commentId)) {
    return { success: false, error: "Invalid comment ID." };
  }

  try {
    if (shouldLike) {
      const { error } = await supabase
        .from("comment_likes")
        .insert({ comment_id: commentId });
      if (error && error.code !== "23505") {
        return { success: false, error: "Couldn't like comment right now." };
      }
      return { success: true };
    } else {
      const { error } = await supabase
        .from("comment_likes")
        .delete()
        .eq("comment_id", commentId);
      if (error) {
        return { success: false, error: "Couldn't unlike comment right now." };
      }
      return { success: true };
    }
  } catch {
    return { success: false, error: "Network error updating comment like." };
  }
}

/**
 * Submits a moderation report on another user's comment.
 */
export async function reportComment(
  supabase: SupabaseClient<any>,
  input: {
    commentId: string;
    reason: CommentReportReason;
    details?: string | null;
  }
): Promise<{ success: boolean; alreadyReported?: boolean; error?: string }> {
  if (!isValidUuid(input.commentId)) {
    return { success: false, error: "Invalid comment ID." };
  }
  if (!isValidReportReason(input.reason)) {
    return { success: false, error: "Please select a valid report reason." };
  }

  const trimmedDetails = input.details ? normalizeCommentText(input.details) : null;
  if (trimmedDetails && trimmedDetails.length > REPORT_DETAILS_MAX_LENGTH) {
    return {
      success: false,
      error: `Report details cannot exceed ${REPORT_DETAILS_MAX_LENGTH} characters.`,
    };
  }

  try {
    const { error } = await supabase.from("comment_reports").insert({
      comment_id: input.commentId,
      reason: input.reason,
      details: trimmedDetails || null,
    });

    if (error) {
      if (error.code === "23505") {
        return { success: true, alreadyReported: true };
      }
      return {
        success: false,
        error: "Unable to submit report for this comment.",
      };
    }

    return { success: true };
  } catch {
    return { success: false, error: "Network error submitting report." };
  }
}

/**
 * Formats compact interaction counts beneath sidebar icons (e.g. 1.2K).
 */
export function formatCompactCount(count: number): string {
  if (!Number.isFinite(count) || count <= 0) return "";
  if (count < 1000) return String(Math.floor(count));
  if (count < 1_000_000) {
    const k = count / 1000;
    return `${k >= 10 ? Math.floor(k) : k.toFixed(1).replace(/\.0$/, "")}K`;
  }
  const m = count / 1_000_000;
  return `${m.toFixed(1).replace(/\.0$/, "")}M`;
}

/**
 * Formats a human-readable relative timestamp for comments.
 */
export function formatRelativeTimestamp(isoString: string): string {
  const date = new Date(isoString);
  const ts = date.getTime();
  if (Number.isNaN(ts)) return "";
  const diffSeconds = Math.max(0, Math.floor((Date.now() - ts) / 1000));

  if (diffSeconds < 45) return "just now";
  const minutes = Math.floor(diffSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
