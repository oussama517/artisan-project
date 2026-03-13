/**
 * Simple in-memory rate limiter using token bucket algorithm.
 * For production with multiple instances, swap to Redis-backed rate limiting.
 */

interface RateLimitEntry {
  tokens: number;
  lastRefill: number;
}

const store = new Map<string, RateLimitEntry>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    if (now - entry.lastRefill > 60 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000);

export interface RateLimitConfig {
  maxTokens: number;      // Max requests per window
  refillRate: number;     // Tokens added per second
  keyPrefix?: string;     // Prefix for different limiters
}

const DEFAULT_CONFIG: RateLimitConfig = {
  maxTokens: 100,
  refillRate: 100 / 900, // 100 requests per 15 minutes
};

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = DEFAULT_CONFIG
): { allowed: boolean; remaining: number; resetIn: number } {
  const key = `${config.keyPrefix || 'default'}:${identifier}`;
  const now = Date.now();
  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: config.maxTokens - 1, lastRefill: now };
    store.set(key, entry);
    return { allowed: true, remaining: entry.tokens, resetIn: 0 };
  }

  // Refill tokens based on elapsed time
  const elapsed = (now - entry.lastRefill) / 1000;
  entry.tokens = Math.min(config.maxTokens, entry.tokens + elapsed * config.refillRate);
  entry.lastRefill = now;

  if (entry.tokens < 1) {
    const resetIn = Math.ceil((1 - entry.tokens) / config.refillRate);
    return { allowed: false, remaining: 0, resetIn };
  }

  entry.tokens -= 1;
  store.set(key, entry);

  return { allowed: true, remaining: Math.floor(entry.tokens), resetIn: 0 };
}

// Preset rate limit configs for different endpoints
export const RATE_LIMITS = {
  auth: { maxTokens: 5, refillRate: 5 / 900, keyPrefix: 'auth' },       // 5 per 15min
  booking: { maxTokens: 10, refillRate: 10 / 60, keyPrefix: 'booking' }, // 10 per minute
  message: { maxTokens: 30, refillRate: 30 / 60, keyPrefix: 'message' }, // 30 per minute
  upload: { maxTokens: 5, refillRate: 5 / 300, keyPrefix: 'upload' },    // 5 per 5min
  api: { maxTokens: 100, refillRate: 100 / 900, keyPrefix: 'api' },      // 100 per 15min
} as const;
