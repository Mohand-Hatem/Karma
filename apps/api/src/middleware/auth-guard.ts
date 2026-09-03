import type { Request, Response, NextFunction } from 'express'
import { fromNodeHeaders } from 'better-auth/node'
export type Role = 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT' | 'STAFF'
import { auth } from '../auth/auth'
import { rawPrisma } from '../db/prisma'
import { runWithOrganization } from '../tenant/context'
import { BadRequestError, ForbiddenError, UnauthorizedError } from './error-handler'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      session?: {
        user: {
          id: string
          email: string
          name: string
          role?: string
          [key: string]: unknown
        }
        session: {
          id: string
          userId: string
          activeOrganizationId?: string | null
          [key: string]: unknown
        }
      } | null
      organizationId?: string
      member?: {
        id: string
        role: Role
        organizationId: string
        userId: string
      } | null
    }
  }
}

// 1. Session resolution (populates req.session)
export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    })
    req.session = session as Express.Request['session']
    next()
  } catch (err) {
    req.log?.error({ err }, 'failed to resolve auth session')
    next(err)
  }
}

// 2. Strict Authentication Guard
export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  if (!req.session?.user) {
    throw new UnauthorizedError('Authentication required')
  }
  next()
}

// 3. Multi-Tenant Context Resolver (sets up AsyncLocalStorage and extracts org membership)
export async function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  const orgIdHeader = req.headers['x-organization-id']
  const orgId = typeof orgIdHeader === 'string' ? orgIdHeader : req.session?.session?.activeOrganizationId

  if (!orgId) {
    throw new BadRequestError('Organization ID is required in x-organization-id header')
  }

  req.organizationId = orgId

  // If user is authenticated, resolve membership role
  if (req.session?.user) {
    const member = await rawPrisma.member.findFirst({
      where: {
        organizationId: orgId,
        userId: req.session.user.id,
      },
    })
    req.member = member as Express.Request['member']
  }

  runWithOrganization(orgId, () => next())
}

// 4. Role-Based Access Control (RBAC) Guard
export function requireRole(allowedRoles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.member || !allowedRoles.includes(req.member.role)) {
      throw new ForbiddenError(
        `Insufficient permissions. Required one of: ${allowedRoles.join(', ')}`
      )
    }
    next()
  }
}
