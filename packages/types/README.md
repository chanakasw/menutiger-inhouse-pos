# @swiftpos/types

Single source of truth for TypeScript types and Zod validation schemas shared between `apps/api` and `apps/web`.

## Exports

| Module | Schemas & Types |
|---|---|
| `order` | `Order`, `OrderItem`, `CreateOrder`, `UpdateOrderStatus`, `PaymentMethod`, `OrderStatus`, `OrderSource` |
| `product` | `Product`, `Category`, `PriceVariant`, `CreateProduct`, `UpdateProduct`, `CreateCategory` |
| `customer` | `Customer`, `LoyaltyTransaction`, `CreateCustomer`, `UpdateCustomer`, `CreateLoyaltyTransaction`, `LoyaltyTier` |
| `tenant` | `Tenant`, `User`, `PosTheme`, `CreateTenant`, `CreateUser`, `PublicUser`, `Login`, `AuthTokens`, `UserRole` |
| `sync` | `SyncPayload`, `OfflineTransaction`, `ConflictResolution`, `SyncBatchResponse`, `SyncStatus` |

## Usage

```typescript
import { OrderSchema, type Order, type CreateOrder } from '@swiftpos/types';

// Validate API input
const result = OrderSchema.safeParse(req.body);
if (!result.success) {
  return res.status(400).json(result.error.flatten());
}
const order: Order = result.data;

// Infer types from schemas — never diverge
type CreateOrderPayload = CreateOrder;
```

## Design principles

- **Schema-first**: TypeScript types are always derived from Zod schemas via `z.infer<>` — the schema is the source of truth.
- **`z.coerce.date()`** on all date fields — handles JSON string-to-Date coercion automatically.
- **`Create*` and `Update*` variants** omit server-assigned fields (`id`, `tenantId`, `createdAt`, `updatedAt`).
- **No `any`** — `z.unknown()` is used for truly dynamic payloads (e.g. `OfflineTransaction.payload`).

## Build

```bash
pnpm build       # compile to dist/
pnpm dev         # watch mode
pnpm type-check  # tsc --noEmit
```
