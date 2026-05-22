import Dexie, { type EntityTable } from 'dexie';
import type {
  Order,
  OrderItem,
  Product,
  Category,
  Customer,
  OfflineTransaction,
} from '@swiftpos/types';

/** Order extended with a local sync-status flag. */
export interface LocalOrder extends Order {
  _syncStatus: 'pending' | 'synced' | 'failed';
}

/** OfflineTransaction extended with retry tracking. */
export interface QueuedTransaction extends OfflineTransaction {
  _retryCount: number;
  _lastError?: string;
}

/** Local inventory snapshot — kept in sync from the API. */
export interface LocalInventoryItem {
  id: string;
  tenantId: string;
  productId: string;
  stockQuantity: number;
  lowStockThreshold: number;
  updatedAt: Date;
}

export class SwiftPosDb extends Dexie {
  orders!: EntityTable<LocalOrder, 'id'>;
  orderItems!: EntityTable<OrderItem, 'id'>;
  products!: EntityTable<Product, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  customers!: EntityTable<Customer, 'id'>;
  inventoryItems!: EntityTable<LocalInventoryItem, 'id'>;
  syncQueue!: EntityTable<QueuedTransaction, 'localId'>;

  constructor() {
    super('swiftpos');

    this.version(1).stores({
      // Indexed fields only — Dexie stores the full object regardless
      orders: 'id, tenantId, status, createdAt, customerId, syncedAt, _syncStatus',
      orderItems: 'id, orderId, productId',
      products: 'id, tenantId, categoryId, isAvailable, name',
      categories: 'id, tenantId, sortOrder',
      customers: 'id, tenantId, email, phone, loyaltyTier',
      inventoryItems: 'id, tenantId, productId, stockQuantity',
      syncQueue: 'localId, type, createdAt, _retryCount',
    });
  }
}

export const db = new SwiftPosDb();
