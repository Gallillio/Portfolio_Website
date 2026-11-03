// Free-tier quota awareness for the Gemini API.
//
// Google reports nothing about remaining quota on a successful call, so this
// module keeps its own 60-second ledger of the input tokens each answer used
// (usageMetadata.promptTokenCount) and refuses a request that would overflow the
// per-minute cap BEFORE calling Google. The visitor gets an exact countdown at
// once instead of waiting on an upstream call that was always going to fail.
//
// Google's own 429 stays the authority: noteUpstream429() turns its RetryInfo
// into a cooldown that every later request on this instance honors.
//
// TRADEOFF, stated plainly: like lib/ai/rate-limit.ts, this is module state, so
// it is per serverless instance. Two warm instances each see only their own
// traffic and a cold start forgets the window. Either way the worst case is the
// one we had before: Google answers 429 and the visitor still gets a countdown.

import { FREE_TIER_INPUT_TPM } from "@/lib/ai/config";

/**
 * Google returns 429 RESOURCE_EXHAUSTED for both the per-minute limits (RPM/TPM,
 * which clear within a minute) and the per-day cap (RPD, which resets at
 * midnight Pacific). The visitor-facing advice is completely different.
 */
export type QuotaScope = "per-minute" | "per-day";

export interface QuotaInfo {
  scope: QuotaScope;
  metric: "input-tokens" | "requests" | "unknown";
  /** The cap itself, from QuotaFailure.quotaValue. */
  limit?: number;
  /** From RetryInfo.retryDelay, or the "Please retry in Ns" message text. */
  retryDelayMs?: number;
}

/**
 * Fallback classification from the raw body when the structured details are
 * missing. Defaults to "per-minute" when ambiguous, deliberately: wrongly
 * telling a visitor to come back tomorrow loses them, whereas wrongly telling
 * them to wait a minute costs one retry.
 */
export function detectQuotaScope(body: string): QuotaScope {
  const normalized = body.toLowerCase().replace(/[\s_-]/g, "");
  if (/perday|requestsperday|dailylimit|perdayperproject/.test(normalized)) return "per-day";

  // A retryDelay measured in hours can only be the daily cap.
  const retryDelay = /"retrydelay":"(\d+(?:\.\d+)?)s"/.exec(normalized);
  if (retryDelay && Number(retryDelay[1]) > 300) return "per-day";

  return "per-minute";
}

interface GoogleErrorDetail {
  "@type"?: string;
  violations?: { quotaId?: string; quotaMetric?: string; quotaValue?: string | number }[];
  retryDelay?: string;
}

/**
 * Read a 429 body. Google documents RetryInfo and QuotaFailure but not their
 * exact contents for this API, so every field is optional and each falls back
 * to something weaker rather than failing.
 */
export function parseQuotaError(body: string): QuotaInfo {
  let message = "";
  let details: GoogleErrorDetail[] = [];
  try {
    const parsed = JSON.parse(body) as { error?: { message?: string; details?: GoogleErrorDetail[] } };
    message = parsed.error?.message ?? "";
    details = Array.isArray(parsed.error?.details) ? parsed.error.details : [];
  } catch {
    message = body;
  }

  let quotaId = "";
  let limit: number | undefined;
  let retryDelayMs: number | undefined;

  for (const detail of details) {
    const type = detail?.["@type"] ?? "";
    if (type.endsWith("QuotaFailure")) {
      const violation = detail.violations?.[0];
      quotaId = `${violation?.quotaId ?? ""} ${violation?.quotaMetric ?? ""}`;
      const value = Number(violation?.quotaValue);
      if (Number.isFinite(value) && value > 0) limit = value;
    } else if (type.endsWith("RetryInfo")) {
      const seconds = /^(\d+(?:\.\d+)?)s$/.exec(detail.retryDelay ?? "");
      if (seconds) retryDelayMs = Math.round(Number(seconds[1]) * 1000);
    }
  }

  if (retryDelayMs === undefined) {
    const seconds = /retry in (\d+(?:\.\d+)?)\s*s/i.exec(message);
    if (seconds) retryDelayMs = Math.round(Number(seconds[1]) * 1000);
  }
  // The message names the metric and cap too ("...input_token_count, limit: 16000"),
  // which covers a body whose QuotaFailure lacks quotaValue.
  if (limit === undefined) {
    const cap = /limit:\s*(\d+)/i.exec(message);
    if (cap && Number(cap[1]) > 0) limit = Number(cap[1]);
  }
  if (!quotaId && /quota exceeded for metric/i.test(message)) quotaId = message;

  const id = quotaId.toLowerCase().replace(/[\s_-]/g, "");
  const scope: QuotaScope = /perday/.test(id) ? "per-day" : /perminute/.test(id) ? "per-minute" : detectQuotaScope(body);
  const metric = /token/.test(id) ? "input-tokens" : /request/.test(id) ? "requests" : "unknown";

  return { scope, metric, limit, retryDelayMs };
}

/** Milliseconds until the free-tier daily quota resets (midnight US/Pacific). */
export function msUntilPacificMidnight(now = Date.now()): number {
  const pacificNow = new Date(new Date(now).toLocaleString("en-US", { timeZone: "America/Los_Angeles" }));
  const nextMidnight = new Date(pacificNow);
  nextMidnight.setHours(24, 0, 0, 0);
  return Math.max(60_000, nextMidnight.getTime() - pacificNow.getTime());
}

