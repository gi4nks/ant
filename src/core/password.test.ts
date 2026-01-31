import { describe, it, expect } from 'vitest';
import { safeCompare, verifyPassword } from './password';
import { hashSync } from 'bcryptjs';

describe('password core', () => {
  it('safeCompare should work correctly', () => {
    expect(safeCompare('password', 'password')).toBe(true);
    expect(safeCompare('password', 'wrong')).toBe(false);
    expect(safeCompare('password', 'password123')).toBe(false);
  });

  it('verifyPassword should work with plaintext', () => {
    expect(verifyPassword('admin', undefined, 'admin')).toBe(true);
    expect(verifyPassword('admin', undefined, 'wrong')).toBe(false);
  });

  it('verifyPassword should work with bcrypt hash', () => {
    const hash = hashSync('secret123', 10);
    expect(verifyPassword('secret123', hash)).toBe(true);
    expect(verifyPassword('wrong', hash)).toBe(false);
  });
});
