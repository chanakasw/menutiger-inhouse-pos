import { CreateProductSchema, UpdateProductSchema } from '@swiftpos/types';
import { NotFoundError } from '../../lib/errors.js';
import * as productsRepository from './products.repository.js';
import type { ProductFilters } from './products.types.js';

/** Lists all available products for the tenant, with optional filters. */
export async function listProducts(tenantId: string, filters: ProductFilters = {}) {
  return productsRepository.findAll(tenantId, filters);
}

/** Returns a single product, throwing 404 if not found. */
export async function getProduct(tenantId: string, id: string) {
  const product = await productsRepository.findById(tenantId, id);
  if (!product) throw new NotFoundError('Product not found');
  return product;
}

/** Creates a new product for the tenant. */
export async function createProduct(tenantId: string, body: unknown) {
  const data = CreateProductSchema.parse(body);
  return productsRepository.create(tenantId, {
    name: data.name,
    description: data.description,
    sku: data.sku,
    price: data.price,
    variants: data.variants as object[],
    imageUrl: data.imageUrl,
    isAvailable: data.isAvailable ?? true,
    trackInventory: data.trackInventory ?? false,
    ...(data.categoryId && { category: { connect: { id: data.categoryId } } }),
  });
}

/** Partially updates a product. */
export async function updateProduct(tenantId: string, id: string, body: unknown) {
  await getProduct(tenantId, id); // ensures it exists + belongs to tenant
  const data = UpdateProductSchema.parse(body);
  await productsRepository.update(tenantId, id, {
    ...(data.name !== undefined && { name: data.name }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.price !== undefined && { price: data.price }),
    ...(data.variants !== undefined && { variants: data.variants as object[] }),
    ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
    ...(data.trackInventory !== undefined && { trackInventory: data.trackInventory }),
    ...(data.categoryId !== undefined && { category: { connect: { id: data.categoryId } } }),
  });
  return getProduct(tenantId, id);
}

/** Removes a product (soft-deletes if referenced by orders). */
export async function deleteProduct(tenantId: string, id: string) {
  await getProduct(tenantId, id);
  await productsRepository.remove(tenantId, id);
}

/** Lists all categories for the tenant. */
export async function listCategories(tenantId: string) {
  return productsRepository.findAllCategories(tenantId);
}
