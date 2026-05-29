import { z } from 'zod';

export const OrderFiltersSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['pending', 'paid', 'voided']).optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type OrderFilters = z.infer<typeof OrderFiltersSchema>;

export interface OrderSummary {
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
  paymentBreakdown: { cash: number; card: number; qr: number };
  topProducts: { productName: string; quantity: number; revenue: number }[];
}

export interface PaginatedOrders {
  data: unknown[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
