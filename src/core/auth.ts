import { validateEnv } from './env';
import { AntAuthConfig, AntAuthResolvedConfig } from './types';
import { verifyPassword } from './password';

export function resolveConfig(config: AntAuthConfig = {}): AntAuthResolvedConfig {
  const needsEnvValidation = !config.secret || !config.user || (!config.password && !config.passwordHash);

  const env = needsEnvValidation ? validateEnv() : null;

  const resolved: AntAuthResolvedConfig = {
    secret: config.secret || env?.ANT_JWT_SECRET!,
    user: config.user || env?.ANT_AUTH_USER || '', 
    password: config.password || env?.ANT_AUTH_PASSWORD || '',
    passwordHash: config.passwordHash || env?.ANT_AUTH_PASSWORD_HASH || '',
    sessionCookieName: config.sessionCookieName || 'session',
    loginPath: config.loginPath || '/login',
    successRedirect: config.successRedirect || '/',
    tokenTTL: config.tokenTTL || env?.ANT_TOKEN_TTL || (process.env.NODE_ENV === 'production' ? '1d' : '7d'),
    secretBytes: new Uint8Array(0), // Placeholder, set below
  };

  if (process.env.NODE_ENV === 'production' && !resolved.passwordHash) {
    throw new Error(
      '[AntAuth] SECURITY ERROR: Using plaintext password in production is not allowed. ' +
      'You must provide ANT_AUTH_PASSWORD_HASH.'
    );
  }

  resolved.secretBytes = new TextEncoder().encode(resolved.secret);

  return resolved;
}

export function checkCredentials(
  config: AntAuthResolvedConfig, 
  user?: string, 
  password?: string
): boolean {
  if (!user || !password) {
    return false;
  }
  
  const userMatch = user === config.user;
  const passwordMatch = verifyPassword(password, config.passwordHash, config.password);
  
  return userMatch && passwordMatch;
}