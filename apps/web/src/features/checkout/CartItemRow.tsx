import { Trash2, Minus, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCartStore } from '@/store';
import type { CartItem } from '@/store';
import { formatCurrency } from '@/lib/utils';

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCartStore();

  return (
    <div className="flex items-start gap-2 py-2">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-tight truncate">{item.productName}</p>
        {item.variantName && (
          <p className="text-xs text-muted-foreground">{item.variantName}</p>
        )}
        <p className="text-xs text-muted-foreground">{formatCurrency(item.unitPrice)} each</p>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
        >
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-medium">{item.quantity}</span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6"
          onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
        >
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="text-sm font-semibold w-16 text-right">
          {formatCurrency(item.unitPrice * item.quantity)}
        </span>
        <Button
          size="icon"
          variant="ghost"
          className="h-6 w-6 text-destructive hover:text-destructive"
          onClick={() => removeItem(item.productId, item.variantId)}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
