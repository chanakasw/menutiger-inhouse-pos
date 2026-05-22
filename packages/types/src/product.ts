import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1).max(100),
  sortOrder: z.number().int().nonnegative().default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
/** A product category grouping (e.g. "Beverages", "Mains"). */
export type Category = z.infer<typeof CategorySchema>;

export const CreateCategorySchema = CategorySchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});
/** Payload for creating a new category. */
export type CreateCategory = z.infer<typeof CreateCategorySchema>;

export const PriceVariantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  price: z.number().nonnegative(),
});
/** A named price variant for a product (e.g. "Small", "Large"). */
export type PriceVariant = z.infer<typeof PriceVariantSchema>;

export const ProductSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoryId: z.string().uuid().optional(),
  name: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  sku: z.string().max(100).optional(),
  price: z.number().nonnegative(),
  variants: z.array(PriceVariantSchema).default([]),
  imageUrl: z.string().url().optional(),
  isAvailable: z.boolean().default(true),
  trackInventory: z.boolean().default(false),
  stockQuantity: z.number().int().nonnegative().optional(),
  lowStockThreshold: z.number().int().nonnegative().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
});
/** A sellable item in the POS catalog. */
export type Product = z.infer<typeof ProductSchema>;

export const CreateProductSchema = ProductSchema.omit({
  id: true,
  tenantId: true,
  createdAt: true,
  updatedAt: true,
});
/** Payload for creating a new product. */
export type CreateProduct = z.infer<typeof CreateProductSchema>;

export const UpdateProductSchema = CreateProductSchema.partial();
/** Payload for partially updating a product. */
export type UpdateProduct = z.infer<typeof UpdateProductSchema>;
