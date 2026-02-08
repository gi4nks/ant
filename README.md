# Ant

Simple, local-first authentication library for Next.js.

## Threat Model

Ant is designed for **single-user** internal tools or small-scale applications where simplicity is prioritized.

- **Intended Use**: Internal dashboards, local development tools, small private sites.
- **NOT Intended For**: Multi-user applications, public internet-facing apps, or complex RBAC.
- **Guarantees**: 
  - Edge Runtime Compatible.
  - Timing-safe credential comparison.
  - CSRF protection for state-changing methods.
  - Secure-by-default cookies (HttpOnly, Secure, SameSite=Strict).
  - Explicit configuration required in production (Hashed passwords mandatory).

## Configuration

Configure via environment variables:

- `ANT_JWT_SECRET`: Secret for JWT signing (min 32 chars).
- `ANT_AUTH_USER`: Authorized username.
- `ANT_AUTH_PASSWORD`: Authorized password (min 8 chars).
- `ANT_AUTH_PASSWORD_HASH`: Bcrypt hash of the password. **Mandatory in production**.

## Usage

### Middleware

Protect your routes in `middleware.ts`:

```typescript
import { auth } from '@gi4nks/ant';

export async function middleware(request: Request) {
  return auth.middleware(request);
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|login).*)'],
};
```

### Login (Server Action)

```typescript
import { auth } from '@gi4nks/ant';
import { redirect } from 'next/navigation';

export async function handleLogin(formData: FormData) {
  'use server';
  try {
    await auth.login(formData);
  } catch (e: any) {
    return { error: 'Invalid credentials' };
  }
  redirect('/');
}
```

### Session

```typescript
import { auth } from '@gi4nks/ant';

const session = await auth.getSession();
if (session) {
  console.log('Logged in as:', session.user);
}
```

## Security

1. **CSRF Protection**: Automatic for all `POST`, `PUT`, `DELETE`, `PATCH` methods in the middleware.
2. **Timing-Safe**: All credential checks use constant-time comparison.
3. **No Plaintext in Prod**: Fails fast if `ANT_AUTH_PASSWORD_HASH` is missing in production.

## License

MIT
