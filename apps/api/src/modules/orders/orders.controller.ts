import type { Request, Response, NextFunction } from 'express';
import { OrderFiltersSchema } from './orders.types.js';
import * as ordersService from './orders.service.js';

/** GET /api/orders */
export async function listOrders(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = OrderFiltersSchema.parse(req.query);
    const result = await ordersService.listOrders(req.tenantId, filters);
    res.json(result);
  } catch (err) { next(err); }
}

/** GET /api/orders/summary */
export async function getOrderSummary(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const date = req.query['date'] ? new Date(req.query['date'] as string) : undefined;
    const summary = await ordersService.getOrderSummary(req.tenantId, date);
    res.json(summary);
  } catch (err) { next(err); }
}

/** GET /api/orders/:id */
export async function getOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await ordersService.getOrder(req.tenantId, req.params['id'] as string);
    res.json(order);
  } catch (err) { next(err); }
}

/** PATCH /api/orders/:id/void */
export async function voidOrder(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const order = await ordersService.voidOrder(req.tenantId, req.params['id'] as string);
    res.json(order);
  } catch (err) { next(err); }
}
