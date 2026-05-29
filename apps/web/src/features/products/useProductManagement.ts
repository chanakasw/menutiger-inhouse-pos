import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import { db } from '@/db';
import type { Product, Category, CreateProduct, UpdateProduct } from '@swiftpos/types';

// ── Query keys ───────────────────────────────────────────────────────────────

const PRODUCTS_KEY = ['products-mgmt'];
const CATEGORIES_KEY = ['categories-mgmt'];

// ── Products ─────────────────────────────────────────────────────────────────

export function useAllProducts() {
  return useQuery({
    queryKey: PRODUCTS_KEY,
    queryFn: async () => {
      const products = await api.get<Product[]>('/api/products');
      await db.products.bulkPut(products);
      return products;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateProduct) => api.post<Product>('/api/products', data),
    onSuccess: async (product) => {
      await db.products.put(product);
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProduct }) =>
      api.patch<Product>(`/api/products/${id}`, data),
    onSuccess: async (product) => {
      await db.products.put(product);
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/products/${id}`),
    onSuccess: async (_result, id) => {
      await db.products.delete(id);
      void qc.invalidateQueries({ queryKey: PRODUCTS_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

// ── Categories ────────────────────────────────────────────────────────────────

export function useAllCategories() {
  return useQuery({
    queryKey: CATEGORIES_KEY,
    queryFn: async () => {
      const categories = await api.get<Category[]>('/api/products/categories');
      await db.categories.bulkPut(categories);
      return categories;
    },
  });
}

export function useCreateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; sortOrder?: number }) =>
      api.post<Category>('/api/products/categories', data),
    onSuccess: async (category) => {
      await db.categories.put(category);
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useUpdateCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; sortOrder?: number } }) =>
      api.patch<Category>(`/api/products/categories/${id}`, data),
    onSuccess: async (category) => {
      if (category) await db.categories.put(category);
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}

export function useDeleteCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/products/categories/${id}`),
    onSuccess: async (_result, id) => {
      await db.categories.delete(id);
      void qc.invalidateQueries({ queryKey: CATEGORIES_KEY });
      void qc.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
