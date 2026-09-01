# Karma — Technology & Library Inventory

> Complete dependency inventory with a status and a justification for each entry.
>
> **Status values:** `Required` (MVP cannot ship without it) · `Recommended` (strong default, minor
> alternatives exist) · `Optional` (add if a need appears) · `Future` (deliberately deferred to a
> named phase) · `Not Allowed` (rejected; reason recorded)
>
> The repository is currently **empty** — nothing below is installed. This is the target state.

---

## 1. Principles

1. **One library per problem.** Two libraries solving the same thing is a defect, not flexibility.
2. **Prefer the platform.** `Intl`, `fetch`, `AbortController`, and CSS logical properties replace
   several common dependencies outright.
3. **Popularity is not a justification.** Every row below answers "what breaks without it?"
4. **Deferred is not rejected.** `Future` rows have a named phase, not a vague "later."

---

## 2. Frontend

| Library | Area | Purpose | Why | Status | Alternative |
|---|---|---|---|---|---|
| `next` | Framework | App Router, RSC, routing, SSR | Decided. `[locale]` segment drives i18n and direction | Required | Remix, Vite SPA |
| `react` / `react-dom` | Framework | UI runtime | Peer of Next | Required | — |
| `typescript` | Language | Static types | Decided; shared contracts depend on it | Required | — |
| `tailwindcss` | Styling | Utility CSS | Decided. **v4** for native cascade layers and better logical-property ergonomics | Required | CSS Modules |
| `@tailwindcss/postcss`, `postcss`, `autoprefixer` | Styling | Build pipeline | Tailwind peers | Required | — |
| `tailwind-merge` | Styling | Resolve conflicting utility classes | Needed the moment components accept a `className` override | Required | Hand-rolled |
| `clsx` | Styling | Conditional class composition | 500 bytes; the alternative is string concatenation bugs | Required | Template literals |
| `class-variance-authority` | UI | Typed component variants | Makes `<Button variant size>` type-safe across ~30 primitives | Recommended | Manual prop maps |
| `@tanstack/react-query` | Server state | Fetching, caching, invalidation, pagination | Decided. Owns **all** server state | Required | SWR |
| `@tanstack/react-query-devtools` | DX | Cache inspection | Dev-only | Recommended | — |
| `axios` | HTTP | API client | Decided. Interceptors for 401 and error normalization; `withCredentials` for Better Auth cookies | Required | `fetch` wrapper |
| `zustand` | Client state | **UI shell state only** | Decided, with the §10 charter: sidebar, locale/direction, theme, command palette, drawers, form drafts. **Nothing fetchable or linkable** | Required | Context |
| `react-hook-form` | Forms | Uncontrolled form state | Decided. Minimal re-renders on large forms (quiz builder, timetable) | Required | Formik |
| `@hookform/resolvers` | Forms | Bridge RHF ↔ Zod | Lets the shared schema validate the form | Required | Manual |
| `zod` | Validation | Schema + inferred types | Decided. **Single source of truth**, shared with the API | Required | Yup, Valibot |
| `recharts` | Charts | Dashboards and trends | Decided. Composable, reasonable RTL handling | Required | Visx, Chart.js |
| `@tanstack/react-table` | Tables | Headless sorting, pagination, column control | ~12 data tables with server pagination; headless keeps our own markup and RTL control | Recommended | Hand-rolled |
| `framer-motion` | Animation | Transitions, drawers, list motion | Decided. **Use sparingly** — over-animation is what makes portfolio UIs look cheap | Required | CSS transitions |
| `lucide-react` | Icons | Icon set | One coherent family, tree-shakeable, RTL-mirrorable | Required | Heroicons |
| `next-intl` | i18n | Translation, routing, `Intl` formatting | Built for App Router; message typing; integrates with the `[locale]` segment | Required | `next-i18next`, `react-intl` |
| `date-fns` | Date/time | Formatting and arithmetic | Tree-shakeable; Arabic locale included | Required | Day.js |
| `@date-fns/tz` | Date/time | School-timezone conversion | Every date-only value resolves against the org timezone. **Not optional** — this is where timezone bugs live | Required | `Intl.DateTimeFormat` |
| `sonner` | Toasts | Transient feedback | Small, accessible, RTL-aware | Recommended | `react-hot-toast` |
| `@radix-ui/react-*` | UI primitives | Dialog, dropdown, tabs, tooltip, select, popover, switch, checkbox | Accessibility (focus trap, ARIA, keyboard) is weeks of work to redo badly. Unstyled — our design system stays ours | Required | Headless UI |
| `cmdk` | UI | Command palette | Only if the palette ships | Optional | Custom |
| `react-day-picker` | UI | Date picker | Radix has no date picker; this is the standard companion | Recommended | Native `<input type=date>` |
| `better-auth` | Auth | Client SDK | Session hooks and sign-in/out calls | Required | — |
| `next-themes` | Theming | Light/dark persistence | Handles the SSR flash correctly | Optional | Zustand + script |

