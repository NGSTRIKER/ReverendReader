import { ReaderSettings, Bookmark } from "@/types/novel";

export const DEFAULT_SETTINGS: ReaderSettings = {
  font: "serif",
  fontSize: 19,
  lineHeight: 1.85,
  surfaceOpacity: 0.95,
  surfaceTheme: "catppuccin", // Catppuccin Blue
  maxWidth: 760,
  fontColor: "#cdd6f4", // Catppuccin Text Lavender
  letterSpacing: 0.2,
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
 * Also deduplicates by clearing any legacy path-specific cookie
 */
export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  const maxAge = days * 86400;
  const encName = encodeURIComponent(name);
  const encVal = encodeURIComponent(value);

  // Clear any potential legacy path-specific duplicate cookie (e.g. created on /read)
  if (typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/") {
    document.cookie = `${encName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${window.location.pathname}; SameSite=Lax`;
  }

  // Set the site-wide root cookie
  document.cookie = `${encName}=${encVal}; expires=${expires}; max-age=${maxAge}; path=/; SameSite=Lax`;
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
 * Save theme and typography settings to both cookie and localStorage.
 * Updates both the consolidated JSON cookie and individual cookies for every setting.
 */
export function saveThemeSettings(settings: ReaderSettings): void {
  const serialized = JSON.stringify(settings);

  // 1. Consolidated cookie for SSR & atomic restores
  setCookie("reverend_theme_settings", serialized);

  // 2. Individual dedicated cookies updated immediately on every setting change
  if (settings.surfaceTheme) {
    setCookie("reverend_surface_theme", settings.surfaceTheme);
  }
  if (settings.font) {
    setCookie("reverend_font", settings.font);
  }
  if (typeof settings.fontSize === "number") {
    setCookie("reverend_font_size", String(settings.fontSize));
  }
  if (typeof settings.lineHeight === "number") {
    setCookie("reverend_line_height", String(settings.lineHeight));
  }
  if (typeof settings.surfaceOpacity === "number") {
    setCookie("reverend_surface_opacity", String(settings.surfaceOpacity));
  }
  if (typeof settings.maxWidth === "number") {
    setCookie("reverend_max_width", String(settings.maxWidth));
  }
  if (settings.fontColor) {
    setCookie("reverend_font_color", settings.fontColor);
  }
  if (typeof settings.letterSpacing === "number") {
    setCookie("reverend_letter_spacing", String(settings.letterSpacing));
  }

  // 3. Keep localStorage fully in sync
  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("reverend_theme_settings", serialized);
      localStorage.setItem("reverend_reader_settings", serialized);
      localStorage.setItem("reverend_surface_theme", settings.surfaceTheme);
      localStorage.setItem("reverend_font", settings.font);
      localStorage.setItem("reverend_font_size", String(settings.fontSize));
      localStorage.setItem("reverend_line_height", String(settings.lineHeight));
      localStorage.setItem("reverend_font_color", settings.fontColor || "#cdd6f4");
      if (typeof settings.letterSpacing === "number") {
        localStorage.setItem("reverend_letter_spacing", String(settings.letterSpacing));
      }
    }
  } catch {
    // Ignore quota errors
  }
}

/**
 * Load theme settings from cookies with localStorage fallback, merging individual cookies if present
 */
export function loadThemeSettings(): ReaderSettings {
  try {
    let currentSettings: ReaderSettings = { ...DEFAULT_SETTINGS };
    let hasLoaded = false;

    // 1. Try reading from consolidated cookie
    const fromCookie = getCookie("reverend_theme_settings");
    if (fromCookie) {
      currentSettings = parseSettingsFromRaw(fromCookie);
      hasLoaded = true;
    }

    // 2. Overlay individual cookies if set
    const surfaceThemeCookie = getCookie("reverend_surface_theme");
    const fontCookie = getCookie("reverend_font");
    const fontSizeCookie = getCookie("reverend_font_size");
    const lineHeightCookie = getCookie("reverend_line_height");
    const opacityCookie = getCookie("reverend_surface_opacity");
    const maxWidthCookie = getCookie("reverend_max_width");
    const fontColorCookie = getCookie("reverend_font_color");
    const letterSpacingCookie = getCookie("reverend_letter_spacing");

    if (surfaceThemeCookie) {
      currentSettings.surfaceTheme = surfaceThemeCookie as ReaderSettings["surfaceTheme"];
      hasLoaded = true;
    }
    if (fontCookie) {
      currentSettings.font = fontCookie as ReaderSettings["font"];
      hasLoaded = true;
    }
    if (fontSizeCookie && !isNaN(parseInt(fontSizeCookie, 10))) {
      currentSettings.fontSize = parseInt(fontSizeCookie, 10);
      hasLoaded = true;
    }
    if (lineHeightCookie && !isNaN(parseFloat(lineHeightCookie))) {
      currentSettings.lineHeight = parseFloat(lineHeightCookie);
      hasLoaded = true;
    }
    if (opacityCookie && !isNaN(parseFloat(opacityCookie))) {
      currentSettings.surfaceOpacity = parseFloat(opacityCookie);
      hasLoaded = true;
    }
    if (maxWidthCookie && !isNaN(parseInt(maxWidthCookie, 10))) {
      currentSettings.maxWidth = parseInt(maxWidthCookie, 10);
      hasLoaded = true;
    }
    if (fontColorCookie) {
      currentSettings.fontColor = fontColorCookie;
      hasLoaded = true;
    }
    if (letterSpacingCookie && !isNaN(parseFloat(letterSpacingCookie))) {
      currentSettings.letterSpacing = parseFloat(letterSpacingCookie);
      hasLoaded = true;
    }

    if (hasLoaded) {
      // Keep localStorage in sync
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("reverend_theme_settings", JSON.stringify(currentSettings));
        }
      } catch {}
      return currentSettings;
    }

    // 3. Try reading from localStorage fallback
    if (typeof localStorage !== "undefined") {
      const fromLocal =
        localStorage.getItem("reverend_theme_settings") ||
        localStorage.getItem("reverend_reader_settings");
      if (fromLocal) {
        const parsed = parseSettingsFromRaw(fromLocal);
        // Sync into cookies so server can read it
        saveThemeSettings(parsed);
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
