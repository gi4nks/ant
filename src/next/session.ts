import { AntAuthResolvedConfig, AntSession } from '../core/types';
import { getSessionCookie } from './cookies';
import { verifyToken } from '../core/token';

export async function getSession<T = { user: string }>(
  config: AntAuthResolvedConfig
): Promise<AntSession<T> | null> {
  const token = await getSessionCookie(config);
  if (!token) return null;

  const result = await verifyToken<T>(token, config.secretBytes);
  if (!result.valid) return null;

  return result.payload as AntSession<T>;
}
