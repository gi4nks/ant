import { timingSafeEqual } from 'node:crypto';
import { compareSync } from 'bcryptjs';

export function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
  if (aBuf.length !== bBuf.length) {
    return false;
  }
  return timingSafeEqual(aBuf, bBuf);
}

export function verifyPassword(password: string, hash?: string, plaintext?: string): boolean {
  if (hash) {
    try {
      return compareSync(password, hash);
    } catch (e) {
      return false;
    }
  }
  if (plaintext) {
    return safeCompare(password, plaintext);
  }
  return false;
}
