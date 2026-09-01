import { describe, expect, it } from 'vitest'
import { HealthResponseSchema } from './health'

describe('HealthResponseSchema', () => {
  it('accepts a valid health payload', () => {
    const result = HealthResponseSchema.safeParse({ status: 'ok', timestamp: '2026-09-02T00:00:00.000Z' })
    expect(result.success).toBe(true)
  })

  it('rejects an invalid status', () => {
    const result = HealthResponseSchema.safeParse({ status: 'nope', timestamp: '2026-09-02T00:00:00.000Z' })
    expect(result.success).toBe(false)
  })
})
