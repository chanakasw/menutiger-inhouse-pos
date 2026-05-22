# SwiftPOS

An offline-first, multi-tenant Point of Sale system built with React PWA + Node.js/Express. Comparable to Loyverse and Square — works fully without internet and syncs when connectivity is restored.

---

## Prerequisites

Install these before anything else.

| Tool | Version | Install |
|---|---|---|
| **Node.js** | 20 or higher | [nodejs.org](https://nodejs.org) or via `fnm`/`nvm` |
| **pnpm** | 9 or higher | `npm install -g pnpm` |
| **Docker** _or_ **Podman** | any recent | [docker.com](https://www.docker.com/get-started) · [podman.io](https://podman.io) |
| **Git** | any | [git-scm.com](https://git-scm.com) |

> **Check you have the right Node version:**
> ```bash
> node --version   # must be v20.x or higher
> pnpm --version   # must be 9.x or higher
> ```

---

## Quick start

```bash
# 1. Clone
git clone <your-repo-url>
cd swiftpos   # or whatever the folder is called

# 2. Install all dependencies (one command covers all workspaces)
pnpm install

# 3. Start Postgres and Redis
docker compose -f infra/docker/compose.yml up -d
# — OR — if you don't have compose yet, run them manually:
docker run -d --name swiftpos-pg \
  -e POSTGRES_USER=swiftpos -e POSTGRES_PASSWORD=swiftpos -e POSTGRES_DB=swiftpos \
  -p 5432:5432 postgres:16-alpine

docker run -d --name swiftpos-redis \
  -p 6379:6379 redis:7-alpine

# 4. Configure environment variables
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
# Edit apps/api/.env and fill in secrets (see Environment variables below)

# 5. Set up the database
pnpm --filter @swiftpos/api db:generate   # generate Prisma client
pnpm --filter @swiftpos/api db:migrate    # create all tables

# 6. Start everything
pnpm dev
```

Open **http://localhost:5173** in your browser.

> **Note (Podman users):** replace `docker` with `podman` in the commands above — the flags are identical.

---

## Environment variables

### `apps/api/.env`

Copy from `apps/api/.env.example` and fill in the values marked ⚠️.

```bash
DATABASE_URL=postgresql://swiftpos:swiftpos@localhost:5432/swiftpos
REDIS_URL=redis://localhost:6379

JWT_SECRET=⚠️ change-me-at-least-32-random-chars
JWT_REFRESH_SECRET=⚠️ change-me-different-from-jwt-secret

JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Only needed if integrating with the external RMS
RMS_API_URL=http://your-rms-backend/api
RMS_API_KEY=your-rms-key
```

> **Generate strong secrets quickly:**
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

### `apps/web/.env`

```bash
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=SwiftPOS
```

---

## Creating your first tenant and user

The database starts empty. Use **Prisma Studio** to insert seed data:

```bash
pnpm --filter @swiftpos/api db:studio
# Opens http://localhost:5555
```

1. Create a **Tenant** row — set `slug` (e.g. `my-store`), `name`, and a `theme` JSON:
   ```json
   {
     "primaryColor": "#0f172a",
     "currencyCode": "USD",
     "taxRate": 0.1,
     "tenantName": "My Store"
   }
   ```
2. Create a **User** row — set `tenantId` (paste the Tenant's id), `email`, `role: admin`, and `password`.
   The password must be a **bcrypt hash** — generate one:
   ```bash
   node -e "const b=require('bcryptjs');b.hash('yourpassword',10).then(console.log)"
   ```
3. Log in at **http://localhost:5173/login** using the `tenantSlug`, email, and plain-text password.

---

## Available scripts

Run from the **monorepo root** unless noted.

| Command | What it does |
|---|---|
| `pnpm dev` | Start API + Web in parallel (hot-reload) |
| `pnpm build` | Production build of all packages and apps |
| `pnpm lint` | ESLint across all workspaces |
| `pnpm type-check` | `tsc --noEmit` across all workspaces |
| `pnpm test` | Run all Vitest suites |
| `pnpm format` | Prettier — format all files |
| `pnpm clean` | Delete all `dist/` and `.turbo/` output |

**API-specific (run from root with `--filter`):**

| Command | What it does |
|---|---|
| `pnpm --filter @swiftpos/api db:generate` | Regenerate Prisma Client after schema changes |
| `pnpm --filter @swiftpos/api db:migrate` | Create and apply a new migration |
| `pnpm --filter @swiftpos/api db:studio` | Open Prisma Studio at localhost:5555 |
| `pnpm --filter @swiftpos/api db:seed` | Run the seed script (once written) |

---

## Project structure

```
swiftpos/
├── apps/
│   ├── api/          # Express + TypeScript backend  → localhost:3001
│   └── web/          # React PWA frontend            → localhost:5173
├── packages/
│   ├── types/        # Shared Zod schemas + TypeScript types
│   ├── ui/           # White-label component library (Phase 4)
│   └── config/       # Shared ESLint, TS, Tailwind, Prettier configs
├── infra/
│   └── docker/       # Postgres + Redis compose file
├── turbo.json         # Turborepo pipeline
└── pnpm-workspace.yaml
```

---

## Tech stack

### Frontend (`apps/web`)
- React 18 + TypeScript + Vite
- `vite-plugin-pwa` + Workbox — offline / service worker
- **Dexie 4** (IndexedDB) — offline data store + sync queue
- **Zustand** — cart, session, connectivity state
- **TanStack Query** — background API fetching and cache
- **React Router v6** — client-side routing
- **shadcn/ui** + Tailwind CSS — UI components

### Backend (`apps/api`)
- Node.js 20 + Express 4 + TypeScript
- **Prisma 5** — ORM → PostgreSQL
- **JWT** — access tokens (15 min) + refresh tokens (7 days)
- **Zod** — request validation (schemas shared from `packages/types`)
- **Vitest** + Supertest — testing

### Monorepo
- **pnpm workspaces** — package linking
- **Turborepo** — build/test/lint pipeline with caching

---

## How offline sync works

```
User action (checkout)
      ↓
Dexie.js (IndexedDB)  ← always succeeds, even offline
      ↓ when navigator.onLine = true
sync.ts flushes sync_queue (every 30 s + on reconnect)
      ↓
POST /api/sync/batch
      ↓
Conflict resolution (last-write-wins for prices, server-wins for inventory)
      ↓
Canonical record in PostgreSQL
```

---

## Implemented features (Phase 1)

- [x] Monorepo scaffold — pnpm + Turborepo + shared configs
- [x] Shared types — Zod schemas for Order, Product, Customer, Tenant, Sync
- [x] Auth — JWT login/refresh/logout, tenant middleware, role guards (admin/cashier)
- [x] Products API — CRUD with category filtering, admin-only writes
- [x] Checkout screen — product grid (Dexie + API fallback), cart, payment modal (cash/card/QR), receipt with print
- [x] Offline sync — Dexie schema, sync queue, background flush to `POST /api/sync/batch`

## Roadmap

- [ ] **Phase 2** — Dashboard, inventory management, orders history
- [ ] **Phase 3** — Loyalty (points/tiers), reports, settings UI
- [ ] **Phase 4** — RMS connector, multi-device conflict resolution, white-label packaging

---

## Common problems

**`pnpm install` fails — `workspace:*` not found**
You must use `pnpm`, not `npm` or `yarn`. Run `npm install -g pnpm` first.

**`prisma migrate dev` times out with advisory lock error**
Another migrate process is still running. Kill it:
```bash
pkill -9 -f prisma
```
Then retry.

**API starts but immediately crashes — "JWT_SECRET is not set"**
You haven't created `apps/api/.env`. Run `cp apps/api/.env.example apps/api/.env` and fill in the values.

**Web shows blank page / login loop**
Check the browser console. Most likely the API is not running on port 3001, or `VITE_API_URL` in `apps/web/.env` points to the wrong address.

**Podman containers stop after terminal closes**
Run them with `--restart=always` or use `podman generate systemd` to create a user service. For dev, just re-run the `podman run` commands each session.
