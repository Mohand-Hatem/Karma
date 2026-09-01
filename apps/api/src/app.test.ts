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
