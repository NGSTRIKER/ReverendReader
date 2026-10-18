import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ManifestData } from "@/types/novel";

let cachedManifest: ManifestData | null = null;
let cachedManifestTime = 0;

function getManifest(): ManifestData | null {
  const now = Date.now();
  if (cachedManifest && now - cachedManifestTime < 60000) {
    return cachedManifest;
  }

  const manifestPath = path.join(process.cwd(), "public", "chapters.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    cachedManifest = JSON.parse(raw) as ManifestData;
    cachedManifestTime = now;
    return cachedManifest;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");

  if (!idParam) {
    return NextResponse.json({ error: "Missing chapter ID" }, { status: 400 });
  }

  const chapterId = parseInt(idParam, 10);
  if (isNaN(chapterId) || chapterId < 1) {
    return NextResponse.json({ error: "Invalid chapter ID" }, { status: 400 });
  }

  const manifest = getManifest();
  if (!manifest) {
    return NextResponse.json({ error: "Manifest not found" }, { status: 500 });
  }

  const chapter = manifest.chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const novelPath = path.join(process.cwd(), "public", "novel.txt");
  if (!fs.existsSync(novelPath)) {
    return NextResponse.json({ error: "Novel asset not found" }, { status: 500 });
  }

  const stats = fs.statSync(novelPath);
  const start = chapter.startByte;
  const end = Math.min(chapter.endByte - 1, stats.size - 1);

  if (start > end || start >= stats.size) {
    return NextResponse.json({ error: "Invalid chapter byte range" }, { status: 416 });
  }

  const stream = fs.createReadStream(novelPath, { start, end });
  // Convert Node readable stream to Web ReadableStream
  const webStream = new ReadableStream({
    start(controller) {
      stream.on("data", (chunk) => controller.enqueue(chunk));
      stream.on("end", () => controller.close());
      stream.on("error", (err) => controller.error(err));
    },
    cancel() {
      stream.destroy();
    },
  });

  return new Response(webStream, {
    status: 206,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Range": `bytes ${start}-${end}/${stats.size}`,
      "Content-Length": String(end - start + 1),
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
