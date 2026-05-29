import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';
import type { PaginatedOrders, OrderRow, OrderFilters, OrderSummary } from './orders.types';

function buildQuery(filters: OrderFilters): string {
  const params = new URLSearchParams();
  if (filters.search) params.set('search', filters.search);
  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.page) params.set('page', String(filters.page));
  if (filters.limit) params.set('limit', String(filters.limit));
  return params.toString();
}

export function useOrders(filters: OrderFilters = {}) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => api.get<PaginatedOrders>(`/api/orders?${buildQuery(filters)}`),
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['orders', id],
    queryFn: () => api.get<OrderRow>(`/api/orders/${id}`),
    enabled: !!id,
  });
}

export function useVoidOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.patch<OrderRow>(`/api/orders/${id}/void`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useOrderSummary(date?: string) {
  const query = date ? `?date=${date}` : '';
  return useQuery({
    queryKey: ['orders', 'summary', date],
    queryFn: () => api.get<OrderSummary>(`/api/orders/summary${query}`),
  });
}
