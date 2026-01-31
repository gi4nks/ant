import { describe, it, expect, vi } from 'vitest';
import { login } from './handlers';
import { AntAuthResolvedConfig } from '../core/types';

// Mock dependencies
vi.mock('./cookies', () => ({
  setSessionCookie: vi.fn(),
  deleteSessionCookie: vi.fn(),
}));

vi.mock('../core/token', () => ({
  signToken: vi.fn(() => Promise.resolve('mock-token')),
}));

describe('handlers', () => {
  const config: AntAuthResolvedConfig = {
    secret: 'secret',
    secretBytes: new TextEncoder().encode('secret'),
    user: 'admin',
    password: 'password',
    passwordHash: '',
    sessionCookieName: 'session',
    loginPath: '/login',
    successRedirect: '/',
    tokenTTL: '1d',
    rateLimit: { maxAttempts: 5, windowMs: 60000 }
  };

  it('should login with correct credentials', async () => {
    const formData = new FormData();
    formData.append('user', 'admin');
    formData.append('password', 'password');

    const result = await login(config, formData);
    expect(result.success).toBe(true);
  });

  it('should fail with incorrect credentials', async () => {
    const formData = new FormData();
    formData.append('user', 'admin');
    formData.append('password', 'wrong');

    const result = await login(config, formData);
    expect(result.success).toBe(false);
    expect(result.error).toBe('Invalid credentials');
  });
});
