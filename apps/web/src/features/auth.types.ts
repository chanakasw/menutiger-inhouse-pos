import type { PublicUser, AuthTokens } from '@swiftpos/types';

/** Shape returned from POST /api/auth/login and POST /api/auth/refresh. */
export interface AuthResponse {
  user: PublicUser;
  tokens: AuthTokens;
}
