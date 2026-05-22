# @swiftpos/web

React 18 PWA frontend for SwiftPOS — offline-first with Dexie.js + Workbox.

## Stack

- **Vite 5** + **React 18** + **TypeScript**
- **vite-plugin-pwa** (Workbox) — service worker, offline caching
- **Dexie 4** (IndexedDB) — offline data + sync queue
- **Zustand** — cart, session, connectivity state
- **TanStack Query** — server state & cache invalidation
- **React Router v6** — client-side routing
- **shadcn/ui** + **Tailwind CSS** — UI components
- **React Hook Form** + **Zod** — validated forms

## Quick start

```bash
cp .env.example .env
pnpm dev          # Vite dev server on http://localhost:5173
```

## Routes

| Path | Feature |
|---|---|
| `/login` | Authentication |
| `/checkout` | Main POS screen — product grid + cart |
| `/dashboard` | Daily revenue, order count, top items |
| `/loyalty` | Customer profiles, points, tiers |
| `/inventory` | Stock levels, low-stock alerts |
| `/settings` | Printer, tax rate, tenant config |

## Offline architecture

1. All writes go to **Dexie (IndexedDB)** first — always succeeds.
2. A `sync_queue` table holds pending `OfflineTransaction` records.
3. `src/db/sync.ts` polls `navigator.onLine` and flushes via `POST /api/sync/batch`.
4. Workbox caches the product catalog with `StaleWhileRevalidate`.

## Adding shadcn/ui components

```bash
pnpm dlx shadcn@latest add button card input
```
