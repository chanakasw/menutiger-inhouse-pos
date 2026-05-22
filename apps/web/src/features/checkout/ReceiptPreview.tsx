import { CheckCircle, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import type { LocalOrder } from '@/db';
import { formatCurrency, formatDateTime } from '@/lib/utils';

interface ReceiptPreviewProps {
  order: LocalOrder;
  onNewSale: () => void;
}

export function ReceiptPreview({ order, onNewSale }: ReceiptPreviewProps) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex flex-col items-center gap-1 text-center">
        <CheckCircle className="h-10 w-10 text-green-500" />
        <p className="font-semibold text-lg">Payment accepted</p>
        <p className="text-sm text-muted-foreground">
          Order #{order.orderNumber} · {formatDateTime(order.createdAt)}
        </p>
      </div>

      {/* Receipt body */}
      <div className="w-full rounded-md border bg-muted/40 p-4 font-mono text-sm space-y-1 print:border-none print:bg-white">
        {order.items.map((item) => (
          <div key={item.id} className="flex justify-between">
            <span>
              {item.productName}
              {item.variantName ? ` (${item.variantName})` : ''} ×{item.quantity}
            </span>
            <span>{formatCurrency(item.totalPrice)}</span>
          </div>
        ))}

        <Separator className="my-2" />

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

        <Separator className="my-2" />

        <div className="flex justify-between font-bold">
          <span>Total</span>
          <span>{formatCurrency(order.total)}</span>
        </div>
        <div className="flex justify-between text-muted-foreground capitalize">
          <span>Paid by</span>
          <span>{order.paymentMethod}</span>
        </div>

        {order._syncStatus === 'pending' && (
          <p className="mt-2 text-center text-xs text-amber-600">⏳ Sync pending</p>
        )}
      </div>

      <div className="flex w-full gap-2">
        <Button variant="outline" className="flex-1 gap-2" onClick={() => window.print()}>
          <Printer className="h-4 w-4" />
          Print
        </Button>
        <Button className="flex-1" onClick={onNewSale}>
          New sale
        </Button>
      </div>
    </div>
  );
}
