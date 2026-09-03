import path from 'node:path'
import dotenv from 'dotenv'
import { z } from 'zod'

// Ensure .env is loaded whether run from repo root or apps/api directory
dotenv.config({ path: path.resolve(import.meta.dirname, '../../.env') })
dotenv.config()

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().default(4000),
  WEB_URL: z.string().url(),
  DATABASE_URL: z.string().url(),
  DIRECT_URL: z.string().url(),
  BETTER_AUTH_SECRET: z.string().min(32),
  BETTER_AUTH_URL: z.string().url(),
  AUTH_TRUSTED_ORIGINS: z.string().transform((s) => s.split(',')),
})

export const env = envSchema.parse(process.env)
