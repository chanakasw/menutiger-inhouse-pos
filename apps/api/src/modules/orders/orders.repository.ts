import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/index.js';
import type { OrderFilters, OrderSummary } from './orders.types.js';

/** Returns paginated orders for a tenant with optional filters. */
export async function findAll(tenantId: string, filters: OrderFilters) {
  const { search, status, dateFrom, dateTo, page, limit } = filters;
  const skip = (page - 1) * limit;

  const where: Prisma.OrderWhereInput = {
    tenantId,
    ...(status && { status }),
    ...(dateFrom || dateTo
      ? {
          createdAt: {
            ...(dateFrom && { gte: dateFrom }),
            ...(dateTo && { lte: dateTo }),
          },
        }
      : {}),
    ...(search && {
      OR: [
        { orderNumber: { equals: parseInt(search, 10) || undefined } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
      ],
    }),
  };

  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        items: true,
        customer: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
}

/** Returns a single order with items and customer, scoped to tenant. */
export async function findById(tenantId: string, id: string) {
  return prisma.order.findFirst({
    where: { id, tenantId },
    include: {
      items: true,
      customer: { select: { id: true, name: true, email: true, phone: true } },
    },
  });
}

/** Marks an order as voided. */
export async function voidOrder(tenantId: string, id: string) {
  return prisma.order.updateMany({
    where: { id, tenantId, status: { not: 'voided' } },
    data: { status: 'voided' },
  });
}

/** Returns sales summary for a given calendar day (defaults to today). */
export async function getDailySummary(tenantId: string, date?: Date): Promise<OrderSummary> {
  const day = date ?? new Date();
  const startOfDay = new Date(day);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(day);
  endOfDay.setHours(23, 59, 59, 999);

  const [orders, topProductsRaw] = await Promise.all([
    prisma.order.findMany({
      where: {
        tenantId,
        status: 'paid',
        createdAt: { gte: startOfDay, lte: endOfDay },
      },
      select: { total: true, paymentMethod: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productName'],
      where: {
        order: {
          tenantId,
          status: 'paid',
          createdAt: { gte: startOfDay, lte: endOfDay },
        },
      },
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { totalPrice: 'desc' } },
      take: 5,
    }),
  ]);

  const revenue = orders.reduce((sum, o) => sum + Number(o.total), 0);
  const orderCount = orders.length;
  const avgOrderValue = orderCount > 0 ? revenue / orderCount : 0;

  const paymentBreakdown = { cash: 0, card: 0, qr: 0 };
  for (const o of orders) {
    paymentBreakdown[o.paymentMethod] += Number(o.total);
  }

  const topProducts = topProductsRaw.map((row) => ({
    productName: row.productName,
    quantity: row._sum.quantity ?? 0,
    revenue: Number(row._sum.totalPrice ?? 0),
  }));

  return { revenue, orderCount, avgOrderValue, paymentBreakdown, topProducts };
}
