import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from '../config/env'
import { withTenantScope } from '../tenant/prisma-extension'

const adapter = new PrismaPg(env.DATABASE_URL)
const rawPrisma = new PrismaClient({ adapter })

export const prisma = withTenantScope(rawPrisma)
export { rawPrisma }
