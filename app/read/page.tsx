import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { ManifestData, ChapterMetadata } from "@/types/novel";
import { ReaderInterface, InitialChapterInfo } from "@/components/reader/ReaderInterface";
import { parseSettingsFromRaw } from "@/lib/storage";
import { cleanChapterContent } from "@/lib/chapterFetcher";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Read Reverend Insanity Online",
  description:
    "Read all 2,334 chapters of Reverend Insanity by Gu Zhenren with adjustable type, light and dark themes, bookmarks, and synced progress.",
  alternates: {
    canonical: "/read",
  },
};

// In-memory cached manifests on the server
let cachedManifestEn: ManifestData | null = null;
let cachedManifestZh: ManifestData | null = null;

function getServerManifest(edition: "en" | "zh" = "en"): ManifestData {
  if (edition === "zh") {
    if (cachedManifestZh) return cachedManifestZh;
    const manifestPath = path.join(process.cwd(), "public", "chapters-zh.json");
    if (!fs.existsSync(manifestPath)) {
      throw new Error("Chinese chapters manifest not found.");
    }
    const raw = fs.readFileSync(manifestPath, "utf-8");
    cachedManifestZh = JSON.parse(raw) as ManifestData;
    return cachedManifestZh;
  }

  if (cachedManifestEn) return cachedManifestEn;
  const manifestPath = path.join(process.cwd(), "public", "chapters.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Chapters manifest not found. Please run: python scripts/convert_epub.py");
  }
  const raw = fs.readFileSync(manifestPath, "utf-8");
  cachedManifestEn = JSON.parse(raw) as ManifestData;
  return cachedManifestEn;
}

/**
 * Reads initial chapter byte slice directly on server in ~0.5ms.
 * Guarantees zero loading skeleton on initial page load and 100 SEO indexability.
 */
function getServerChapterContent(
  chapter: ChapterMetadata,
  edition: "en" | "zh" = "en"
): string | null {
  try {
    const fileName = edition === "zh" ? "novel-zh.txt" : "novel.txt";
    const novelPath = path.join(process.cwd(), "public", fileName);
    if (!fs.existsSync(novelPath)) return null;
    const fd = fs.openSync(novelPath, "r");
    const len = chapter.length;
    const buf = Buffer.alloc(len);
    fs.readSync(fd, buf, 0, len, chapter.startByte);
    fs.closeSync(fd);
    return cleanChapterContent(buf.toString("utf-8"));
  } catch {
    return null;
  }
}

interface ReadPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReadPage({ searchParams }: ReadPageProps) {
  const resolvedParams = await searchParams;
  const cookieStore = await cookies();
  const rawLangParam = resolvedParams.lang || resolvedParams.edition;
  const cookieEdition = cookieStore.get("reverend_reader_edition")?.value;
  const initialEdition: "en" | "zh" =
    rawLangParam === "zh" || rawLangParam === "raw" || (!rawLangParam && cookieEdition === "zh") ? "zh" : "en";
  const manifest = getServerManifest(initialEdition);

  const rawChapterParam = resolvedParams.c || resolvedParams.id;
  let initialChapterId = 1;
  let initialScroll: number | undefined;
  let initialVersion: number | undefined;
  let initialUserId: string | undefined;
  let cloudChapterId: number | undefined;
  let cloudScroll: number | undefined;

  if (typeof rawChapterParam === "string") {
    const parsed = parseInt(rawChapterParam, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= manifest.totalChapters) {
      initialChapterId = parsed;
    }
  }

