import { ChapterMetadata } from "@/types/novel";

const chapterCache = new Map<number, string>();

/**
 * Strips the internal conversion delimiters from the raw chapter text
 * so the reader displays pure, beautiful novel content.
 */
export function cleanChapterContent(rawText: string): string {
  // Delimiter line is 80 equals signs
  const lines = rawText.split("\n");
  let startIndex = 0;

  // Check if starts with delimiter block
  if (lines[0]?.trim().startsWith("========")) {
    // Find second delimiter line
    for (let i = 1; i < Math.min(lines.length, 10); i++) {
      if (lines[i]?.trim().startsWith("========")) {
        startIndex = i + 1;
        break;
      }
    }
  }

  const bodyLines = lines.slice(startIndex);
  return bodyLines.join("\n").trim();
}

/**
 * Fetches a single chapter with performance optimization:
 * 1. Returns from client memory cache if available.
 * 2. Fetches byte slice directly from /api/chapter?id=${id}
 * 3. Never keeps more than 50 chapters in memory cache to avoid memory leaks.
 */
export async function fetchChapterContent(chapter: { id: number }): Promise<string> {
  if (chapterCache.has(chapter.id)) {
    return chapterCache.get(chapter.id)!;
  }

  const apiRes = await fetch(`/api/chapter?id=${chapter.id}`);
  if (!apiRes.ok) {
    throw new Error(`Failed to load chapter (${apiRes.status}: ${apiRes.statusText})`);
  }

  const rawText = await apiRes.text();
  const cleaned = cleanChapterContent(rawText);
  cacheChapter(chapter.id, cleaned);
  return cleaned;
}

function cacheChapter(id: number, content: string) {
  // Evict oldest chapters if cache grows beyond 50 chapters
  if (chapterCache.size > 50) {
    const firstKey = chapterCache.keys().next().value;
    if (firstKey !== undefined) {
      chapterCache.delete(firstKey);
    }
  }
  chapterCache.set(id, content);
}

/**
 * Preload adjacent chapter into cache in the background for instant navigation.
 */
export function preloadChapter(chapter: { id: number } | undefined) {
  if (!chapter || chapterCache.has(chapter.id)) return;
  // Trigger background fetch without awaiting
  fetchChapterContent(chapter).catch(() => {});
}
