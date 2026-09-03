import { describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'

describe('Swagger Documentation Endpoints', () => {
  const app = createApp()

  it('GET /docs.json returns valid OpenAPI 3.0 specification', async () => {
    const res = await request(app).get('/docs.json')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('application/json')
    expect(res.body.openapi).toBe('3.0.3')
    expect(res.body.info.title).toBe('Karma School Management API')
    expect(res.body.paths['/healthz']).toBeDefined()
    expect(res.body.components.securitySchemes.sessionCookie).toBeDefined()
    expect(res.body.components.securitySchemes.tenantHeader).toBeDefined()
  })

  it('GET /docs/ returns Swagger UI HTML interface', async () => {
    const res = await request(app).get('/docs/')
    expect(res.status).toBe(200)
    expect(res.headers['content-type']).toContain('text/html')
    expect(res.text).toContain('Swagger UI')
  })
})
