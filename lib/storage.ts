import { ReaderSettings, Bookmark } from "@/types/novel";

export const DEFAULT_SETTINGS: ReaderSettings = {
  font: "serif",
  fontSize: 19,
  lineHeight: 1.85,
  surfaceOpacity: 0.95,
  surfaceTheme: "catppuccin", // Catppuccin Blue
  maxWidth: 760,
  fontColor: "#cdd6f4", // Catppuccin Text Lavender
};

/**
 * Helper to parse a raw JSON or URI-encoded string into ReaderSettings
 */
export function parseSettingsFromRaw(raw: string | null | undefined): ReaderSettings {
  if (!raw) return DEFAULT_SETTINGS;
  try {
    let jsonStr = raw;
    try {
      jsonStr = decodeURIComponent(raw);
    } catch {
      jsonStr = raw;
    }
    const parsed = JSON.parse(jsonStr);
    if (parsed && typeof parsed === "object") {
      return { ...DEFAULT_SETTINGS, ...parsed };
    }
  } catch {
    // If double encoded or plain string
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch {
      // Fallback
    }
  }
  return DEFAULT_SETTINGS;
}

/**
 * Set a cookie with 365-day persistence, SameSite=Lax, path=/
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const maxAge = days * 86400;
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; max-age=${maxAge}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie value by name (handles any spacing, multiple cookies, and URI encoding)
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escapedName = encodeURIComponent(name).replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${escapedName}=([^;]*)`));
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return match[1];
  }
}

/**
 * Save theme and typography settings to both cookie and localStorage
 */
export function saveThemeSettings(settings: ReaderSettings): void {
  const serialized = JSON.stringify(settings);
  setCookie("reverend_theme_settings", serialized);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("reverend_theme_settings", serialized);
      localStorage.setItem("reverend_reader_settings", serialized);
    }
  } catch {
    // Ignore quota errors
  }
}

/**
 * Load theme settings from cookie with localStorage fallback, syncing if needed
 */
export function loadThemeSettings(): ReaderSettings {
  try {
    // 1. Try reading from cookie
    const fromCookie = getCookie("reverend_theme_settings");
    if (fromCookie) {
      const parsed = parseSettingsFromRaw(fromCookie);
      // Keep localStorage in sync
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("reverend_theme_settings", JSON.stringify(parsed));
        }
      } catch {}
      return parsed;
    }

    // 2. Try reading from localStorage fallback
    if (typeof localStorage !== "undefined") {
      const fromLocal =
        localStorage.getItem("reverend_theme_settings") ||
        localStorage.getItem("reverend_reader_settings");
      if (fromLocal) {
        const parsed = parseSettingsFromRaw(fromLocal);
        // Sync into cookie so server can read it on next page load / refresh
        setCookie("reverend_theme_settings", JSON.stringify(parsed));
        return parsed;
      }
    }
  } catch {
    // Parse error fallback
  }
  return DEFAULT_SETTINGS;
}

/**
 * Save bookmarks to both cookie and localStorage
 */
export function saveBookmarks(bookmarks: Bookmark[]): void {
  const serialized = JSON.stringify(bookmarks);
  setCookie("reverend_bookmarks", serialized);
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("reverend_bookmarks", serialized);
    }
  } catch {
    // Ignore quota errors
  }
}

/**
 * Load bookmarks from cookie with localStorage fallback
 */
export function loadBookmarks(): Bookmark[] {
  try {
    const fromCookie = getCookie("reverend_bookmarks");
    if (fromCookie) {
      return JSON.parse(fromCookie);
    }
    if (typeof localStorage !== "undefined") {
      const fromLocal = localStorage.getItem("reverend_bookmarks");
      if (fromLocal) {
        return JSON.parse(fromLocal);
      }
    }
  } catch {
    // Parse error fallback
  }
  return [];
}

/**
 * Toggle bookmark for a chapter
 */
export function toggleBookmarkStorage(bookmark: Bookmark): {
  bookmarked: boolean;
  bookmarks: Bookmark[];
} {
  const current = loadBookmarks();
  const index = current.findIndex((b) => b.chapterId === bookmark.chapterId);
  let updated: Bookmark[];
  let bookmarked: boolean;

  if (index >= 0) {
    updated = current.filter((b) => b.chapterId !== bookmark.chapterId);
    bookmarked = false;
  } else {
    updated = [bookmark, ...current];
    bookmarked = true;
  }

  saveBookmarks(updated);
  return { bookmarked, bookmarks: updated };
}

/**
 * Check if a chapter is bookmarked
 */
export function isChapterBookmarked(chapterId: number, bookmarks?: Bookmark[]): boolean {
  const list = bookmarks ?? loadBookmarks();
  return list.some((b) => b.chapterId === chapterId);
}
