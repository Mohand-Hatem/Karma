import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      WEB_URL: 'http://localhost:3000',
      DATABASE_URL: 'postgresql://postgres:postgres@localhost:5432/postgres',
      DIRECT_URL: 'postgresql://postgres:postgres@localhost:5432/postgres',
    },
  },
})
