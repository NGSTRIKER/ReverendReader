import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { cookies } from "next/headers";
import { ManifestData } from "@/types/novel";
import { ReaderInterface } from "@/components/reader/ReaderInterface";
import { parseSettingsFromRaw } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Read Reverend Insanity | Distraction-Free Novel Reader",
  description:
    "Immerse yourself in Reverend Insanity with a fast, customizable reading experience. Browse 2,334 chapters with customizable typography, dark mode, and custom backgrounds.",
};

function loadManifest(): ManifestData {
  const manifestPath = path.join(process.cwd(), "public", "chapters.json");
  if (!fs.existsSync(manifestPath)) {
    throw new Error("Chapters manifest not found. Please run: python scripts/convert_epub.py");
  }
  const raw = fs.readFileSync(manifestPath, "utf-8");
  return JSON.parse(raw) as ManifestData;
}

interface ReadPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function ReadPage({ searchParams }: ReadPageProps) {
  const manifest = loadManifest();
  const resolvedParams = await searchParams;

  const rawChapterParam = resolvedParams.c;
  let initialChapterId = 1;

  const cookieStore = await cookies();

  if (typeof rawChapterParam === "string") {
    const parsed = parseInt(rawChapterParam, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= manifest.totalChapters) {
      initialChapterId = parsed;
    }
  } else {
    // If no query param, check reverend_last_read cookie
    const lastReadCookie = cookieStore.get("reverend_last_read")?.value;
    if (lastReadCookie) {
      const parsedLast = parseInt(lastReadCookie, 10);
      if (!isNaN(parsedLast) && parsedLast >= 1 && parsedLast <= manifest.totalChapters) {
        initialChapterId = parsedLast;
      }
    }
  }

  // Read saved theme settings from server-side cookies
  const themeCookie = cookieStore.get("reverend_theme_settings")?.value;
  const initialSettings = parseSettingsFromRaw(themeCookie);

  // Overlay individual cookies if set
  const surfaceThemeCookie = cookieStore.get("reverend_surface_theme")?.value;
  const fontCookie = cookieStore.get("reverend_font")?.value;
  const fontSizeCookie = cookieStore.get("reverend_font_size")?.value;
  const lineHeightCookie = cookieStore.get("reverend_line_height")?.value;
  const opacityCookie = cookieStore.get("reverend_surface_opacity")?.value;
  const maxWidthCookie = cookieStore.get("reverend_max_width")?.value;
  const fontColorCookie = cookieStore.get("reverend_font_color")?.value;

  if (surfaceThemeCookie) {
    initialSettings.surfaceTheme = surfaceThemeCookie as ManifestData extends never ? never : typeof initialSettings.surfaceTheme;
  }
  if (fontCookie) {
    initialSettings.font = fontCookie as typeof initialSettings.font;
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
  if (fontColorCookie) {
    try {
      initialSettings.fontColor = decodeURIComponent(fontColorCookie);
    } catch {
      initialSettings.fontColor = fontColorCookie;
    }
  }

  return (
    <ReaderInterface
      manifest={manifest}
      initialChapterId={initialChapterId}
      initialSettings={initialSettings}
    />
  );
}
