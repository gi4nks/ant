# Ant

Simple, local-first authentication library for Next.js applications.

## Threat Model

Ant is designed for **local-first** applications, internal tools, or small-scale applications where simplicity and speed are prioritized. 

- **Intended Use**: Internal dashboards, local development tools, small private sites.
- **NOT Intended For**: High-traffic public internet-facing applications, high-value financial systems, or applications requiring complex RBAC.
- **Guarantees**: 
  - **Edge Runtime Compatible**: Works seamlessly in Next.js Middleware and Edge API Routes.
  - Timing-safe credential comparison.
  - Robust CSRF protection for state-changing methods.
  - Secure-by-default cookies (HttpOnly, Secure, SameSite=Strict).
  - Secure password hashing support (Bcrypt).
  - Explicit configuration required in production.

## Configuration

Configure via environment variables or constructor (Required):

- `ANT_JWT_SECRET`: Secret for JWT signing (min 32 chars).
- `ANT_AUTH_USER`: Authorized username.
- `ANT_AUTH_PASSWORD`: Authorized password (min 8 chars).
- `ANT_AUTH_PASSWORD_HASH`: Bcrypt hash of the password. **Strongly Recommended in production**. 
- `ANT_TOKEN_TTL`: Optional. Token expiration time (e.g., `1d`, `7d`). Default: `1d` in production, `7d` in development.

Note: In **production**, it is strongly recommended to use `ANT_AUTH_PASSWORD_HASH`. If only `ANT_AUTH_PASSWORD` is provided, the application will **warn** but continue to function.

Note: The application will throw an error at startup if required environment variables (like Secret or User) are missing.

## Usage

### UI Components

Ant provides a ready-to-use login form for React/Next.js:

```tsx
import { auth, LoginForm } from '@gi4nks/ant';

export default function LoginPage({ searchParams }: { searchParams: { callbackUrl?: string } }) {
  async function handleLogin(formData: FormData) {
    'use server';
    try {
      await auth.login(formData);
      // Logic to redirect using searchParams.callbackUrl
    } catch (e: any) {
      return { error: e.message };
    }
  }

  return (
    <LoginForm 
      action={handleLogin} 
      callbackUrl={searchParams.callbackUrl} 
    />
  );
}
```

### Functional API (Recommended)

```typescript
import { createAuth } from '@gi4nks/ant';

const { login, logout, getSession, verifyCredentials, middleware } = createAuth({
  loginPath: '/login',
});

// Use middleware in middleware.ts
export { middleware };
```

### Class-based API (Singleton)

```typescript
import { auth } from '@gi4nks/ant';

// In middleware.ts
export async function middleware(request: Request) {
  return auth.middleware(request);
}

// In API Routes
const isValid = auth.verifyCredentials(user, pass);
if (isValid) await auth.login();
```

### Typed Sessions

```typescript
interface MySession {
  role: 'admin' | 'user';
  email: string;
}

const { getSession } = createAuth<MySession>();
const session = await getSession(); // Typed as AntSession<MySession>
```

## Integration Examples

### Conan (Internal Tool)
Update `middleware.ts` to use the new functional API for cleaner route protection.

### Atlas (Dashboard)
Migrate from custom JWT logic to Ant to ensure timing-safe comparisons and robust CSRF protection.

## Security Guarantees

1. **CSRF Protection**: Automatic for all `POST`, `PUT`, `DELETE`, `PATCH` methods in the middleware.
2. **Timing-Safe**: All credential checks use constant-time comparison.
3. **No Defaults**: Fails fast if security secrets are not provided.
4. **Hashed Passwords**: Strongly encourages bcrypt in production to prevent plaintext leaks (warns if missing).

## Development & Release

This project uses **GitHub Actions** and **semantic-release** for automated versioning and npm publishing.

### Automated Releases

Every push to the `main` branch triggers a workflow that:
1. Runs linting (`npm run lint`).
2. Runs tests (`npm test`).
3. Builds the library (`npm run build`).
4. Determines the next version based on commit messages.
5. Publishes the package to **GitHub Packages**.
6. Creates a GitHub Release and Tag.

### Conventional Commits

To ensure proper versioning, please use [Conventional Commits](https://www.conventionalcommits.org/):
- `fix: ...` triggers a **patch** release.
- `feat: ...` triggers a **minor** release.
- `perf: ...` triggers a **patch** release.
- `BREAKING CHANGE: ...` in the footer triggers a **major** release.

### Installation from GitHub Packages

Since this package is hosted on GitHub Packages, you need to create or update your `.npmrc` file:

```text
@gi4nks:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_PERSONAL_ACCESS_TOKEN
```

Then install as usual:
```bash
npm install @gi4nks/ant
```

## License

MIT