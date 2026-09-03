import type { PrismaClient, Result, Prisma } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

export type PublishResultData = {
  studentId: string
  classSubjectId: string
  termId: string
  version?: number
  score: number
  letterGrade?: string
  breakdown: Prisma.InputJsonValue
  comment?: string
  publishedById: string
  correctionReason?: string
}

export async function createResultSnapshot(prisma: PrismaClient, data: PublishResultData): Promise<Result> {
  const organizationId = getCurrentOrganizationId()
  return prisma.result.create({
    data: {
      organizationId,
      studentId: data.studentId,
      classSubjectId: data.classSubjectId,
      termId: data.termId,
      version: data.version ?? 1,
      score: data.score,
      letterGrade: data.letterGrade,
      breakdown: data.breakdown,
      comment: data.comment,
      publishedById: data.publishedById,
      correctionReason: data.correctionReason,
    },
    include: {
      student: true,
      classSubject: { include: { subject: true, class: true } },
      term: true,
    },
  })
}

export async function findActiveResult(
  prisma: PrismaClient,
  studentId: string,
  classSubjectId: string,
  termId: string
): Promise<Result | null> {
  return prisma.result.findFirst({
    where: {
      studentId,
      classSubjectId,
      termId,
      supersededAt: null,
    },
    orderBy: { version: 'desc' },
    include: {
      student: true,
      classSubject: { include: { subject: true } },
      term: true,
    },
  })
}

export async function findResultById(prisma: PrismaClient, id: string): Promise<Result | null> {
  return prisma.result.findFirst({
    where: { id },
    include: {
      student: true,
      classSubject: { include: { subject: true, class: true } },
      term: true,
      supersededBy: true,
    },
  })
}

export async function listStudentResults(prisma: PrismaClient, studentId: string, termId?: string) {
  return prisma.result.findMany({
    where: {
      studentId,
      termId,
      supersededAt: null,
    },
    include: {
      classSubject: { include: { subject: true } },
      term: true,
    },
    orderBy: { publishedAt: 'desc' },
  })
}
