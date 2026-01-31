import { AntAuthResolvedConfig } from '../core/types';
import { checkCredentials } from '../core/auth';
import { signToken } from '../core/token';
import { setSessionCookie, deleteSessionCookie } from './cookies';
import { checkRateLimit, resetRateLimit } from '../core/rate-limit';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(
  config: AntAuthResolvedConfig,
  formData: FormData,
  ip?: string
): Promise<LoginResult> {
  const user = formData.get('user') as string;
  const password = formData.get('password') as string;

  // Rate limiting based on IP or user
  const identifier = ip || user;
  if (identifier) {
    const rate = checkRateLimit(identifier, config.rateLimit.maxAttempts, config.rateLimit.windowMs);
    if (!rate.success) {
      return { 
        success: false, 
        error: `Too many attempts. Try again in ${Math.ceil((rate.resetAt - Date.now()) / 60000)} minutes.` 
      };
    }
  }

  const isValid = checkCredentials(config, user, password);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  // Success: Reset rate limit
  if (identifier) resetRateLimit(identifier);

  const token = await signToken({ user }, config.secretBytes, config.tokenTTL);
  await setSessionCookie(config, token);

  return { success: true };
}

export async function logout(config: AntAuthResolvedConfig) {
  await deleteSessionCookie(config);
}