### Frontend testing & tooling

| Library | Purpose | Status |
|---|---|---|
| `vitest` | Unit/component test runner — shares the Vite/ESM pipeline, faster than Jest | Required |
| `@testing-library/react` + `/user-event` + `/jest-dom` | Component testing from the user's perspective | Required |
| `@playwright/test` | E2E — the 5 Phase 1 happy paths | Required |
| `@axe-core/playwright` | Automated accessibility assertions in E2E | Recommended |
| `msw` | API mocking in component tests | Optional |

---

## 3. Backend

| Library | Area | Purpose | Why | Status | Alternative |
|---|---|---|---|---|---|
| Node.js 22 LTS | Runtime | — | Native `AsyncLocalStorage` (the tenant context depends on it), stable `fetch` | Required | Bun |
| `express` | Framework | HTTP routing, middleware | Decided. **v5** — async errors propagate to the error middleware without a wrapper | Required | Fastify |
| `typescript` | Language | Static types | Decided | Required | — |
| `tsx` | DX | TS execution in dev with watch | Faster than `ts-node` | Required | `ts-node-dev` |
| `tsup` | Build | Bundle to ESM/CJS for production | Zero-config esbuild wrapper | Recommended | `tsc` |
| `prisma` / `@prisma/client` | ORM | Schema, migrations, typed client | Decided. Hosts the **tenant extension** (§6.5) | Required | Drizzle |
| PostgreSQL 16 (Supabase) | Database | Primary datastore | Decided. Managed Postgres; **hosted Postgres only** — no Supabase Auth, no Supabase Storage | Required | Neon, RDS |
| `pgvector` | Vector | Embedding storage and ANN search | Decided. Same database, no second datastore. Declared `Unsupported("vector(1536)")`; queried via `$queryRaw` | Required | Pinecone |
| `better-auth` | Auth | Sessions, email/password, verification, reset | Decided. Mounted on Express as the single auth source | Required | Lucia, custom JWT |
| `better-auth/plugins` → `organization` | Auth | Organizations, members, invitations, custom roles | Supplies the tenancy identity tables and the invite flow. Karma roles configured as **custom roles**, not owner/admin/member | Required | Hand-built |
| `zod` | Validation | Request validation | Same schemas as the frontend, from `packages/shared` | Required | Joi |
| `multer` | Uploads | Multipart parsing (memory storage) | Decided. Buffer → validate → Cloudinary; nothing hits local disk | Required | Busboy |
| `cloudinary` | Storage | File storage + transformations | Decided. **No S3/R2/presigned** | Required | S3 |
| `file-type` | Security | Detect MIME from magic bytes | The client-declared MIME type is a claim, not evidence | Required | — |
| `firebase-admin` | Realtime | Write notification signals, mint custom tokens | Decided. **Signal only** — no domain data in Firebase | Required | Socket.IO |
| `pino` | Logging | Structured JSON logs | Decided | Required | Winston |
| `pino-http` | Logging | Request logging + request IDs | Correlates the log line with the API error response | Required | — |
| `pino-pretty` | DX | Readable dev logs | Dev-only | Recommended | — |
| `helmet` | Security | Security headers | One line, meaningful coverage | Required | Manual |
| `cors` | Security | Explicit allowlist + `credentials: true` | **Required for cookie auth to work at all** | Required | Manual |
| `express-rate-limit` | Security | Throttle auth, reset, invite, AI endpoints | AI endpoints on a public demo without this is a spending liability | Required | `rate-limiter-flexible` |
| `dotenv` | Config | Load `.env` in development | Required | — |
| `nodemailer` | Email | Transactional send | Provider-agnostic; swap transport without touching call sites | Recommended | Resend SDK |
| `@react-email/components` + `react-email` | Email | Typed, previewable templates | Invitations and resets need bilingual HTML; string concatenation is worse | Optional | Handlebars |
| `openai` *or* `@anthropic-ai/sdk` | AI | LLM calls, tool use, streaming, embeddings | Decided in principle; **exact provider is an open decision** (§Contradictions) | Required | Vercel AI SDK |

