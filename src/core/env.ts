import { z } from 'zod';

const envSchema = z.object({
  ANT_JWT_SECRET: z.string().min(32, {
    message: 'ANT_JWT_SECRET must be at least 32 characters long for security.',
  }),
  ANT_AUTH_USER: z.string().min(1, {
    message: 'ANT_AUTH_USER is required.',
  }),
  ANT_AUTH_PASSWORD: z.string().min(8).optional(),
  ANT_AUTH_PASSWORD_HASH: z.string().optional(),
  ANT_TOKEN_TTL: z.string().optional(),
}).refine((data) => data.ANT_AUTH_PASSWORD || data.ANT_AUTH_PASSWORD_HASH, {
  message: 'Either ANT_AUTH_PASSWORD or ANT_AUTH_PASSWORD_HASH must be provided.',
  path: ['ANT_AUTH_PASSWORD'],
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const errors = parsed.error.flatten().fieldErrors;
    const errorMessages = Object.entries(errors)
      .map(([key, messages]) => `${key}: ${messages?.join(', ')}`)
      .join('\n');

    throw new Error(
      `[AntAuth] Invalid environment variables:\n${errorMessages}`
    );
  }

  return parsed.data;
}
