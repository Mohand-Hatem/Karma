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

  it('signs in with the created account and retrieves an active session', async () => {
    const app = createApp()
    const agent = request.agent(app)
    const email = `phase0-roundtrip-${Date.now()}@karma.dev`

    await agent.post('/api/auth/sign-up/email').send({
      email,
      name: 'Roundtrip Test',
      password: 'correct-horse-battery-staple',
    })

    const signInRes = await agent.post('/api/auth/sign-in/email').send({
      email,
      password: 'correct-horse-battery-staple',
    })
    expect(signInRes.status).toBe(200)

    const sessionRes = await agent.get('/api/auth/get-session')
    expect(sessionRes.status).toBe(200)
    expect(sessionRes.body.user.email).toBe(email)
  })
})
