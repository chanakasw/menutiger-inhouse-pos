import { useState } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useOrders } from './useOrders';
import { OrderDetailModal } from './OrderDetailModal';
import type { OrderRow, OrderFilters } from './orders.types';
import { formatCurrency, formatDateTime } from '@/lib/utils';

const STATUS_BADGE: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  voided: 'bg-red-100 text-red-800',
};

const PAGE_SIZE = 20;

export function OrdersPage() {
  const [filters, setFilters] = useState<OrderFilters>({ page: 1, limit: PAGE_SIZE });
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRow | null>(null);

  const { data, isLoading, isError } = useOrders(filters);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters((f) => ({ ...f, search: search || undefined, page: 1 }));
  };

  const handleStatusFilter = (status?: 'paid' | 'pending' | 'voided') => {
    setFilters((f) => ({ ...f, status, page: 1 }));
  };

  return (
    <div className="flex flex-col h-full p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Orders</h1>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {data && <span>{data.total} total</span>}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Order # or customer…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 w-56"
            />
          </div>
          <Button type="submit" variant="secondary" size="sm">Search</Button>
        </form>

        <div className="flex gap-1">
          {([undefined, 'paid', 'pending', 'voided'] as const).map((s) => (
            <Button
              key={s ?? 'all'}
              variant={filters.status === s ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleStatusFilter(s)}
            >
              {s ?? 'All'}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto rounded-md border">
        {isLoading ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
            Loading orders…
          </div>
        ) : isError ? (
          <div className="flex h-40 items-center justify-center text-destructive text-sm">
            Failed to load orders.
          </div>
        ) : !data || data.data.length === 0 ? (
          <div className="flex h-40 items-center justify-center text-muted-foreground text-sm">
            No orders found.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order #</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.data.map((order) => (
                <TableRow
                  key={order.id}
                  className="cursor-pointer"
                  onClick={() => setSelectedOrder(order)}
                >
                  <TableCell className="font-mono font-medium">#{order.orderNumber}</TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap">
                    {formatDateTime(new Date(order.createdAt))}
                  </TableCell>
                  <TableCell>{order.customer?.name ?? <span className="text-muted-foreground">—</span>}</TableCell>
                  <TableCell className="capitalize">{order.paymentMethod}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_BADGE[order.status] ?? ''}`}>
                      {order.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(order.total)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Page {data.page} of {data.totalPages}
          </span>
          <div className="flex gap-1">
            <Button
              variant="outline"
              size="icon"
              disabled={data.page <= 1}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              disabled={data.page >= data.totalPages}
              onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <OrderDetailModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
    </div>
  );
}
