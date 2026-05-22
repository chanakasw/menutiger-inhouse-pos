import type { Request, Response, NextFunction } from 'express';
import { UnauthorizedError } from '../lib/errors.js';

/**
 * Ensures `req.tenantId` is populated.
 * Must be placed after `requireAuth` — it relies on the JWT payload already attached.
 */
export function requireTenant(req: Request, _res: Response, next: NextFunction): void {
  if (!req.tenantId) {
    return next(new UnauthorizedError('Tenant context missing'));
  }
  next();
}
