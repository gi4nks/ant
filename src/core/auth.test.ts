import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveConfig } from './auth';

describe('resolveConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should throw in production if password hash is missing', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      ANT_JWT_SECRET: 'super-secret-key-at-least-32-chars-long',
      ANT_AUTH_USER: 'admin',
      ANT_AUTH_PASSWORD: 'password123',
    };

    expect(() => resolveConfig()).toThrow(
      /SECURITY ERROR: Using plaintext password in production is not allowed/
    );
  });

  it('should not throw in production if password hash is provided', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      ANT_JWT_SECRET: 'super-secret-key-at-least-32-chars-long',
      ANT_AUTH_USER: 'admin',
      ANT_AUTH_PASSWORD_HASH: '$2a$10$abcdefg',
    };

    expect(() => resolveConfig()).not.toThrow();
  });
});