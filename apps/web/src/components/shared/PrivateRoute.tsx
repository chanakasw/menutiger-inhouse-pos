import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/store';

interface PrivateRouteProps {
  children: ReactNode;
}

/** Redirects unauthenticated users to /login, preserving the intended destination. */
export function PrivateRoute({ children }: PrivateRouteProps) {
  const isAuthenticated = useSessionStore((s) => s.isAuthenticated());
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
