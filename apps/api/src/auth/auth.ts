import { betterAuth } from 'better-auth'
import { prismaAdapter } from 'better-auth/adapters/prisma'
import { organization } from 'better-auth/plugins'
import { rawPrisma } from '../db/prisma'
import { env } from '../config/env'
import { ac, adminRole, teacherRole, studentRole, parentRole } from './roles'

export const auth = betterAuth({
  database: prismaAdapter(rawPrisma, { provider: 'postgresql' }),
  secret: env.BETTER_AUTH_SECRET,
  baseURL: env.BETTER_AUTH_URL,
  trustedOrigins: env.AUTH_TRUSTED_ORIGINS,
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  plugins: [
    organization({
      ac,
      roles: {
        ADMIN: adminRole,
        TEACHER: teacherRole,
        STUDENT: studentRole,
        PARENT: parentRole,
      },
    }),
  ],
})
