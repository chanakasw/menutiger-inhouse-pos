import type { PaymentMethod, OrderItem } from '@swiftpos/types';
import { db } from '@/db';
import type { LocalOrder, QueuedTransaction } from '@/db';
import { useSessionStore, useConnectivityStore } from '@/store';
import { useCart } from '@/hooks';
import { useSync } from '@/hooks';
import { uuid } from '@/lib/utils';

// TODO Phase 3: read taxRate from tenant settings
const DEFAULT_TAX_RATE = 0.1;

/** Generates the next local order number for this tenant, stored in localStorage.
 *  The server may reassign on conflict when two devices are offline simultaneously. */
function getNextLocalOrderNumber(tenantId: string): number {
  const key = `swiftpos_order_num_${tenantId}`;
  const current = parseInt(localStorage.getItem(key) ?? '0', 10);
  const next = current + 1;
  localStorage.setItem(key, String(next));
  return next;
}

/** Completes a checkout: writes the order to Dexie, enqueues for sync, clears the cart. */
export function useCheckout() {
  const { items, subtotal, discount, customerId, clearCart } = useCart();
  const { tenantId } = useSessionStore();
  const { isOnline } = useConnectivityStore();
  const { flush } = useSync();

  async function completeOrder(paymentMethod: PaymentMethod): Promise<LocalOrder> {
    if (!tenantId) throw new Error('No active tenant session');
    if (items.length === 0) throw new Error('Cart is empty');

    const sub = subtotal;
    const taxAmount = parseFloat((sub * DEFAULT_TAX_RATE).toFixed(2));
    const total = parseFloat((sub + taxAmount - discount).toFixed(2));
    const orderId = uuid();

    const orderItems: OrderItem[] = items.map((item) => ({
      id: uuid(),
      productId: item.productId,
      productName: item.productName,
      variantId: item.variantId,
      variantName: item.variantName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: parseFloat((item.unitPrice * item.quantity).toFixed(2)),
    }));

    const order: LocalOrder = {
      id: orderId,
      tenantId,
      orderNumber: getNextLocalOrderNumber(tenantId),
      items: orderItems,
      subtotal: sub,
      tax: taxAmount,
      discount,
      total,
      paymentMethod,
      customerId: customerId ?? undefined,
      status: 'paid',
      source: 'pos',
      createdAt: new Date(),
      syncedAt: undefined,
      _syncStatus: 'pending',
    };

    const queueEntry: QueuedTransaction = {
      localId: uuid(),
      type: 'order',
      payload: order,
      createdAt: new Date(),
      _retryCount: 0,
    };

    // Write-to-Dexie-first — always succeeds regardless of connectivity
    await db.transaction('rw', [db.orders, db.orderItems, db.syncQueue], async () => {
      await db.orders.add(order);
      await db.orderItems.bulkAdd(orderItems);
      await db.syncQueue.add(queueEntry);
    });

    clearCart();

    // Best-effort immediate flush when online
    if (isOnline) {
      flush().catch(() => { /* retry will happen on next interval */ });
    }

    return order;
  }

  return { completeOrder, taxRate: DEFAULT_TAX_RATE };
}
