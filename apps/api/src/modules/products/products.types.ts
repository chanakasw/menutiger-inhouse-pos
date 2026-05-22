import { z } from 'zod';

export const ProductFiltersSchema = z.object({
  categoryId: z.string().uuid().optional(),
  isAvailable: z
    .string()
    .optional()
    .transform((v) => (v === undefined ? undefined : v === 'true')),
  search: z.string().max(100).optional(),
});
export type ProductFilters = z.infer<typeof ProductFiltersSchema>;
