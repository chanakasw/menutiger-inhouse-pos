import { NavLink, Outlet } from 'react-router-dom';
import {
  ShoppingCart,
  LayoutDashboard,
  ClipboardList,
  Heart,
  Package,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '../ui/button';
import { OfflineIndicator } from './OfflineIndicator';
import { useSessionStore } from '@/store';
import { api } from '@/lib/api-client';

const NAV_ITEMS = [
  { to: '/checkout', label: 'Checkout', icon: ShoppingCart },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/orders', label: 'Orders', icon: ClipboardList },
  { to: '/loyalty', label: 'Loyalty', icon: Heart },
  { to: '/inventory', label: 'Inventory', icon: Package },
  { to: '/settings', label: 'Settings', icon: Settings },
] as const;

export function AppLayout() {
  const { user, tokens, clearSession } = useSessionStore();

  const handleLogout = async () => {
    try {
      if (tokens?.refreshToken) {
        await api.post('/api/auth/logout', { refreshToken: tokens.refreshToken });
      }
    } finally {
      clearSession();
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r bg-card">
        {/* Logo */}
        <div className="flex h-14 items-center gap-2 border-b px-4">
          <Zap className="h-5 w-5 text-primary" />
          <span className="font-bold tracking-tight">SwiftPOS</span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-2">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t p-3 space-y-2">
          <OfflineIndicator />
          <div className="flex items-center justify-between">
            <span className="truncate text-xs text-muted-foreground">{user?.name}</span>
            <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex flex-1 flex-col overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
