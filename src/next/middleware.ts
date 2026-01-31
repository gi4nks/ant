import { NextRequest, NextResponse } from 'next/server';
import { AntAuthResolvedConfig } from '../core/types';
import { verifyToken } from '../core/token';

export function createAntMiddleware(config: AntAuthResolvedConfig) {
  return async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // CSRF Protection for state-changing methods
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const origin = request.headers.get('origin');
      const host = request.headers.get('host');

      if (origin) {
        try {
          const originHost = new URL(origin).host;
          if (originHost !== host) {
            console.warn(`[AntAuth] CSRF Blocked: Origin ${originHost} does not match Host ${host}`);
            return NextResponse.json({ error: 'CSRF Protection: Invalid Origin' }, { status: 403 });
          }
        } catch (e) {
          return NextResponse.json({ error: 'CSRF Protection: Invalid Origin' }, { status: 403 });
        }
      }
    }

    // Public paths
    if (path === config.loginPath || path.startsWith('/api/auth/')) {
      return NextResponse.next();
    }

    const token = request.cookies.get(config.sessionCookieName)?.value;
    
    if (!token) {
      return handleUnauthorized(request, config);
    }

    const result = await verifyToken(token, config.secretBytes);

    if (!result.valid) {
      console.warn(`[AntAuth] Session ${result.reason} for path ${path}`);
      return handleUnauthorized(request, config);
    }

    return NextResponse.next();
  };
}

function handleUnauthorized(request: NextRequest, config: AntAuthResolvedConfig) {
  const path = request.nextUrl.pathname;
  if (path.startsWith('/api/')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return NextResponse.redirect(new URL(config.loginPath, request.url));
}