import { beforeAll, afterAll, beforeEach, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { runWithOrganization } from '../../tenant/context'
import { enforceLimit, incrementUsage, LimitExceededError } from './limits'

const orgId = `test-org-limits-${Date.now()}`
let planId: string

beforeAll(async () => {
  const org = await rawPrisma.organization.create({ data: { id: orgId, name: 'Limits Test Org', slug: `limits-${Date.now()}` } })
  const plan = await rawPrisma.plan.create({
    data: { code: `LIMITS-TEST-${Date.now()}`, name: 'Limits Test Plan', maxStudents: 2, maxTeachers: 5, storageMb: 100, aiRequestsPerMonth: 10 },
  })
  planId = plan.id
  await rawPrisma.subscription.create({
    data: { organizationId: org.id, planId, status: 'ACTIVE', currentPeriodStart: new Date(), currentPeriodEnd: new Date(Date.now() + 86400000) },
  })
})

afterAll(async () => {
  await rawPrisma.usageCounter.deleteMany({ where: { organizationId: orgId } })
  await rawPrisma.subscription.deleteMany({ where: { organizationId: orgId } })
  await rawPrisma.organization.delete({ where: { id: orgId } })
  await rawPrisma.plan.delete({ where: { id: planId } })
  await rawPrisma.$disconnect()
})

beforeEach(async () => {
  await rawPrisma.usageCounter.deleteMany({ where: { organizationId: orgId } })
})

describe('enforceLimit', () => {
  it('allows the action when usage is below the plan limit', async () => {
    await expect(runWithOrganization(orgId, () => enforceLimit('STUDENTS'))).resolves.not.toThrow()
  })

  it('throws LimitExceededError once usage reaches the plan limit', async () => {
    await runWithOrganization(orgId, () => incrementUsage('STUDENTS', 2))
    await expect(runWithOrganization(orgId, () => enforceLimit('STUDENTS'))).rejects.toThrow(LimitExceededError)
  })
})

describe('incrementUsage', () => {
  it('creates the counter row on first use', async () => {
    await runWithOrganization(orgId, () => incrementUsage('TEACHERS', 1))
    const row = await rawPrisma.usageCounter.findUnique({
      where: { organizationId_metric_period: { organizationId: orgId, metric: 'TEACHERS', period: 'current' } },
    })
    expect(row?.value).toBe(1)
  })
})
