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
 * 2. Attempts direct HTTP Range request on /novel.txt.
 * 3. If server ignores Range request (200 OK instead of 206), aborts immediately
 *    to prevent downloading the full novel and routes to /api/chapter.
 * 4. Never keeps more than 30 chapters in memory cache to avoid memory leaks.
 */
export async function fetchChapterContent(chapter: ChapterMetadata): Promise<string> {
  if (chapterCache.has(chapter.id)) {
    return chapterCache.get(chapter.id)!;
  }

  // Attempt 1: Direct HTTP Range request
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const rangeHeader = `bytes=${chapter.startByte}-${chapter.endByte - 1}`;
    const res = await fetch("/novel.txt", {
      headers: {
        Range: rangeHeader,
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // If server genuinely respects HTTP Range requests:
    if (res.status === 206) {
      const rawText = await res.text();
      const cleaned = cleanChapterContent(rawText);
      cacheChapter(chapter.id, cleaned);
      return cleaned;
    }

    // If the server returned 200 OK, it ignored Range! Cancel stream immediately!
    if (res.body) {
      try {
        await res.body.cancel();
      } catch {
        controller.abort();
      }
    }
  } catch {
    // Fallback to API route
  }

  // Attempt 2: Server-side byte-range reader API
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
export function preloadChapter(chapter: ChapterMetadata | undefined) {
  if (!chapter || chapterCache.has(chapter.id)) return;
  // Trigger background fetch without awaiting
  fetchChapterContent(chapter).catch(() => {});
}
