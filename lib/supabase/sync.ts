import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReadingProgress, DatabaseBookmark } from "../../types/database.ts";
import type { Bookmark } from "../../types/novel.ts";

export {
  clearPendingProgress,
  getPendingProgress,
  getProgressWriterId,
  listPendingProgress,
  markPendingProgressConflict,
  queueProgress,
  rebasePendingProgress,
} from "./progressQueue.ts";
export type { PendingProgressRecord } from "./progressQueue.ts";

export const ERROR_SAVE_FAILED = "Couldn't save this right now. Please try again.";

export interface ProgressPayload {
  chapter_id: string;
  chapter_number: number;
  chapter_title: string;
  scroll_position: number;
  /** Database-issued version the client last observed; null means unknown. */
  expected_version: number | null;
}

export interface AuthoritativeProgressRecord {
  id: string | null;
  user_id: string;
  chapter_id: string | null;
  chapter_number: number | null;
  chapter_title: string | null;
  scroll_position: number | null;
  progress_updated_at: string | null;
  version: number;
  updated: boolean;
  record_exists: boolean;
}

export interface SyncReadingProgressResult {
  success: boolean;
  updated?: boolean;
  authoritativeRecord?: AuthoritativeProgressRecord;
  error?: string;
}

/** Sends progress only through the authenticated, database-authoritative CAS RPC. */
export async function syncReadingProgress(
  supabase: SupabaseClient<any>,
  userId: string,
  progress: ProgressPayload
): Promise<SyncReadingProgressResult> {
  if (
    !userId ||
    !Number.isInteger(progress.expected_version) ||
    (progress.expected_version as number) < 0 ||
    !/^([1-9][0-9]{0,3})$/.test(progress.chapter_id) ||
    Number(progress.chapter_id) !== progress.chapter_number ||
    progress.chapter_number < 1 ||
    progress.chapter_number > 2334 ||
    !progress.chapter_title ||
    progress.chapter_title.length > 300 ||
    !Number.isFinite(progress.scroll_position) ||
    progress.scroll_position < 0 ||
    progress.scroll_position > 1
  ) {
    return { success: false, error: ERROR_SAVE_FAILED };
  }

  try {
    const { data, error } = await supabase.rpc("sync_reading_progress", {
      p_expected_user_id: userId,
      p_expected_version: progress.expected_version as number,
      p_chapter_id: progress.chapter_id,
      p_chapter_number: progress.chapter_number,
      p_chapter_title: progress.chapter_title,
      p_scroll_position: progress.scroll_position,
    });

    if (error) {
      console.error("Database error updating reading progress:", error.message);
      return { success: false, error: ERROR_SAVE_FAILED };
    }

    const result = Array.isArray(data) ? data[0] : data;
    if (!result || result.user_id !== userId) {
      return { success: false, error: ERROR_SAVE_FAILED };
    }

    return {
      success: true,
      updated: Boolean(result.updated),
      authoritativeRecord: result as AuthoritativeProgressRecord,
    };
  } catch (err: unknown) {
    console.error(
      "Network error updating reading progress:",
      err instanceof Error ? err.message : String(err)
    );
    return { success: false, error: ERROR_SAVE_FAILED };
  }
}

export interface ReadingProgressSnapshot {
  success: boolean;
  progress: ReadingProgress | null;
}

/** Distinguishes an empty account from a failed baseline read. */
export async function fetchReadingProgress(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<ReadingProgressSnapshot> {
  try {
    const { data, error } = await supabase
      .from("reading_progress")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching reading progress:", error.message);
      return { success: false, progress: null };
    }

    return { success: true, progress: data as ReadingProgress | null };
  } catch (err) {
    console.error("Network error fetching reading progress:", err);
    return { success: false, progress: null };
  }
}

/** Fetches user bookmarks from Supabase, ordered by most recently created. */
export async function fetchCloudBookmarks(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<Bookmark[]> {
  try {
    const { data, error } = await supabase
      .from("bookmarks")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching bookmarks:", error.message);
      return [];
    }

    const items = (data || []) as DatabaseBookmark[];
    return items.map((bookmark) => ({
      chapterId: parseInt(bookmark.chapter_id, 10),
      chapterNumber: bookmark.chapter_number || parseInt(bookmark.chapter_id, 10),
      chapterTitle: bookmark.chapter_title || `Chapter ${bookmark.chapter_id}`,
      createdAt: bookmark.created_at,
    }));
  } catch (err) {
    console.error("Network error fetching bookmarks:", err);
    return [];
  }
}

/** Adds a bookmark to Supabase. */
export async function addCloudBookmark(
  supabase: SupabaseClient<any>,
  userId: string,
  bookmark: Bookmark
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.from("bookmarks").insert({
      user_id: userId,
      chapter_id: String(bookmark.chapterId),
      chapter_number: bookmark.chapterNumber,
      chapter_title: bookmark.chapterTitle,
      created_at: bookmark.createdAt || new Date().toISOString(),
    });

    if (error) {
      if (error.code === "23505") return { success: true };
      console.error("Database error adding bookmark:", error.message);
      return { success: false, error: ERROR_SAVE_FAILED };
    }
    return { success: true };
  } catch (err: unknown) {
    console.error("Network error adding bookmark:", err instanceof Error ? err.message : String(err));
    return { success: false, error: ERROR_SAVE_FAILED };
  }
}

/** Removes a bookmark from Supabase. */
export async function removeCloudBookmark(
  supabase: SupabaseClient<any>,
  userId: string,
  chapterId: number
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("bookmarks")
      .delete()
      .eq("user_id", userId)
      .eq("chapter_id", String(chapterId));

    if (error) {
      console.error("Database error removing bookmark:", error.message);
      return { success: false, error: ERROR_SAVE_FAILED };
    }
    return { success: true };
  } catch (err: unknown) {
    console.error("Network error removing bookmark:", err instanceof Error ? err.message : String(err));
    return { success: false, error: ERROR_SAVE_FAILED };
  }
}
