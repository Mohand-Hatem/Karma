import type { PrismaClient, Lesson, LessonStatus } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

export type CreateLessonInput = {
  classSubjectId: string
  title: string
  titleAr?: string
  description?: string
  content?: string
  scheduledAt?: Date
  status?: LessonStatus
  createdById: string
}

export async function createLesson(prisma: PrismaClient, data: CreateLessonInput): Promise<Lesson> {
  const organizationId = getCurrentOrganizationId()
  return prisma.lesson.create({
    data: {
      organizationId,
      classSubjectId: data.classSubjectId,
      title: data.title,
      titleAr: data.titleAr,
      description: data.description,
      content: data.content,
      scheduledAt: data.scheduledAt,
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

export async function findLessonById(prisma: PrismaClient, id: string) {
  return prisma.lesson.findFirst({
    where: { id },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
          teacher: true,
        },
      },
      resources: {
        orderBy: { order: 'asc' },
        include: { fileAsset: true },
      },
    },
  })
}

export async function listLessons(
  prisma: PrismaClient,
  filter: { classSubjectId?: string; status?: LessonStatus }
) {
  const where: Record<string, unknown> = {}
  if (filter.classSubjectId) where.classSubjectId = filter.classSubjectId
  if (filter.status) where.status = filter.status

  return prisma.lesson.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      classSubject: {
        include: {
          class: true,
          subject: true,
        },
      },
    },
  })
}

export async function publishLessonRecord(prisma: PrismaClient, id: string) {
  return prisma.lesson.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  })
}
