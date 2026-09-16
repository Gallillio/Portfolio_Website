// In-memory fixed-window rate limiting.
//
// TRADEOFF, stated plainly: module state is per serverless instance. With N warm
// lambdas the effective limit is N x LIMIT, and a cold start resets the counter.
// For a personal portfolio whose worst case is burning a free-tier quota that is
// an acceptable trade; swapping in Upstash Redis later means replacing the body
// of checkRateLimit() and nothing else — which is why this is async today.

interface Window {
  count: number;
  resetAt: number;
}

const BURST = { limit: 12, windowMs: 60_000 };
const SUSTAINED = { limit: 60, windowMs: 3_600_000 };
const MAX_TRACKED_KEYS = 500;

const windows = new Map<string, Window>();

export type RateLimitResult =
  | { ok: true; remaining: number; resetAt: number }
  | { ok: false; retryAfterSec: number };

function hit(key: string, limit: number, windowMs: number, now: number): RateLimitResult {
  const existing = windows.get(key);

  if (!existing || existing.resetAt <= now) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (existing.count >= limit) {
    return { ok: false, retryAfterSec: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)) };
  }

  existing.count += 1;
  return { ok: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

/** Evict on read. Never use setInterval — it keeps the lambda alive and bills for it. */
function sweep(now: number): void {
  if (windows.size <= MAX_TRACKED_KEYS) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
}

export async function checkRateLimit(key: string): Promise<RateLimitResult> {
  const now = Date.now();
  sweep(now);

  const burst = hit(`b:${key}`, BURST.limit, BURST.windowMs, now);
  if (!burst.ok) return burst;

  const sustained = hit(`s:${key}`, SUSTAINED.limit, SUSTAINED.windowMs, now);
  if (!sustained.ok) return sustained;

  return burst;
}

/**
 * On Vercel the first x-forwarded-for entry is the client. An unresolvable
 * client collapses into one shared bucket, which is the safe failure direction.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}
