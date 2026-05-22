import { z } from 'zod';

export const OfflineTransactionTypeSchema = z.enum([
  'order',
  'inventory_adjustment',
  'loyalty_transaction',
]);
export type OfflineTransactionType = z.infer<typeof OfflineTransactionTypeSchema>;

export const OfflineTransactionSchema = z.object({
  localId: z.string().uuid(),
  type: OfflineTransactionTypeSchema,
  /** Raw payload — typed and validated by the receiving API module. */
  payload: z.unknown(),
  createdAt: z.coerce.date(),
});
/** A single action captured while the device was offline. Flushed in batches via `POST /sync/batch`. */
export type OfflineTransaction = z.infer<typeof OfflineTransactionSchema>;

export const SyncPayloadSchema = z.object({
  tenantId: z.string().uuid(),
  deviceId: z.string().uuid(),
  transactions: z.array(OfflineTransactionSchema).min(1),
  lastSyncAt: z.coerce.date(),
});
/** The request body for `POST /api/sync/batch`. */
export type SyncPayload = z.infer<typeof SyncPayloadSchema>;

export const ConflictStrategySchema = z.enum([
  'last-write-wins',
  'server-wins',
  'client-wins',
]);
export type ConflictStrategy = z.infer<typeof ConflictStrategySchema>;

export const ConflictResolutionSchema = z.object({
  localId: z.string().uuid(),
  strategy: ConflictStrategySchema,
  resolvedAt: z.coerce.date(),
  /** The canonical server record after resolution, if applicable. */
  serverRecord: z.unknown().optional(),
});
/** Describes how a sync conflict was resolved for a given offline transaction. */
export type ConflictResolution = z.infer<typeof ConflictResolutionSchema>;

export const SyncBatchResponseSchema = z.object({
  accepted: z.array(z.string().uuid()),
  rejected: z.array(
    z.object({
      localId: z.string().uuid(),
      reason: z.string(),
    })
  ),
  conflicts: z.array(ConflictResolutionSchema),
  serverTime: z.coerce.date(),
});
/** Response from `POST /api/sync/batch`. */
export type SyncBatchResponse = z.infer<typeof SyncBatchResponseSchema>;

export const SyncStatusSchema = z.object({
  deviceId: z.string().uuid(),
  tenantId: z.string().uuid(),
  lastSyncAt: z.coerce.date().optional(),
  pendingCount: z.number().int().nonnegative(),
  isSyncing: z.boolean(),
});
/** Client-side sync state (stored in Zustand / Dexie metadata). */
export type SyncStatus = z.infer<typeof SyncStatusSchema>;
