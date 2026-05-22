import type { AuthTokens, PublicUser } from '@swiftpos/types';

/** Response body returned from login and token refresh. */
export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}

/** Decoded JWT payload as stored on req.user. */
export interface RequestUser {
  id: string;
  tenantId: string;
  role: 'admin' | 'cashier';
}
