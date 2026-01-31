import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AntUser } from './core/types';
import { hashSync } from 'bcryptjs';

// Mock next/headers
const cookieStore = new Map();
vi.mock('next/headers', () => ({
  cookies: async () => ({
    set: (name: string, value: string) => cookieStore.set(name, value),
    get: (name: string) => ({ value: cookieStore.get(name) }),
    delete: (name: string) => cookieStore.delete(name),
  }),
}));

describe('Multi-User Auth', () => {
  const secret = 'super-secret-key-at-least-32-chars-long';
  const password = 'my-secret-password';
  const passwordHash = hashSync(password, 10);

  const mockDb: Record<string, AntUser> = {
    'alice': { id: '1', username: 'alice', passwordHash, role: 'admin' },
    'bob': { id: '2', username: 'bob', passwordHash, role: 'user' },
  };

  let createAuth: any;

  beforeEach(async () => {
    // Set minimal env vars to satisfy the default instance initialization in index.ts
    vi.stubEnv('ANT_JWT_SECRET', 'default-secret-for-initialization-check');
    vi.stubEnv('ANT_AUTH_USER', 'default-user');
    vi.stubEnv('ANT_AUTH_PASSWORD', 'default-pass');
    
    const module = await import('./index');
    createAuth = module.createAuth;
  });

  it('should login successfully with valid user from provider', async () => {
    const auth = createAuth({
      secret,
      provider: (username: string) => mockDb[username] || null,
    });

    const formData = new FormData();
    formData.append('user', 'alice');
    formData.append('password', password);

    const token = await auth.login(formData);
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
  });

  it('should fail login with invalid user', async () => {
    const auth = createAuth({
      secret,
      provider: (username: string) => mockDb[username] || null,
    });
    const formData = new FormData();
    formData.append('user', 'charlie'); // Does not exist
    formData.append('password', password);

    await expect(auth.login(formData)).rejects.toThrow('Invalid credentials');
  });

  it('should fail login with valid user but wrong password', async () => {
    const auth = createAuth({
      secret,
      provider: (username: string) => mockDb[username] || null,
    });
    const formData = new FormData();
    formData.append('user', 'alice');
    formData.append('password', 'wrong-password');

    await expect(auth.login(formData)).rejects.toThrow('Invalid credentials');
  });
});