const WINDOW_MS = 60_000;
/** Our token estimate is approximate and Google's count is not, so keep some room. */
const HEADROOM = 0.95;
/** A per-minute retryDelay outside this range is noise, not information. */
const MIN_COOLDOWN_MS = 5_000;
const MAX_COOLDOWN_MS = 65_000;

export interface Reservation {
  at: number;
  tokens: number;
  /** Who made the request (lib/ai/rate-limit.ts clientKey), for the per-client share. */
  client: string;
}

const ledger: Reservation[] = [];
let learnedLimit: number | undefined;
/**
 * Tokens per character of prompt TEXT (not of the JSON payload, whose escaping a
 * client controls: one U+0001 is six JSON characters but a single token).
 * Measured in production: 6,695 tokens for about 26k characters.
 */
let tokensPerChar = 0.26;
/** One odd answer must not swing every later estimate, so recalibration is clamped. */
const MIN_TOKENS_PER_CHAR = 0.15;
const MAX_TOKENS_PER_CHAR = 0.5;
let cooldown: { until: number; scope: QuotaScope } | undefined;

export type Admission =
  | { ok: true; reservation: Reservation }
  | { ok: false; retryAfterMs: number; scope: QuotaScope };

function prune(now: number): void {
  while (ledger.length > 0 && ledger[0].at <= now - WINDOW_MS) ledger.shift();
}

/** When enough of `entries` (oldest first) will have aged out for `estimate` to fit under `cap`. */
function waitUntilFits(entries: Reservation[], used: number, estimate: number, cap: number, now: number): number {
  let fitsAt = now;
  for (const entry of entries) {
    if (used + estimate <= cap) break;
    used -= entry.tokens;
    fitsAt = entry.at + WINDOW_MS;
  }
  return Math.max(1_000, fitsAt - now);
}

/**
 * Decide whether a request of `textChars` fits in the current minute. On
 * success the estimate is reserved, so two visitors arriving together cannot
 * both slip under a cap that only one of them fits.
 *
 * Fairness: the free tier fits only about two questions a minute across every
 * visitor, so one client must not be able to hold the whole window. A client
 * that already holds reservations may hold at most `limit - floor`, where
 * `floorChars` is the smallest possible request (the system prompt). That
 * always leaves room for one fresh visitor's question. A client's first request
 * in the window is admitted whenever it fits globally, so a single long
 * conversation never gets stuck.
 */
export function admit(
  textChars: number,
  client: string,
  floorChars: number,
  now = Date.now()
): Admission {
  if (cooldown && cooldown.until > now) {
    return { ok: false, retryAfterMs: cooldown.until - now, scope: cooldown.scope };
  }
  cooldown = undefined;
  prune(now);

  const limit = (learnedLimit ?? FREE_TIER_INPUT_TPM) * HEADROOM;
  const estimate = Math.ceil(textChars * tokensPerChar);

  // A request larger than the whole minute can never fit. Refuse it instead of
  // reserving it: reserving it is what let one request lock out every visitor.
  if (estimate > limit) {
    return { ok: false, retryAfterMs: WINDOW_MS, scope: "per-minute" };
  }

  const mine = ledger.filter((entry) => entry.client === client);
  if (mine.length > 0) {
    const clientCap = Math.max(limit * 0.4, limit - Math.ceil(floorChars * tokensPerChar));
    const mineUsed = mine.reduce((sum, entry) => sum + entry.tokens, 0);
    if (mineUsed + estimate > clientCap) {
      return { ok: false, retryAfterMs: waitUntilFits(mine, mineUsed, estimate, clientCap, now), scope: "per-minute" };
    }
  }

  const used = ledger.reduce((sum, entry) => sum + entry.tokens, 0);
  if (used + estimate > limit) {
    return { ok: false, retryAfterMs: waitUntilFits(ledger, used, estimate, limit, now), scope: "per-minute" };
  }

  const reservation = { at: now, tokens: estimate, client };
  ledger.push(reservation);
  return { ok: true, reservation };
}

/** Replace the estimate with what Google actually counted, and recalibrate. */
export function settle(reservation: Reservation, inputTokens: number, textChars: number): void {
  if (inputTokens <= 0) return;
  reservation.tokens = inputTokens;
  if (textChars > 0) {
    tokensPerChar = Math.min(MAX_TOKENS_PER_CHAR, Math.max(MIN_TOKENS_PER_CHAR, inputTokens / textChars));
  }
}

/** The request never reached the model (refused, timed out, failed), so it cost nothing. */
export function release(reservation: Reservation): void {
  const index = ledger.indexOf(reservation);
  if (index !== -1) ledger.splice(index, 1);
}

/** Turn Google's 429 into a cooldown for this instance. Returns how long to wait. */
export function noteUpstream429(info: QuotaInfo, now = Date.now()): { retryAfterMs: number; scope: QuotaScope } {
  // retryDelay has been seen reading "1s" on a per-day cap, so the daily wait
  // is computed from the documented reset time, never taken from the response.
  const retryAfterMs =
    info.scope === "per-day"
      ? msUntilPacificMidnight(now)
      : Math.min(MAX_COOLDOWN_MS, Math.max(MIN_COOLDOWN_MS, info.retryDelayMs ?? WINDOW_MS));

  if (info.metric === "input-tokens" && info.limit && info.scope === "per-minute") learnedLimit = info.limit;
  cooldown = { until: now + retryAfterMs, scope: info.scope };
  return { retryAfterMs, scope: info.scope };
}
