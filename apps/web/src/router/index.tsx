import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '@/components/shared/AppLayout';
import { PrivateRoute } from '@/components/shared/PrivateRoute';
import { LoginPage } from '@/features/auth/LoginPage';
import { CheckoutPage } from '@/features/checkout/CheckoutPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { LoyaltyPage } from '@/features/loyalty/LoyaltyPage';
import { InventoryPage } from '@/features/inventory/InventoryPage';
import { SettingsPage } from '@/features/settings/SettingsPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <AppLayout />
      </PrivateRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/checkout" replace /> },
      { path: 'checkout', element: <CheckoutPage /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'loyalty', element: <LoyaltyPage /> },
      { path: 'inventory', element: <InventoryPage /> },
      { path: 'settings', element: <SettingsPage /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/checkout" replace />,
  },
]);
