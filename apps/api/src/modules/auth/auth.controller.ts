import type { Request, Response, NextFunction } from 'express';
import { LoginSchema } from '@swiftpos/types';
import * as authService from './auth.service.js';

/** POST /api/auth/login */
export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const dto = LoginSchema.parse(req.body);
    const result = await authService.login(dto);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/refresh */
export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: unknown };
    if (typeof refreshToken !== 'string') {
      res.status(400).json({ error: 'refreshToken is required' });
      return;
    }
    const tokens = await authService.refreshTokens(refreshToken);
    res.status(200).json(tokens);
  } catch (err) {
    next(err);
  }
}

/** POST /api/auth/logout  (requires valid access token) */
export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body as { refreshToken?: unknown };
    if (typeof refreshToken !== 'string') {
      res.status(400).json({ error: 'refreshToken is required' });
      return;
    }
    await authService.logout(refreshToken);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}
