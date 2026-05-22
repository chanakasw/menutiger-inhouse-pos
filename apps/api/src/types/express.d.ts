import type { UserRole } from '@swiftpos/types';

declare global {
  namespace Express {
    interface Request {
      /** Populated by `requireAuth` middleware after JWT verification. */
      user: {
        id: string;
        tenantId: string;
        role: UserRole;
      };
      /** Shortcut populated by `requireTenant` middleware — same as `req.user.tenantId`. */
      tenantId: string;
    }
  }
}
