import type { PrismaClient, Prisma } from '@prisma/client'
import { BadRequestError, ConflictError, NotFoundError } from '../../middleware/error-handler'
import { getCurrentOrganizationId } from '../../tenant/context'
import {
  createResultSnapshot,
  findActiveResult,
  findResultById,
  listStudentResults as queryStudentResults,
  type PublishResultData,
} from './result.repository'

export async function publishResult(prisma: PrismaClient, data: PublishResultData) {
  // 1. Check if active result already published
  const existing = await findActiveResult(
    prisma,
    data.studentId,
    data.classSubjectId,
    data.termId
  )
  if (existing) {
    throw new ConflictError(
      'Result already exists for this student and subject. Issue a correction to revise published grades.'
    )
  }

  return createResultSnapshot(prisma, {
    ...data,
    version: 1,
  })
}

// Immutable correction: increments version, links superseded, writes audit log in 1 transaction
export async function correctResult(
  prisma: PrismaClient,
  params: {
    priorResultId: string
    newScore: number
    newLetterGrade?: string
    newBreakdown: Prisma.InputJsonValue
    correctionReason: string
    actorUserId: string
  }
) {
  if (!params.correctionReason || params.correctionReason.trim().length === 0) {
    throw new BadRequestError('Correction reason is mandatory when revising a published result')
  }

  const organizationId = getCurrentOrganizationId()

  return prisma.$transaction(async (tx) => {
    // 1. Fetch prior result
    const prior = await tx.result.findFirst({
      where: { id: params.priorResultId },
    })
    if (!prior) {
      throw new NotFoundError(`Result ${params.priorResultId} not found`)
    }
    if (prior.supersededAt) {
      throw new BadRequestError('This result version has already been superseded')
    }

    const nextVersion = prior.version + 1

    // 2. Insert new corrected result row
    const correctedResult = await tx.result.create({
      data: {
        organizationId,
        studentId: prior.studentId,
        classSubjectId: prior.classSubjectId,
        termId: prior.termId,
        version: nextVersion,
        score: params.newScore,
        letterGrade: params.newLetterGrade,
        breakdown: params.newBreakdown,
        publishedById: params.actorUserId,
        correctionReason: params.correctionReason,
      },
      include: {
        student: true,
        classSubject: { include: { subject: true } },
        term: true,
      },
    })

    // 3. Mark previous row as superseded
    await tx.result.update({
      where: { id: prior.id },
      data: {
        supersededAt: new Date(),
        supersededById: correctedResult.id,
      },
    })

    // 4. Append-only AuditLog
    await tx.auditLog.create({
      data: {
        organizationId,
        actorUserId: params.actorUserId,
        action: 'RESULT_CORRECTED',
        resourceType: 'Result',
        resourceId: correctedResult.id,
        reason: params.correctionReason,
        before: {
          score: prior.score.toString(),
          version: prior.version,
          breakdown: prior.breakdown as object,
        },
        after: {
          score: params.newScore,
          version: nextVersion,
          breakdown: params.newBreakdown as object,
        },
      },
    })

    return correctedResult
  })
}

export async function getResultById(prisma: PrismaClient, id: string) {
  const result = await findResultById(prisma, id)
  if (!result) {
    throw new NotFoundError(`Result ${id} not found`)
  }
  return result
}

export async function listStudentResults(prisma: PrismaClient, studentId: string, termId?: string) {
  return queryStudentResults(prisma, studentId, termId)
}
