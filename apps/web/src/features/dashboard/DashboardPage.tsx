import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function DashboardPage() {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {['Revenue', 'Orders', 'Avg. Order', 'Customers'].map((label) => (
          <Card key={label}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">—</p>
              <p className="text-xs text-muted-foreground mt-1">Phase 2 feature</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
