import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validateEnv } from './env';

describe('env validation', () => {
  beforeEach(() => {
    vi.stubEnv('ANT_JWT_SECRET', 'a'.repeat(32));
    vi.stubEnv('ANT_AUTH_USER', 'admin');
    vi.stubEnv('ANT_AUTH_PASSWORD', 'password123');
    vi.stubEnv('ANT_AUTH_PASSWORD_HASH', '');
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('should validate correct env', () => {
    const env = validateEnv();
    expect(env.ANT_JWT_SECRET).toBe('a'.repeat(32));
    expect(env.ANT_AUTH_USER).toBe('admin');
  });

  it('should throw for short secret', () => {
    vi.stubEnv('ANT_JWT_SECRET', 'too-short');
    expect(() => validateEnv()).toThrow(/ANT_JWT_SECRET/);
  });

  it('should throw if password and hash are missing', () => {
    // @ts-ignore
    delete process.env.ANT_AUTH_PASSWORD;
    // @ts-ignore
    delete process.env.ANT_AUTH_PASSWORD_HASH;
    expect(() => validateEnv()).toThrow(/Either ANT_AUTH_PASSWORD or ANT_AUTH_PASSWORD_HASH/);
  });

  it('should allow hash instead of password', () => {
    // @ts-ignore
    delete process.env.ANT_AUTH_PASSWORD;
    vi.stubEnv('ANT_AUTH_PASSWORD_HASH', 'some-hash-here');
    const env = validateEnv();
    expect(env.ANT_AUTH_PASSWORD_HASH).toBe('some-hash-here');
  });
});
