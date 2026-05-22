import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CartItemRow } from './CartItemRow';
import { PaymentModal } from './PaymentModal';
import { useCart } from '@/hooks';
import { formatCurrency } from '@/lib/utils';

const TAX_RATE = 0.1; // TODO Phase 3: from tenant settings

export function Cart() {
  const { items, subtotal, discount, itemCount, clearCart } = useCart();
  const [paymentOpen, setPaymentOpen] = useState(false);

  const tax = parseFloat((subtotal * TAX_RATE).toFixed(2));
  const total = parseFloat((subtotal + tax - discount).toFixed(2));

  return (
    <aside className="flex w-80 flex-col border-l bg-card">
      {/* Header */}
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="flex items-center gap-2 font-semibold">
          <ShoppingCart className="h-4 w-4" />
          Cart
          {itemCount > 0 && (
            <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
              {itemCount}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <Button variant="ghost" size="sm" className="text-xs text-muted-foreground" onClick={clearCart}>
            Clear
          </Button>
        )}
      </div>

      {/* Item list */}
      <div className="flex-1 overflow-auto px-4 divide-y">
        {items.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-muted-foreground">Add products to begin a sale</p>
          </div>
        ) : (
          items.map((item) => (
            <CartItemRow key={`${item.productId}-${item.variantId ?? ''}`} item={item} />
          ))
        )}
      </div>

      {/* Totals + pay button */}
      {items.length > 0 && (
        <div className="border-t p-4 space-y-3">
          <div className="space-y-1 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-muted-foreground">
              <span>Tax ({(TAX_RATE * 100).toFixed(0)}%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Discount</span>
                <span>-{formatCurrency(discount)}</span>
              </div>
            )}
          </div>
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
          <Button className="w-full" size="lg" onClick={() => setPaymentOpen(true)}>
            Pay {formatCurrency(total)}
          </Button>
        </div>
      )}

      <PaymentModal
        isOpen={paymentOpen}
        onClose={() => setPaymentOpen(false)}
        totals={{ subtotal, tax, discount, total }}
      />
    </aside>
  );
}
