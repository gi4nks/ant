export * from './core/types';
export * from './core/auth';
export * from './core/token';
export * from './next/middleware';
export * from './next/cookies';
export * from './next/session';
export * from './next/handlers';

import { AntAuthConfig, AntAuthResolvedConfig, AntSession } from './core/types';
import { resolveConfig, checkCredentials } from './core/auth';
import { signToken, verifyToken } from './core/token';
import { setSessionCookie, deleteSessionCookie, getSessionCookie } from './next/cookies';
import { createAntMiddleware } from './next/middleware';
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

  async login(formData: FormData) {
    const user = formData.get('user') as string;
    const password = formData.get('password') as string;

    const isValid = checkCredentials(this.config, user, password);

    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    const payload = { user };
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

// Default instance
export const auth = new AntAuth();
