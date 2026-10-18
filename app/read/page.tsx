import fs from "fs";
import path from "path";
import { Metadata } from "next";
import { ManifestData } from "@/types/novel";
import { ReaderInterface } from "@/components/reader/ReaderInterface";

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

  if (typeof rawChapterParam === "string") {
    const parsed = parseInt(rawChapterParam, 10);
    if (!isNaN(parsed) && parsed >= 1 && parsed <= manifest.totalChapters) {
      initialChapterId = parsed;
    }
  }

  return (
    <ReaderInterface
      manifest={manifest}
      initialChapterId={initialChapterId}
    />
  );
}
