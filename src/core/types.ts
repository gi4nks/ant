export interface AntUser {
  id: string;
  username: string;
  passwordHash: string;
  [key: string]: any;
}

export type CredentialsProvider = (identifier: string) => Promise<AntUser | null> | AntUser | null;

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
  provider?: CredentialsProvider;
}

export interface AntAuthResolvedConfig extends Required<Omit<AntAuthConfig, 'rateLimit' | 'provider'>> {
  secretBytes: Uint8Array;
  rateLimit: Required<NonNullable<AntAuthConfig['rateLimit']>>;
  provider?: CredentialsProvider;
}

export type AntSession<T = { user: string }> = T & {
  iat: number;
  exp: number;
};