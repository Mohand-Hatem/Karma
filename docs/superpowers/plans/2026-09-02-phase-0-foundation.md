# Phase 0 — Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Stand up a deployed, empty-but-real Karma skeleton — monorepo, CI, database with tenant isolation proven by test, auth, and a working login round trip — so every later phase adds features to a foundation that already works in production.

**Architecture:** npm workspaces monorepo (`apps/api`, `apps/web`, `packages/shared`). Express 5 + Prisma + Supabase Postgres on the API, with a Prisma client extension enforcing tenant isolation from an `AsyncLocalStorage` request context. Better Auth (core + organization plugin) supplies identity and tenancy tables. Next.js App Router on the web side with `next-intl` for bilingual RTL routing from day one.

**Tech Stack:** Node.js 22 LTS · TypeScript (strict) · Express 5 · Prisma · Supabase PostgreSQL · Better Auth · Next.js (App Router) · Tailwind CSS v4 · next-intl · Zustand · TanStack Query · Axios · Zod · Vitest · Supertest · GitHub Actions

**Spec:** [docs/PROJECT_BLUEPRINT.md](../../PROJECT_BLUEPRINT.md) §6 (architecture), §28 Phase 0 · [docs/DATABASE_SCHEMA.md](../../DATABASE_SCHEMA.md) §2–4 · [docs/TECH_STACK.md](../../TECH_STACK.md) · [docs/ENVIRONMENT_REFERENCE.md](../../ENVIRONMENT_REFERENCE.md)

## Global Constraints

- Package manager: **npm workspaces only** — no pnpm, no yarn.
- Runtime: **Node.js 22 LTS**.
- TypeScript **strict mode** in every package, no exceptions.
- Backend: Express **5**, Prisma, Supabase PostgreSQL. Two connection strings required:
  `DATABASE_URL` (pooled, port `6543`) for the app, `DIRECT_URL` (direct, port `5432`) for migrations.
- Auth: **Better Auth** core + organization plugin. Custom roles `ADMIN` | `TEACHER` | `STUDENT` | `PARENT` — never the plugin's owner/admin/member defaults.
- Tenancy: **`organizationId` on every domain table.** A Prisma client extension injects it from `AsyncLocalStorage`. `organizationId` is **never** accepted from a client request. Cross-tenant access resolves as **404**, not 403.
- Frontend: Next.js App Router, Tailwind CSS **v4**, `next-intl` (`en` + `ar`, RTL), **Zustand for UI-shell state only** (sidebar, locale/direction, theme, drawers, form drafts — nothing fetchable or linkable), TanStack Query for all server state, Axios with `withCredentials: true`.
- Shared contracts: `packages/shared` holds Zod schemas as the single source of truth; the API validates with them, the web app infers types from them.
- CSS: **logical properties only** (`margin-inline-start`, never `margin-left`). RTL-first, not RTL-patched.
- CI: GitHub Actions — `npm ci` → ESLint → `tsc --noEmit` → tests → production build — **green from the first commit**.
- Explicitly **not allowed** in this phase or later without a documented reason: Socket.IO, SSE, Redis/BullMQ, S3/R2/presigned uploads, Supabase Auth, Supabase Storage, GraphQL, tRPC, Redux, a second vector database.

---

## File Structure

```text
karma/
├── package.json                        # workspaces root
├── tsconfig.base.json
├── .gitignore
├── .env.example
├── .github/workflows/ci.yml
├── apps/
│   ├── api/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── config/env.ts
│   │       ├── tenant/context.ts
│   │       ├── tenant/prisma-extension.ts
│   │       ├── tenant/prisma-extension.test.ts
│   │       ├── auth/auth.ts
│   │       ├── auth/roles.ts
│   │       ├── modules/organizations/limits.ts
│   │       ├── modules/organizations/limits.test.ts
│   │       ├── middleware/error-handler.ts
│   │       ├── middleware/request-logger.ts
│   │       ├── app.ts
│   │       ├── app.test.ts
│   │       ├── server.ts
│   │       └── seed.ts
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── next.config.ts
│       ├── i18n/request.ts
│       ├── i18n/messages/en.json
│       ├── i18n/messages/ar.json
│       ├── src/
│       │   ├── app/[locale]/layout.tsx
│       │   ├── app/[locale]/page.tsx
│       │   ├── lib/api-client.ts
│       │   ├── lib/query-provider.tsx
│       │   ├── lib/auth-client.ts
│       │   ├── stores/shell-store.ts
│       │   ├── stores/shell-store.test.ts
│       │   └── styles/globals.css
│       └── middleware.ts
└── packages/
    └── shared/
        ├── package.json
        ├── tsconfig.json
        └── src/
            ├── index.ts
            └── schemas/health.ts
```

---

### Task 1: Monorepo scaffold

**Files:**
- Create: `package.json`, `tsconfig.base.json`, `.gitignore`, `.env.example`
- Create: `apps/api/package.json`, `apps/api/tsconfig.json`
- Create: `apps/web/package.json`, `apps/web/tsconfig.json` (placeholder, replaced by `next` CLI in Task 12)
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`

**Interfaces:**
- Produces: three npm workspaces (`apps/api`, `apps/web`, `packages/shared`) resolvable by `npm install` from the root.

- [ ] **Step 1: Create the root workspace manifest**

`package.json`:
```json
{
  "name": "karma",
  "private": true,
  "workspaces": ["apps/*", "packages/*"],
  "scripts": {
    "lint": "npm run lint --workspaces --if-present",
    "typecheck": "npm run typecheck --workspaces --if-present",
    "test": "npm run test --workspaces --if-present",
    "build": "npm run build --workspaces --if-present"
  },
  "devDependencies": {
    "typescript": "^5.6.0"
  }
}
```

- [ ] **Step 2: Create the base TypeScript config**

`tsconfig.base.json`:
```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true
  }
}
```

- [ ] **Step 3: Create `.gitignore` before anything else touches disk**

```gitignore
node_modules/
.env
.env.local
.env.*.local
dist/
.next/
coverage/
*.log
.DS_Store
```

- [ ] **Step 4: Create `.env.example` with every key from ENVIRONMENT_REFERENCE.md, placeholders only**

```env
NODE_ENV=development
PORT=4000
API_URL=http://localhost:4000
WEB_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1

DATABASE_URL=
DIRECT_URL=

BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:4000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:4000
AUTH_TRUSTED_ORIGINS=http://localhost:3000

ENABLE_DEMO_LOGIN=true
```

- [ ] **Step 5: Create placeholder workspace manifests**

`apps/api/package.json`:
```json
{
  "name": "@karma/api",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "lint": "eslint .",
    "typecheck": "tsc --noEmit",
    "test": "vitest run",
    "build": "tsup src/server.ts --format esm"
  }
}
```

`apps/api/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

`packages/shared/package.json`:
```json
{
  "name": "@karma/shared",
  "private": true,
  "type": "module",
  "main": "./src/index.ts",
  "scripts": {
    "typecheck": "tsc --noEmit",
    "build": "tsup src/index.ts --format esm,cjs --dts"
  }
}
```

`packages/shared/tsconfig.json`:
```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist", "rootDir": "src" },
  "include": ["src"]
}
```

- [ ] **Step 6: Install root dependencies and verify the workspace resolves**

Run: `npm install`
Expected: no errors; `node_modules/@karma` symlinks appear for `shared` (api/web not yet installable — added next tasks).

- [ ] **Step 7: Commit**

```bash
git add package.json tsconfig.base.json .gitignore .env.example apps/api/package.json apps/api/tsconfig.json packages/shared/package.json packages/shared/tsconfig.json
git commit -m "chore: scaffold npm workspaces monorepo"
```

