import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { compareSync } from 'bcryptjs';

const DEFAULT_SECRET = 'ant-local-default-secret-change-it';

export interface AntAuthConfig {
  secret?: string;
  user?: string;
  password?: string;
  passwordHash?: string;
  tokenTtl?: string;
  sessionCookieName?: string;
  loginPath?: string;
}

export class AntAuth {
  private secret: Uint8Array;
  private config: Required<AntAuthConfig>;

  constructor(config: AntAuthConfig = {}) {
    const isProd = process.env.NODE_ENV === 'production';
    
    this.config = {
      secret: config.secret || process.env.ANT_JWT_SECRET || process.env.JWT_SECRET || DEFAULT_SECRET,
      user: config.user || process.env.ANT_AUTH_USER || process.env.AUTH_USER || 'admin',
      password: config.password || process.env.ANT_AUTH_PASSWORD || process.env.AUTH_PASSWORD || 'admin',
      passwordHash: config.passwordHash || process.env.ANT_AUTH_PASSWORD_HASH || '',
      tokenTtl: config.tokenTtl || process.env.ANT_TOKEN_TTL || (isProd ? '1d' : '7d'),
      sessionCookieName: config.sessionCookieName || 'session',
      loginPath: config.loginPath || '/login',
    };
    this.secret = new TextEncoder().encode(this.config.secret);
  }

  login = async (payload: any = { role: 'admin' }) => {
    const token = await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(this.config.tokenTtl)
      .sign(this.secret);

    const cookieStore = await cookies();
    cookieStore.set(this.config.sessionCookieName, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
    return token;
  }

  logout = async () => {
    const cookieStore = await cookies();
    cookieStore.delete(this.config.sessionCookieName);
  }

  getSession = async (req?: NextRequest) => {
    let token: string | undefined;

    if (req) {
      token = req.cookies.get(this.config.sessionCookieName)?.value;
    } else {
      const cookieStore = await cookies();
      token = cookieStore.get(this.config.sessionCookieName)?.value;
    }

    if (!token) return null;

    try {
      const { payload } = await jwtVerify(token, this.secret, {
        algorithms: ['HS256'],
      });
      return payload;
    } catch (error) {
      return null;
    }
  }

  verifyCredentials = (user?: string, password?: string): boolean => {
    const isProd = process.env.NODE_ENV === 'production';
    
    if (!user || !password) {
      if (!isProd) console.log('AntAuth: Missing username or password in request');
      return false;
    }

    if (user !== this.config.user) {
      if (!isProd) console.log(`AntAuth: User mismatch. Expected '${this.config.user}', got '${user}'`);
      return false;
    }

    // If hash is provided, use it (recommended for prod)
    if (this.config.passwordHash) {
      try {
        const matches = compareSync(password, this.config.passwordHash);
        if (!matches && !isProd) console.log('AntAuth: Password does not match hash');
        return matches;
      } catch (e) {
        console.error('AntAuth: Error comparing password hash', e);
        return false;
      }
    }

    // Fallback to plain password (dev only)
    if (isProd) {
      console.warn('AntAuth: Using plain password in production is discouraged. Use ANT_AUTH_PASSWORD_HASH instead.');
    }
    
    const matches = password === this.config.password;
    if (!matches && !isProd) console.log('AntAuth: Plain password mismatch');
    return matches;
  }

  middleware = async (request: NextRequest) => {
    const path = request.nextUrl.pathname;

    if (['POST', 'PUT', 'DELETE'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');
      if (origin && !origin.includes(host as string)) {
        return NextResponse.json({ error: 'CSRF Protection: Invalid Origin' }, { status: 403 });
      }
    }

    if (path === this.config.loginPath || path.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    const session = await this.getSession(request);

    if (!session) {
      if (path.startsWith('/api/')) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      return NextResponse.redirect(new URL(this.config.loginPath, request.url));
    }

    return NextResponse.next();
  }
}

export function createAuth(config: AntAuthConfig = {}) {
  return new AntAuth(config);
}

export const auth = createAuth();

