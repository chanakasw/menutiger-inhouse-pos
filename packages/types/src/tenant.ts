import { z } from 'zod';

export const UserRoleSchema = z.enum(['admin', 'cashier']);
export type UserRole = z.infer<typeof UserRoleSchema>;

/**
 * White-label theme configuration applied per tenant.
 * Passed to `ThemeProvider` in `packages/ui`.
 */
export const PosThemeSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Must be a hex colour'),
  logo: z.string().url().optional(),
  receiptHeader: z.string().max(500).optional(),
  currencyCode: z.string().length(3),
  taxRate: z.number().min(0).max(1),
  tenantName: z.string().min(1),
});
export type PosTheme = z.infer<typeof PosThemeSchema>;

export const TenantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  slug: z
    .string()
    .min(2)
    .max(63)
    .regex(/^[a-z0-9-]+$/, 'Must be lowercase alphanumeric with hyphens'),
  theme: PosThemeSchema,
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
/** A SaaS tenant (client). Each tenant has its own isolated data and white-label theme. */
export type Tenant = z.infer<typeof TenantSchema>;

export const CreateTenantSchema = TenantSchema.omit({
  id: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});
/** Payload for onboarding a new tenant. */
export type CreateTenant = z.infer<typeof CreateTenantSchema>;

export const UserSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  email: z.string().email(),
  name: z.string().min(1).max(200),
  role: UserRoleSchema,
  isActive: z.boolean().default(true),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
/** A POS operator — either an admin (full access) or cashier (checkout only). */
export type User = z.infer<typeof UserSchema>;

export const CreateUserSchema = UserSchema.omit({
  id: true,
  tenantId: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  password: z.string().min(8),
});
/** Payload for creating a user account (password included only at creation). */
export type CreateUser = z.infer<typeof CreateUserSchema>;

export const PublicUserSchema = UserSchema.omit({ isActive: true });
/** Safe user shape returned from the API (no sensitive fields). */
export type PublicUser = z.infer<typeof PublicUserSchema>;

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  tenantSlug: z.string().min(1),
});
/** Payload for the POST /auth/login endpoint. */
export type Login = z.infer<typeof LoginSchema>;

export const AuthTokensSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int().positive(),
});
/** JWT access + refresh token pair returned on login or token refresh. */
export type AuthTokens = z.infer<typeof AuthTokensSchema>;
