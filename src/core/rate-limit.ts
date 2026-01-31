interface RateLimitStore {
  attempts: number;
  resetAt: number;
}

const store = new Map<string, RateLimitStore>();

export function checkRateLimit(
  identifier: string,
  maxAttempts: number,
  windowMs: number
): { success: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = store.get(identifier);

  if (!record || now > record.resetAt) {
    const newRecord = { attempts: 1, resetAt: now + windowMs };
    store.set(identifier, newRecord);
    return { success: true, remaining: maxAttempts - 1, resetAt: newRecord.resetAt };
  }

  if (record.attempts >= maxAttempts) {
    return { success: false, remaining: 0, resetAt: record.resetAt };
  }

  record.attempts++;
  return { success: true, remaining: maxAttempts - record.attempts, resetAt: record.resetAt };
}

export function resetRateLimit(identifier: string): void {
  store.delete(identifier);
}
