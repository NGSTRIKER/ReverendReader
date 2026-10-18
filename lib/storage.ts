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
 * Set a cookie with 365-day persistence, SameSite=Lax
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; expires=${expires}; path=/; SameSite=Lax`;
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const cookies = document.cookie ? document.cookie.split("; ") : [];
  for (const c of cookies) {
    const parts = c.split("=");
    const key = decodeURIComponent(parts[0]);
    if (key === name) {
      return decodeURIComponent(parts.slice(1).join("="));
    }
  }
  return null;
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
 * Load theme settings from cookie with localStorage fallback
 */
export function loadThemeSettings(): ReaderSettings {
  try {
    const fromCookie = getCookie("reverend_theme_settings");
    if (fromCookie) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(fromCookie) };
    }
    if (typeof localStorage !== "undefined") {
      const fromLocal =
        localStorage.getItem("reverend_theme_settings") ||
        localStorage.getItem("reverend_reader_settings");
      if (fromLocal) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(fromLocal) };
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
