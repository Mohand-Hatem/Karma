import { defineConfig } from 'vitest/config'
import 'dotenv/config'

export default defineConfig({
  test: {
    environment: 'node',
    testTimeout: 30000,
    hookTimeout: 30000,
    env: {
      NODE_ENV: 'test',
      PORT: '4000',
      API_URL: 'http://localhost:4000',
      WEB_URL: 'http://localhost:3000',
      NEXT_PUBLIC_API_URL: 'http://localhost:4000',
      DATABASE_URL:
        process.env.DATABASE_URL ||
        'postgresql://postgres.btssglzvntecsualtpnm:KarmaSchool123%40@aws-1-eu-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1',
      DIRECT_URL:
        process.env.DIRECT_URL ||
        'postgresql://postgres.btssglzvntecsualtpnm:KarmaSchool123%40@aws-1-eu-west-1.pooler.supabase.com:5432/postgres',
      BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET || 'test-better-auth-secret-min-32-chars-long-1234567890',
      BETTER_AUTH_URL: 'http://localhost:4000',
      NEXT_PUBLIC_BETTER_AUTH_URL: 'http://localhost:4000',
      AUTH_TRUSTED_ORIGINS: 'http://localhost:3000',
      ENABLE_DEMO_LOGIN: 'true',
    },
  },
})
