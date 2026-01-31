import { describe, it, expect, vi } from 'vitest';
import { createAntMiddleware } from './middleware';
import { AntAuthResolvedConfig } from '../core/types';
import { signToken } from '../core/token';

// Mock NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    next: vi.fn(() => ({ type: 'next' })),
    redirect: vi.fn((url) => ({ type: 'redirect', url })),
    json: vi.fn((data, init) => ({ type: 'json', data, status: init?.status })),
  },
}));

describe('middleware integration', () => {
  const secret = 'a'.repeat(32);
  const config: AntAuthResolvedConfig = {
    secret,
    secretBytes: new TextEncoder().encode(secret),
    user: 'admin',
    password: 'password',
    passwordHash: '',
    sessionCookieName: 'session',
    loginPath: '/login',
    tokenTTL: '1h',
  };

  const middleware = createAntMiddleware(config);

  it('should allow public paths', async () => {
    const req = {
      nextUrl: { pathname: '/login' },
      method: 'GET',
      headers: new Map(),
      cookies: { get: vi.fn() },
      url: 'http://localhost/login',
    } as any;

    const res = await middleware(req);
    expect(res.type).toBe('next');
  });

  it('should redirect to login for unauthorized access', async () => {
    const req = {
      nextUrl: { pathname: '/dashboard' },
      method: 'GET',
      headers: new Map(),
      cookies: { get: vi.fn(() => undefined) },
      url: 'http://localhost/dashboard',
    } as any;

    const res = await middleware(req);
    expect(res.type).toBe('redirect');
    expect(res.url.toString()).toContain('/login');
  });

  it('should allow access with valid token', async () => {
    const token = await signToken({ role: 'admin' }, config.secretBytes, '1h');
    const req = {
      nextUrl: { pathname: '/dashboard' },
      method: 'GET',
      headers: new Map(),
      cookies: { get: vi.fn(() => ({ value: token })) },
      url: 'http://localhost/dashboard',
    } as any;

    const res = await middleware(req);
    expect(res.type).toBe('next');
  });

  it('should block CSRF with mismatching origin', async () => {
    const req = {
      nextUrl: { pathname: '/api/settings' },
      method: 'POST',
      headers: new Map([
        ['origin', 'http://malicious.com'],
        ['host', 'localhost'],
      ]),
      cookies: { get: vi.fn() },
      url: 'http://localhost/api/settings',
    } as any;

    const res = await middleware(req);
    expect(res.type).toBe('json');
    expect(res.status).toBe(403);
  });
});