import { beforeAll, afterAll, describe, expect, it } from 'vitest'
import { PrismaClient } from '@prisma/client'
import { withTenantScope } from './prisma-extension'
import { runWithOrganization } from './context'

const rawPrisma = new PrismaClient()
const scopedPrisma = withTenantScope(rawPrisma)

let orgAPlanId: string
const orgAId = 'test-org-a'
const orgBId = 'test-org-b'

beforeAll(async () => {
  const plan = await rawPrisma.plan.create({
    data: { code: 'TEST_ISOLATION_' + Date.now(), name: 'Test Plan', maxStudents: 10, maxTeachers: 10, storageMb: 100, aiRequestsPerMonth: 10 },
  })
  orgAPlanId = plan.id

  await rawPrisma.subscription.create({
    data: {
      organizationId: orgAId,
      planId: orgAPlanId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400000),
    },
  })
  await rawPrisma.subscription.create({
    data: {
      organizationId: orgBId,
      planId: orgAPlanId,
      status: 'ACTIVE',
      currentPeriodStart: new Date(),
      currentPeriodEnd: new Date(Date.now() + 86400000),
    },
  })
})

afterAll(async () => {
  await rawPrisma.subscription.deleteMany({ where: { organizationId: { in: [orgAId, orgBId] } } })
  await rawPrisma.plan.delete({ where: { id: orgAPlanId } })
  await rawPrisma.$disconnect()
})

describe('tenant Prisma extension', () => {
  it('scopes findMany to the current organization only', async () => {
    const rows = await runWithOrganization(orgAId, () => scopedPrisma.subscription.findMany())
    expect(rows).toHaveLength(1)
    expect(rows[0].organizationId).toBe(orgAId)
  })

  it('never returns another organization row via findFirst/findUnique', async () => {
    const orgBRow = await rawPrisma.subscription.findFirstOrThrow({ where: { organizationId: orgBId } })
    const result = await runWithOrganization(orgAId, () =>
      scopedPrisma.subscription.findFirst({ where: { id: orgBRow.id } })
    )
    expect(result).toBeNull()
  })

  it('injects organizationId on create automatically', async () => {
    const created = await runWithOrganization(orgAId, () =>
      scopedPrisma.subscription.create({
        data: {
          planId: orgAPlanId,
          status: 'TRIALING',
          currentPeriodStart: new Date(),
          currentPeriodEnd: new Date(Date.now() + 86400000),
        } as never,
      })
    )
    expect(created.organizationId).toBe(orgAId)
  })

  it('throws if used outside a tenant context', async () => {
    await expect(scopedPrisma.subscription.findMany()).rejects.toThrow(/tenant context/i)
  })
})
