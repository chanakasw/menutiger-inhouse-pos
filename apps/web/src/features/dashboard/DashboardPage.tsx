import { TrendingUp, ShoppingBag, Receipt, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useOrderSummary } from '@/features/orders/useOrders';
import { formatCurrency } from '@/lib/utils';

export function DashboardPage() {
  const { data, isLoading } = useOrderSummary();

  const kpis = [
    {
      label: "Today's Revenue",
      value: data ? formatCurrency(data.revenue) : '—',
      icon: TrendingUp,
    },
    {
      label: 'Orders',
      value: data ? String(data.orderCount) : '—',
      icon: ShoppingBag,
    },
    {
      label: 'Avg. Order',
      value: data ? formatCurrency(data.avgOrderValue) : '—',
      icon: Receipt,
    },
    {
      label: 'Top Product',
      value: data?.topProducts[0]?.productName ?? '—',
      icon: Users,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* KPI cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpis.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className={`text-2xl font-bold truncate ${isLoading ? 'animate-pulse text-muted-foreground' : ''}`}>
                {isLoading ? '…' : value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Payment breakdown */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Payment breakdown — today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
            ) : (
              (['cash', 'card', 'qr'] as const).map((method) => {
                const amount = data.paymentBreakdown[method];
                const pct = data.revenue > 0 ? (amount / data.revenue) * 100 : 0;
                return (
                  <div key={method} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize text-muted-foreground">{method}</span>
                      <span className="font-medium">{formatCurrency(amount)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        {/* Top products */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Top products — today</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading || !data ? (
              <p className="text-sm text-muted-foreground animate-pulse">Loading…</p>
            ) : data.topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sales today yet.</p>
            ) : (
              <div className="space-y-2">
                {data.topProducts.map((p, i) => (
                  <div key={p.productName}>
                    <div className="flex justify-between text-sm">
                      <span className="flex gap-2 items-center">
                        <span className="text-muted-foreground w-4">{i + 1}.</span>
                        <span className="font-medium truncate">{p.productName}</span>
                      </span>
                      <span className="text-muted-foreground whitespace-nowrap">
                        ×{p.quantity} · {formatCurrency(p.revenue)}
                      </span>
                    </div>
                    {i < data.topProducts.length - 1 && <Separator className="mt-2" />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
