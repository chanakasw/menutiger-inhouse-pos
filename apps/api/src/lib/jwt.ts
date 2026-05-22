import jwt, { type SignOptions } from 'jsonwebtoken';
import type { UserRole } from '@swiftpos/types';
import { UnauthorizedError } from './errors.js';

export interface JwtPayload {
  sub: string;
  tenantId: string;
  role: UserRole;
}

const accessSecret = (): string => {
  const secret = process.env['JWT_SECRET'];
  if (!secret) throw new Error('JWT_SECRET is not set');
  return secret;
};

const refreshSecret = (): string => {
  const secret = process.env['JWT_REFRESH_SECRET'];
  if (!secret) throw new Error('JWT_REFRESH_SECRET is not set');
  return secret;
};

/** Signs a short-lived access token (default 15 m). */
export function signAccessToken(payload: JwtPayload): string {
  const expiresIn = (process.env['JWT_EXPIRES_IN'] ?? '15m') as SignOptions['expiresIn'];
  return jwt.sign(payload, accessSecret(), { expiresIn });
}

/** Signs a long-lived refresh token (default 7 d). */
export function signRefreshToken(payload: JwtPayload): string {
  const expiresIn = (process.env['JWT_REFRESH_EXPIRES_IN'] ?? '7d') as SignOptions['expiresIn'];
  return jwt.sign(payload, refreshSecret(), { expiresIn });
}

/** Verifies an access token and returns the decoded payload. Throws `UnauthorizedError` on failure. */
export function verifyAccessToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, accessSecret()) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired access token');
  }
}

/** Verifies a refresh token and returns the decoded payload. Throws `UnauthorizedError` on failure. */
export function verifyRefreshToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, refreshSecret()) as JwtPayload;
  } catch {
    throw new UnauthorizedError('Invalid or expired refresh token');
  }
}

/** Extracts the bearer token from the Authorization header, or returns null. */
export function extractBearerToken(authHeader: string | undefined): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null;
  return authHeader.slice(7);
}
