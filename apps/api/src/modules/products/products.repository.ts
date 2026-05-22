import type { Prisma } from '@prisma/client';
import { prisma } from '../../db/index.js';
import type { ProductFilters } from './products.types.js';

/** Returns all products for a tenant, with optional filters. */
export async function findAll(tenantId: string, filters: ProductFilters = {}) {
  const where: Prisma.ProductWhereInput = {
    tenantId,
    ...(filters.categoryId !== undefined && { categoryId: filters.categoryId }),
    ...(filters.isAvailable !== undefined && { isAvailable: filters.isAvailable }),
    ...(filters.search && { name: { contains: filters.search, mode: 'insensitive' } }),
  };
  return prisma.product.findMany({ where, orderBy: { name: 'asc' } });
}

/** Returns a single product scoped to a tenant, or null. */
export async function findById(tenantId: string, id: string) {
  return prisma.product.findFirst({ where: { id, tenantId } });
}

/** Creates a new product. */
export async function create(tenantId: string, data: Prisma.ProductCreateWithoutTenantInput) {
  return prisma.product.create({ data: { ...data, tenant: { connect: { id: tenantId } } } });
}

/** Partially updates a product scoped to a tenant. */
export async function update(tenantId: string, id: string, data: Prisma.ProductUpdateInput) {
  return prisma.product.updateMany({ where: { id, tenantId }, data });
}

/** Soft-deletes by making unavailable, or hard-deletes if no order items reference it. */
export async function remove(tenantId: string, id: string) {
  const hasOrders = await prisma.orderItem.count({ where: { productId: id } });
  if (hasOrders > 0) {
    await prisma.product.updateMany({ where: { id, tenantId }, data: { isAvailable: false } });
  } else {
    await prisma.product.deleteMany({ where: { id, tenantId } });
  }
}

/** Returns all categories for a tenant, ordered by sortOrder. */
export async function findAllCategories(tenantId: string) {
  return prisma.category.findMany({ where: { tenantId }, orderBy: { sortOrder: 'asc' } });
}
