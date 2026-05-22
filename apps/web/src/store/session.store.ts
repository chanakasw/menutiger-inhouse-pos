import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { PublicUser, AuthTokens } from '@swiftpos/types';

interface SessionStore {
  user: PublicUser | null;
  tokens: AuthTokens | null;
  tenantId: string | null;
  setSession: (user: PublicUser, tokens: AuthTokens) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
  isAuthenticated: () => boolean;
}

export const useSessionStore = create<SessionStore>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      tenantId: null,

      setSession(user, tokens) {
        set({ user, tokens, tenantId: user.tenantId });
      },

      setTokens(tokens) {
        set({ tokens });
      },

      clearSession() {
        set({ user: null, tokens: null, tenantId: null });
      },

      isAuthenticated() {
        return get().tokens !== null && get().user !== null;
      },
    }),
    {
      name: 'swiftpos-session',
      // Only persist tokens and user — clear connectivity state on reload
      partialize: (state) => ({ user: state.user, tokens: state.tokens, tenantId: state.tenantId }),
    }
  )
);
