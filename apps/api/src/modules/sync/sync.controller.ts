import type { Request, Response, NextFunction } from 'express';
import * as syncService from './sync.service.js';

/** POST /api/sync/batch */
export async function processBatch(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const result = await syncService.processBatch(req.tenantId, req.body);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