---

### Task 2: ESLint + Prettier

**Files:**
- Create: `eslint.config.js` (root, flat config)
- Create: `.prettierrc.json`
- Modify: `apps/api/package.json` (add `eslint`, `typescript-eslint` devDeps reference)

**Interfaces:**
- Consumes: nothing.
- Produces: `npm run lint` at the root, exercised by CI in Task 3.

- [ ] **Step 1: Install lint tooling at the root**

Run:
```bash
npm install -D eslint@^9 typescript-eslint prettier eslint-config-prettier
```

- [ ] **Step 2: Write the flat ESLint config**

`eslint.config.js`:
```js
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['**/dist/**', '**/.next/**', '**/node_modules/**'] },
  ...tseslint.configs.recommended,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
    },
  }
)
```

- [ ] **Step 3: Write Prettier config**

`.prettierrc.json`:
```json
{ "semi": false, "singleQuote": true, "printWidth": 100 }
```

- [ ] **Step 4: Verify lint runs clean on the empty scaffold**

Run: `npx eslint .`
Expected: exits 0 (no files to lint yet, or zero errors).

- [ ] **Step 5: Commit**

```bash
git add eslint.config.js .prettierrc.json package.json package-lock.json
git commit -m "chore: add ESLint and Prettier"
```

---

### Task 3: GitHub Actions CI

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` from Task 1's root scripts.
- Produces: a required status check named `ci` for the default branch.

- [ ] **Step 1: Write the workflow**

`.github/workflows/ci.yml`:
```yaml
name: ci

on:
  push:
    branches: [main]
  pull_request:

jobs:
  ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run test
      - run: npm run build
```

- [ ] **Step 2: Push to a branch and verify the workflow runs**

Run: `git push -u origin HEAD` (on a feature branch, or directly to `main` per your workflow)
Expected: the `ci` job appears in the GitHub Actions tab and passes (all four steps are no-ops against an empty scaffold at this point, which is fine — they must still exit 0).

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions pipeline"
```

---

### Task 4: Shared package — first Zod contract

**Files:**
- Create: `packages/shared/src/schemas/health.ts`
- Create: `packages/shared/src/index.ts`
- Test: `packages/shared/src/schemas/health.test.ts`

**Interfaces:**
- Produces: `HealthResponseSchema` (Zod) and `HealthResponse` (inferred type), exported from `@karma/shared`. Consumed by Task 5 (API) and Task 14 (web).

- [ ] **Step 1: Install Zod and Vitest in the shared package**

Run (from `packages/shared/`):
```bash
npm install zod
npm install -D vitest tsup
```

- [ ] **Step 2: Write the failing test**

`packages/shared/src/schemas/health.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import { HealthResponseSchema } from './health'

describe('HealthResponseSchema', () => {
  it('accepts a valid health payload', () => {
    const result = HealthResponseSchema.safeParse({ status: 'ok', timestamp: '2026-09-02T00:00:00.000Z' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid status', () => {
    const result = HealthResponseSchema.safeParse({ status: 'nope', timestamp: '2026-09-02T00:00:00.000Z' })
    expect(result.success).toBe(false)
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/schemas/health.test.ts`
Expected: FAIL — `Cannot find module './health'`

- [ ] **Step 4: Write the schema**

`packages/shared/src/schemas/health.ts`:
```ts
import { z } from 'zod'

export const HealthResponseSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string().datetime(),
})

export type HealthResponse = z.infer<typeof HealthResponseSchema>
```

`packages/shared/src/index.ts`:
```ts
export * from './schemas/health'
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/schemas/health.test.ts`
Expected: PASS (2 tests)

- [ ] **Step 6: Add the `test` and `lint`/`typecheck` scripts to the package manifest**

`packages/shared/package.json` — add to `scripts`:
```json
"test": "vitest run",
"lint": "eslint ."
```

- [ ] **Step 7: Commit**

```bash
git add packages/shared
git commit -m "feat(shared): add HealthResponseSchema as the first shared contract"
```

---

### Task 5: Express skeleton with `/healthz`

**Files:**
- Create: `apps/api/src/config/env.ts`
- Create: `apps/api/src/middleware/error-handler.ts`
- Create: `apps/api/src/middleware/request-logger.ts`
- Create: `apps/api/src/app.ts`
- Test: `apps/api/src/app.test.ts`
- Create: `apps/api/src/server.ts`

**Interfaces:**
- Consumes: `HealthResponseSchema` from `@karma/shared` (Task 4).
- Produces: `createApp(): Express` from `apps/api/src/app.ts`, consumed by Task 6+ tests and by `server.ts`. `env` object from `apps/api/src/config/env.ts`, consumed by every later task needing configuration.

- [ ] **Step 1: Install API dependencies**

Run (from `apps/api/`):
```bash
npm install express pino pino-http helmet cors zod
npm install -D typescript tsx tsup vitest supertest @types/express @types/supertest @types/node
npm install @karma/shared@*
```

- [ ] **Step 2: Write the env validation module (minimal for this task; extended in Task 6, 8, 9)**

`apps/api/src/config/env.ts`:
```ts
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url(),
})

export const env = envSchema.parse(process.env)
```

- [ ] **Step 3: Write the failing test for the app factory**

`apps/api/src/app.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from './app'

describe('GET /healthz', () => {
  it('returns a valid health payload', async () => {
    const app = createApp()
    const res = await request(app).get('/healthz')
    expect(res.status).toBe(200)
    expect(res.body.status).toBe('ok')
  })
})
```

- [ ] **Step 4: Run the test to verify it fails**

Run: `npx vitest run src/app.test.ts`
Expected: FAIL — `Cannot find module './app'`

- [ ] **Step 5: Write the error handler and request logger middleware**

`apps/api/src/middleware/error-handler.ts`:
```ts
import type { NextFunction, Request, Response } from 'express'

export class AppError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message)
  }
}

export function errorHandler(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const requestId = req.headers['x-request-id'] ?? 'unknown'
  if (err instanceof AppError) {
    res.status(err.status).json({
      success: false,
      error: { code: err.code, message: err.message },
      requestId,
    })
    return
  }
  req.log?.error({ err }, 'unhandled error')
  res.status(500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'Something went wrong.' },
    requestId,
  })
}
```

`apps/api/src/middleware/request-logger.ts`:
```ts
import pinoHttp from 'pino-http'
import { randomUUID } from 'node:crypto'

export const requestLogger = pinoHttp({
  genReqId: (req) => (req.headers['x-request-id'] as string) ?? randomUUID(),
})
```

- [ ] **Step 6: Write the app factory**

`apps/api/src/app.ts`:
```ts
import express, { type Express } from 'express'
import helmet from 'helmet'
import cors from 'cors'
import { HealthResponseSchema } from '@karma/shared'
import { env } from './config/env'
import { requestLogger } from './middleware/request-logger'
import { errorHandler } from './middleware/error-handler'

export function createApp(): Express {
  const app = express()

  app.use(requestLogger)
  app.use(helmet())
  app.use(cors({ origin: env.WEB_URL, credentials: true }))
  app.use(express.json())

  app.get('/healthz', (_req, res) => {
    const payload = HealthResponseSchema.parse({ status: 'ok', timestamp: new Date().toISOString() })
    res.status(200).json(payload)
  })

  app.use(errorHandler)

  return app
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/app.test.ts`
Expected: PASS

- [ ] **Step 8: Write the server entrypoint**

