# Karma — Environment Variable Reference

> Every variable the project will need, what it does, and where it is consumed.
>
> **No real secrets appear in this file, and none may ever be committed.** Placeholders only.
>
> Validate the whole set at boot with a Zod schema and **refuse to start on failure**. A process that
> boots with a missing key and fails three screens later is worse than one that refuses immediately.

---

## 1. Layout

| File | Committed | Purpose |
|---|---|---|
| `.env.example` | ✅ Yes | Every key with a placeholder value. The contract |
| `apps/api/.env` | ❌ Never | Local API secrets |
| `apps/web/.env.local` | ❌ Never | Local web config |
| GitHub Actions secrets | ❌ Never | CI values |
| Host dashboards (Vercel / Railway) | ❌ Never | Production values |

`.gitignore` must cover `.env`, `.env.local`, `.env.*.local`, and `*.pem` **before the first
commit** — a secret committed once is a secret leaked permanently, even after removal.

**Only variables prefixed `NEXT_PUBLIC_` reach the browser.** Everything else is server-only. Putting
a provider key behind `NEXT_PUBLIC_` publishes it.

---

## 2. Core

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `NODE_ENV` | Runtime mode | ✓ | api, web | `development` |
| `PORT` | API listen port | ✓ | api | `4000` |
| `API_URL` | Canonical API origin | ✓ | api | `http://localhost:4000` |
| `WEB_URL` | Canonical web origin — used for CORS, cookies, and email links | ✓ | api | `http://localhost:3000` |
| `NEXT_PUBLIC_API_URL` | API base for the browser client | ✓ | web | `http://localhost:4000/api/v1` |
| `LOG_LEVEL` | pino level | – | api | `debug` |

---

## 3. Database — Supabase PostgreSQL

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `DATABASE_URL` | **Pooled** connection for the application | ✓ | api, Prisma | `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1` |
| `DIRECT_URL` | **Direct** connection for migrations | ✓ | Prisma CLI | `postgresql://postgres.<ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres` |
| `SHADOW_DATABASE_URL` | Shadow DB for `prisma migrate dev` | – | Prisma CLI | `postgresql://.../postgres_shadow` |

> **This is the first thing that breaks on Supabase + Prisma.** Migrations cannot run through
> pgBouncer's transaction mode, so `prisma migrate` needs `DIRECT_URL` while the running app uses the
> pooled `DATABASE_URL`. Both belong in the `datasource` block:
>
> ```prisma
> datasource db {
>   provider  = "postgresql"
>   url       = env("DATABASE_URL")
>   directUrl = env("DIRECT_URL")
> }
> ```
>
> Note the `:6543` vs `:5432` port difference — that is the whole distinction, and it is easy to
> copy the wrong one from the Supabase dashboard.

**pgvector** must be enabled once per database (`CREATE EXTENSION IF NOT EXISTS vector;`). It is
enabled through a migration, not an environment variable.

---

## 4. Authentication — Better Auth

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `BETTER_AUTH_SECRET` | Signs sessions and tokens | ✓ | api | `<64-char random string>` |
| `BETTER_AUTH_URL` | Auth server base URL | ✓ | api | `http://localhost:4000` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Auth base for the client SDK | ✓ | web | `http://localhost:4000` |
| `AUTH_COOKIE_DOMAIN` | Parent domain for cross-subdomain cookies | ✓ (prod) | api | `.karma.app` |
| `AUTH_TRUSTED_ORIGINS` | Comma-separated CORS/redirect allowlist | ✓ | api | `http://localhost:3000` |
| `INVITATION_EXPIRY_HOURS` | Invitation validity | – | api | `168` |

> Generate the secret with `openssl rand -base64 48`. **Rotating it invalidates every active
> session** — expected in development, a deliberate action in production.
>
> `AUTH_COOKIE_DOMAIN` is the setting that decides whether cookie auth works in production at all.
> Web and API must share a parent domain (`karma.app` + `api.karma.app`) with the leading dot set
> here. Leave it **unset locally** — the Next.js rewrite proxy keeps development same-origin, and a
> cookie domain on `localhost` silently breaks sign-in.

