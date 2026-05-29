import { z } from 'zod';

export const PaymentMethodSchema = z.enum(['cash', 'card', 'qr']);
export type PaymentMethod = z.infer<typeof PaymentMethodSchema>;

export const OrderStatusSchema = z.enum(['pending', 'paid', 'voided']);
export type OrderStatus = z.infer<typeof OrderStatusSchema>;

export const OrderSourceSchema = z.enum(['pos', 'rms']);
export type OrderSource = z.infer<typeof OrderSourceSchema>;

export const OrderItemSchema = z.object({
  id: z.string().uuid(),
  productId: z.string().min(1),
  productName: z.string().min(1),
  variantId: z.string().min(1).optional(),
  variantName: z.string().optional(),
  quantity: z.number().int().positive(),
  unitPrice: z.coerce.number().nonnegative(),
  totalPrice: z.coerce.number().nonnegative(),
  note: z.string().optional(),
});
/** A single line item within an order. */
export type OrderItem = z.infer<typeof OrderItemSchema>;

export const OrderSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  orderNumber: z.number().int().positive(),
  items: z.array(OrderItemSchema).min(1),
  subtotal: z.coerce.number().nonnegative(),
  tax: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative(),
  total: z.coerce.number().nonnegative(),
  paymentMethod: PaymentMethodSchema,
  customerId: z.string().uuid().optional(),
  status: OrderStatusSchema,
  source: OrderSourceSchema,
  createdAt: z.coerce.date(),
  syncedAt: z.coerce.date().optional(),
});
/** A completed or in-progress sales order. `syncedAt` is null while still in the offline queue. */
export type Order = z.infer<typeof OrderSchema>;

export const CreateOrderSchema = OrderSchema.omit({
  id: true,
  orderNumber: true,
  status: true,
  syncedAt: true,
  createdAt: true,
});
/** Payload for creating a new order. */
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export const UpdateOrderStatusSchema = z.object({
  status: OrderStatusSchema,
});
/** Payload for updating an order's status (e.g. void). */
export type UpdateOrderStatus = z.infer<typeof UpdateOrderStatusSchema>;
