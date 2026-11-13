import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { ManifestData } from "@/types/novel";

let cachedManifestEn: ManifestData | null = null;
let cachedManifestEnTime = 0;
let cachedManifestZh: ManifestData | null = null;
let cachedManifestZhTime = 0;
let cachedNovelSizeEn: number | null = null;
let cachedNovelSizeEnTime = 0;
let cachedNovelSizeZh: number | null = null;
let cachedNovelSizeZhTime = 0;
const NOVEL_SIZE_TTL_MS = 60_000;

async function getNovelSize(novelPath: string, edition: string): Promise<number | null> {
  const now = Date.now();
  const cachedSize = edition === "zh" ? cachedNovelSizeZh : cachedNovelSizeEn;
  const cachedTime = edition === "zh" ? cachedNovelSizeZhTime : cachedNovelSizeEnTime;

  if (cachedSize !== null && now - cachedTime < NOVEL_SIZE_TTL_MS) {
    return cachedSize;
  }

  try {
    const stats = await fs.promises.stat(novelPath);
    if (edition === "zh") {
      cachedNovelSizeZh = stats.size;
      cachedNovelSizeZhTime = now;
    } else {
      cachedNovelSizeEn = stats.size;
      cachedNovelSizeEnTime = now;
    }
    return stats.size;
  } catch {
    return null;
  }
}

// Best-effort per-instance rate limiter. Serverless instances do not share this
// map, so this is a local abuse throttle, not a deployment-wide quota.
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();
const MAX_TRACKED_IPS = 10_000;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const windowMs = 60000;
  const limit = 120;

  const record = ipRequestCounts.get(ip);
  if (!record || now > record.resetAt) {
    if (!record && ipRequestCounts.size >= MAX_TRACKED_IPS) {
      // Drop expired entries first; if still full, evict the earliest expiry.
      for (const [key, value] of ipRequestCounts) {
        if (now > value.resetAt) ipRequestCounts.delete(key);
      }
      if (ipRequestCounts.size >= MAX_TRACKED_IPS) {
        let oldestKey: string | null = null;
        let oldestExpiry = Infinity;
        for (const [key, value] of ipRequestCounts) {
          if (value.resetAt < oldestExpiry) {
            oldestKey = key;
            oldestExpiry = value.resetAt;
          }
        }
        if (oldestKey) ipRequestCounts.delete(oldestKey);
      }
    }
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }

  record.count += 1;
  return record.count > limit;
}

// Clean up expired IP entries every 5 minutes to prevent memory growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipRequestCounts.entries()) {
    if (now > record.resetAt) {
      ipRequestCounts.delete(ip);
    }
  }
}, 300000).unref?.();

function getManifest(edition: "en" | "zh" = "en"): ManifestData | null {
  const now = Date.now();
  if (edition === "zh") {
    if (cachedManifestZh && now - cachedManifestZhTime < 60000) {
      return cachedManifestZh;
    }
    const manifestPath = path.join(process.cwd(), "public", "chapters-zh.json");
    if (!fs.existsSync(manifestPath)) return null;
    try {
      const raw = fs.readFileSync(manifestPath, "utf-8");
      cachedManifestZh = JSON.parse(raw) as ManifestData;
      cachedManifestZhTime = now;
      return cachedManifestZh;
    } catch {
      return null;
    }
  }

  if (cachedManifestEn && now - cachedManifestEnTime < 60000) {
    return cachedManifestEn;
  }

  const manifestPath = path.join(process.cwd(), "public", "chapters.json");
  if (!fs.existsSync(manifestPath)) {
    return null;
  }

  try {
    const raw = fs.readFileSync(manifestPath, "utf-8");
    cachedManifestEn = JSON.parse(raw) as ManifestData;
    cachedManifestEnTime = now;
    return cachedManifestEn;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  // Rate limiting check
  const clientIp =
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",").at(-1)?.trim() ||
    "unknown-ip";

  if (isRateLimited(clientIp)) {
    return NextResponse.json(
      { error: "Too many requests. Please slow down." },
      {
        status: 429,
        headers: {
          "Retry-After": "60",
        },
      }
    );
  }

  const { searchParams } = new URL(request.url);
  const idParam = searchParams.get("id");
  const rawEdition = searchParams.get("edition") || searchParams.get("lang");
  const edition: "en" | "zh" = rawEdition === "zh" || rawEdition === "raw" ? "zh" : "en";

  if (!idParam) {
    return NextResponse.json({ error: "Missing chapter ID" }, { status: 400 });
  }

  if (!/^[1-9][0-9]{0,3}$/.test(idParam)) {
    return NextResponse.json({ error: "Invalid chapter ID" }, { status: 400 });
  }
  const chapterId = Number(idParam);

  const manifest = getManifest(edition);
  if (!manifest) {
    return NextResponse.json({ error: "Manifest not found" }, { status: 500 });
  }

  const chapter = manifest.chapters.find((c) => c.id === chapterId);
  if (!chapter) {
    return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
  }

  const novelFileName = edition === "zh" ? "novel-zh.txt" : "novel.txt";
  const novelPath = path.join(process.cwd(), "public", novelFileName);
  const novelSize = await getNovelSize(novelPath, edition);
  if (novelSize === null) {
    return NextResponse.json({ error: "Novel asset not found" }, { status: 500 });
  }

  const start = chapter.startByte;
  const end = Math.min(chapter.endByte - 1, novelSize - 1);

  if (
    !Number.isInteger(start) ||
    !Number.isInteger(end) ||
    start < 0 ||
    start > end ||
    start >= novelSize
  ) {
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
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Content-Length": String(end - start + 1),
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "public, max-age=86400, stale-while-revalidate=604800",
    },
  });
}
