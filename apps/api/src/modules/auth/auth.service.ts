import bcrypt from 'bcryptjs';
import type { Login, AuthTokens, PublicUser } from '@swiftpos/types';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../lib/jwt.js';
import { UnauthorizedError, NotFoundError } from '../../lib/errors.js';
import type { AuthResponse } from './auth.types.js';
import * as authRepository from './auth.repository.js';

/** Validates credentials and returns a fresh token pair. */
export async function login(dto: Login): Promise<AuthResponse> {
  const tenant = await authRepository.findTenantBySlug(dto.tenantSlug);
  if (!tenant || !tenant.isActive) {
    throw new NotFoundError('Tenant not found');
  }

  const user = await authRepository.findUserByEmail(tenant.id, dto.email);
  if (!user || !user.isActive) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const passwordValid = await bcrypt.compare(dto.password, user.password);
  if (!passwordValid) {
    throw new UnauthorizedError('Invalid credentials');
  }

  const jwtPayload = { sub: user.id, tenantId: tenant.id, role: user.role };
  const accessToken = signAccessToken(jwtPayload);
  const refreshToken = signRefreshToken(jwtPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepository.createRefreshToken({
    token: refreshToken,
    expiresAt,
    user: { connect: { id: user.id } },
  });

  const tokens: AuthTokens = { accessToken, refreshToken, expiresIn: 15 * 60 };
  const publicUser: PublicUser = {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };

  return { user: publicUser, tokens };
}

/** Rotates a refresh token — verifies the old one, issues a new pair. */
export async function refreshTokens(oldRefreshToken: string): Promise<AuthTokens> {
  const payload = verifyRefreshToken(oldRefreshToken);

  const stored = await authRepository.findRefreshToken(oldRefreshToken);
  if (!stored || stored.expiresAt < new Date()) {
    throw new UnauthorizedError('Refresh token invalid or expired');
  }

  await authRepository.deleteRefreshToken(oldRefreshToken);

  const jwtPayload = { sub: payload.sub, tenantId: payload.tenantId, role: payload.role };
  const accessToken = signAccessToken(jwtPayload);
  const newRefreshToken = signRefreshToken(jwtPayload);

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  await authRepository.createRefreshToken({
    token: newRefreshToken,
    expiresAt,
    user: { connect: { id: payload.sub } },
  });

  return { accessToken, refreshToken: newRefreshToken, expiresIn: 15 * 60 };
}

/** Invalidates the provided refresh token (logout). */
export async function logout(refreshToken: string): Promise<void> {
  await authRepository.deleteRefreshToken(refreshToken);
}
