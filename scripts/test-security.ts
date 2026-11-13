import assert from "node:assert/strict";
import { getSafeRedirectUrl } from "../lib/auth/redirect.ts";
import { getSafeBaseOrigin } from "../lib/auth/origin.ts";
import { createContentSecurityPolicy } from "../lib/security/csp.ts";
import {
  clearPendingProgress,
  getPendingProgress,
  listPendingProgress,
  markPendingProgressConflict,
  queueProgress,
  rebasePendingProgress,
} from "../lib/supabase/progressQueue.ts";
import { syncReadingProgress, addCloudBookmark } from "../lib/supabase/sync.ts";
import {
  loadSidebarVisibility,
  resolveSettingsFromCookies,
  saveSidebarVisibility,
} from "../lib/storage.ts";
import {
  isValidChapterId,
  isValidUuid,
  sanitizeAvatarUrl,
  validateCommentText,
  withActionLock,
  setChapterLike,
  createChapterComment,
  fetchChapterComments,
  reportComment,
  getRandomPollIntervalMs,
  MIN_POLL_INTERVAL_MS,
  MAX_POLL_INTERVAL_MS,
  cleanPublicUsername,
  formatAuthorNames,
} from "../lib/supabase/social.ts";

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>();
  get length() { return this.values.size; }
  clear() { this.values.clear(); }
  getItem(key: string) { return this.values.get(key) ?? null; }
  key(index: number) { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string) { this.values.delete(key); }
  setItem(key: string, value: string) { this.values.set(key, String(value)); }
}

const storage = new MemoryStorage();
Object.defineProperty(globalThis, "localStorage", { configurable: true, value: storage });

let passed = 0;
async function check(name: string, assertion: () => void | Promise<void>) {
  await assertion();
  passed += 1;
  console.log(`PASS ${name}`);
}

const payload = {
  chapter_id: "42",
  chapter_number: 42,
  chapter_title: "Chapter 42",
  scroll_position: 0.5,
  expected_version: 2,
};

await check("queue is scoped to authenticated account", () => {
  const a = queueProgress("account-a", "writer-a", "session-a", payload);
  assert.ok(a);
  assert.equal(getPendingProgress("account-b", "writer-a"), null);
  assert.deepEqual(listPendingProgress("account-a").map((entry) => entry.id), [a.id]);
});

await check("late completion cannot clear a newer queued operation", () => {
  const first = queueProgress("account-a", "writer-race", "session-a", payload);
  const newer = queueProgress("account-a", "writer-race", "session-a", {
    ...payload,
    chapter_id: "43",
    chapter_number: 43,
  });
  assert.ok(first && newer);
  assert.equal(clearPendingProgress("account-a", "writer-race", first.id), false);
  assert.equal(getPendingProgress("account-a", "writer-race")?.id, newer.id);
});

await check("retry rebases exact queue item and preserves payload", () => {
  const queued = queueProgress("account-a", "writer-rebase", "session-a", payload);
  assert.ok(queued);
  const rebased = rebasePendingProgress("account-a", "writer-rebase", queued.id, 7);
  assert.equal(rebased?.payload.expected_version, 7);
  assert.equal(rebased?.payload.chapter_id, payload.chapter_id);
});

await check("stale queue conflict is retained instead of discarded", () => {
  const queued = queueProgress("account-a", "writer-conflict", "old-session", payload);
  assert.ok(queued);
  const conflict = markPendingProgressConflict("account-a", "writer-conflict", queued.id, {
    chapter_id: "51",
    chapter_number: 51,
    chapter_title: "Chapter 51",
    scroll_position: 0.8,
    progress_updated_at: "2026-01-01T00:00:00.000Z",
    version: 9,
    record_exists: true,
  });
  assert.equal(conflict?.status, "conflict");
  assert.equal(getPendingProgress("account-a", "writer-conflict")?.id, queued.id);
});

