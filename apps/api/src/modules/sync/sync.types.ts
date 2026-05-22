import { z } from 'zod';

/** Payload shape for inventory adjustments sent via the sync queue. */
export const InventoryAdjustmentPayloadSchema = z.object({
  productId: z.string().uuid(),
  delta: z.number().int(),
  reason: z.string().optional(),
});
export type InventoryAdjustmentPayload = z.infer<typeof InventoryAdjustmentPayloadSchema>;

/** Payload shape for loyalty transactions sent via the sync queue. */
export const LoyaltyTransactionPayloadSchema = z.object({
  id: z.string().uuid(),
  customerId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  type: z.enum(['earn', 'redeem', 'adjustment']),
  points: z.number().int(),
  balanceAfter: z.number().int().nonnegative(),
  note: z.string().optional(),
  createdAt: z.coerce.date(),
});
export type LoyaltyTransactionPayload = z.infer<typeof LoyaltyTransactionPayloadSchema>;
