export function validateEnv() {
  const env = process.env;
  const errors: string[] = [];

  const ANT_JWT_SECRET = env.ANT_JWT_SECRET;
  const ANT_AUTH_USER = env.ANT_AUTH_USER;
  const ANT_AUTH_PASSWORD = env.ANT_AUTH_PASSWORD;
  const ANT_AUTH_PASSWORD_HASH = env.ANT_AUTH_PASSWORD_HASH;

  if (!ANT_JWT_SECRET || ANT_JWT_SECRET.length < 32) {
    errors.push('ANT_JWT_SECRET must be at least 32 characters long for security.');
  }

  if (!ANT_AUTH_USER) {
    errors.push('ANT_AUTH_USER is required.');
  }

  if ((!ANT_AUTH_PASSWORD || ANT_AUTH_PASSWORD.length < 8) && !ANT_AUTH_PASSWORD_HASH) {
    errors.push('Either ANT_AUTH_PASSWORD (min 8 chars) or ANT_AUTH_PASSWORD_HASH must be provided.');
  }

  if (errors.length > 0) {
    throw new Error(`[AntAuth] Invalid environment variables:\n${errors.join('\n')}`);
  }

  return {
    ANT_JWT_SECRET: ANT_JWT_SECRET!,
    ANT_AUTH_USER: ANT_AUTH_USER!,
    ANT_AUTH_PASSWORD: ANT_AUTH_PASSWORD,
    ANT_AUTH_PASSWORD_HASH,
    ANT_TOKEN_TTL: env.ANT_TOKEN_TTL,
  };
}