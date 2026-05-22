# @swiftpos/api

Express + TypeScript REST API for SwiftPOS.

## Stack

- **Express 4** + TypeScript
- **Prisma 5** ORM → PostgreSQL
- **JWT** access (15 min) + refresh (7 day) tokens
- **Zod** validation (schemas from `@swiftpos/types`)
- **Vitest** + Supertest for testing

## Quick start

```bash
cp .env.example .env          # fill in values
pnpm db:migrate               # run Prisma migrations
pnpm dev                      # tsx watch — hot reload
```

## Module pattern

Every feature follows `routes → controller → service → repository`:

```
modules/orders/
├── orders.routes.ts      # Express router
├── orders.controller.ts  # parse req/res only
├── orders.service.ts     # business logic
├── orders.repository.ts  # Prisma queries only
├── orders.types.ts       # local type extensions
└── index.ts
```

## Auth flow

```
POST /api/auth/login      { email, password, tenantSlug } → { accessToken, refreshToken }
POST /api/auth/refresh    { refreshToken }                 → { accessToken, refreshToken }
POST /api/auth/logout     Bearer <accessToken>             → 204
```

All protected routes require `Authorization: Bearer <accessToken>`.
The `tenantId` is extracted from the JWT — never trusted from the client body.

## Database

```bash
pnpm db:migrate   # dev migration
pnpm db:studio    # Prisma Studio UI
pnpm db:seed      # seed dev data
```
