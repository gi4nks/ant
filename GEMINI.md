# Ant - AI Context & Guidelines

Ant is a simple, local-first authentication library for Next.js. It focuses on security-by-default, simplicity, and zero-config for development while enforcing strict security for production. It supports both **Single-User** (env-based) and **Multi-User** (provider-based) modes.

## Tech Stack
- **Language**: TypeScript
- **Runtime**: Node.js / Edge Runtime (Next.js)
- **Bundler**: `tsup` (CJS, ESM, DTS)
- **Testing**: `vitest`
- **Linting**: `eslint` (Flat Config)
- **CI/CD**: GitHub Actions + `semantic-release` (publishing to GitHub Packages)

## Core Principles
1. **Security First**: Timing-safe comparisons, CSRF protection, secure cookies.
2. **Local-First**: Optimized for internal tools and small-scale applications.
3. **Fail-Fast**: Throws errors early if critical environment variables are missing. Warns on non-critical security misconfigurations.
4. **Developer Experience**: Functional and Class-based APIs for flexibility.
5. **Edge Compatible**: Zero dependencies on Node.js-specific APIs (like `crypto`), fully compatible with Vercel Edge Runtime.

## Codebase Map
- `src/core/`: Pure logic for authentication, tokens, and environment validation.
- `src/next/`: Next.js specific integration (middleware, cookies).
- `src/index.ts`: Public entry point.

## AI Guidelines
- **Versioning**: Adhere to Conventional Commits for all changes.
- **Testing**: Every new feature or bug fix must include tests in `*.test.ts`.
- **Typing**: Maintain strict TypeScript types. Use `AntSession<T>` for generic session support.
- **Security**: Never compromise on timing-safety or CSRF protection. Ensure cookies remain `HttpOnly`, `Secure`, and `SameSite=Strict`.
- **Formatting**: Follow existing linting rules defined in `eslint.config.mjs`.

## Workflow
- Build: `npm run build`
- Test: `npm test`
- Lint: `npm run lint`
- Dev: `npm run dev`
