import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, resetRateLimit } from './rate-limit';

describe('rate-limit', () => {
  const ID = 'test-id';

  beforeEach(() => {
    resetRateLimit(ID);
  });

  it('should allow requests within limit', () => {
    const result = checkRateLimit(ID, 2, 1000);
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it('should block requests over limit', () => {
    checkRateLimit(ID, 1, 1000);
    const result = checkRateLimit(ID, 1, 1000);
    expect(result.success).toBe(false);
    expect(result.remaining).toBe(0);
  });

  it('should reset after window expires', async () => {
    checkRateLimit(ID, 1, 10);
    await new Promise(r => setTimeout(r, 20));
    const result = checkRateLimit(ID, 1, 10);
    expect(result.success).toBe(true);
  });
});
