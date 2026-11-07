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

/**
 * Typography and layout preferences for the reader.
 * Color theme is global (see lib/theme.ts) and the typeface is fixed.
 */
export interface ReaderSettings {
  fontSize: number; // in pixels (e.g. 18, 20, 22)
  lineHeight: number; // e.g. 1.7, 1.85, 2.0
  surfaceOpacity: number; // 0.0 to 1.0, page backing opacity over a custom background image
  maxWidth: number; // reading column width in px, 9999 = full width
  letterSpacing?: number; // letter spacing in pixels (e.g. 0, 0.5, 1.0)
}

export interface Bookmark {
  chapterId: number;
  chapterNumber: number;
  chapterTitle: string;
  createdAt: string;
}
