import type { ProgressPayload } from "./sync.ts";

export interface PendingProgressRecord {
  id: string;
  userId: string;
  writerId: string;
  sessionId: string;
  sequence: number;
  queuedAt: number;
  status: "pending" | "conflict";
  payload: ProgressPayload;
  authoritative?: {
    chapter_id: string | null;
    chapter_number: number | null;
    chapter_title: string | null;
    scroll_position: number | null;
    progress_updated_at: string | null;
    version: number;
    record_exists: boolean;
  } | null;
}

const PENDING_PREFIX = "reverend_pending_progress_v2_";
let writerId: string | null = null;

function storage(): Storage | null {
  try {
    return typeof localStorage === "undefined" ? null : localStorage;
  } catch {
    return null;
  }
}

function randomId(): string {
  try {
    return globalThis.crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  }
}

export function getProgressWriterId(): string {
  if (!writerId) writerId = randomId();
  return writerId;
}

function keyPrefix(userId: string): string {
  return `${PENDING_PREFIX}${encodeURIComponent(userId)}_`;
}

function recordKey(userId: string, recordWriterId: string): string {
  return `${keyPrefix(userId)}${encodeURIComponent(recordWriterId)}`;
}

function isPayload(value: unknown): value is ProgressPayload {
  if (!value || typeof value !== "object") return false;
  const payload = value as Partial<ProgressPayload>;
  return (
    typeof payload.chapter_id === "string" &&
    Number.isInteger(payload.chapter_number) &&
    typeof payload.chapter_title === "string" &&
    typeof payload.scroll_position === "number" &&
    (payload.expected_version === null ||
      (typeof payload.expected_version === "number" &&
        Number.isInteger(payload.expected_version) &&
        payload.expected_version >= 0))
  );
}

function parseRecord(raw: string | null, userId: string): PendingProgressRecord | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<PendingProgressRecord>;
    if (
      value.userId !== userId ||
      typeof value.id !== "string" ||
      typeof value.writerId !== "string" ||
      typeof value.sessionId !== "string" ||
      !Number.isInteger(value.sequence) ||
      typeof value.queuedAt !== "number" ||
      (value.status !== "pending" && value.status !== "conflict") ||
      !isPayload(value.payload)
    ) {
      return null;
    }
    return value as PendingProgressRecord;
  } catch {
    return null;
  }
}

/** Queue a new user action before sending it. Failed responses never rewrite it. */
export function queueProgress(
  userId: string,
  recordWriterId: string,
  sessionId: string,
  payload: ProgressPayload
): PendingProgressRecord | null {
  if (!userId || !recordWriterId || !sessionId || !isPayload(payload)) return null;
  const store = storage();
  if (!store) return null;

  const key = recordKey(userId, recordWriterId);
  const current = parseRecord(store.getItem(key), userId);
  const record: PendingProgressRecord = {
    id: randomId(),
    userId,
    writerId: recordWriterId,
    sessionId,
    sequence: (current?.sequence ?? 0) + 1,
    queuedAt: Date.now(),
    status: "pending",
    payload: { ...payload },
  };

  try {
    store.setItem(key, JSON.stringify(record));
    return record;
  } catch {
    return null;
  }
}

export function getPendingProgress(userId: string, recordWriterId: string): PendingProgressRecord | null {
  const store = storage();
  if (!store || !userId || !recordWriterId) return null;
  try {
    return parseRecord(store.getItem(recordKey(userId, recordWriterId)), userId);
  } catch {
    return null;
  }
}

/**
 * Enumerates only this account's queues. Per-writer keys keep tabs from
 * overwriting each other's pending records; the database CAS resolves races.
 */
export function listPendingProgress(userId: string): PendingProgressRecord[] {
  const store = storage();
  if (!store || !userId) return [];
  const prefix = keyPrefix(userId);
  const records: PendingProgressRecord[] = [];

  try {
    for (let index = 0; index < store.length; index += 1) {
      const key = store.key(index);
      if (!key?.startsWith(prefix)) continue;
      const record = parseRecord(store.getItem(key), userId);
      if (record) records.push(record);
    }
  } catch {
    return records;
  }

  return records.sort((a, b) => a.queuedAt - b.queuedAt || a.sequence - b.sequence);
}

function updateRecord(
  userId: string,
  recordWriterId: string,
  expectedId: string,
  update: (current: PendingProgressRecord) => PendingProgressRecord
): PendingProgressRecord | null {
  const store = storage();
  if (!store || !userId || !recordWriterId || !expectedId) return null;

  const key = recordKey(userId, recordWriterId);
  try {
    const current = parseRecord(store.getItem(key), userId);
    if (!current || current.id !== expectedId) return null;
    const next = update(current);
    store.setItem(key, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function rebasePendingProgress(
  userId: string,
  recordWriterId: string,
  expectedId: string,
  expectedVersion: number
): PendingProgressRecord | null {
  if (!Number.isInteger(expectedVersion) || expectedVersion < 0) return null;
  return updateRecord(userId, recordWriterId, expectedId, (record) => ({
    ...record,
    status: "pending",
    authoritative: undefined,
    payload: { ...record.payload, expected_version: expectedVersion },
  }));
}

export function markPendingProgressConflict(
  userId: string,
  recordWriterId: string,
  expectedId: string,
  authoritative: PendingProgressRecord["authoritative"]
): PendingProgressRecord | null {
  return updateRecord(userId, recordWriterId, expectedId, (record) => ({
    ...record,
    status: "conflict",
    authoritative,
  }));
}

/** Clear only the operation whose response arrived; later writes remain queued. */
export function clearPendingProgress(
  userId: string,
  recordWriterId: string,
  expectedId: string
): boolean {
  const store = storage();
  if (!store || !userId || !recordWriterId || !expectedId) return false;
  const key = recordKey(userId, recordWriterId);
  try {
    const current = parseRecord(store.getItem(key), userId);
    if (!current || current.id !== expectedId) return false;
    store.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
