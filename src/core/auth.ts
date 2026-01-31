import { validateEnv } from './env';
import { AntAuthConfig, AntAuthResolvedConfig } from './types';
import { verifyPassword } from './password';

export function resolveConfig(config: AntAuthConfig = {}): AntAuthResolvedConfig {
  const env = (!config.secret || !config.user || (!config.password && !config.passwordHash)) 
    ? validateEnv() 
    : null;

  const resolved: Required<AntAuthConfig> = {
    secret: config.secret || env?.ANT_JWT_SECRET!,
    user: config.user || env?.ANT_AUTH_USER!,
    password: config.password || env?.ANT_AUTH_PASSWORD || '',
    passwordHash: config.passwordHash || env?.ANT_AUTH_PASSWORD_HASH || '',
    sessionCookieName: config.sessionCookieName || 'session',
    loginPath: config.loginPath || '/login',
    tokenTTL: config.tokenTTL || env?.ANT_TOKEN_TTL || (process.env.NODE_ENV === 'production' ? '1d' : '7d'),
  };

  if (process.env.NODE_ENV === 'production' && !resolved.passwordHash) {
    throw new Error(
      '[AntAuth] ANT_AUTH_PASSWORD_HASH is required in production. ' +
      'Plaintext passwords are only allowed in development.'
    );
  }

  return {
    ...resolved,
    secretBytes: new TextEncoder().encode(resolved.secret),
  };
}

export function checkCredentials(
  config: AntAuthResolvedConfig, 
  user?: string, 
  password?: string
): boolean {
  if (!user || !password) return false;
  
  const userMatch = user === config.user; // Simple equality for username is fine, but we can use safeCompare if paranoid
  const passwordMatch = verifyPassword(password, config.passwordHash, config.password);
  
  return userMatch && passwordMatch;
}
