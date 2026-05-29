import { useState } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProductCard } from './ProductCard';
import { useProducts } from './useProducts';

export function ProductGrid() {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState('');
  const { products, categories, isLoading } = useProducts(selectedCategoryId, search);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center text-muted-foreground">
        Loading products…
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col overflow-hidden">
      {/* Search + category filter bar */}
      <div className="flex flex-col gap-2 border-b px-4 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {categories.length > 0 && (
          <div className="flex gap-1 overflow-x-auto">
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
      </div>

      {/* Product grid */}
      <div className="flex-1 overflow-auto p-4">
        {products.length === 0 ? (
          <p className="text-center text-muted-foreground mt-12">
            {search ? `No products matching "${search}".` : 'No products found.'}
          </p>
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
