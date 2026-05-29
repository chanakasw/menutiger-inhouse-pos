import type { Request, Response, NextFunction } from 'express';
import { ProductFiltersSchema } from './products.types.js';
import * as productsService from './products.service.js';

/** GET /api/products */
export async function listProducts(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const filters = ProductFiltersSchema.parse(req.query);
    const products = await productsService.listProducts(req.tenantId, filters);
    res.json(products);
  } catch (err) { next(err); }
}

/** GET /api/products/categories */
export async function listCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const categories = await productsService.listCategories(req.tenantId);
    res.json(categories);
  } catch (err) { next(err); }
}

/** POST /api/products/categories */
export async function createCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await productsService.createCategory(req.tenantId, req.body);
    res.status(201).json(category);
  } catch (err) { next(err); }
}

/** PATCH /api/products/categories/:id */
export async function updateCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const category = await productsService.updateCategory(req.tenantId, req.params['id'] as string, req.body);
    res.json(category);
  } catch (err) { next(err); }
}

/** DELETE /api/products/categories/:id */
export async function deleteCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productsService.deleteCategory(req.tenantId, req.params['id'] as string);
    res.status(204).send();
  } catch (err) { next(err); }
}

/** GET /api/products/:id */
export async function getProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.getProduct(req.tenantId, req.params['id'] as string);
    res.json(product);
  } catch (err) { next(err); }
}

/** POST /api/products */
export async function createProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.createProduct(req.tenantId, req.body);
    res.status(201).json(product);
  } catch (err) { next(err); }
}

/** PATCH /api/products/:id */
export async function updateProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const product = await productsService.updateProduct(req.tenantId, req.params['id'] as string, req.body);
    res.json(product);
  } catch (err) { next(err); }
}

/** DELETE /api/products/:id */
export async function deleteProduct(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await productsService.deleteProduct(req.tenantId, req.params['id'] as string);
    res.status(204).send();
  } catch (err) { next(err); }
}
