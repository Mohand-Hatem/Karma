import type { UsageMetric } from '@prisma/client'
import { prisma, rawPrisma } from '../../db/prisma'
import { getCurrentOrganizationId } from '../../tenant/context'

export class LimitExceededError extends Error {
  constructor(public metric: UsageMetric, public limit: number) {
    super(`Plan limit reached for ${metric} (limit: ${limit})`)
  }
}

const LEVEL_METRICS: UsageMetric[] = ['STUDENTS', 'TEACHERS', 'STORAGE_MB']

function periodFor(metric: UsageMetric): string {
  if (LEVEL_METRICS.includes(metric)) return 'current'
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`
}

function limitFieldFor(metric: UsageMetric): 'maxStudents' | 'maxTeachers' | 'storageMb' | 'aiRequestsPerMonth' {
  switch (metric) {
    case 'STUDENTS':
      return 'maxStudents'
    case 'TEACHERS':
      return 'maxTeachers'
    case 'STORAGE_MB':
      return 'storageMb'
    case 'AI_REQUESTS':
      return 'aiRequestsPerMonth'
    default: {
      const _exhaustive: never = metric
      throw new Error(`Unhandled metric: ${_exhaustive}`)
    }
  }
}

async function currentPlanLimit(organizationId: string, metric: UsageMetric): Promise<number> {
  const subscription = await rawPrisma.subscription.findFirstOrThrow({
    where: { organizationId, status: 'ACTIVE' },
    include: { plan: true },
  })
  return subscription.plan[limitFieldFor(metric)]
}

export async function enforceLimit(metric: UsageMetric): Promise<void> {
  const organizationId = getCurrentOrganizationId()
  const period = periodFor(metric)
  const [limit, counter] = await Promise.all([
    currentPlanLimit(organizationId, metric),
    prisma.usageCounter.findUnique({ where: { organizationId_metric_period: { organizationId, metric, period } } }),
  ])
  const current = counter?.value ?? 0
  if (current >= limit) {
    throw new LimitExceededError(metric, limit)
  }
}

export async function incrementUsage(metric: UsageMetric, delta: number): Promise<void> {
  const organizationId = getCurrentOrganizationId()
  const period = periodFor(metric)
  await prisma.usageCounter.upsert({
    where: { organizationId_metric_period: { organizationId, metric, period } },
    create: { metric, period, value: delta } as never,
    update: { value: { increment: delta } },
  })
}
