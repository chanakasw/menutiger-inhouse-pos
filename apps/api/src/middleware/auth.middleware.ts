import type { Request, Response, NextFunction } from 'express';
import type { UserRole } from '@swiftpos/types';
import { extractBearerToken, verifyAccessToken } from '../lib/jwt.js';
import { ForbiddenError, UnauthorizedError } from '../lib/errors.js';

/** Verifies the JWT and attaches `req.user` and `req.tenantId`. */
export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const token = extractBearerToken(req.headers['authorization']);
  if (!token) return next(new UnauthorizedError('No bearer token provided'));

  try {
    const payload = verifyAccessToken(token);
    req.user = { id: payload.sub, tenantId: payload.tenantId, role: payload.role };
    req.tenantId = payload.tenantId;
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * Role guard — must be composed after `requireAuth`.
 * @example router.get('/admin', requireAuth, requireRole('admin'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) return next(new UnauthorizedError());
    if (!roles.includes(req.user.role)) {
      return next(new ForbiddenError('Insufficient permissions'));
    }
    next();
  };
}
