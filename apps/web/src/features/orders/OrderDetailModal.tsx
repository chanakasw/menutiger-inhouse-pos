import { useState } from 'react';
import { Printer, Ban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useVoidOrder } from './useOrders';
import type { OrderRow } from './orders.types';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useSessionStore } from '@/store';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  voided: 'bg-red-100 text-red-800',
};

interface OrderDetailModalProps {
  order: OrderRow | null;
  onClose: () => void;
}

export function OrderDetailModal({ order, onClose }: OrderDetailModalProps) {
  const { user } = useSessionStore();
  const voidMutation = useVoidOrder();
  const [confirmVoid, setConfirmVoid] = useState(false);

  if (!order) return null;

  const handleVoid = async () => {
    await voidMutation.mutateAsync(order.id);
    setConfirmVoid(false);
    onClose();
  };

  const handlePrint = () => window.print();

  return (
    <Dialog open={!!order} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Order #{order.orderNumber}</span>
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${STATUS_COLORS[order.status] ?? ''}`}>
              {order.status}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 text-sm print:text-base">
          {/* Meta */}
          <div className="flex justify-between text-muted-foreground">
            <span>{formatDateTime(new Date(order.createdAt))}</span>
            <span className="capitalize">{order.paymentMethod}</span>
          </div>
          {order.customer && (
            <p className="text-muted-foreground">
              Customer: <span className="font-medium text-foreground">{order.customer.name}</span>
            </p>
          )}

          <Separator />

          {/* Items */}
          <div className="space-y-1">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between">
                <span>
                  {item.productName}
                  {item.variantName ? ` (${item.variantName})` : ''} ×{item.quantity}
                </span>
                <span>{formatCurrency(item.totalPrice)}</span>
              </div>
            ))}
          </div>

          <Separator />

          {/* Totals */}
          <div className="space-y-1">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax</span>
              <span>{formatCurrency(order.tax)}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span>{formatCurrency(order.total)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 print:hidden">
            <Button variant="outline" className="flex-1 gap-2" onClick={handlePrint}>
              <Printer className="h-4 w-4" />
              Print
            </Button>

            {user?.role === 'admin' && order.status !== 'voided' && (
              confirmVoid ? (
                <div className="flex flex-1 gap-2">
                  <Button variant="destructive" className="flex-1" onClick={handleVoid} disabled={voidMutation.isPending}>
                    {voidMutation.isPending ? 'Voiding…' : 'Confirm void'}
                  </Button>
                  <Button variant="ghost" onClick={() => setConfirmVoid(false)}>Cancel</Button>
                </div>
              ) : (
                <Button variant="outline" className="flex-1 gap-2 text-destructive hover:text-destructive" onClick={() => setConfirmVoid(true)}>
                  <Ban className="h-4 w-4" />
                  Void
                </Button>
              )
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