### Backend testing & tooling

| Library | Purpose | Status |
|---|---|---|
| `vitest` | Test runner — same tool as the frontend, one config idiom | Required |
| `supertest` | HTTP-level API assertions; **drives the authorization matrix suite** | Required |
| `@testcontainers/postgresql` | Real Postgres per test run | Recommended — a real DB is the only way to prove tenant isolation. Alternative: a dedicated Supabase test branch |

---

## 4. Shared / monorepo

| Item | Purpose | Status | Notes |
|---|---|---|---|
| **npm workspaces** | Monorepo | Required | Decided. No pnpm, no Turborepo — three packages do not need a task graph |
| `packages/shared` | Zod schemas + inferred types | Required | The reason the monorepo exists. API validates with them; web infers from them |
| `typescript` (root) | Shared compiler | Required | Base `tsconfig.json` extended by each app |
| `@total-typescript/tsconfig` | Sane strict base config | Optional | Or hand-write; `strict: true` is non-negotiable either way |
| `eslint` v9 + flat config | Linting | Required | CI gate |
| `typescript-eslint` | TS rules | Required | |
| `eslint-config-next` | Next.js rules | Required | |
| `eslint-plugin-tailwindcss` | Class ordering and validity | Recommended | |
| **`eslint-plugin-rtl-friendly`** *or* a custom rule | **Ban physical CSS properties** | Recommended | Catches `ml-4`/`text-left` at lint time instead of during an RTL review. High value for the effort |
| `prettier` + `prettier-plugin-tailwindcss` | Formatting | Required | |
| `husky` + `lint-staged` | Pre-commit hooks | Recommended | Keeps CI green cheaply |
| `@commitlint/*` | Commit message format | Optional | Only if conventional commits are wanted |

---

## 5. Infrastructure & DevOps

| Item | Purpose | Status | Notes |
|---|---|---|---|
| Supabase PostgreSQL | Managed database + pgvector | Required | **Two connection strings**: pooled `:6543` for the app, direct `:5432` for migrations |
| Cloudinary | File storage | Required | Free tier is sufficient for a demo |
| Firebase Realtime Database | Notification delivery signal | Required | Security rules live in the repo and are reviewed as code |
| GitHub Actions | CI from Phase 0 | Required | `npm ci` → ESLint → `tsc --noEmit` → tests → build |
| Vercel | Web hosting | Recommended | |
| Railway / Render / Fly | API hosting | Recommended | Must share a parent domain with the web app for cookies |
| Docker + Docker Compose | Local Postgres + pgvector | **Optional** | Supabase can serve development directly. Compose is only worth it for offline work or a fast test database |
| Sentry | Error tracking | Future — Phase 7 | |
| Redis + BullMQ | Queue for document processing and embeddings | **Future — Phase 6** | Explicitly not in the MVP. Redis being present is **not** a reason to start caching |
| Email provider (Resend / SES / Postmark) | Transactional delivery | Required | Provider open; `nodemailer` keeps it swappable |
| LLM provider | EduAI | Required | See open decisions |

