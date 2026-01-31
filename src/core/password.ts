import { compareSync } from 'bcryptjs';

function timingSafeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.byteLength; i++) {
    diff |= a[i] ^ b[i];
  }
  return diff === 0;
}

export function safeCompare(a: string, b: string): boolean {
  const encoder = new TextEncoder();
  const aBuf = encoder.encode(a);
  const bBuf = encoder.encode(b);
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
