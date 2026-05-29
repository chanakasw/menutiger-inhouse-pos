import { useQuery } from '@tanstack/react-query';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Product, Category } from '@swiftpos/types';
import { db } from '@/db';
import { api } from '@/lib/api-client';
import { useTenant } from '@/hooks';

/** Reads products and categories from Dexie (instant, offline-capable).
 *  Fetches from API in the background when online, then upserts into Dexie. */
export function useProducts(selectedCategoryId?: string, search?: string) {
  const { tenantId } = useTenant();
  const searchLower = search?.trim().toLowerCase();

  // Always read from Dexie — updates live as Dexie changes
  const products = useLiveQuery<Product[]>(
    () => {
      if (!tenantId) return Promise.resolve([]);
      const query = db.products.where('tenantId').equals(tenantId);
      return query
        .filter((p) => {
          if (!p.isAvailable) return false;
          if (selectedCategoryId && p.categoryId !== selectedCategoryId) return false;
          if (searchLower && !p.name.toLowerCase().includes(searchLower)) return false;
          return true;
        })
        .toArray();
    },
    [tenantId, selectedCategoryId, searchLower]
  );

  const categories = useLiveQuery<Category[]>(
    () =>
      tenantId
        ? db.categories.where('tenantId').equals(tenantId).sortBy('sortOrder')
        : Promise.resolve([]),
    [tenantId]
  );

  // Background API fetch — populates Dexie so the live query above updates automatically
  const { isLoading: isFetchingFromApi } = useQuery({
    queryKey: ['products', tenantId],
    queryFn: async () => {
      const [apiProducts, apiCategories] = await Promise.all([
        api.get<Product[]>('/api/products'),
        api.get<Category[]>('/api/products/categories'),
      ]);
      await db.products.bulkPut(apiProducts);
      await db.categories.bulkPut(apiCategories);
      return { products: apiProducts, categories: apiCategories };
    },
    enabled: !!tenantId,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  // Show loading only when Dexie is also empty — otherwise show cached data immediately
  const isLoading = products === undefined && isFetchingFromApi;

  return {
    products: products ?? [],
    categories: categories ?? [],
    isLoading,
  };
}
