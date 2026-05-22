import type { Prisma, User, Tenant, RefreshToken } from '@prisma/client';
import { prisma } from '../../db/index.js';

/** Finds a user by email scoped to a tenant. Returns null if not found. */
export async function findUserByEmail(
  tenantId: string,
  email: string
): Promise<User | null> {
  return prisma.user.findUnique({
    where: { tenantId_email: { tenantId, email } },
  });
}

/** Finds a user by their primary key. Returns null if not found. */
export async function findUserById(id: string): Promise<User | null> {
  return prisma.user.findUnique({ where: { id } });
}

/** Finds a tenant by its URL slug. Returns null if not found. */
export async function findTenantBySlug(slug: string): Promise<Tenant | null> {
  return prisma.tenant.findUnique({ where: { slug } });
}

/** Persists a new refresh token record for the given user. */
export async function createRefreshToken(
  data: Prisma.RefreshTokenCreateInput
): Promise<RefreshToken> {
  return prisma.refreshToken.create({ data });
}

/** Retrieves a stored refresh token by its value. Returns null if not found or expired. */
export async function findRefreshToken(token: string): Promise<RefreshToken | null> {
  return prisma.refreshToken.findUnique({ where: { token } });
}

/** Deletes a refresh token — called on logout or rotation. */
export async function deleteRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

/** Deletes all refresh tokens for a user — called on password change or force-logout. */
export async function deleteAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { userId } });
}
