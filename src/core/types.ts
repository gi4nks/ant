export interface AntAuthConfig {
  secret?: string;
  user?: string;
  password?: string;
  passwordHash?: string;
  sessionCookieName?: string;
  loginPath?: string;
  tokenTTL?: string;
}

export interface AntAuthResolvedConfig extends Required<AntAuthConfig> {
  secretBytes: Uint8Array;
}

export type AntSession<T = { role: string }> = T & {
  iat: number;
  exp: number;
};