import type { OrderStatus, PaymentMethod } from '@swiftpos/types';

export interface OrderCustomer {
  id: string;
  name: string;
  email: string | null;
  phone?: string | null;
}

export interface OrderItemRow {
  id: string;
  productId: string;
  productName: string;
  variantId?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string | null;
}

export interface OrderRow {
  id: string;
  orderNumber: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  createdAt: string;
  syncedAt?: string | null;
  customer?: OrderCustomer | null;
  items: OrderItemRow[];
}

export interface PaginatedOrders {
  data: OrderRow[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderFilters {
  search?: string;
  status?: OrderStatus;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface OrderSummary {
  revenue: number;
  orderCount: number;
  avgOrderValue: number;
  paymentBreakdown: { cash: number; card: number; qr: number };
  topProducts: { productName: string; quantity: number; revenue: number }[];
}
