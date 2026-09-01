import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    env: {
      NODE_ENV: 'test',
      WEB_URL: 'http://localhost:3000',
    },
  },
})
