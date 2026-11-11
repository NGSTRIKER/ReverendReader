import type { ReaderSettings, Bookmark, ReaderFont, ReaderSurfaceTheme } from "../types/novel.ts";

export const DEFAULT_SETTINGS: ReaderSettings = {
  font: "mono",
  fontSize: 19,
  lineHeight: 1.85,
  surfaceOpacity: 0.95,
  surfaceTheme: "matte-terminal",
  maxWidth: 760,
  fontColor: "#e4e8f0",
  letterSpacing: 0.2,
  textAlign: "left",
  scrollFluidity: 0,
};

const VALID_FONTS: ReaderFont[] = ["serif", "sans", "mono", "literary"];
const VALID_THEMES: ReaderSurfaceTheme[] = [
  "matte-terminal",
  "terminal-grey",
  "catppuccin",
  "catppuccin-mocha",
  "catppuccin-pink",
  "catppuccin-coffee",
  "catppuccin-jade",
  "catppuccin-latte",
  "dark",
  "black",
  "slate",
  "sepia",
  "acrylic",
  "blur",
  "transparent",
];

function sanitizeSettings(raw: Record<string, unknown>): ReaderSettings {
  const clamp = (val: unknown, fallback: number, min: number, max: number) => {
    const n = typeof val === "number" ? val : Number(val);
    return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
  };

  const font = typeof raw.font === "string" && VALID_FONTS.includes(raw.font as ReaderFont)
    ? (raw.font as ReaderFont)
    : DEFAULT_SETTINGS.font;

  const surfaceTheme =
    typeof raw.surfaceTheme === "string" && VALID_THEMES.includes(raw.surfaceTheme as ReaderSurfaceTheme)
      ? (raw.surfaceTheme as ReaderSurfaceTheme)
      : DEFAULT_SETTINGS.surfaceTheme;

  const fontColor =
    typeof raw.fontColor === "string" && /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(raw.fontColor)
      ? raw.fontColor
      : DEFAULT_SETTINGS.fontColor;

  const textAlign = raw.textAlign === "justify" ? "justify" : "left";

  return {
    font,
    fontSize: clamp(raw.fontSize, DEFAULT_SETTINGS.fontSize, 14, 32),
    lineHeight: clamp(raw.lineHeight, DEFAULT_SETTINGS.lineHeight, 1.3, 2.6),
    surfaceOpacity: clamp(raw.surfaceOpacity, DEFAULT_SETTINGS.surfaceOpacity, 0, 1),
    surfaceTheme,
    maxWidth: clamp(raw.maxWidth, DEFAULT_SETTINGS.maxWidth, 560, 9999),
    fontColor,
    letterSpacing: clamp(raw.letterSpacing ?? DEFAULT_SETTINGS.letterSpacing, 0.2, -0.5, 2.5),
    textAlign,
    scrollFluidity: clamp(raw.scrollFluidity ?? DEFAULT_SETTINGS.scrollFluidity ?? 0, 0, 0, 100),
  };
}

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
      return sanitizeSettings(parsed as Record<string, unknown>);
    }
  } catch {
    try {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") {
        return sanitizeSettings(parsed as Record<string, unknown>);
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

  if (typeof window !== "undefined" && window.location.pathname && window.location.pathname !== "/") {
    document.cookie = `${encName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=${window.location.pathname}; SameSite=Lax`;
  }

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
 * Save typography settings to both cookie and localStorage.
 */
export function saveThemeSettings(settings: ReaderSettings): void {
  const clean = sanitizeSettings(settings as unknown as Record<string, unknown>);
  const serialized = JSON.stringify(clean);

  setCookie("reverend_theme_settings", serialized);
  setCookie("reverend_font", clean.font);
  setCookie("reverend_font_size", String(clean.fontSize));
  setCookie("reverend_line_height", String(clean.lineHeight));
  setCookie("reverend_surface_opacity", String(clean.surfaceOpacity));
  setCookie("reverend_surface_theme", clean.surfaceTheme);
  setCookie("reverend_max_width", String(clean.maxWidth));
  if (clean.fontColor) {
    setCookie("reverend_font_color", clean.fontColor);
  }
  if (typeof clean.letterSpacing === "number") {
    setCookie("reverend_letter_spacing", String(clean.letterSpacing));
  }
  if (clean.textAlign) {
    setCookie("reverend_text_align", clean.textAlign);
  }
  if (typeof clean.scrollFluidity === "number") {
    setCookie("reverend_scroll_fluidity", String(clean.scrollFluidity));
  }

  try {
    if (typeof localStorage !== "undefined") {
      localStorage.setItem("reverend_theme_settings", serialized);
      localStorage.setItem("reverend_reader_settings", serialized);
      localStorage.setItem("reverend_font", clean.font);
      localStorage.setItem("reverend_font_size", String(clean.fontSize));
      localStorage.setItem("reverend_line_height", String(clean.lineHeight));
      localStorage.setItem("reverend_surface_theme", clean.surfaceTheme);
      localStorage.setItem("reverend_surface_opacity", String(clean.surfaceOpacity));
      localStorage.setItem("reverend_max_width", String(clean.maxWidth));
      if (clean.fontColor) {
        localStorage.setItem("reverend_font_color", clean.fontColor);
      }
      if (typeof clean.letterSpacing === "number") {
        localStorage.setItem("reverend_letter_spacing", String(clean.letterSpacing));
      }
      if (clean.textAlign) {
        localStorage.setItem("reverend_text_align", clean.textAlign);
      }
      if (typeof clean.scrollFluidity === "number") {
        localStorage.setItem("reverend_scroll_fluidity", String(clean.scrollFluidity));
      }
    }
  } catch {
    // Ignore quota errors
  }
}

/**
 * Load typography settings from cookies with localStorage fallback.
 */
export function loadThemeSettings(): ReaderSettings {
  try {
    let currentSettings: ReaderSettings = { ...DEFAULT_SETTINGS };
    let hasLoaded = false;

    const fromCookie = getCookie("reverend_theme_settings");
    if (fromCookie) {
      currentSettings = parseSettingsFromRaw(fromCookie);
      hasLoaded = true;
    }

    const fontCookie = getCookie("reverend_font");
    const fontSizeCookie = getCookie("reverend_font_size");
    const lineHeightCookie = getCookie("reverend_line_height");
    const opacityCookie = getCookie("reverend_surface_opacity");
    const surfaceThemeCookie = getCookie("reverend_surface_theme");
    const maxWidthCookie = getCookie("reverend_max_width");
    const fontColorCookie = getCookie("reverend_font_color");
    const letterSpacingCookie = getCookie("reverend_letter_spacing");
    const textAlignCookie = getCookie("reverend_text_align");
    const scrollFluidityCookie = getCookie("reverend_scroll_fluidity");

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
    if (surfaceThemeCookie) {
      currentSettings.surfaceTheme = surfaceThemeCookie as ReaderSettings["surfaceTheme"];
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
    if (textAlignCookie === "left" || textAlignCookie === "justify") {
      currentSettings.textAlign = textAlignCookie;
      hasLoaded = true;
    }
    if (scrollFluidityCookie && !isNaN(parseInt(scrollFluidityCookie, 10))) {
      currentSettings.scrollFluidity = parseInt(scrollFluidityCookie, 10);
      hasLoaded = true;
    }

    if (hasLoaded) {
      const clean = sanitizeSettings(currentSettings as unknown as Record<string, unknown>);
      try {
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("reverend_theme_settings", JSON.stringify(clean));
        }
      } catch {}
      return clean;
    }

    if (typeof localStorage !== "undefined") {
      const fromLocal =
        localStorage.getItem("reverend_theme_settings") ||
        localStorage.getItem("reverend_reader_settings");
      if (fromLocal) {
        const parsed = parseSettingsFromRaw(fromLocal);
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

export const SIDEBAR_VISIBILITY_KEY = "reverend_sidebar_visible";

/**
 * Load interaction sidebar visibility preference from localStorage (defaults to true).
 */
export function loadSidebarVisibility(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(SIDEBAR_VISIBILITY_KEY);
    if (raw === "false" || raw === "0") return false;
    return true;
  } catch {
    return true;
  }
}

/**
 * Persist interaction sidebar visibility preference in localStorage.
 */
export function saveSidebarVisibility(visible: boolean): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(SIDEBAR_VISIBILITY_KEY, visible ? "true" : "false");
  } catch {
    // Ignore storage quota / privacy mode errors
  }
}
