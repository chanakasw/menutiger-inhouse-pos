import type { Product, PriceVariant } from '@swiftpos/types';
import { ShoppingCart } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/store';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = (variant?: PriceVariant) => addItem(product, variant);

  const hasVariants = product.variants.length > 0;

  return (
    <Card className="flex flex-col overflow-hidden hover:shadow-md transition-shadow cursor-pointer group">
      {/* Colour block placeholder instead of real image */}
      <div
        className="h-28 bg-muted flex items-center justify-center text-muted-foreground"
        onClick={() => !hasVariants && handleAdd()}
      >
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
        ) : (
          <ShoppingCart className="h-8 w-8 opacity-30" />
        )}
      </div>

      <CardContent className="flex flex-col gap-1 p-3">
        <p className="font-medium text-sm leading-tight line-clamp-2">{product.name}</p>

        {!hasVariants ? (
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-semibold">{formatCurrency(product.price)}</span>
            <Button size="sm" variant="ghost" className="h-7 px-2" onClick={() => handleAdd()}>
              +
            </Button>
          </div>
        ) : (
          <div className="flex flex-wrap gap-1 mt-1">
            {product.variants.map((v) => (
              <Badge
                key={v.id}
                variant="outline"
                className="cursor-pointer hover:bg-primary hover:text-primary-foreground text-xs"
                onClick={() => handleAdd(v)}
              >
                {v.name} · {formatCurrency(v.price)}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
