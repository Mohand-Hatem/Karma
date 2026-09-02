# Deploying Karma to Vercel (Frontend & Backend)

This guide documents how to deploy both the **Next.js Web Frontend** (`apps/web`) and the **Express Serverless API** (`apps/api`) to Vercel as two connected projects from the same monorepo.

---

## Project 1: Backend API (`apps/api`)

### 1. Import to Vercel
- **Root Directory**: `apps/api`
- **Framework Preset**: `Other`
- **Build Command**: `npm run build`
- **Output Directory**: `dist` (or leave default)

### 2. Vercel Serverless Function Configuration
The repository includes:
- [`apps/api/vercel.json`](file:///c:/Users/Mohand/Documents/GitHub/Karma/apps/api/vercel.json): Rewrites all traffic `/(.*)` to `/api`.
- [`apps/api/api/index.ts`](file:///c:/Users/Mohand/Documents/GitHub/Karma/apps/api/api/index.ts): Serverless entry point exporting the Express application.

### 3. Environment Variables for API
Set the following in the Vercel Dashboard for the API project:
```env
NODE_ENV=production
PORT=4000
WEB_URL=https://<your-web-project>.vercel.app
DATABASE_URL=<your-supabase-transaction-pooler-url>
DIRECT_URL=<your-supabase-session-pooler-url>
BETTER_AUTH_SECRET=<generate-a-strong-random-secret>
BETTER_AUTH_URL=https://<your-api-project>.vercel.app
AUTH_TRUSTED_ORIGINS=https://<your-web-project>.vercel.app
ENABLE_DEMO_LOGIN=true
```

---

## Project 2: Frontend Web App (`apps/web`)

### 1. Import to Vercel
- **Root Directory**: `apps/web`
- **Framework Preset**: `Next.js`
- **Build Command**: `next build` (default)
- **Output Directory**: `.next` (default)

### 2. Environment Variables for Web App
Set the following in the Vercel Dashboard for the Web project:
```env
NEXT_PUBLIC_API_URL=https://<your-api-project>.vercel.app
NEXT_PUBLIC_BETTER_AUTH_URL=https://<your-api-project>.vercel.app
```

---

## CORS & Cookie Domain Linking

1. Once both projects are deployed:
   - Make sure `WEB_URL` and `AUTH_TRUSTED_ORIGINS` in the API project match the exact Vercel URL of the Web app (e.g. `https://karma-web.vercel.app`).
2. For custom domains (e.g. `app.karma.com` and `api.karma.com`), set `AUTH_COOKIE_DOMAIN=.karma.com` in the API environment variables so the session cookie shares seamlessly.
