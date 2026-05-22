import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth } from '../../middleware/index.js';
import * as authController from './auth.controller.js';

const router: ExpressRouter = Router();

router.post('/login', authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', requireAuth, authController.logout);

export { router as authRouter };
