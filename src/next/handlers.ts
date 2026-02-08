import { AntAuthResolvedConfig } from '../core/types';
import { checkCredentials } from '../core/auth';
import { signToken } from '../core/token';
import { setSessionCookie, deleteSessionCookie } from './cookies';

export interface LoginResult {
  success: boolean;
  error?: string;
}

export async function login(
  config: AntAuthResolvedConfig,
  formData: FormData
): Promise<LoginResult> {
  const user = formData.get('user') as string;
  const password = formData.get('password') as string;

  const isValid = checkCredentials(config, user, password);

  if (!isValid) {
    return { success: false, error: 'Invalid credentials' };
  }

  const token = await signToken({ user }, config.secretBytes, config.tokenTTL);
  await setSessionCookie(config, token);

  return { success: true };
}

export async function logout(config: AntAuthResolvedConfig) {
  await deleteSessionCookie(config);
}