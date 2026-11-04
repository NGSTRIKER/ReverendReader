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
import { syncReadingProgress } from "../lib/supabase/sync.ts";

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

console.log(`\n${passed} offline security checks passed.`);