---

## 5. File storage — Cloudinary

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `CLOUDINARY_CLOUD_NAME` | Account identifier | ✓ | api | `karma-dev` |
| `CLOUDINARY_API_KEY` | API key | ✓ | api | `123456789012345` |
| `CLOUDINARY_API_SECRET` | API secret | ✓ | api | `<secret>` |
| `CLOUDINARY_UPLOAD_FOLDER` | Namespace prefix | – | api | `karma/dev` |
| `MAX_UPLOAD_SIZE_MB` | Per-file ceiling | – | api | `10` |

> All three credentials are **server-only**. Uploads pass through the API (Multer memory storage →
> validation → Cloudinary), so the browser never holds a Cloudinary credential. There is no
> presigned-URL path by design.

---

## 6. Realtime — Firebase

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `FIREBASE_PROJECT_ID` | Project | ✓ | api | `karma-dev` |
| `FIREBASE_CLIENT_EMAIL` | Service account | ✓ | api | `firebase-adminsdk@karma-dev.iam.gserviceaccount.com` |
| `FIREBASE_PRIVATE_KEY` | Service account key | ✓ | api | `-----BEGIN PRIVATE KEY-----\n...` |
| `FIREBASE_DATABASE_URL` | RTDB instance | ✓ | api | `https://karma-dev-default-rtdb.firebaseio.com` |
| `NEXT_PUBLIC_FIREBASE_API_KEY` | Web SDK | ✓ | web | `AIza...` |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID` | Web SDK | ✓ | web | `karma-dev` |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL` | Web SDK | ✓ | web | `https://karma-dev-default-rtdb.firebaseio.com` |

> **`FIREBASE_PRIVATE_KEY` is the awkward one.** It contains literal `\n` sequences that must be
> unescaped at load time (`key.replace(/\\n/g, '\n')`), and some hosts mangle multi-line values.
> Base64-encoding the whole key and decoding at boot avoids the problem entirely.
>
> The `NEXT_PUBLIC_` Firebase values are **safe to expose** — they identify the project, they do not
> authorize anything. Access is governed by Firebase security rules plus the custom token the API
> mints. The service-account variables are the opposite: never expose them.

---

## 7. AI

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `AI_PROVIDER` | Which SDK to load | ✓ | api | `anthropic` |
| `AI_API_KEY` | Provider key | ✓ | api | `<secret>` |
| `AI_MODEL_CHAT` | Answer-composing model | ✓ | api | `<provider model id>` |
| `AI_MODEL_ROUTER` | Cheap tool-selection model | – | api | `<small model id>` |
| `EMBEDDING_PROVIDER` | Embedding source | ✓ | api | `openai` |
| `EMBEDDING_API_KEY` | Embedding key | ✓ | api | `<secret>` |
| `EMBEDDING_MODEL` | Model | ✓ | api | `text-embedding-3-small` |
| `EMBEDDING_DIMENSIONS` | Vector width | ✓ | api, Prisma | `1536` |
| `AI_MAX_TOKENS_PER_REQUEST` | Per-response ceiling | ✓ | api | `2000` |
| `AI_RATE_LIMIT_PER_USER_PER_HOUR` | Abuse guard | ✓ | api | `20` |

> **`EMBEDDING_DIMENSIONS` is not really configurable.** It is pinned in the schema as
> `vector(1536)`. Changing it requires a migration and re-embedding every `DocumentChunk`. It appears
> here so the coupling is visible, not so it can be tuned.
>
> Both rate-limit variables are **required, not optional**. A public demo with an unmetered AI
> endpoint is an open invoice.

---

