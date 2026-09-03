import type { PrismaClient, LessonStatus } from '@prisma/client'
import { ForbiddenError, NotFoundError } from '../../middleware/error-handler'
import {
  createLesson,
  findLessonById,
  listLessons,
  publishLessonRecord,
  type CreateLessonInput,
} from './lesson.repository'

export async function createLessonRecord(
  prisma: PrismaClient,
  input: CreateLessonInput,
  actorTeacherId?: string
) {
  const classSubject = await prisma.classSubject.findFirst({
    where: { id: input.classSubjectId },
  })
  if (!classSubject) {
    throw new NotFoundError(`Class subject ${input.classSubjectId} not found`)
  }

  // If teacher is creating, ensure they are assigned to this class subject
  if (actorTeacherId && classSubject.teacherId !== actorTeacherId) {
    throw new ForbiddenError('You can only create lessons for your assigned class subjects')
  }

  return createLesson(prisma, input)
}

export async function getLesson(
  prisma: PrismaClient,
  id: string,
  role?: string
) {
  const lesson = await findLessonById(prisma, id)
  if (!lesson) {
    throw new NotFoundError(`Lesson ${id} not found`)
  }

  // Students can only view published lessons
  if (role === 'STUDENT' && lesson.status !== 'PUBLISHED') {
    throw new ForbiddenError('This lesson has not been published yet')
  }

  return lesson
}

export async function listClassLessons(
  prisma: PrismaClient,
  filter: { classSubjectId?: string; status?: LessonStatus },
  role?: string
) {
  // If student is querying, enforce published status
  const effectiveStatus = role === 'STUDENT' ? 'PUBLISHED' : filter.status

  return listLessons(prisma, {
    classSubjectId: filter.classSubjectId,
    status: effectiveStatus,
  })
}

export async function publishLesson(
  prisma: PrismaClient,
  id: string,
  actorTeacherId?: string
) {
  const lesson = await findLessonById(prisma, id)
  if (!lesson) {
    throw new NotFoundError(`Lesson ${id} not found`)
  }

  if (actorTeacherId && lesson.classSubject.teacherId !== actorTeacherId) {
    throw new ForbiddenError('You can only publish lessons for your assigned class subjects')
  }

  return publishLessonRecord(prisma, id)
}
