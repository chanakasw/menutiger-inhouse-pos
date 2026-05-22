import { z } from 'zod';

export const LoyaltyTierSchema = z.enum(['bronze', 'silver', 'gold']);
export type LoyaltyTier = z.infer<typeof LoyaltyTierSchema>;

export const CustomerSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(200),
  email: z.string().email().optional(),
  phone: z.string().max(30).optional(),
  loyaltyPoints: z.number().int().nonnegative().default(0),
  loyaltyTier: LoyaltyTierSchema.default('bronze'),
  totalSpend: z.number().nonnegative().default(0),
  visitCount: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
/** A registered customer with loyalty tracking. */
export type Customer = z.infer<typeof CustomerSchema>;

export const CreateCustomerSchema = CustomerSchema.omit({
  id: true,
  tenantId: true,
  loyaltyPoints: true,
  loyaltyTier: true,
  totalSpend: true,
  visitCount: true,
  createdAt: true,
  updatedAt: true,
});
/** Payload for registering a new customer. */
export type CreateCustomer = z.infer<typeof CreateCustomerSchema>;

export const UpdateCustomerSchema = CreateCustomerSchema.partial();
/** Payload for partially updating a customer profile. */
export type UpdateCustomer = z.infer<typeof UpdateCustomerSchema>;

export const LoyaltyTransactionTypeSchema = z.enum(['earn', 'redeem', 'adjustment']);
export type LoyaltyTransactionType = z.infer<typeof LoyaltyTransactionTypeSchema>;

export const LoyaltyTransactionSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  customerId: z.string().uuid(),
  orderId: z.string().uuid().optional(),
  type: LoyaltyTransactionTypeSchema,
  points: z.number().int(),
  balanceAfter: z.number().int().nonnegative(),
  note: z.string().max(500).optional(),
  createdAt: z.coerce.date(),
});
/** Records a single loyalty point earn, redemption, or manual adjustment. */
export type LoyaltyTransaction = z.infer<typeof LoyaltyTransactionSchema>;

export const CreateLoyaltyTransactionSchema = LoyaltyTransactionSchema.omit({
  id: true,
  tenantId: true,
  balanceAfter: true,
  createdAt: true,
});
/** Payload for recording a loyalty transaction. */
export type CreateLoyaltyTransaction = z.infer<typeof CreateLoyaltyTransactionSchema>;
