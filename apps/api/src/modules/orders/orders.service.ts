import { NotFoundError } from '../../lib/errors.js';
import * as ordersRepository from './orders.repository.js';
import type { OrderFilters } from './orders.types.js';

/** Lists paginated orders for a tenant. */
export async function listOrders(tenantId: string, filters: OrderFilters) {
  return ordersRepository.findAll(tenantId, filters);
}

/** Returns a single order, throwing 404 if not found. */
export async function getOrder(tenantId: string, id: string) {
  const order = await ordersRepository.findById(tenantId, id);
  if (!order) throw new NotFoundError('Order not found');
  return order;
}

/** Voids an order, throwing 404 if not found. */
export async function voidOrder(tenantId: string, id: string) {
  await getOrder(tenantId, id);
  const result = await ordersRepository.voidOrder(tenantId, id);
  if (result.count === 0) throw new NotFoundError('Order already voided or not found');
  return getOrder(tenantId, id);
}

/** Returns today's sales summary for the dashboard. */
export async function getOrderSummary(tenantId: string, date?: Date) {
  return ordersRepository.getDailySummary(tenantId, date);
}
