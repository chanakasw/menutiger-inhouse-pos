import { useSessionStore } from '../store';

/** Returns the current tenant ID and user from the persisted session. */
export function useTenant(): { tenantId: string | null; tenantName: string | null } {
  const { tenantId, user } = useSessionStore();

  return {
    tenantId,
    // PublicUser doesn't carry tenantName — this would come from a tenant query
    // For now we fall back to the tenantId slug
    tenantName: tenantId,
  };
}
