import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'

describe('Better Auth mount', () => {
  it('creates a user via sign-up and returns a session cookie', async () => {
    const app = createApp()
    const res = await request(app)
      .post('/api/auth/sign-up/email')
      .send({ email: `phase0-test-${Date.now()}@karma.dev`, name: 'Phase 0 Test', password: 'correct-horse-battery-staple' })

    expect(res.status).toBe(200)
    expect(res.headers['set-cookie']).toBeDefined()
  })
})
