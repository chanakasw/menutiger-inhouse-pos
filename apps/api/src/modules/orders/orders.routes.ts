import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth, requireTenant, requireRole } from '../../middleware/index.js';
import * as ordersController from './orders.controller.js';

const router: ExpressRouter = Router();

router.use(requireAuth, requireTenant);

// Specific routes before parameterised :id
router.get('/summary', ordersController.getOrderSummary);

router.get('/', ordersController.listOrders);
router.get('/:id', ordersController.getOrder);
router.patch('/:id/void', requireRole('admin'), ordersController.voidOrder);

export { router as ordersRouter };
