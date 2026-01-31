export * from './core/types';
export * from './core/auth';
export * from './core/token';
export * from './core/rate-limit';
export * from './next/middleware';
export * from './next/cookies';
export * from './next/session';
export * from './next/handlers';
export * from './next/components';

import { AntAuthConfig, AntAuthResolvedConfig, AntSession } from './core/types';
import { resolveConfig, checkCredentials } from './core/auth';
import { verifyPassword } from './core/password';
import { signToken, verifyToken } from './core/token';
import { setSessionCookie, deleteSessionCookie, getSessionCookie } from './next/cookies';
import { createAntMiddleware } from './next/middleware';
import { checkRateLimit, resetRateLimit } from './core/rate-limit';
import { NextRequest } from 'next/server';

/**
 * Class-based API for AntAuth
 */
export class AntAuth {
  private _config?: AntAuthResolvedConfig;
  private _rawConfig?: AntAuthConfig;

  constructor(config?: AntAuthConfig) {
    this._rawConfig = config;
  }

  private get config(): AntAuthResolvedConfig {
    if (!this._config) {
      this._config = resolveConfig(this._rawConfig);
    }
    return this._config;
  }

  async login(formData: FormData, ip?: string) {
    const user = formData.get('user') as string;
    const password = formData.get('password') as string;

    const identifier = ip || user;
    if (identifier) {
      const rate = checkRateLimit(identifier, this.config.rateLimit.maxAttempts, this.config.rateLimit.windowMs);
      if (!rate.success) {
        throw new Error(`Too many attempts. Try again in ${Math.ceil((rate.resetAt - Date.now()) / 60000)} minutes.`);
      }
    }

    let isValid = false;
    let payload: any = { user };

    if (this.config.provider) {
      const antUser = await this.config.provider(user);
      if (antUser) {
        isValid = verifyPassword(password, antUser.passwordHash);
        if (isValid) {
          // Exclude passwordHash from token payload
          const { passwordHash, ...rest } = antUser;
          payload = rest;
        }
      }
    } else {
      isValid = checkCredentials(this.config, user, password);
    }

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    if (identifier) resetRateLimit(identifier);

    const token = await signToken(payload, this.config.secretBytes, this.config.tokenTTL);
    await setSessionCookie(this.config, token);
    return token;
  }

  verifyCredentials(user?: string, password?: string): boolean { 
    return checkCredentials(this.config, user, password); 
  } 

  async logout() {
    await deleteSessionCookie(this.config);
  }

  async getSession<T = { user: string }>(req?: NextRequest): Promise<AntSession<T> | null> {
    const token = req 
      ? req.cookies.get(this.config.sessionCookieName)?.value 
      : await getSessionCookie(this.config);
    
    if (!token) return null;

    const result = await verifyToken<T>(token, this.config.secretBytes);
    if (!result.valid) return null;

    return result.payload as AntSession<T>;
  }

  get middleware() {
    return createAntMiddleware(this.config);
  }
}

export function createAuth(config?: AntAuthConfig) {
  return new AntAuth(config);
}

// Default instance
export const auth = new AntAuth();