  // Fetch the authenticated user's version even when a chapter was explicitly
  // selected. The version is the CAS baseline; chapter navigation still wins.
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      initialUserId = user.id;
      const { data: progress, error } = await supabase
        .from("reading_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!error) {
        initialVersion = progress?.version ?? 0;
        if (progress?.chapter_id) {
          const parsed = parseInt(progress.chapter_id, 10);
          if (!isNaN(parsed) && parsed >= 1 && parsed <= manifest.totalChapters) {
            cloudChapterId = parsed;
            cloudScroll = progress.scroll_position;
          }
        }
      }
    }
  } catch {
    // Public reading remains available if auth or the progress query is unavailable.
  }

  if (typeof rawChapterParam !== "string" && cloudChapterId !== undefined) {
    initialChapterId = cloudChapterId;
    initialScroll = cloudScroll;
  } else if (typeof rawChapterParam !== "string" && initialChapterId === 1) {
    const lastReadCookie = cookieStore.get("reverend_last_read")?.value;
    if (lastReadCookie) {
      const parsedLast = parseInt(lastReadCookie, 10);
      if (!isNaN(parsedLast) && parsedLast >= 1 && parsedLast <= manifest.totalChapters) {
        initialChapterId = parsedLast;
      }
    }
  }

  // If explicit scroll parameter is passed in URL (e.g. /read?id=5&scroll=0.45)
  if (typeof resolvedParams.scroll === "string") {
    const parsedScroll = parseFloat(resolvedParams.scroll);
    if (!isNaN(parsedScroll) && parsedScroll >= 0 && parsedScroll <= 1) {
      initialScroll = parsedScroll;
    }
  }

  // Get current chapter metadata (only ~80 bytes serialized into HTML instead of 520KB)
  const chapterMeta =
    manifest.chapters.find((c) => c.id === initialChapterId) || manifest.chapters[0];
  const initialChapter: InitialChapterInfo = {
    id: chapterMeta.id,
    number: chapterMeta.number,
    title: chapterMeta.title,
    wordCount: chapterMeta.wordCount,
  };

  // Pre-render chapter text directly on server (eliminates spinner, maximizes LCP, 100 SEO)
  const initialContent = getServerChapterContent(chapterMeta, initialEdition);

  // Read saved typography settings from server-side cookies
  const themeCookie = cookieStore.get("reverend_theme_settings")?.value;
  const initialSettings = parseSettingsFromRaw(themeCookie);

  const fontSizeCookie = cookieStore.get("reverend_font_size")?.value;
  const lineHeightCookie = cookieStore.get("reverend_line_height")?.value;
  const opacityCookie = cookieStore.get("reverend_surface_opacity")?.value;
  const surfaceThemeCookie = cookieStore.get("reverend_surface_theme")?.value;
  const fontCookie = cookieStore.get("reverend_font")?.value;
  const fontColorCookie = cookieStore.get("reverend_font_color")?.value;
  const maxWidthCookie = cookieStore.get("reverend_max_width")?.value;
  const letterSpacingCookie = cookieStore.get("reverend_letter_spacing")?.value;
  const textAlignCookie = cookieStore.get("reverend_text_align")?.value;

  if (fontCookie) {
    initialSettings.font = fontCookie as typeof initialSettings.font;
  }
  if (surfaceThemeCookie) {
    initialSettings.surfaceTheme = surfaceThemeCookie as typeof initialSettings.surfaceTheme;
  }
  if (fontColorCookie) {
    initialSettings.fontColor = fontColorCookie;
  }
  if (textAlignCookie === "left" || textAlignCookie === "justify") {
    initialSettings.textAlign = textAlignCookie;
  }
  if (fontSizeCookie && !isNaN(parseInt(fontSizeCookie, 10))) {
    initialSettings.fontSize = parseInt(fontSizeCookie, 10);
  }
  if (lineHeightCookie && !isNaN(parseFloat(lineHeightCookie))) {
    initialSettings.lineHeight = parseFloat(lineHeightCookie);
  }
  if (opacityCookie && !isNaN(parseFloat(opacityCookie))) {
    initialSettings.surfaceOpacity = parseFloat(opacityCookie);
  }
  if (maxWidthCookie && !isNaN(parseInt(maxWidthCookie, 10))) {
    initialSettings.maxWidth = parseInt(maxWidthCookie, 10);
  }
  if (letterSpacingCookie && !isNaN(parseFloat(letterSpacingCookie))) {
    initialSettings.letterSpacing = parseFloat(letterSpacingCookie);
  }

  return (
    <ReaderInterface
      manifest={manifest}
      initialEdition={initialEdition}
      initialChapter={initialChapter}
      totalChapters={manifest.totalChapters}
      initialContent={initialContent}
      initialSettings={initialSettings}
      initialScroll={initialScroll}
      initialVersion={initialVersion}
      initialUserId={initialUserId}
    />
  );
}
