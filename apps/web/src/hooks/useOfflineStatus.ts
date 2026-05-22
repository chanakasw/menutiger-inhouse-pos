import { useEffect } from 'react';
import { useConnectivityStore } from '../store';

/** Returns the current online status and keeps the Zustand store in sync with browser events. */
export function useOfflineStatus(): { isOnline: boolean; isOffline: boolean } {
  const { isOnline, setOnline } = useConnectivityStore();

  useEffect(() => {
    const handleOnline = () => setOnline(true);
    const handleOffline = () => setOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnline]);

  return { isOnline, isOffline: !isOnline };
}
