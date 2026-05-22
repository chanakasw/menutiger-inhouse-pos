import { useEffect, useCallback } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, flushSyncQueue } from '../db';
import { useConnectivityStore } from '../store';

/** Exposes sync queue depth and a manual flush trigger. Starts the live queue count. */
export function useSync(): {
  pendingCount: number;
  isSyncing: boolean;
  flush: () => Promise<void>;
} {
  const { isOnline, isSyncing, setIsSyncing, setPendingSyncCount } = useConnectivityStore();

  const pendingCount = useLiveQuery(
    () => db.syncQueue.where('_retryCount').below(3).count(),
    [],
    0
  );

  useEffect(() => {
    setPendingSyncCount(pendingCount ?? 0);
  }, [pendingCount, setPendingSyncCount]);

  const flush = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);
    try {
      await flushSyncQueue();
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, setIsSyncing]);

  return { pendingCount: pendingCount ?? 0, isSyncing, flush };
}