`apps/api/src/server.ts`:
```ts
import { createApp } from './app'
import { env } from './config/env'

const app = createApp()

app.listen(env.PORT, () => {
  console.log(`API listening on :${env.PORT}`)
})
```

- [ ] **Step 9: Verify it boots locally**

Run: `WEB_URL=http://localhost:3000 npx tsx src/server.ts`
Expected: prints `API listening on :4000`. In a second terminal: `curl http://localhost:4000/healthz` returns `{"status":"ok","timestamp":"..."}`.

- [ ] **Step 10: Commit**

```bash
git add apps/api
git commit -m "feat(api): add Express skeleton with /healthz, error handling, and structured logging"
```

---

### Task 6: Prisma + Supabase connection + pgvector

**Files:**
- Create: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/00000000000000_enable_pgvector/migration.sql`
- Modify: `apps/api/src/config/env.ts` (add `DATABASE_URL`, `DIRECT_URL`)
- Modify: `.env.example` (already has placeholders from Task 1 — verify)

**Interfaces:**
- Produces: a working `PrismaClient` importable as `apps/api/src/db/prisma.ts`, consumed by every later task touching the database.

> **Prerequisite (manual, outside this plan):** create a Supabase project and copy its pooled (`:6543`) and direct (`:5432`) connection strings into a local `apps/api/.env`. This step cannot be scripted — it requires a Supabase account.

- [ ] **Step 1: Install Prisma**

Run (from `apps/api/`):
```bash
npm install @prisma/client
npm install -D prisma
```

- [ ] **Step 2: Extend env validation with the two connection strings**

`apps/api/src/config/env.ts` — replace the schema:
```ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
})
```

- [ ] **Step 3: Initialize the Prisma schema**

`apps/api/prisma/schema.prisma`:
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// Models added in Task 7 and beyond.
```

- [ ] **Step 4: Enable pgvector via a hand-written migration**

Run: `npx prisma migrate dev --name enable_pgvector --create-only`

Edit the generated `apps/api/prisma/migrations/<timestamp>_enable_pgvector/migration.sql`:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

- [ ] **Step 5: Apply the migration against the real Supabase database**

Run: `npx prisma migrate dev`
Expected: `Your database is now in sync with your schema.` No models exist yet — this only enables the extension.

- [ ] **Step 6: Verify the connection with a smoke script**

Create a throwaway `apps/api/scripts/verify-db.ts`:
```ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const result = await prisma.$queryRaw`SELECT extname FROM pg_extension WHERE extname = 'vector'`
console.log(result)
await prisma.$disconnect()
```

Run: `npx tsx scripts/verify-db.ts`
Expected: `[ { extname: 'vector' } ]`

Delete `apps/api/scripts/verify-db.ts` — it was a manual check, not part of the codebase.

- [ ] **Step 7: Commit**

```bash
git add apps/api/prisma apps/api/src/config/env.ts apps/api/package.json
git commit -m "feat(api): connect Prisma to Supabase and enable pgvector"
```

---

### Task 7: Tenancy and SaaS foundation models

**Files:**
- Modify: `apps/api/prisma/schema.prisma`

**Interfaces:**
- Produces: `OrganizationSettings`, `Plan`, `Subscription`, `UsageCounter` Prisma models. `Plan.code`, `Subscription.organizationId`, `UsageCounter.metric` are referenced by Task 10's `enforceLimit`.

> Better Auth's `organization` table (created in Task 9) is the tenant root these models reference. Because Better Auth's migration runs after this one, `organizationId` foreign keys here are added as **plain string columns now** and wired with a relation once Task 9 creates the `organization` table — see Task 9 Step 4.

- [ ] **Step 1: Add the SaaS models to the schema**

Append to `apps/api/prisma/schema.prisma`:
```prisma
model OrganizationSettings {
  id                         String   @id @default(cuid())
  organizationId             String   @unique
  timezone                   String   @default("UTC")
  defaultLocale              Locale   @default(EN)
  weekStartDay                DayOfWeek @default(SUNDAY)
  attendanceEditWindowHours  Int      @default(24)
  gradingDefaults            Json?
  createdAt                  DateTime @default(now())
  updatedAt                  DateTime @updatedAt
}

model Plan {
  id                 String   @id @default(cuid())
  code               String   @unique
  name               String
  nameAr             String?
  maxStudents        Int
  maxTeachers        Int
  storageMb          Int
  aiRequestsPerMonth Int
  isActive           Boolean  @default(true)
  sortOrder          Int      @default(0)
  subscriptions      Subscription[]
}

model Subscription {
  id                      String             @id @default(cuid())
  organizationId          String
  planId                  String
  status                  SubscriptionStatus @default(TRIALING)
  currentPeriodStart      DateTime
  currentPeriodEnd        DateTime
  canceledAt              DateTime?
  provider                String?
  externalCustomerId      String?
  externalSubscriptionId  String?
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  plan Plan @relation(fields: [planId], references: [id])

  @@index([organizationId, status])
}

model UsageCounter {
  id              String      @id @default(cuid())
  organizationId  String
  metric          UsageMetric
  period          String
  value           Int         @default(0)
  updatedAt       DateTime    @updatedAt

  @@unique([organizationId, metric, period])
}

enum Locale {
  EN
  AR
}

enum DayOfWeek {
  SUNDAY
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
}

enum SubscriptionStatus {
  TRIALING
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}

enum UsageMetric {
  STUDENTS
  TEACHERS
  STORAGE_MB
  AI_REQUESTS
}
```

- [ ] **Step 2: Generate and apply the migration**

Run: `npx prisma migrate dev --name saas_foundation`
Expected: migration applies cleanly; `npx prisma generate` runs automatically and the client now exposes `prisma.plan`, `prisma.subscription`, `prisma.usageCounter`, `prisma.organizationSettings`.

- [ ] **Step 3: Commit**

```bash
git add apps/api/prisma
git commit -m "feat(api): add Plan, Subscription, UsageCounter, OrganizationSettings models"
```

---

### Task 8: Tenant context + Prisma client extension (the isolation test)

**Files:**
- Create: `apps/api/src/tenant/context.ts`
- Create: `apps/api/src/tenant/prisma-extension.ts`
- Test: `apps/api/src/tenant/prisma-extension.test.ts`
- Create: `apps/api/src/db/prisma.ts`

**Interfaces:**
- Produces: `runWithOrganization<T>(organizationId: string, fn: () => Promise<T>): Promise<T>` and `getCurrentOrganizationId(): string` from `tenant/context.ts`. `tenantScopedPrisma: PrismaClient` from `db/prisma.ts` — **this is the client every service imports from this point forward**, never `@prisma/client` directly.
- Consumes: `Subscription`/`Plan`/`UsageCounter` models from Task 7, used as the isolation test's fixture data.

> This is the most important test in Phase 0. It is written and run against real Postgres — no mocking the extension.

- [ ] **Step 1: Add `organizationId` to `Subscription` isolation query surface and write the failing isolation test**