await check("sync RPC fails closed and makes no direct table write", async () => {
  let directWriteCalled = false;
  const client = {
    rpc: async () => ({ data: null, error: { message: "RPC unavailable" } }),
    from: () => {
      directWriteCalled = true;
      throw new Error("unexpected direct write");
    },
  } as never;
  const result = await syncReadingProgress(client, "account-a", payload);
  assert.equal(result.success, false);
  assert.equal(directWriteCalled, false);
});

await check("OAuth callback rejects forwarded-host spoofing", () => {
  const env = {
    NODE_ENV: "production",
    NEXT_PUBLIC_SITE_URL: "https://reader.example",
    VERCEL_URL: "preview-team.vercel.app",
  } as NodeJS.ProcessEnv;
  assert.equal(
    getSafeBaseOrigin("https://attacker.example/auth/callback", "attacker.example", env),
    "https://reader.example"
  );
  assert.equal(
    getSafeBaseOrigin("https://attacker.example/auth/callback", "preview-team.vercel.app", env),
    "https://preview-team.vercel.app"
  );
});

await check("production CSP uses nonce and excludes unsafe inline/eval scripts", () => {
  const csp = createContentSecurityPolicy("test-nonce", "https://project.supabase.co", false);
  assert.match(csp, /'nonce-test-nonce'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-inline'/);
  assert.doesNotMatch(csp, /script-src[^;]*'unsafe-eval'/);
  assert.match(createContentSecurityPolicy("dev", "http://localhost:54321", true), /'unsafe-eval'/);
});

await check("relative OAuth redirects reject external destinations", () => {
  assert.equal(getSafeRedirectUrl("https://evil.example"), "/");
  assert.equal(getSafeRedirectUrl("//evil.example"), "/");
  assert.equal(getSafeRedirectUrl("/read?c=42"), "/read?c=42");
});

await check("chapter ID validator enforces 1..2334 range and rejects SQL/path payloads", () => {
  assert.equal(isValidChapterId(1), true);
  assert.equal(isValidChapterId("2334"), true);
  assert.equal(isValidChapterId(0), false);
  assert.equal(isValidChapterId(2335), false);
  assert.equal(isValidChapterId("01"), false);
  assert.equal(isValidChapterId("1; DROP TABLE comments;"), false);
});

await check("avatar URL sanitizer allows only Discord CDN HTTPS URLs", () => {
  assert.equal(
    sanitizeAvatarUrl("https://cdn.discordapp.com/avatars/12345/abcdef.png?size=128"),
    "https://cdn.discordapp.com/avatars/12345/abcdef.png?size=128"
  );
  assert.equal(sanitizeAvatarUrl("javascript:alert(1)"), null);
  assert.equal(sanitizeAvatarUrl("https://evil.example/avatar.png"), null);
});

await check("comment validator strips control chars, trims, and enforces 1..1000 length", () => {
  assert.equal(validateCommentText("   \n\t  ").valid, false);
  const cleaned = validateCommentText("  Hello\x00\x07\r\n\r\n\r\nWorld  ");
  assert.equal(cleaned.valid, true);
  assert.equal(cleaned.normalized, "Hello\n\nWorld");
  assert.equal(validateCommentText("a".repeat(1001)).valid, false);
});

await check("in-flight action lock prevents duplicate rapid-click writes", async () => {
  let executions = 0;
  let release!: () => void;
  const gate = new Promise<void>((r) => {
    release = r;
  });

  const firstPromise = withActionLock("like:1", async () => {
    executions += 1;
    await gate;
    return "done";
  });
  const duplicateAttempt = await withActionLock("like:1", async () => {
    executions += 1;
    return "duplicate";
  });

  assert.equal(duplicateAttempt.locked, true);
  release();
  const firstResult = await firstPromise;
  assert.equal(firstResult.locked, false);
  assert.equal(executions, 1);
});

await check("social write helpers never send client-supplied user_id or reporter_id", async () => {
  const insertedPayloads: Record<string, unknown>[] = [];
  const mockSupabase = {
    from: () => ({
      insert: (row: Record<string, unknown>) => {
        insertedPayloads.push(row);
        return {
          error: null,
          select: () => ({
            single: async () => ({
              data: {
                id: "11111111-1111-4111-8111-111111111111",
                chapter_id: "1",
                parent_id: null,
                content: "Safe",
                is_spoiler: false,
                is_deleted: false,
                like_count: 0,
                reply_count: 0,
                created_at: "2026-11-04T00:00:00Z",
                updated_at: "2026-11-04T00:00:00Z",
              },
              error: null,
            }),
          }),
        };
      },
    }),
  } as never;

  await setChapterLike(mockSupabase, 1, true);
  await createChapterComment(mockSupabase, { chapterId: 1, content: "Safe", isSpoiler: true });
  await reportComment(mockSupabase, {
    commentId: "11111111-1111-4111-8111-111111111111",
    reason: "spoiler",
    details: "Unmarked spoiler",
  });

  assert.equal(insertedPayloads.length, 3);
  for (const row of insertedPayloads) {
    assert.equal("user_id" in row, false);
    assert.equal("reporter_id" in row, false);
  }
});

await check("cursor pagination slices pageSize and computes nextCursor", async () => {
  const rows = Array.from({ length: 21 }, (_, idx) => ({
    id: `00000000-0000-4000-8000-${String(idx + 1).padStart(12, "0")}`,
    chapter_id: "1",
    parent_id: null,
    content: `Comment ${idx + 1}`,
    is_spoiler: false,
    is_deleted: false,
    created_at: `2026-11-04T00:${String(idx).padStart(2, "0")}:00Z`,
    updated_at: `2026-11-04T00:${String(idx).padStart(2, "0")}:00Z`,
    like_count: 50 - idx,
    reply_count: 0,
    author_username: "user",
    author_display_name: "User",
    author_avatar_url: "https://evil.example/x.png",
    viewer_liked: false,
    is_own: false,
  }));

  const mockSupabase = {
    rpc: async () => ({ data: rows, error: null }),
  } as never;

  const page = await fetchChapterComments(mockSupabase, 1, "top", null, 20);
  assert.equal(page.success, true);
  assert.equal(page.comments.length, 20);
  assert.equal(page.hasMore, true);
  assert.equal(page.nextCursor?.likeCount, 31);
  assert.equal(page.comments[0].author_avatar_url, null);
});

await check("bookmark helper rejects out-of-range chapter IDs before querying DB", async () => {
  let dbCalled = false;
  const mockSupabase = {
    from: () => {
      dbCalled = true;
      throw new Error("should not be called");
    },
  } as never;
  const res = await addCloudBookmark(mockSupabase, "user-1", {
    chapterId: 9999,
    chapterNumber: 9999,
    chapterTitle: "Invalid",
    createdAt: new Date().toISOString(),
  });
  assert.equal(res.success, false);
  assert.equal(dbCalled, false);
  assert.equal(isValidUuid("11111111-1111-4111-8111-111111111111"), true);
  assert.equal(isValidUuid("not-a-uuid"), false);
});

await check("sidebar visibility defaults to visible and persists in localStorage", () => {
  Object.defineProperty(globalThis, "window", { configurable: true, value: globalThis });
  storage.clear();
  assert.equal(loadSidebarVisibility(), true);
  saveSidebarVisibility(false);
  assert.equal(loadSidebarVisibility(), false);
  saveSidebarVisibility(true);
  assert.equal(loadSidebarVisibility(), true);
});

await check("active polling intervals are randomized between 10s and 40s to prevent request clumping", () => {
  assert.equal(MIN_POLL_INTERVAL_MS, 10_000);
  assert.equal(MAX_POLL_INTERVAL_MS, 40_000);
  const sample = Array.from({ length: 50 }, () => getRandomPollIntervalMs());
  for (const interval of sample) {
    assert.ok(
      interval >= 10_000 && interval <= 40_000,
      `interval ${interval} out of bounds`
    );
  }
  const uniqueValues = new Set(sample);
  assert.ok(uniqueValues.size > 15, "polling intervals must be randomized across clients");
});

await check("UI author formatting suppresses emails while showing usernames cleanly", () => {
  // Strips email domain from username
  assert.equal(cleanPublicUsername("alice@gmail.com"), "alice");
  assert.equal(cleanPublicUsername("@alice"), "alice");
  assert.equal(cleanPublicUsername("fang_yuan"), "fang_yuan");
  assert.equal(cleanPublicUsername(""), null);
  assert.equal(cleanPublicUsername(null), null);

  // Masks email if stored as display name and falls back to username
  const case1 = formatAuthorNames("alice@gmail.com", "alice");
  assert.equal(case1.authorLabel, "alice");
  assert.equal(case1.displayUsername, null); // don't repeat @alice when authorLabel is alice

  // When both are email, strips domain and shows username
  const case2 = formatAuthorNames("john.doe@sect.org", "john.doe@sect.org");
  assert.equal(case2.authorLabel, "john.doe");
  assert.equal(case2.displayUsername, null);

  // User with display name and username uses Discord username for display name
  const case3 = formatAuthorNames("Fang Yuan", "great_love");
  assert.equal(case3.authorLabel, "great_love");
  assert.equal(case3.displayUsername, null);

  // Anonymous user
  const case4 = formatAuthorNames(null, null);
  assert.equal(case4.authorLabel, "Cultivator");
  assert.equal(case4.displayUsername, null);
});

await check("resolveSettingsFromCookies sanitizes font, color, theme, and numeric bounds", () => {
  const safeCookies: Record<string, string> = {
    reverend_font: "bellota",
    reverend_font_color: "#1a2b3c",
    reverend_surface_theme: "catppuccin-mocha",
    reverend_font_size: "20",
    reverend_line_height: "1.8",
    reverend_letter_spacing: "0.02",
    reverend_max_width: "820",
    reverend_text_align: "justify",
    reverend_scroll_fluidity: "65",
  };
  const safeResult = resolveSettingsFromCookies((name) => safeCookies[name]);
  assert.equal(safeResult.hasLoaded, true);
  assert.equal(safeResult.settings.font, "bellota");
  assert.equal(safeResult.settings.fontColor, "#1a2b3c");
  assert.equal(safeResult.settings.surfaceTheme, "catppuccin-mocha");
  assert.equal(safeResult.settings.fontSize, 20);
  assert.equal(safeResult.settings.lineHeight, 1.8);
  assert.equal(safeResult.settings.letterSpacing, 0.02);
  assert.equal(safeResult.settings.maxWidth, 820);
  assert.equal(safeResult.settings.textAlign, "justify");
  assert.equal(safeResult.settings.scrollFluidity, 65);

  const maliciousCookies: Record<string, string> = {
    reverend_font: "javascript:alert(1)",
    reverend_font_color: "red; background-image: url(https://evil.test)",
    reverend_surface_theme: "invalid-theme",
    reverend_font_size: "999",
    reverend_line_height: "0.1",
    reverend_letter_spacing: "5",
    reverend_max_width: "100",
    reverend_text_align: "justify-all",
    reverend_scroll_fluidity: "999",
  };
  const maliciousResult = resolveSettingsFromCookies((name) => maliciousCookies[name]);
  assert.equal(maliciousResult.settings.font, "mono");
  assert.equal(maliciousResult.settings.fontColor, "#e4e8f0");
  assert.equal(maliciousResult.settings.surfaceTheme, "matte-terminal");
  assert.equal(maliciousResult.settings.fontSize, 32);
  assert.equal(maliciousResult.settings.lineHeight, 1.3);
  assert.equal(maliciousResult.settings.letterSpacing, 2.5);
  assert.equal(maliciousResult.settings.maxWidth, 560);
  assert.equal(maliciousResult.settings.textAlign, "left");
  assert.equal(maliciousResult.settings.scrollFluidity, 100);
});

await check("createContentSecurityPolicy falls back cleanly on malformed supabaseUrl", () => {
  const csp = createContentSecurityPolicy("nonce-123", "not a valid url", false);
  assert.match(csp, /https:\/\/placeholder\.supabase\.co/);
  assert.match(csp, /wss:\/\/placeholder\.supabase\.co/);
});

console.log(`\n${passed} offline security checks passed.`);
