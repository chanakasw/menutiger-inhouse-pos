import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/index.js';

/** Checks whether an order with this ID already exists. */
export async function orderExists(id: string): Promise<boolean> {
  const count = await prisma.order.count({ where: { id } });
  return count > 0;
}

/** Finds the highest orderNumber for a tenant to generate the next one on conflict. */
export async function nextOrderNumber(tenantId: string): Promise<number> {
  const result = await prisma.order.aggregate({
    where: { tenantId },
    _max: { orderNumber: true },
  });
  return (result._max.orderNumber ?? 0) + 1;
}

/** Creates an order with its items in a single transaction. */
export async function createOrderWithItems(
  orderData: Prisma.OrderCreateInput,
  items: Prisma.OrderItemCreateManyOrderInput[]
): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const order = await tx.order.create({ data: orderData });
    if (items.length > 0) {
      await tx.orderItem.createMany({
        data: items.map((item) => ({ ...item, orderId: order.id })),
      });
    }
  });
}

/** Upserts an inventory item (increments stockQuantity by delta). */
export async function adjustInventory(
  tenantId: string,
  productId: string,
  delta: number
): Promise<void> {
  await prisma.inventoryItem.upsert({
    where: { productId },
    update: { stockQuantity: { increment: delta } },
    create: { tenantId, productId, stockQuantity: Math.max(0, delta), lowStockThreshold: 10 },
  });
}

/** Checks whether a loyalty transaction with this ID already exists. */
export async function loyaltyTransactionExists(id: string): Promise<boolean> {
  const count = await prisma.loyaltyTransaction.count({ where: { id } });
  return count > 0;
}

/** Creates a loyalty transaction and updates the customer's point balance. */
export async function createLoyaltyTransaction(
  data: Prisma.LoyaltyTransactionCreateInput,
  customerId: string,
  pointsDelta: number
): Promise<void> {
  await prisma.$transaction([
    prisma.loyaltyTransaction.create({ data }),
    prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { increment: pointsDelta } },
    }),
  ]);
}
