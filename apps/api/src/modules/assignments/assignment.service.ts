import type { PrismaClient, AssignmentStatus } from '@prisma/client'
import { BadRequestError, ConflictError, ForbiddenError, NotFoundError } from '../../middleware/error-handler'
import {
  createAssignment,
  findAssignmentById,
  listAssignments,
  createSubmission,
  findSubmission,
  findSubmissionById,
  gradeSubmissionRecord,
  type CreateAssignmentInput,
} from './assignment.repository'

export async function createAssignmentRecord(
  prisma: PrismaClient,
  input: CreateAssignmentInput,
  actorTeacherId?: string
) {
  const classSubject = await prisma.classSubject.findFirst({
    where: { id: input.classSubjectId },
  })
  if (!classSubject) {
    throw new NotFoundError(`Class subject ${input.classSubjectId} not found`)
  }

  if (actorTeacherId && classSubject.teacherId !== actorTeacherId) {
    throw new ForbiddenError('You can only create assignments for your assigned class subjects')
  }

  if (input.maxScore <= 0) {
    throw new BadRequestError('Max score must be greater than zero')
  }

  return createAssignment(prisma, input)
}

export async function getAssignment(prisma: PrismaClient, id: string, role?: string) {
  const assignment = await findAssignmentById(prisma, id)
  if (!assignment) {
    throw new NotFoundError(`Assignment ${id} not found`)
  }

  if (role === 'STUDENT' && assignment.status !== 'PUBLISHED') {
    throw new ForbiddenError('This assignment has not been published yet')
  }

  return assignment
}

export async function listClassAssignments(
  prisma: PrismaClient,
  filter: { classSubjectId?: string; status?: AssignmentStatus },
  role?: string
) {
  const effectiveStatus = role === 'STUDENT' ? 'PUBLISHED' : filter.status

  return listAssignments(prisma, {
    classSubjectId: filter.classSubjectId,
    status: effectiveStatus,
  })
}

export async function submitStudentAssignment(
  prisma: PrismaClient,
  data: {
    assignmentId: string
    studentId: string
    content?: string
  }
) {
  // 1. Verify assignment exists and is published
  const assignment = await findAssignmentById(prisma, data.assignmentId)
  if (!assignment) {
    throw new NotFoundError(`Assignment ${data.assignmentId} not found`)
  }
  if (assignment.status !== 'PUBLISHED') {
    throw new BadRequestError('Cannot submit work to an unpublished or closed assignment')
  }

  // 2. Verify student is actively enrolled in the assignment's class
  const enrollment = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: data.studentId,
      classId: assignment.classSubject.classId,
      status: 'ACTIVE',
    },
  })
  if (!enrollment) {
    throw new ForbiddenError('You are not actively enrolled in the class for this assignment')
  }

  // 3. Check for existing submission
  const existing = await findSubmission(prisma, data.assignmentId, data.studentId)
  if (existing) {
    throw new ConflictError('You have already submitted work for this assignment')
  }

  // 4. Server-side tamper-proof late detection
  const now = new Date()
  let status: 'SUBMITTED' | 'LATE' = 'SUBMITTED'

  if (now > assignment.dueAt) {
    if (!assignment.allowLateSubmission) {
      throw new BadRequestError('Late submissions are not accepted for this assignment')
    }
    if (assignment.lateUntil && now > assignment.lateUntil) {
      throw new BadRequestError('The deadline for late submissions has passed')
    }
    status = 'LATE'
  }

  return createSubmission(prisma, {
    assignmentId: data.assignmentId,
    studentId: data.studentId,
    content: data.content,
    submittedAt: now,
    status,
  })
}

export async function gradeStudentSubmission(
  prisma: PrismaClient,
  params: {
    submissionId: string
    score: number
    feedback?: string
    actorTeacherId: string
  }
) {
  const submission = await findSubmissionById(prisma, params.submissionId)
  if (!submission) {
    throw new NotFoundError(`Submission ${params.submissionId} not found`)
  }

  // Enforce that only the assigned teacher can grade
  if (submission.assignment.classSubject.teacherId !== params.actorTeacherId) {
    throw new ForbiddenError('You are not authorized to grade submissions for this class subject')
  }

  const maxScore = Number(submission.assignment.maxScore)
  if (params.score < 0 || params.score > maxScore) {
    throw new BadRequestError(`Score must be between 0 and ${maxScore}`)
  }

  return gradeSubmissionRecord(prisma, params.submissionId, {
    score: params.score,
    feedback: params.feedback,
    gradedById: params.actorTeacherId,
  })
}
