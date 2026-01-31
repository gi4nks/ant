import { describe, it, expect } from 'vitest';
import { signToken, verifyToken } from './token';

describe('token core', () => {
  const secret = new TextEncoder().encode('a'.repeat(32));

  it('should sign and verify a token', async () => {
    const payload = { user: 'test' };
    const token = await signToken(payload, secret, '1h');
    const result = await verifyToken<{ user: string }>(token, secret);
    
    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.payload.user).toBe('test');
    }
  });

  it('should fail for invalid secret', async () => {
    const token = await signToken({ user: 'test' }, secret, '1h');
    const wrongSecret = new TextEncoder().encode('b'.repeat(32));
    const result = await verifyToken(token, wrongSecret);
    
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('invalid');
    }
  });

  it('should fail for expired token', async () => {
    // 0s expiration
    const token = await signToken({ user: 'test' }, secret, '0s');
    // Wait a tiny bit to ensure expiration
    await new Promise(r => setTimeout(r, 10));
    
    const result = await verifyToken(token, secret);
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reason).toBe('expired');
    }
  });
});
