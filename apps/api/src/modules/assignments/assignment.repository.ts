import type { PrismaClient, Assignment, AssignmentStatus, AssignmentSubmission, SubmissionStatus } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

export type CreateAssignmentInput = {
  classSubjectId: string
  gradeCategoryId?: string
  title: string
  titleAr?: string
  description?: string
  instructions?: string
  maxScore: number
  dueAt: Date
  lateUntil?: Date
  allowLateSubmission?: boolean
  status?: AssignmentStatus
  createdById: string // Teacher.id
}

export type CreateSubmissionInput = {
  assignmentId: string
  studentId: string
  content?: string
  submittedAt: Date
  status: SubmissionStatus
}

export async function createAssignment(prisma: PrismaClient, data: CreateAssignmentInput): Promise<Assignment> {
  const organizationId = getCurrentOrganizationId()
  return prisma.assignment.create({
    data: {
      organizationId,
      classSubjectId: data.classSubjectId,
      gradeCategoryId: data.gradeCategoryId,
      title: data.title,
      titleAr: data.titleAr,
      description: data.description,
      instructions: data.instructions,
      maxScore: data.maxScore,
      dueAt: data.dueAt,
      lateUntil: data.lateUntil,
      allowLateSubmission: data.allowLateSubmission ?? true,
      status: data.status ?? 'DRAFT',
      publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      createdById: data.createdById,
    },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
          teacher: true,
        },
      },
    },
  })
}

export async function findAssignmentById(prisma: PrismaClient, id: string) {
  return prisma.assignment.findFirst({
    where: { id },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
          teacher: true,
        },
      },
      resources: { include: { fileAsset: true } },
      submissions: {
        include: {
          student: true,
        },
      },
    },
  })
}

export async function listAssignments(
  prisma: PrismaClient,
  filter: { classSubjectId?: string; status?: AssignmentStatus }
) {
  const where: Record<string, unknown> = {}
  if (filter.classSubjectId) where.classSubjectId = filter.classSubjectId
  if (filter.status) where.status = filter.status

  return prisma.assignment.findMany({
    where,
    orderBy: { dueAt: 'asc' },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
        },
      },
      _count: {
        select: { submissions: true },
      },
    },
  })
}

export async function createSubmission(
  prisma: PrismaClient,
  data: CreateSubmissionInput
): Promise<AssignmentSubmission> {
  const organizationId = getCurrentOrganizationId()
  return prisma.assignmentSubmission.create({
    data: {
      organizationId,
      assignmentId: data.assignmentId,
      studentId: data.studentId,
      content: data.content,
      submittedAt: data.submittedAt,
      status: data.status,
    },
    include: {
      student: true,
      assignment: true,
    },
  })
}

export async function findSubmission(
  prisma: PrismaClient,
  assignmentId: string,
  studentId: string
): Promise<AssignmentSubmission | null> {
  return prisma.assignmentSubmission.findUnique({
    where: {
      assignmentId_studentId: {
        assignmentId,
        studentId,
      },
    },
    include: {
      student: true,
      assignment: true,
    },
  })
}

export async function findSubmissionById(
  prisma: PrismaClient,
  id: string
) {
  return prisma.assignmentSubmission.findFirst({
    where: { id },
    include: {
      student: true,
      assignment: {
        include: {
          classSubject: true,
        },
      },
    },
  })
}

export async function gradeSubmissionRecord(
  prisma: PrismaClient,
  id: string,
  data: {
    score: number
    feedback?: string
    gradedById: string
  }
): Promise<AssignmentSubmission> {
  return prisma.assignmentSubmission.update({
    where: { id },
    data: {
      score: data.score,
      feedback: data.feedback,
      gradedById: data.gradedById,
      gradedAt: new Date(),
      status: 'GRADED',
    },
    include: {
      student: true,
      assignment: true,
      gradedBy: true,
    },
  })
}
