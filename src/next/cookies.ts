import { cookies } from 'next/headers';
import { AntAuthResolvedConfig } from '../core/types';

export async function setSessionCookie(config: AntAuthResolvedConfig, token: string) {
  const cookieStore = await cookies();
  cookieStore.set(config.sessionCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
  });
}

export async function deleteSessionCookie(config: AntAuthResolvedConfig) {
  const cookieStore = await cookies();
  cookieStore.delete(config.sessionCookieName);
}

export async function getSessionCookie(config: AntAuthResolvedConfig): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(config.sessionCookieName)?.value;
}
