/**
 * Simple in-memory rate limiter.
 * Resets on server restart — suitable for single-process / self-hosted deployments.
 * For multi-instance deployments, replace with Redis-backed storage.
 */

interface Entry {
  count: number;
  resetAt: number; // epoch ms
}

const store = new Map<string, Entry>();

/**
 * Returns true if the request is within the allowed limit, false if it should be blocked.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

/** Seconds until the rate-limit window resets for the given key. */
export function getRetryAfter(key: string): number {
  const entry = store.get(key);
  if (!entry) return 0;
  return Math.ceil(Math.max(0, entry.resetAt - Date.now()) / 1000);
}
