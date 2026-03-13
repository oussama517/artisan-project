import { describe, it, expect, vi } from 'vitest';
import { checkRateLimit, RATE_LIMITS } from '@/lib/rate-limit';

describe('Rate Limiter', () => {
  it('allows first request', () => {
    const result = checkRateLimit('test-1', { maxTokens: 5, refillRate: 1, keyPrefix: 'test1' });
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(4);
  });

  it('blocks after max requests exhausted', () => {
    const config = { maxTokens: 2, refillRate: 0.001, keyPrefix: 'test2' };
    checkRateLimit('test-2', config);
    checkRateLimit('test-2', config);
    const result = checkRateLimit('test-2', config);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('has correct preset configs', () => {
    expect(RATE_LIMITS.auth.maxTokens).toBe(5);
    expect(RATE_LIMITS.booking.maxTokens).toBe(10);
    expect(RATE_LIMITS.message.maxTokens).toBe(30);
    expect(RATE_LIMITS.upload.maxTokens).toBe(5);
    expect(RATE_LIMITS.api.maxTokens).toBe(100);
  });

  it('tracks different keys independently', () => {
    const config = { maxTokens: 1, refillRate: 0.001, keyPrefix: 'test3' };
    checkRateLimit('user-a', config);
    const result = checkRateLimit('user-b', config);
    expect(result.allowed).toBe(true);
  });
});
