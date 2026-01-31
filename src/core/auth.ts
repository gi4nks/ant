import { validateEnv } from './env';
import { AntAuthConfig, AntAuthResolvedConfig } from './types';
import { verifyPassword } from './password';

export function resolveConfig(config: AntAuthConfig = {}): AntAuthResolvedConfig {
  const env = (!config.secret || !config.user || (!config.password && !config.passwordHash)) 
    ? validateEnv() 
    : null;

  const resolved: Required<Omit<AntAuthConfig, 'rateLimit'>> = {
    secret: config.secret || env?.ANT_JWT_SECRET!,
    user: config.user || env?.ANT_AUTH_USER!,
    password: config.password || env?.ANT_AUTH_PASSWORD || '',
    passwordHash: config.passwordHash || env?.ANT_AUTH_PASSWORD_HASH || '',
    sessionCookieName: config.sessionCookieName || 'session',
    loginPath: config.loginPath || '/login',
    successRedirect: config.successRedirect || '/',
    tokenTTL: config.tokenTTL || env?.ANT_TOKEN_TTL || (process.env.NODE_ENV === 'production' ? '1d' : '7d'),
  };

  const rateLimit: Required<NonNullable<AntAuthConfig['rateLimit']>> = {
    maxAttempts: config.rateLimit?.maxAttempts || 5,
    windowMs: config.rateLimit?.windowMs || 15 * 60 * 1000, // 15 minutes
  };

  if (process.env.NODE_ENV === 'production' && !resolved.passwordHash) {
    console.warn(
      '[AntAuth] WARNING: Using plaintext password in production. ' +
      'It is strongly recommended to use ANT_AUTH_PASSWORD_HASH.'
    );
  }

  return {
    ...resolved,
    rateLimit,
    secretBytes: new TextEncoder().encode(resolved.secret),
  };
}

export function checkCredentials(
  config: AntAuthResolvedConfig, 
  user?: string, 
  password?: string
): boolean {
  if (!user || !password) {
    console.debug('[AntAuth] Missing credentials');
    return false;
  }
  
  const userMatch = user === config.user;
  if (!userMatch) {
    console.debug(`[AntAuth] User mismatch: ${user}`);
  }

  const passwordMatch = verifyPassword(password, config.passwordHash, config.password);
  if (!passwordMatch) {
    console.debug('[AntAuth] Password mismatch');
  }
  
  return userMatch && passwordMatch;
}
