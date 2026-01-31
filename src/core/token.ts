import { SignJWT, jwtVerify, JWTPayload } from 'jose';

export type TokenVerificationResult<T> = 
  | { valid: true; payload: T & JWTPayload }
  | { valid: false; reason: 'expired' | 'invalid' | 'missing' };

export async function signToken(payload: any, secret: Uint8Array, ttl: string): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function verifyToken<T>(token: string, secret: Uint8Array): Promise<TokenVerificationResult<T>> {
  try {
    const { payload } = await jwtVerify(token, secret, {
      algorithms: ['HS256'],
    });
    return { valid: true, payload: payload as T & JWTPayload };
  } catch (error: any) {
    if (error.code === 'ERR_JWT_EXPIRED') {
      return { valid: false, reason: 'expired' };
    }
    return { valid: false, reason: 'invalid' };
  }
}