## 8. Email

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `EMAIL_PROVIDER` | Transport selection | ✓ | api | `resend` |
| `EMAIL_API_KEY` | Provider key | ✓ (prod) | api | `<secret>` |
| `EMAIL_FROM` | Sender address | ✓ | api | `Karma <noreply@karma.app>` |
| `EMAIL_REPLY_TO` | Reply address | – | api | `support@karma.app` |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASSWORD` | SMTP fallback | – | api | `localhost` / `1025` / – / – |

> Locally, point SMTP at **Mailpit or Mailhog on port 1025** and read invitation emails in a browser.
> Sending real mail from a development machine is slow and risks the sender reputation of the domain.

---

## 9. Demo & seed

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `ENABLE_DEMO_LOGIN` | Exposes the one-click role switcher | ✓ | api, web | `true` |
| `DEMO_ORGANIZATION_SLUG` | Which org demo accounts belong to | – | api | `karma-demo` |
| `DEMO_ADMIN_EMAIL` … `DEMO_PARENT_EMAIL` | The four demo accounts | – | api | `admin@demo.karma.app` |
| `DEMO_ACCOUNT_PASSWORD` | Shared demo password | – | api | `<generated>` |
| `SEED_RANDOM_SEED` | Deterministic seeding | – | api | `karma-2026` |
| `DEMO_RESET_ENABLED` | Allows the scheduled reset | – | api | `false` |

> `ENABLE_DEMO_LOGIN` must be **`false` in any environment holding real data**, and the demo-login
> route should not merely hide itself — it should not register at all when the flag is off. A hidden
> route is still a route.

---

## 10. Feature flags

| Variable | Purpose | Required | Used by | Placeholder |
|---|---|---|---|---|
| `ENABLE_AI` | Master switch for EduAI | – | api, web | `false` until Phase 6 |
| `ENABLE_RAG` | Document retrieval | – | api | `false` until Phase 6 |
| `ENABLE_REALTIME` | Firebase delivery; falls back to polling | – | api, web | `false` until Phase 4 |
| `ENABLE_QUEUE` | Redis/BullMQ workers | – | api | `false` until Phase 6 |

> These let Phase 0 deploy and stay deployed while later phases are unbuilt — which is the point of
> deploying from Phase 0.

---

## 11. Future — Phase 6 and beyond

Documented now so the shape is known; **not needed for the MVP**.

| Variable | Purpose | Phase |
|---|---|---|
| `REDIS_URL` | BullMQ connection | 6 |
| `QUEUE_CONCURRENCY` | Worker parallelism | 6 |
| `SENTRY_DSN` / `NEXT_PUBLIC_SENTRY_DSN` | Error tracking | 7 |
| `PAYMENT_PROVIDER` / `PAYMENT_API_KEY` / `PAYMENT_WEBHOOK_SECRET` | Billing | Post-MVP |

---

## 12. Boot-time validation

One schema per app, evaluated before the server or the build starts:

```ts
// apps/api/src/config/env.ts
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  // …
  ENABLE_DEMO_LOGIN: z.coerce.boolean().default(false),
})

export const env = envSchema.parse(process.env) // throws → process exits
```

Rules:

1. **Fail fast and loudly.** Never fall back to a default for a secret.
2. **Never log a resolved env object.** Log the *names* of missing keys, never their values.
3. `.env.example` is updated in the same commit as any new variable. A key that exists only in
   someone's local file is a key nobody else can run the project without.
4. Production adds cross-field checks: `ENABLE_DEMO_LOGIN` must be `false`, `AUTH_COOKIE_DOMAIN` must
   be set, and `BETTER_AUTH_SECRET` must not equal the example value.

---

## 13. Summary — services requiring an account

| Service | Free tier | Needed by | Blocking |
|---|---|---|---|
| Supabase | ✓ | Phase 0 | **Yes** |
| Cloudinary | ✓ | Phase 1 | Yes |
| Firebase | ✓ | Phase 4 | No |
| Email provider | ✓ | Phase 1 (Mailpit locally) | No |
| LLM provider | ✗ paid | Phase 6 | No |
| Vercel | ✓ | Phase 0 | Yes |
| API host | ✓ | Phase 0 | Yes |

Only Supabase and the two hosts block the start of work. Everything else can be deferred behind its
feature flag.
