import type { PrismaClient } from '@prisma/client'
import { getCurrentOrganizationId } from './context'

// Models exempt from tenant scoping: Better Auth's own tables (managed by the library)
// and Plan (platform-level, shared across all organizations).
const EXEMPT_MODELS = new Set(['Plan', 'User', 'Session', 'Account', 'Verification', 'Organization', 'Member', 'Invitation'])

const READ_OPS = new Set(['findFirst', 'findFirstOrThrow', 'findMany', 'findUnique', 'findUniqueOrThrow', 'count', 'aggregate', 'groupBy'])
const WRITE_ONE_OPS = new Set(['create'])
const WRITE_MANY_OPS = new Set(['updateMany', 'deleteMany'])
const WRITE_WHERE_OPS = new Set(['update', 'delete', 'upsert'])

export function withTenantScope(prisma: PrismaClient) {
  return prisma.$extends({
    name: 'tenant-scope',
    query: {
      $allModels: {
        async $allOperations({ model, operation, args, query }) {
          if (!model || EXEMPT_MODELS.has(model)) {
            return query(args)
          }

          const organizationId = getCurrentOrganizationId()
          const a = args as Record<string, unknown>

          if (READ_OPS.has(operation) || WRITE_MANY_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), organizationId }
          }

          if (WRITE_ONE_OPS.has(operation)) {
            a.data = { ...(a.data as object), organizationId }
          }

          if (WRITE_WHERE_OPS.has(operation)) {
            a.where = { ...(a.where as object | undefined), organizationId }
            if ('create' in a) {
              a.create = { ...(a.create as object), organizationId }
            }
          }

          return query(a as never)
        },
      },
    },
  }) as unknown as PrismaClient
}
