import { describe, it, expect, vi, afterEach } from 'vitest';
import { resolveConfig } from './auth';

describe('resolveConfig', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it('should warn but not throw in production if password hash is missing', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      ANT_JWT_SECRET: 'super-secret-key-at-least-32-chars-long',
      ANT_AUTH_USER: 'admin',
      ANT_AUTH_PASSWORD: 'password123',
    };

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => resolveConfig()).not.toThrow();
    
    expect(consoleSpy).toHaveBeenCalledWith(
      expect.stringContaining('WARNING: Using plaintext password in production')
    );
  });

  it('should not warn in production if password hash is provided', () => {
    process.env = {
      ...originalEnv,
      NODE_ENV: 'production',
      ANT_JWT_SECRET: 'super-secret-key-at-least-32-chars-long',
      ANT_AUTH_USER: 'admin',
      ANT_AUTH_PASSWORD_HASH: '$2a$10$abcdefg',
    };

    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => resolveConfig()).not.toThrow();
    expect(consoleSpy).not.toHaveBeenCalled();
  });
});
