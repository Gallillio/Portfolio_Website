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
/** Past this many keys, expired windows are swept on each request. */
const SWEEP_THRESHOLD = 500;
/** Hard ceiling on tracked keys. Past it the oldest windows are dropped, so distinct keys cannot grow memory without bound. */
const MAX_TRACKED_KEYS = 5_000;

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
  if (windows.size <= SWEEP_THRESHOLD) return;
  for (const [key, window] of windows) {
    if (window.resetAt <= now) windows.delete(key);
  }
  // A Map iterates in insertion order, so the first keys are the oldest windows.
  for (const key of windows.keys()) {
    if (windows.size <= MAX_TRACKED_KEYS) break;
    windows.delete(key);
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

const IPV4 = /^(?:\d{1,3}\.){3}\d{1,3}$/;
const IPV6 = /^[0-9a-f:]{2,39}$/i;

/**
 * Reduce an address to the unit one client controls. An IPv6 client usually
 * holds a whole /64, so keying on the full address would let it rotate through
 * billions of buckets; the first four groups are the client.
 */
function normalizeIp(value: string): string | undefined {
  if (IPV4.test(value)) return value;
  // An IPv4 client seen through an IPv6 socket: "::ffff:203.0.113.9".
  const mapped = /^::ffff:((?:\d{1,3}\.){3}\d{1,3})$/i.exec(value);
  if (mapped) return mapped[1];
  if (!IPV6.test(value) || !value.includes(":")) return undefined;
  const [head, tail = ""] = value.toLowerCase().split("::");
  const headGroups = head ? head.split(":") : [];
  const tailGroups = tail ? tail.split(":") : [];
  const missing = 8 - headGroups.length - tailGroups.length;
  if (missing < 0 || (missing > 0 && !value.includes("::"))) return undefined;
  const groups = [...headGroups, ...Array(missing).fill("0"), ...tailGroups];
  return `${groups.slice(0, 4).map((g) => g.replace(/^0+(?=.)/, "")).join(":")}::/64`;
}

/**
 * The client address for rate limiting and the quota share.
 *
 * Vercel overwrites x-forwarded-for and x-real-ip with the connecting client's
 * address and does not pass on a value the client sent, so the first entry is
 * trustworthy there. Behind any other proxy, or with no proxy at all, it is
 * whatever the client typed, so the value must at least be a real address:
 * anything else collapses into one shared bucket, the safe failure direction.
 */
export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const candidate = forwarded || request.headers.get("x-real-ip")?.trim() || "";
  return (candidate.length <= 45 && normalizeIp(candidate)) || "unknown";
}
