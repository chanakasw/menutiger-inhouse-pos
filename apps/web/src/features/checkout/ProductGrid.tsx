import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ProductCard } from './ProductCard';
import { useProducts } from './useProducts';

export function ProductGrid() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const { products, categories, isLoading } = useProducts(selectedCategoryId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading products…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Category filter tabs */}
      {categories.length > 0 && (
        <div className="flex gap-1 overflow-x-auto border-b px-4 py-2 shrink-0">
          <Button
            variant={selectedCategoryId === undefined ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategoryId(undefined)}
          >
            All
          </Button>
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={selectedCategoryId === cat.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setSelectedCategoryId(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </div>
      )}

      {/* Product grid */}
      <div className="flex-1 overflow-auto p-4">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">No products found.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