`apps/api/src/tenant/prisma-extension.test.ts`:
```ts
import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { withTenantScope } from './prisma-extension'
import { runWithOrganization } from './context'

const rawPrisma = new PrismaClient()
const scopedPrisma = withTenantScope(rawPrisma)

let orgAPlanId: string
let orgAId = 'test-org-a'
let orgBId = 'test-org-b'

beforeAll(async () => {
  const plan = await rawPrisma.plan.create({
    data: { code: 'TEST', name: 'Test Plan', maxStudents: 10, maxTeachers: 10, storageMb: 100, aiRequestsPerMonth: 10 },
  })
  orgAPlanId = plan.id

  await rawPrisma.subscription.create({
    data: {
      organizationId: orgAId,
      planId: orgAPlanId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400000),
    },
  })
  await rawPrisma.subscription.create({
    data: {
      organizationId: orgBId,
      planId: orgAPlanId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400000),
    },
  })
})

afterAll(async () => {
  await rawPrisma.subscription.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } })
  await rawPrisma.plan.delete({ where: { id: orgAPlanId } })
  await rawPrisma.$disconnect()
})

describe('tenant Prisma extension', () => {
  it('scopes findMany to the current organization only', async () => {
    const rows = await runWithOrganization(orgAId, () => scopedPrisma.subscription.findMany())
    expect(rows).toHaveLength(1)
    expect(rows[0].organizationId).toBe(orgAId)
  })

  it('never returns another organization row via findFirst', async () => {
    const orgBRow = await rawPrisma.subscription.findFirstOrThrow({ where: { organizationId: orgBId } })
    const result = await runWithOrganization(orgAId, () =>
      scopedPrisma.subscription.findUnique({ where: { id: orgBRow.id } })
    )
    expect(result).toBeNull()
  })

  it('injects organizationId on create automatically', async () => {
    const created = await runWithOrganization(orgAId, () =>
      scopedPrisma.subscription.create({
        data: {
          planId: orgAPlanId,
          status: 'TRIALING',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 86400000),
        } as never,
      })
    )
    expect(created.organizationId).toBe(orgAId)
  })

  it('throws if used outside a tenant context', async () => {
    await expect(scopedPrisma.subscription.findMany()).rejects.toThrow(/tenant context/i)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/tenant/prisma-extension.test.ts`
Expected: FAIL — `Cannot find module './prisma-extension'` and `./context`

- [ ] **Step 3: Implement the AsyncLocalStorage context**

`apps/api/src/tenant/context.ts`:
```ts
import { AsyncLocalStorage } from 'node:async_hooks'

const tenantStorage = new AsyncLocalStorage<{ organizationId: string }>()

export function runWithOrganization<T>(organizationId: string, fn: () => Promise<T>): Promise<T> {
  return tenantStorage.run({ organizationId }, fn)
}

export function getCurrentOrganizationId(): string {
  const store = tenantStorage.getStore()
  if (!store) {
    throw new Error('No tenant context: getCurrentOrganizationId() called outside runWithOrganization()')
  }
  return store.organizationId
}

export function tryGetCurrentOrganizationId(): string | undefined {
  return tenantStorage.getStore()?.organizationId
}
```

- [ ] **Step 4: Implement the Prisma client extension**

`apps/api/src/tenant/prisma-extension.ts`:
```ts
import { Prisma, type PrismaClient } from '@prisma/client'
import { getCurrentOrganizationId } from './context'

// Models exempt from tenant scoping: Better Auth's own tables (managed by the library)
// and Plan (platform-level, shared across all organizations).
const EXEMPT_MODELS = new Set(['Plan', 'User', 'Session', 'Account', 'Verification', 'Organization', 'Member', 'Invitation'])

const READ_OPS = new Set(['findFirst', 'findFirstOrThrow', 'findMany', 'findUnique', 'findUniqueOrThrow', 'count', 'aggregate', 'groupBy'])
const WRITE_ONE_OPS = new Set(['create'])
const WRITE_MANY_OPS = new Set(['updateMany', 'deleteMany'])
const WRITE_WHERE_OPS = new Set(['update', 'delete', 'upsert'])

export function withTenantScope(prisma: PrismaClient) {
  return prisma.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || EXEMPT_MODELS.has(model)) {
            return query(args)
          }

          const organizationId = getCurrentOrganizationId()
          const a = args as Record<string, unknown>

          if (READ_OPS.has(operation) || WRITE_MANY_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), organizationId }
          }

          if (WRITE_ONE_OPS.has(operation)) {
            a.data = { ...(a.data as object), organizationId }
          }

          if (WRITE_WHERE_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), organizationId }
            if ('create' in a) {
              a.create = { ...(a.create as object), organizationId }
            }
          }

          return query(a as never)
        },
      },
    },
  }) as PrismaClient
}
```

> `Prisma` is imported but unused in this minimal version — remove the import if the linter flags it, or keep it if a later task needs `Prisma.PrismaClientKnownRequestError` here.

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/tenant/prisma-extension.test.ts`
Expected: PASS (4 tests)

- [ ] **Step 6: Wire the exported scoped client used by the rest of the app**

`apps/api/src/db/prisma.ts`:
```ts
import { PrismaClient } from '@prisma/client'
import { withTenantScope } from '../tenant/prisma-extension'

const rawPrisma = new PrismaClient()

