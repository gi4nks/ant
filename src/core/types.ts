export interface AntAuthConfig {
  secret?: string;
  user?: string;
  password?: string;
  passwordHash?: string;
  sessionCookieName?: string;
  loginPath?: string;
  successRedirect?: string;
  tokenTTL?: string;
  rateLimit?: {
    maxAttempts?: number;
    windowMs?: number;
  };
}

export interface AntAuthResolvedConfig extends Required<Omit<AntAuthConfig, 'rateLimit'>> {
  secretBytes: Uint8Array;
  rateLimit: Required<NonNullable<AntAuthConfig['rateLimit']>>;
}

export type AntSession<T = { user: string }> = T & {
  iat: number;
  exp: number;
};