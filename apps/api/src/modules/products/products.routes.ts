import { Router, type Router as ExpressRouter } from 'express';
import { requireAuth, requireTenant, requireRole } from '../../middleware/index.js';
import * as productsController from './products.controller.js';

const router: ExpressRouter = Router();

router.use(requireAuth, requireTenant);

// Specific routes before parameterised :id
router.get('/categories', productsController.listCategories);

router.get('/', productsController.listProducts);
router.get('/:id', productsController.getProduct);
router.post('/', requireRole('admin'), productsController.createProduct);
router.patch('/:id', requireRole('admin'), productsController.updateProduct);
router.delete('/:id', requireRole('admin'), productsController.deleteProduct);

export { router as productsRouter };