export const prisma = withTenantScope(rawPrisma)
export { rawPrisma }
```

> `rawPrisma` is exported deliberately — for seed scripts and platform-level queries (e.g. reading `Plan`) that run outside a tenant context. **No service or controller may import `rawPrisma`.**

- [ ] **Step 7: Add an ESLint rule note (enforced manually until Task list revisits tooling) forbidding `rawPrisma` outside `db/` and `seed.ts`**

Add a comment at the top of `apps/api/src/db/prisma.ts`:
```ts
// eslint-disable-next-line -- placeholder for a future no-restricted-imports rule scoped to this file
```
(A proper `no-restricted-imports` ESLint rule for `rawPrisma` is deferred to Phase 1 Task "Authorization matrix harness" — noted in the Phase 1–7 roadmap.)

- [ ] **Step 8: Commit**

```bash
git add apps/api/src/tenant apps/api/src/db
git commit -m "feat(api): add AsyncLocalStorage tenant context and Prisma tenant-scoping extension"
```

---

### Task 9: Better Auth (core + organization plugin)

**Files:**
- Create: `apps/api/src/auth/roles.ts`
- Create: `apps/api/src/auth/auth.ts`
- Modify: `apps/api/src/app.ts` (mount Better Auth's handler)
- Modify: `apps/api/prisma/schema.prisma` (add the relation from Task 7's models to `organization` once it exists)
- Modify: `apps/api/src/config/env.ts` (add auth env vars)
- Test: `apps/api/src/auth/auth.test.ts`

**Interfaces:**
- Consumes: `env` from Task 5/6.
- Produces: `auth: ReturnType<typeof betterAuth>` from `auth/auth.ts`, mounted at `/api/auth/*`. `organizationId` claim available on every authenticated request via `auth.api.getSession`.

- [ ] **Step 1: Install Better Auth**

Run (from `apps/api/`):
```bash
npm install better-auth
```

- [ ] **Step 2: Extend env validation**

`apps/api/src/config/env.ts` — add to the schema:
```ts
BETTER_AUTH_SECRET: z.string().min(32),
BETTER_AUTH_URL: z.string().url(),
AUTH_TRUSTED_ORIGINS: z.string().transform((s) => s.split(',')),
```

- [ ] **Step 3: Define Karma's custom roles**

`apps/api/src/auth/roles.ts`:
```ts
import { createAccessControl } from 'better-auth/plugins/organization/access'

const statement = {
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
} as const

export const ac = createAccessControl(statement)

export const adminRole = ac.newRole({
  organization: ['update'],
  member: ['create', 'update', 'delete'],
  invitation: ['create', 'cancel'],
})

export const teacherRole = ac.newRole({})
export const studentRole = ac.newRole({})
export const parentRole = ac.newRole({})
```

> Resource-level permissions (who may read which submission) are **not** modeled here — that is the service-layer authorization matrix (§9 of the blueprint), not Better Auth's role statement. This file only decides organization-management actions.

- [ ] **Step 4: Configure Better Auth with the organization plugin**

`apps/api/src/auth/auth.ts`:
```ts
import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { rawPrisma } from '../db/prisma'
import { env } from '../config/env'
import { ac, adminRole, teacherRole, studentRole, parentRole } from './roles'

export const auth = betterAuth({
  database: prismaAdapter(rawPrisma, { provider: 'postgresql' }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    organization({
      ac,
      roles: {
        ADMIN: adminRole,
        TEACHER: teacherRole,
        STUDENT: studentRole,
        PARENT: parentRole,
      },
    }),
  ],
})
```

> `emailAndPassword.requireEmailVerification` stays `false` in Phase 0 so the auth round-trip test in Step 6 doesn't need a mail transport yet. Flip to `true` when Task "Email provider" lands in the Phase 1 roadmap.

- [ ] **Step 5: Generate and apply Better Auth's schema**

Run: `npx @better-auth/cli generate` then review the generated Prisma models it appends to `schema.prisma` (`user`, `session`, `account`, `verification`, `organization`, `member`, `invitation`).

Run: `npx prisma migrate dev --name better_auth_core`
Expected: migration applies; `prisma.user`, `prisma.organization`, `prisma.member` etc. now exist on the client.

- [ ] **Step 6: Wire the relation from Task 7's SaaS models to the now-existing `organization` table**

In `apps/api/prisma/schema.prisma`, add to the `organization` model (generated by the CLI, now editable):
```prisma
model organization {
  // ...generated fields...
  settings      OrganizationSettings?
  subscriptions Subscription[]
}
```

And add the back-relations:
```prisma
model OrganizationSettings {
  // ...existing fields...
  organization organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}

model Subscription {
  // ...existing fields...
  organization organization @relation(fields: [organizationId], references: [id], onDelete: Cascade)
}
```

Run: `npx prisma migrate dev --name link_saas_models_to_organization`

- [ ] **Step 7: Mount the Better Auth handler in the Express app**

`apps/api/src/app.ts` — add before the `/healthz` route:
```ts
import { toNodeHandler } from 'better-auth/node'
import { auth } from './auth/auth'

// ...inside createApp(), before express.json():
app.all('/api/auth/*', toNodeHandler(auth))
```

> Better Auth's handler must be mounted **before** `express.json()` — it parses its own request body.

- [ ] **Step 8: Write the failing sign-up round-trip test**

`apps/api/src/auth/auth.test.ts`:
```ts
import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'

describe('Better Auth mount', () => {
  it('creates a user via sign-up and returns a session cookie', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: 'phase0-test@karma.dev', name: 'Phase 0 Test', password: 'correct-horse-battery-staple' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
  })
})
```

- [ ] **Step 9: Run the test to verify it fails, then passes**

Run: `npx vitest run src/auth/auth.test.ts`
Expected first: FAIL (route not mounted / env not configured for tests — set `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`, `AUTH_TRUSTED_ORIGINS`, `WEB_URL`, `DATABASE_URL`, `DIRECT_URL` in a `.env.test` loaded by Vitest config).
Expected after Steps 3–7 are in place: PASS.

- [ ] **Step 10: Commit**

```bash
git add apps/api/src/auth apps/api/src/app.ts apps/api/prisma apps/api/src/config/env.ts
git commit -m "feat(api): mount Better Auth with the organization plugin and custom roles"
```

---

### Task 10: `enforceLimit` and usage counters

**Files:**
- Create: `apps/api/src/modules/organizations/limits.ts`
- Test: `apps/api/src/modules/organizations/limits.test.ts`

**Interfaces:**
- Consumes: `prisma` from `db/prisma.ts` (Task 8), `getCurrentOrganizationId` from `tenant/context.ts` (Task 8).
- Produces: `enforceLimit(metric: UsageMetric): Promise<void>` and `incrementUsage(metric: UsageMetric, delta: number): Promise<void>`, consumed by every later create-path that is plan-limited (student/teacher creation in Phase 1, file upload in Phase 1, AI requests in Phase 6).

- [ ] **Step 1: Write the failing test**

`apps/api/src/modules/organizations/limits.test.ts`:
```ts
import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { runWithOrganization } from '../../tenant/context'
import { enforceLimit, incrementUsage, LimitExceededError } from './limits'

const orgId = 'test-org-limits'
let planId: string

beforeAll(async () => {
  const org = await rawPrisma.organization.create({ data: { id: orgId, name: 'Limits Test Org', slug: 'limits-test-org' } })
  const plan = await rawPrisma.plan.create({
    data: { code: 'LIMITS-TEST', name: 'Limits Test Plan', maxStudents: 2, maxTeachers: 5, storageMb: 100, aiRequestsPerMonth: 10 },
  })
  planId = plan.id
  await rawPrisma.subscription.create({
    data: { organizationId: org.id, planId, status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 86400000) },
  })
})

afterAll(async () => {
  await rawPrisma.usageCounter.deleteMany({ where: { organizationId: orgId } })
  await rawPrisma.subscription.deleteMany({ where: { organizationId: orgId } })
  await rawPrisma.organization.delete({ where: { id: orgId } })
  await rawPrisma.plan.delete({ where: { id: planId } })
})

beforeEach(async () => {
  await rawPrisma.usageCounter.deleteMany({ where: { organizationId: orgId } })
})

describe('enforceLimit', () => {
  it('allows the action when usage is below the plan limit', async () => {
    await expect(runWithOrganization(orgId, () => enforceLimit('STUDENTS'))).resolves.not.toThrow()
  })

  it('throws LimitExceededError once usage reaches the plan limit', async () => {
    await runWithOrganization(orgId, () => incrementUsage('STUDENTS', 2))
    await expect(runWithOrganization(orgId, () => enforceLimit('STUDENTS'))).rejects.toThrow(LimitExceededError)
  })
})

describe('incrementUsage', () => {
  it('creates the counter row on first use', async () => {
    await runWithOrganization(orgId, () => incrementUsage('TEACHERS', 1))
    const row = await rawPrisma.usageCounter.findUnique({
      where: { organizationId_metric_period: { organizationId: orgId, metric: 'TEACHERS', period: 'current' } },
    })
    expect(row?.value).toBe(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npx vitest run src/modules/organizations/limits.test.ts`
Expected: FAIL — `Cannot find module './limits'`

- [ ] **Step 3: Implement the limits module**

`apps/api/src/modules/organizations/limits.ts`:
```ts
import type { UsageMetric } from '@prisma/client'
import { prisma, rawPrisma } from '../../db/prisma'
import { getCurrentOrganizationId } from '../../tenant/context'

export class LimitExceededError extends Error {
  constructor(public metric: UsageMetric, public limit: number) {
    super(`Plan limit reached for ${metric} (limit: ${limit})`)
  }
}

const LEVEL_METRICS: UsageMetric[] = ['STUDENTS', 'TEACHERS', 'STORAGE_MB']

function periodFor(metric: UsageMetric): string {
  if (LEVEL_METRICS.includes(metric)) return 'current'
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function limitFieldFor(metric: UsageMetric): 'maxStudents' | 'maxTeachers' | 'storageMb' | 'aiRequestsPerMonth' {
  switch (metric) {
    case 'STUDENTS': return 'maxStudents'
    case 'TEACHERS': return 'maxTeachers'
    case 'STORAGE_MB': return 'storageMb'
    case 'AI_REQUESTS': return 'aiRequestsPerMonth'
  }
}

async function currentPlanLimit(organizationId: string, metric: UsageMetric): Promise<number> {
  const subscription = await rawPrisma.subscription.findFirstOrThrow({
    where: { organizationId, status: 'ACTIVE' },
    include: { plan: true },
  })
  return subscription.plan[limitFieldFor(metric)]
}

export async function enforceLimit(metric: UsageMetric): Promise<void> {
  const organizationId = getCurrentOrganizationId()
  const period = periodFor(metric)
  const [limit, counter] = await Promise.all([
    currentPlanLimit(organizationId, metric),
    prisma.usageCounter.findUnique({ where: { organizationId_metric_period: { organizationId, metric, period } } }),
  ])
  const current = counter?.value ?? 0
  if (current >= limit) {
    throw new LimitExceededError(metric, limit)
  }
}

export async function incrementUsage(metric: UsageMetric, delta: number): Promise<void> {
  const organizationId = getCurrentOrganizationId()
  const period = periodFor(metric)
  await prisma.usageCounter.upsert({
    where: { organizationId_metric_period: { organizationId, metric, period } },
    create: { metric, period, value: delta } as never,
    update: { value: { increment: delta } },
  })
}
```

> Called together, inside the same transaction as the action they guard — e.g. `prisma.$transaction([...])` wrapping both the `Student` create and `incrementUsage('STUDENTS', 1)` — starting in Phase 1. Phase 0 only proves the primitive works.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/modules/organizations/limits.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 5: Commit**

```bash
git add apps/api/src/modules/organizations
git commit -m "feat(api): add enforceLimit and incrementUsage for plan-based usage limits"
```

---

### Task 11: Seed script

**Files:**
- Create: `apps/api/src/seed.ts`
- Modify: `apps/api/package.json` (add `prisma.seed` config and `db:seed` script)

**Interfaces:**
- Consumes: `rawPrisma`, `runWithOrganization`, `incrementUsage`.
- Produces: one organization (`karma-demo`), one plan (`SCHOOL`), one active subscription — the fixture every later phase's seed data builds on.

- [ ] **Step 1: Write the seed script**

`apps/api/src/seed.ts`:
```ts
import { rawPrisma } from './db/prisma'
import { runWithOrganization } from './tenant/context'
import { auth } from './auth/auth'

async function main() {
  const plan = await rawPrisma.plan.upsert({
    where: { code: 'SCHOOL' },
    create: {
      code: 'SCHOOL',
      name: 'School Plan',
      nameAr: 'خطة المدرسة',
      maxStudents: 500,
      maxTeachers: 50,
      storageMb: 5000,
      aiRequestsPerMonth: 1000,
    },
    update: {},
  })

  const organization = await rawPrisma.organization.upsert({
    where: { slug: 'karma-demo' },
    create: { name: 'Karma Demo School', slug: 'karma-demo' },
    update: {},
  })

  await rawPrisma.subscription.upsert({
    where: { id: `${organization.id}-seed-subscription` },
    create: {
      id: `${organization.id}-seed-subscription`,
      organizationId: organization.id,
      planId: plan.id,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 365 * 86400000),
    },
    update: {},
  })

  await runWithOrganization(organization.id, async () => {
    await rawPrisma.organizationSettings.upsert({
      where: { organizationId: organization.id },
      create: { organizationId: organization.id, timezone: 'Africa/Cairo', defaultLocale: 'EN' },
      update: {},
    })
  })

  console.log(`Seeded organization ${organization.slug} (${organization.id}) on plan ${plan.code}`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
  .finally(() => rawPrisma.$disconnect())
```

> The demo admin user, teacher, student, and parent accounts are **not** seeded here — creating a Better Auth user requires a real password hash flow best driven through `auth.api.signUpEmail`, and there is no `Student`/`Teacher`/`Parent` profile model yet. That is Phase 1's seed data task, once those models exist.

- [ ] **Step 2: Wire the script into `package.json`**

`apps/api/package.json` — add:
```json
"scripts": {
  "db:seed": "tsx src/seed.ts"
},
"prisma": {
  "seed": "tsx src/seed.ts"
}
```

- [ ] **Step 3: Run it and verify**

Run: `npm run db:seed`
Expected: `Seeded organization karma-demo (<id>) on plan SCHOOL`

Verify: `npx prisma studio` (or a `SELECT` via `psql`) shows one row each in `organization`, `Plan`, `Subscription`, `OrganizationSettings`.

- [ ] **Step 4: Commit**

```bash
git add apps/api/src/seed.ts apps/api/package.json
git commit -m "feat(api): add seed script for the demo organization, plan, and subscription"
```

---

### Task 12: Next.js skeleton with bilingual RTL routing

**Files:**
- Create: `apps/web/*` (via `create-next-app`, then modified)
- Create: `apps/web/i18n/request.ts`
- Create: `apps/web/i18n/messages/en.json`
- Create: `apps/web/i18n/messages/ar.json`
- Create: `apps/web/middleware.ts`
- Create: `apps/web/src/app/[locale]/layout.tsx`
- Create: `apps/web/src/app/[locale]/page.tsx`
- Test: `apps/web/src/app/[locale]/page.test.tsx`

**Interfaces:**
- Produces: locale-prefixed routing (`/en`, `/ar`) with `dir="rtl"` applied automatically for `ar`. Every later frontend task builds routes under `app/[locale]/`.

- [ ] **Step 1: Scaffold the Next.js app**

Run (from `apps/`):
```bash
npx create-next-app@latest web --typescript --tailwind --app --src-dir --no-eslint --import-alias "@/*"
```

Then reconcile `apps/web/package.json`'s `name` to `@karma/web` and confirm it lands in the workspace.

- [ ] **Step 2: Install i18n, testing, and Tailwind v4 dependencies**

Run (from `apps/web/`):
```bash
npm install next-intl
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

> Tailwind v4 ships via `create-next-app`'s `--tailwind` flag using the new CSS-first config (`@import "tailwindcss"` in `globals.css`, no `tailwind.config.js` required). Verify `apps/web/src/styles/globals.css` (or `app/globals.css`) contains `@import "tailwindcss";` and delete any generated `tailwind.config.ts` if present.

- [ ] **Step 3: Write the translation message files**

`apps/web/i18n/messages/en.json`:
```json
{ "home": { "title": "Karma", "tagline": "School management, built for how schools actually run." } }
```

`apps/web/i18n/messages/ar.json`:
```json
{ "home": { "title": "كارما", "tagline": "إدارة مدرسية مبنية على الطريقة الفعلية لعمل المدارس." } }
```

- [ ] **Step 4: Configure `next-intl` request config**

`apps/web/i18n/request.ts`:
```ts
import { getRequestConfig } from 'next-intl/server'

export const locales = ['en', 'ar'] as const
export type AppLocale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  const resolved = locales.includes(locale as AppLocale) ? (locale as AppLocale) : 'en'
  return {
    locale: resolved,
    messages: (await import(`./messages/${resolved}.json`)).default,
  }
})
```

- [ ] **Step 5: Add the locale-routing middleware**

`apps/web/middleware.ts`:
```ts
import createMiddleware from 'next-intl/middleware'
import { locales } from './i18n/request'

export default createMiddleware({
  locales,
  defaultLocale: 'en',
})

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
```

- [ ] **Step 6: Wire `next.config.ts` for the next-intl plugin**

`apps/web/next.config.ts`:
```ts
import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

const nextConfig: NextConfig = {}

export default withNextIntl(nextConfig)
```

- [ ] **Step 7: Move the root layout under `[locale]` and set `dir` from the locale**

Delete the default `apps/web/src/app/layout.tsx` and `apps/web/src/app/page.tsx` (Next scaffolded these at the root; the app now lives entirely under `[locale]`).

`apps/web/src/app/[locale]/layout.tsx`:
```tsx
import type { ReactNode } from 'react'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages } from 'next-intl/server'
import { locales, type AppLocale } from '../../../i18n/request'
import '../../styles/globals.css'

const RTL_LOCALES: AppLocale[] = ['ar']

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  const dir = RTL_LOCALES.includes(locale as AppLocale) ? 'rtl' : 'ltr'
  const messages = await getMessages()

  return (
    <html lang={locale} dir={dir}>
      <body>
        <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 8: Write the home page using a translated string**

`apps/web/src/app/[locale]/page.tsx`:
```tsx
import { useTranslations } from 'next-intl'

export default function HomePage() {
  const t = useTranslations('home')
  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('tagline')}</p>
    </main>
  )
}
```

- [ ] **Step 9: Write a test proving the Arabic route renders RTL content**

`apps/web/src/app/[locale]/page.test.tsx`:
```tsx
import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../i18n/messages/ar.json'
import HomePage from './page'

describe('HomePage (ar locale)', () => {
  it('renders the Arabic title', () => {
    render(
      <NextIntlClientProvider locale="ar" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>
    )
    expect(screen.getByText('كارما')).toBeInTheDocument()
  })
})
```

- [ ] **Step 10: Run the test to verify it passes**

Run (from `apps/web/`): `npx vitest run src/app/[locale]/page.test.tsx`
Expected: PASS

- [ ] **Step 11: Verify both locales in the browser**

Run: `npm run dev` → visit `http://localhost:3000/en` (LTR, English) and `http://localhost:3000/ar` (RTL, Arabic — confirm via devtools that `<html dir="rtl">`).

- [ ] **Step 12: Commit**

```bash
git add apps/web
git commit -m "feat(web): scaffold Next.js App Router with bilingual RTL routing via next-intl"
```

---

### Task 13: Zustand shell store

**Files:**
- Create: `apps/web/src/stores/shell-store.ts`
- Test: `apps/web/src/stores/shell-store.test.ts`

**Interfaces:**
- Produces: `useShellStore` hook with `{ sidebarCollapsed, toggleSidebar, theme, setTheme }`, consumed by the layout shell built in Phase 1.

- [ ] **Step 1: Install Zustand**

Run (from `apps/web/`): `npm install zustand`

- [ ] **Step 2: Write the failing test**

`apps/web/src/stores/shell-store.test.ts`:
```ts
import { describe, expect, it, beforeEach } from 'vitest'
import { useShellStore } from './shell-store'

describe('useShellStore', () => {
  beforeEach(() => {
    useShellStore.setState({ sidebarCollapsed: false, theme: 'system' })
  })

  it('starts with the sidebar expanded', () => {
    expect(useShellStore.getState().sidebarCollapsed).toBe(false)
  })

  it('toggles the sidebar', () => {
    useShellStore.getState().toggleSidebar()
    expect(useShellStore.getState().sidebarCollapsed).toBe(true)
  })

  it('sets the theme', () => {
    useShellStore.getState().setTheme('dark')
    expect(useShellStore.getState().theme).toBe('dark')
  })
})
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npx vitest run src/stores/shell-store.test.ts`
Expected: FAIL — `Cannot find module './shell-store'`

- [ ] **Step 4: Implement the store, scoped strictly to UI-shell state**

`apps/web/src/stores/shell-store.ts`:
```ts
import { create } from 'zustand'

// Charter (blueprint §10): sidebar, locale/direction, theme, command palette,
// notification drawer, multi-step form drafts. Nothing fetchable or linkable —
// server state lives in TanStack Query, filters and selection live in the URL.
type ShellState = {
  sidebarCollapsed: boolean
  toggleSidebar: () => void
  theme: 'light' | 'dark' | 'system'
  setTheme: (theme: ShellState['theme']) => void
}

export const useShellStore = create<ShellState>((set) => ({
  sidebarCollapsed: false,
  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  theme: 'system',
  setTheme: (theme) => set({ theme }),
}))
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npx vitest run src/stores/shell-store.test.ts`
Expected: PASS (3 tests)

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/stores
git commit -m "feat(web): add Zustand shell store for UI-only state"
```

---

### Task 14: API client + TanStack Query wiring (first end-to-end smoke test)

**Files:**
- Create: `apps/web/src/lib/api-client.ts`
- Create: `apps/web/src/lib/query-provider.tsx`
- Modify: `apps/web/src/app/[locale]/layout.tsx` (wrap children in the query provider)
- Modify: `apps/web/src/app/[locale]/page.tsx` (call `/healthz` through React Query as the smoke test)
- Test: `apps/web/src/app/[locale]/page.test.tsx` (extend)

**Interfaces:**
- Consumes: `HealthResponseSchema` from `@karma/shared` (Task 4), the running API's `/healthz` (Task 5).
- Produces: `apiClient: AxiosInstance` and `QueryProvider` component, consumed by every later data-fetching feature.

- [ ] **Step 1: Install dependencies**

Run (from `apps/web/`):
```bash
npm install axios @tanstack/react-query
npm install -D @tanstack/react-query-devtools
npm install @karma/shared@*
```

- [ ] **Step 2: Write the Axios client**

`apps/web/src/lib/api-client.ts`:
```ts
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // required for Better Auth's cookie session
})
```

- [ ] **Step 3: Write the Query provider**

`apps/web/src/lib/query-provider.tsx`:
```tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'

export function QueryProvider({ children }: { children: ReactNode }) {
  const [client] = useState(() => new QueryClient())
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>
}
```

- [ ] **Step 4: Wrap the locale layout**

`apps/web/src/app/[locale]/layout.tsx` — wrap `{children}`:
```tsx
import { QueryProvider } from '../../lib/query-provider'
// ...
<NextIntlClientProvider messages={messages}>
  <QueryProvider>{children}</QueryProvider>
</NextIntlClientProvider>
```

- [ ] **Step 5: Extend the home page to prove the full round trip**

`apps/web/src/app/[locale]/page.tsx`:
```tsx
'use client'

import { useTranslations } from 'next-intl'
import { useQuery } from '@tanstack/react-query'
import { HealthResponseSchema } from '@karma/shared'
import { apiClient } from '../../lib/api-client'

export default function HomePage() {
  const t = useTranslations('home')
  const { data, isLoading } = useQuery({
    queryKey: ['health'],
    queryFn: async () => HealthResponseSchema.parse((await apiClient.get('/healthz')).data),
  })

  return (
    <main>
      <h1>{t('title')}</h1>
      <p>{t('tagline')}</p>
      <p data-testid="api-status">{isLoading ? '…' : data?.status}</p>
    </main>
  )
}
```

> `page.tsx` becomes a Client Component here (`'use client'`) because it uses `useQuery`. This is expected and localized — it is not a blanket rule for every page.

- [ ] **Step 6: Extend the test to mock the query and assert the status renders**

`apps/web/src/app/[locale]/page.test.tsx` — add:
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi } from 'vitest'
import { apiClient } from '../../lib/api-client'

vi.mock('../../lib/api-client', () => ({
  apiClient: { get: vi.fn().mockResolvedValue({ data: { status: 'ok', timestamp: new Date().toISOString() } }) },
}))

it('renders the API health status once loaded', async () => {
  const client = new QueryClient()
  render(
    <QueryClientProvider client={client}>
      <NextIntlClientProvider locale="ar" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>
    </QueryClientProvider>
  )
  expect(await screen.findByTestId('api-status')).toHaveTextContent('ok')
})
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npx vitest run src/app/[locale]/page.test.tsx`
Expected: PASS

- [ ] **Step 8: Verify manually against the real running API**

Run the API (`npm run dev` in `apps/api`) and the web app (`npm run dev` in `apps/web`); visit `/en`.
Expected: the page shows `ok` after a brief loading state — proving CORS (Task 5's `cors({ origin: env.WEB_URL, credentials: true })`) and the API connection both work.

- [ ] **Step 9: Commit**

```bash
git add apps/web/src/lib apps/web/src/app
git commit -m "feat(web): wire Axios and TanStack Query, prove the API round trip via /healthz"
```

---

### Task 15: CORS + cross-subdomain cookies + login round trip

**Files:**
- Create: `apps/web/src/lib/auth-client.ts`
- Test: `apps/api/src/auth/auth.test.ts` (extend)
- Modify: `.env.example` (document `AUTH_COOKIE_DOMAIN`, deployment-only)

**Interfaces:**
- Consumes: `auth` from Task 9.
- Produces: `authClient` (Better Auth React client) from `apps/web/src/lib/auth-client.ts`, consumed by every auth UI in Phase 1.

- [ ] **Step 1: Install the Better Auth client on the web app**

Run (from `apps/web/`): `npm install better-auth`

- [ ] **Step 2: Write the client**

`apps/web/src/lib/auth-client.ts`:
```ts
import { createAuthClient } from 'better-auth/react'
import { organizationClient } from 'better-auth/client/plugins'

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
  plugins: [organizationClient()],
})
```

- [ ] **Step 3: Extend the API auth test to prove a full sign-up → sign-in → session round trip**

`apps/api/src/auth/auth.test.ts` — add:
```ts
it('signs in with the created account and retrieves an active session', async () => {
  const app = createApp()
  const agent = request.agent(app)

  await agent.post('/api/auth/sign-up/email').send({
    email: 'phase0-roundtrip@karma.dev',
    name: 'Roundtrip Test',
    password: 'correct-horse-battery-staple',
  })

  const signInRes = await agent.post('/api/auth/sign-in/email').send({
    email: 'phase0-roundtrip@karma.dev',
    password: 'correct-horse-battery-staple',
  })
  expect(signInRes.status).toBe(200)

  const sessionRes = await agent.get('/api/auth/get-session')
  expect(sessionRes.status).toBe(200)
  expect(sessionRes.body.user.email).toBe('phase0-roundtrip@karma.dev')
})
```

> `request.agent(app)` persists the `Set-Cookie` from sign-up/sign-in across subsequent requests, which is what actually proves the cookie session works — a bare `request(app)` per call would not carry the cookie forward.

- [ ] **Step 4: Run the test to verify it passes**

Run: `npx vitest run src/auth/auth.test.ts`
Expected: PASS (3 tests total in this file)

- [ ] **Step 5: Document the production cookie-domain requirement**

Add to `.env.example`, under the auth section:
```env
# Production only — leave unset locally. Must be the shared parent domain
# (e.g. .karma.app) so the session cookie works across app.karma.app and api.karma.app.
AUTH_COOKIE_DOMAIN=
```

> Setting this locally breaks sign-in on `localhost` — noted explicitly per ENVIRONMENT_REFERENCE.md §4.

- [ ] **Step 6: Commit**

```bash
git add apps/web/src/lib/auth-client.ts apps/api/src/auth/auth.test.ts .env.example
git commit -m "test(api): prove sign-up/sign-in/session cookie round trip; add web auth client"
```

---

### Task 16: Deploy Phase 0 to production

**Files:**
- Create: `apps/api/railway.json` (or equivalent host config — adjust to the chosen provider)
- Modify: `apps/web/next.config.ts` (if the host requires output config — verify against the chosen provider's docs at execution time)

**Interfaces:**
- Produces: a public URL serving `/en` and `/ar`, and a public API URL answering `/healthz` — the first real deployment, kept alive from here forward.

> This task's exact steps depend on which hosts you choose (TECH_STACK.md recommends Vercel for web, Railway/Render/Fly for the API). The steps below assume Vercel + Railway; substitute equivalently if a different host is chosen.

- [ ] **Step 1: Create the Supabase production database (if not already the same project used in development) and run migrations against it**

Run: `DATABASE_URL=<prod pooled> DIRECT_URL=<prod direct> npx prisma migrate deploy`
Expected: all migrations from Tasks 6, 7, 9 apply cleanly.

- [ ] **Step 2: Deploy the API to Railway (or chosen host)**

- Connect the GitHub repository, root directory `apps/api`.
- Set build command: `npm run build` (from the workspace root, or scoped per host's monorepo support).
- Set start command: `node dist/server.js`.
- Set every required environment variable from `.env.example`'s `Required` rows in ENVIRONMENT_REFERENCE.md §2–4: `NODE_ENV=production`, `PORT`, `WEB_URL` (the eventual Vercel URL), `DATABASE_URL`, `DIRECT_URL`, `BETTER_AUTH_SECRET` (freshly generated via `openssl rand -base64 48`, **not** reused from local dev), `BETTER_AUTH_URL` (the Railway URL), `AUTH_TRUSTED_ORIGINS` (the Vercel URL).

- [ ] **Step 3: Verify the deployed API**

Run: `curl https://<railway-app>.up.railway.app/healthz`
Expected: `{"status":"ok","timestamp":"..."}`

- [ ] **Step 4: Deploy the web app to Vercel**

- Import the repository, root directory `apps/web`.
- Set `NEXT_PUBLIC_API_URL` to `https://<railway-app>.up.railway.app/api/v1` and `NEXT_PUBLIC_BETTER_AUTH_URL` to `https://<railway-app>.up.railway.app`.

- [ ] **Step 5: Update `WEB_URL` and `AUTH_TRUSTED_ORIGINS` on the API host to the real Vercel URL, and redeploy the API**

This closes the CORS loop — Task 5's `cors({ origin: env.WEB_URL })` must match the deployed web origin exactly.

- [ ] **Step 6: Verify the deployed web app end to end**

Visit `https://<vercel-app>.vercel.app/en` and `/ar`.
Expected: the page loads, shows the translated tagline, and `api-status` resolves to `ok` — proving the deployed frontend reaches the deployed backend across origins.

- [ ] **Step 7: Run the production seed**

Run: `DATABASE_URL=<prod pooled> DIRECT_URL=<prod direct> npm run db:seed --workspace=@karma/api`
Expected: the demo organization exists in production.

- [ ] **Step 8: Commit any host config files added in Step 2/4**

```bash
git add apps/api/railway.json  # or equivalent
git commit -m "chore: add deployment configuration for API host"
```

---

## Phase 0 Definition of Done

- [ ] `npm ci && npm run lint && npm run typecheck && npm run test && npm run build` passes locally from the repo root.
- [ ] The GitHub Actions `ci` workflow is green on `main`.
- [ ] The tenant isolation test (Task 8) passes against real Postgres.
- [ ] The auth round-trip test (Task 15) passes against real Postgres.
- [ ] `/healthz` is reachable on both the deployed API and, through the deployed web app, end to end.
- [ ] Both `/en` and `/ar` render correctly, with `dir="rtl"` confirmed on `/ar`.
- [ ] The demo organization, plan, and subscription exist in the production database.

**Next:** expand the Phase 1 entry in [`2026-09-02-project-roadmap-phases-1-7.md`](./2026-09-02-project-roadmap-phases-1-7.md) into a full step-by-step plan via `writing-plans`, using this file's actual outcomes (exact file paths, exact function names) as its starting context.
