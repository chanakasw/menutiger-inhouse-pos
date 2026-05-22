import { OrderSchema, SyncPayloadSchema, type SyncBatchResponse } from '@swiftpos/types';
import { InventoryAdjustmentPayloadSchema, LoyaltyTransactionPayloadSchema } from './sync.types.js';
import * as syncRepository from './sync.repository.js';

/** Processes a sync batch and returns accepted/rejected/conflict lists. */
export async function processBatch(
  tenantId: string,
  rawPayload: unknown
): Promise<SyncBatchResponse> {
  const payload = SyncPayloadSchema.parse(rawPayload);

  if (payload.tenantId !== tenantId) {
    throw new Error('Tenant mismatch in sync payload');
  }

  const accepted: string[] = [];
  const rejected: SyncBatchResponse['rejected'] = [];
  const conflicts: SyncBatchResponse['conflicts'] = [];

  for (const tx of payload.transactions) {
    try {
      switch (tx.type) {
        case 'order':
          await processOrder(tenantId, tx.localId, tx.payload, accepted, conflicts);
          break;
        case 'inventory_adjustment':
          await processInventoryAdjustment(tenantId, tx.localId, tx.payload, accepted, rejected);
          break;
        case 'loyalty_transaction':
          await processLoyaltyTransaction(tenantId, tx.localId, tx.payload, accepted, rejected);
          break;
        default:
          rejected.push({ localId: tx.localId, reason: `Unknown transaction type` });
      }
    } catch (err) {
      rejected.push({
        localId: tx.localId,
        reason: err instanceof Error ? err.message : 'Processing error',
      });
    }
  }

  return { accepted, rejected, conflicts, serverTime: new Date() };
}

async function processOrder(
  tenantId: string,
  localId: string,
  payload: unknown,
  accepted: string[],
  conflicts: SyncBatchResponse['conflicts']
): Promise<void> {
  const result = OrderSchema.safeParse(payload);
  if (!result.success) throw new Error('Invalid order payload');

  const order = result.data;

  // Idempotency — already synced
  if (await syncRepository.orderExists(order.id)) {
    accepted.push(localId);
    return;
  }

  // Resolve orderNumber conflict (two devices can both generate the same local number)
  let orderNumber = order.orderNumber;
  try {
    await syncRepository.createOrderWithItems(
      {
        id: order.id,
        orderNumber,
        subtotal: order.subtotal,
        tax: order.tax,
        discount: order.discount,
        total: order.total,
        paymentMethod: order.paymentMethod,
        status: order.status,
        source: order.source,
        createdAt: order.createdAt,
        syncedAt: new Date(),
        tenant: { connect: { id: tenantId } },
        ...(order.customerId && { customer: { connect: { id: order.customerId } } }),
      },
      order.items.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        variantId: item.variantId,
        variantName: item.variantName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        note: item.note,
      }))
    );
  } catch (err: unknown) {
    // Handle orderNumber unique constraint — assign next available number
    const isUniqueViolation =
      err instanceof Error && err.message.includes('Unique constraint');
    if (!isUniqueViolation) throw err;

    orderNumber = await syncRepository.nextOrderNumber(tenantId);
    await syncRepository.createOrderWithItems(
      { id: order.id, orderNumber, subtotal: order.subtotal, tax: order.tax, discount: order.discount, total: order.total, paymentMethod: order.paymentMethod, status: order.status, source: order.source, createdAt: order.createdAt, syncedAt: new Date(), tenant: { connect: { id: tenantId } } },
      order.items.map((item) => ({ id: item.id, productId: item.productId, productName: item.productName, variantId: item.variantId, variantName: item.variantName, quantity: item.quantity, unitPrice: item.unitPrice, totalPrice: item.totalPrice, note: item.note }))
    );

    conflicts.push({
      localId,
      strategy: 'server-wins',
      resolvedAt: new Date(),
      serverRecord: { orderNumber },
    });
  }

  accepted.push(localId);
}

async function processInventoryAdjustment(
  tenantId: string,
  localId: string,
  payload: unknown,
  accepted: string[],
  rejected: SyncBatchResponse['rejected']
): Promise<void> {
  const result = InventoryAdjustmentPayloadSchema.safeParse(payload);
  if (!result.success) {
    rejected.push({ localId, reason: 'Invalid inventory adjustment payload' });
    return;
  }
  await syncRepository.adjustInventory(tenantId, result.data.productId, result.data.delta);
  accepted.push(localId);
}

async function processLoyaltyTransaction(
  tenantId: string,
  localId: string,
  payload: unknown,
  accepted: string[],
  rejected: SyncBatchResponse['rejected']
): Promise<void> {
  const result = LoyaltyTransactionPayloadSchema.safeParse(payload);
  if (!result.success) {
    rejected.push({ localId, reason: 'Invalid loyalty transaction payload' });
    return;
  }
  const tx = result.data;

  if (await syncRepository.loyaltyTransactionExists(tx.id)) {
    accepted.push(localId);
    return;
  }

  await syncRepository.createLoyaltyTransaction(
    {
      id: tx.id,
      type: tx.type,
      points: tx.points,
      balanceAfter: tx.balanceAfter,
      note: tx.note,
      createdAt: tx.createdAt,
      tenant: { connect: { id: tenantId } },
      customer: { connect: { id: tx.customerId } },
      ...(tx.orderId && { order: { connect: { id: tx.orderId } } }),
    },
    tx.customerId,
    tx.points
  );
  accepted.push(localId);
}
