import { PrismaClient } from '@prisma/client'
import { withTenantScope } from '../tenant/prisma-extension'

const rawPrisma = new PrismaClient()

export const prisma = withTenantScope(rawPrisma)
export { rawPrisma }
