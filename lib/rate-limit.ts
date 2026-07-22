/**
 * Simple in-memory, fixed-window rate limiter.
 *
 * IMPORTANT LIMITATION: this only works within a single, long-running
 * Node process. On serverless platforms with multiple concurrent function
 * instances (e.g. Vercel), each instance has its own memory, so limits
 * aren't actually shared/enforced globally across instances. Fine as a
 * first line of defense at this project's scale; if this ever runs
 * serverless at real scale, replace with a shared store (e.g. Upstash
 * Redis) instead.
 */

import { headers } from "next/headers";

/**
 * Extracts a best-effort client IP from request headers - for use inside
 * Server Actions, which don't get a Request object directly.
 */
export async function getClientIpFromHeaders(): Promise<string> {
  const headerList = await headers();
  const forwardedFor = headerList.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headerList.get("x-real-ip") ?? "unknown";
}

/**
 * Extracts a best-effort client IP from a NextRequest - for use inside
 * Route Handlers.
 */
export function getClientIpFromRequest(req: {
  headers: { get(name: string): string | null };
}): string {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "unknown";
}

interface WindowEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, WindowEntry>();

// Opportunistic cleanup so the map doesn't grow unbounded - runs a light
// sweep occasionally rather than on every single call.
let callsSinceCleanup = 0;
const CLEANUP_INTERVAL_CALLS = 200;

function cleanupExpired(now: number, windowMs: number) {
  for (const [key, entry] of store.entries()) {
    if (now - entry.windowStart > windowMs) {
      store.delete(key);
    }
  }
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * @param key Unique identifier for the caller (e.g. `booking:${ip}`).
 * @param limit Max requests allowed within the window.
 * @param windowMs Window size in milliseconds.
 */
export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const now = Date.now();

  callsSinceCleanup += 1;
  if (callsSinceCleanup >= CLEANUP_INTERVAL_CALLS) {
    callsSinceCleanup = 0;
    cleanupExpired(now, windowMs);
  }

  const entry = store.get(key);

  if (!entry || now - entry.windowStart > windowMs) {
    store.set(key, { count: 1, windowStart: now });
    return { allowed: true, remaining: limit - 1, resetAt: now + windowMs };
  }

  if (entry.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.windowStart + windowMs,
    };
  }

  entry.count += 1;
  return {
    allowed: true,
    remaining: limit - entry.count,
    resetAt: entry.windowStart + windowMs,
  };
}
