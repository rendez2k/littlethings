/** Locally-generated stable UUIDs + timestamps (brief §16, sync-ready). */

export function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Extremely unlikely fallback for environments without WebCrypto.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.floor(Math.random() * 16);
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** ISO-8601 timestamp with offset. Injectable for deterministic tests. */
export function nowIso(now: Date = new Date()): string {
  return now.toISOString();
}