---

## 6. Not Allowed

Rejected with reasons, so they are not revisited by accident.

| Technology | Why not |
|---|---|
| Microservices | A modular monolith with clear module boundaries is correct at this size. Distribution buys nothing and costs everything |
| GraphQL / tRPC | REST plus shared Zod contracts already gives type safety. GraphQL adds a resolver layer and N+1 risk; tRPC removes the REST API design that is part of the point |
| Socket.IO / SSE | The only real-time need is notification delivery, and Firebase covers it. **A second transport is banned** |
| Redis (as a cache) | No measured performance problem exists. Caching before measurement is how stale-data bugs are introduced |
| Kafka / gRPC | Wildly out of proportion to a single-node monolith |
| Redux | TanStack Query owns server state, the URL owns navigable state, Zustand owns UI shell state. There is nothing left for Redux to do |
| S3 / R2 / presigned URLs | Cloudinary is the decision. One storage path, not two |
| Supabase Auth | Better Auth is the decision. Two auth systems is the worst possible outcome |
| Supabase Storage | Same reason as S3 |
| A second vector database | pgvector lives in the database that already holds the tenant filter. A separate store would need its own isolation logic — a new place for tenant leaks |
| Component kits (MUI, Chakra, Ant, shadcn-as-dependency) | The design system is the portfolio artifact. Radix primitives + Tailwind keep the visual identity ours |
| `moment.js` | Deprecated, mutable, large |
| `lodash` | Modern JS covers it; a targeted helper beats 70 KB |
| Multiple state libraries | One per problem, per §1 |

---

## 7. Phase mapping

| Phase | Introduces |
|---|---|
| **0** | Next, Express, TS, Tailwind, Prisma, Supabase, Better Auth (+organization), Zod, shared package, ESLint/Prettier, Vitest, pino, helmet, cors, GitHub Actions |
| **1** | React Query, Axios, Zustand, RHF, Radix, lucide, next-intl, date-fns, sonner, Supertest, Playwright, Testcontainers |
| **2** | (no new dependencies — timetable and attendance use what exists) |
| **3** | TanStack Table, react-day-picker |
| **4** | firebase-admin, nodemailer, react-email |
| **5** | Recharts |
| **6** | LLM SDK, pgvector queries, **Redis + BullMQ** |
| **7** | Sentry, axe-core |

Each phase should add the smallest possible set. If a phase wants a library not listed here, that is
a decision to record in this file first.

---

## 8. Open technology decisions

Listed here rather than silently chosen.

| # | Decision | Options | Recommendation |
|---|---|---|---|
| 1 | **LLM provider** | Anthropic (Claude) · OpenAI · Google | Either of the first two. Both have mature tool calling and streaming. **Embeddings**: OpenAI `text-embedding-3-small` is the cheap default — note that the `vector(1536)` dimension in the schema follows from this choice and changing provider means re-embedding |
| 2 | **Testcontainers vs a Supabase test branch** | Docker-based ephemeral Postgres · a dedicated remote test database | Testcontainers for local isolation and parallel-safe CI; requires Docker in the CI runner |
| 3 | **Email provider** | Resend · SES · Postmark | Resend for developer experience on a demo project; `nodemailer` keeps it swappable |
| 4 | **Docker Compose locally** | Include · skip | Skip initially. Supabase serves development fine, and one less moving part matters more than offline capability |
| 5 | **Component testing depth** | Testing Library everywhere · Playwright only | Testing Library for logic-bearing components; do not test presentational markup |
