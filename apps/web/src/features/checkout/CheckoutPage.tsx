import { useEffect } from 'react';
import { ProductGrid } from './ProductGrid';
import { Cart } from './Cart';
import { startSyncEngine } from '@/db';

export function CheckoutPage() {
  // Start the background sync engine for the lifetime of this page
  useEffect(() => {
    const stop = startSyncEngine(30_000);
    return stop;
  }, []);

  return (
    <div className="flex h-full overflow-hidden">
      <ProductGrid />
      <Cart />
    </div>
  );
}
