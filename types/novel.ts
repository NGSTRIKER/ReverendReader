export interface ChapterMetadata {
  id: number;
  number: number;
  title: string;
  startByte: number;
  endByte: number;
  length: number;
  wordCount: number;
}

export interface ManifestData {
  novelTitle: string;
  author: string;
  totalChapters: number;
  totalWords: number;
  totalBytes: number;
  generatedAt: string;
  chapters: ChapterMetadata[];
}

export type ReaderFont = "serif" | "sans" | "mono" | "literary";

export type ReaderSurfaceTheme =
  | "matte-terminal"
  | "terminal-grey"
  | "catppuccin"
  | "catppuccin-mocha"
  | "catppuccin-pink"
  | "catppuccin-coffee"
  | "catppuccin-jade"
  | "catppuccin-latte"
  | "dark"
  | "black"
  | "slate"
  | "sepia"
  | "acrylic"
  | "blur"
  | "transparent";

/**
 * Typography and layout preferences for the reader.
 */
export interface ReaderSettings {
  font: ReaderFont;
  fontSize: number; // in pixels (e.g. 18, 20, 22)
  lineHeight: number; // e.g. 1.7, 1.85, 2.0
  surfaceOpacity: number; // 0.0 to 1.0, page backing opacity over a custom background image
  surfaceTheme: ReaderSurfaceTheme;
  maxWidth: number; // reading column width in px, 9999 = full width
  fontColor?: string; // custom hex color string, e.g. "#e4e8f0"
  letterSpacing?: number; // letter spacing in pixels (e.g. 0, 0.5, 1.0)
  textAlign?: "left" | "justify";
}

export interface Bookmark {
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
  createdAt: string;
}
