import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth, requireTenant } from '../../middleware/index.js';
import * as syncController from './sync.controller.js';

const router: ExpressRouter = Router();

router.use(requireAuth, requireTenant);

router.post('/batch', syncController.processBatch);

export { router as syncRouter };
