type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const store = new Map<string, RateLimitEntry>();

export type RateLimitOptions = {
  maxRequests: number;
  windowMs: number;
};

export type RateLimitResult = {
  success: boolean;
  remaining: number;
  resetAt: number;
};

// Presets matching security.md §3.2
export const RATE_LIMIT_PRESETS = {
  auth: { maxRequests: 10, windowMs: 60_000 },
  generation: { maxRequests: 30, windowMs: 60 * 60_000 },
  api: { maxRequests: 100, windowMs: 60_000 },
  strict: { maxRequests: 5, windowMs: 60_000 },
} as const satisfies Record<string, RateLimitOptions>;

export function checkRateLimit(key: string, options: RateLimitOptions): RateLimitResult {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { success: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
  }

  if (entry.count >= options.maxRequests) {
    return { success: false, remaining: 0, resetAt: entry.resetAt };
  }

  entry.count++;
  return { success: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}
