import { create } from 'zustand';

interface ConnectivityStore {
  isOnline: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  setOnline: (online: boolean) => void;
  setPendingSyncCount: (count: number) => void;
  setIsSyncing: (syncing: boolean) => void;
}

export const useConnectivityStore = create<ConnectivityStore>((set) => ({
  isOnline: navigator.onLine,
  pendingSyncCount: 0,
  isSyncing: false,

  setOnline(online) {
    set({ isOnline: online });
  },

  setPendingSyncCount(count) {
    set({ pendingSyncCount: count });
  },

  setIsSyncing(syncing) {
    set({ isSyncing: syncing });
  },
}));
