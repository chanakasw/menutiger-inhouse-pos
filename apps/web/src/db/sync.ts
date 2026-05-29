import { SyncPayloadSchema } from '@swiftpos/types';
import { db } from './schema';
import { uuid } from '../lib/utils';
import { queryClient } from '../lib/query-client';
import { useSessionStore } from '../store';
import { useConnectivityStore } from '../store';

const MAX_RETRIES = 3;
const BATCH_SIZE = 50;

/** Flushes pending sync_queue entries to POST /api/sync/batch when online. */
export async function flushSyncQueue(): Promise<void> {
  const { isOnline } = useConnectivityStore.getState();
  if (!isOnline) return;

  const { tokens, tenantId } = useSessionStore.getState();
  if (!tokens || !tenantId) return;

  const pending = await db.syncQueue
    .where('_retryCount')
    .below(MAX_RETRIES)
    .limit(BATCH_SIZE)
    .toArray();

  if (pending.length === 0) return;

  const payload = SyncPayloadSchema.parse({
    tenantId,
    deviceId: getDeviceId(),
    transactions: pending.map(({ _retryCount: _, _lastError: __, ...tx }) => tx),
    lastSyncAt: new Date(),
  });

  const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

  try {
    const res = await fetch(`${apiUrl}/api/sync/batch`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`Sync failed: ${res.status}`);

    const { accepted, rejected } = (await res.json()) as {
      accepted: string[];
      rejected: Array<{ localId: string; reason: string }>;
    };

    // Remove successfully synced entries
    await db.syncQueue.bulkDelete(accepted);

    // Mark rejected entries with error + incremented retry count
    await Promise.all(
      rejected.map(({ localId, reason }) =>
        db.syncQueue
          .where('localId')
          .equals(localId)
          .modify((tx) => {
            tx._retryCount += 1;
            tx._lastError = reason;
          })
      )
    );

    // Mark local orders as synced
    await db.orders
      .where('id')
      .anyOf(accepted)
      .modify({ _syncStatus: 'synced', syncedAt: new Date() });

    // Invalidate orders queries so Dashboard and Orders page refresh automatically
    if (accepted.length > 0) {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  } catch (err) {
    // Increment retry count on all items in the batch on network failure
    const localIds = pending.map((t) => t.localId);
    await db.syncQueue
      .where('localId')
      .anyOf(localIds)
      .modify((tx) => {
        tx._retryCount += 1;
        tx._lastError = err instanceof Error ? err.message : 'Unknown error';
      });
  }
}

/** Returns the per-device UUID, creating and persisting one if needed. */
export function getDeviceId(): string {
  const key = 'swiftpos_device_id';
  let deviceId = localStorage.getItem(key);
  if (!deviceId) {
    deviceId = uuid();
    localStorage.setItem(key, deviceId);
  }
  return deviceId;
}

/** Starts a background interval that flushes the sync queue when online. */
export function startSyncEngine(intervalMs = 30_000): () => void {
  flushSyncQueue();
  const id = setInterval(flushSyncQueue, intervalMs);

  const handleOnline = () => {
    useConnectivityStore.getState().setOnline(true);
    flushSyncQueue();
  };
  const handleOffline = () => useConnectivityStore.getState().setOnline(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    clearInterval(id);
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
