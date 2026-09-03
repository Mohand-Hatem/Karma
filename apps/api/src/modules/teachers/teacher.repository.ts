import type { PrismaClient, Teacher, TeacherSubject, ProfileStatus, Gender } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

export type CreateTeacherInput = {
  userId: string
  employeeCode: string
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  gender?: Gender
  phone?: string
  address?: string
  specialization?: string
  hireDate: Date
  status?: ProfileStatus
}

export type TeacherFilter = {
  status?: ProfileStatus
  search?: string
  cursor?: string
  limit?: number
}

export async function createTeacher(prisma: PrismaClient, data: CreateTeacherInput): Promise<Teacher> {
  const organizationId = getCurrentOrganizationId()
  return prisma.teacher.create({
    data: {
      organizationId,
      userId: data.userId,
      employeeCode: data.employeeCode,
      firstName: data.firstName,
      lastName: data.lastName,
      firstNameAr: data.firstNameAr,
      lastNameAr: data.lastNameAr,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      specialization: data.specialization,
      hireDate: data.hireDate,
      status: data.status ?? 'ACTIVE',
    },
    include: {
      user: true,
    },
  })
}

export async function findTeacherById(prisma: PrismaClient, id: string) {
  return prisma.teacher.findFirst({
    where: { id },
    include: {
      user: true,
      qualifiedSubjects: {
        include: { subject: true },
      },
      classSubjects: {
        include: { class: true, subject: true },
      },
    },
  })
}

export async function findTeacherByEmployeeCode(prisma: PrismaClient, employeeCode: string) {
  return prisma.teacher.findFirst({
    where: { employeeCode },
    include: { user: true },
  })
}

export async function findTeacherByUserId(prisma: PrismaClient, userId: string) {
  return prisma.teacher.findFirst({
    where: { userId },
    include: { user: true },
  })
}

export async function listTeachers(prisma: PrismaClient, filter: TeacherFilter = {}) {
  const limit = filter.limit ?? 20
  const where: Record<string, unknown> = {}

  if (filter.status) {
    where.status = filter.status
  }

  if (filter.search) {
    where.OR = [
      { firstName: { contains: filter.search, mode: 'insensitive' } },
      { lastName: { contains: filter.search, mode: 'insensitive' } },
      { employeeCode: { contains: filter.search, mode: 'insensitive' } },
    ]
  }

  return prisma.teacher.findMany({
    where,
    take: limit,
    skip: filter.cursor ? 1 : 0,
    cursor: filter.cursor ? { id: filter.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      qualifiedSubjects: { include: { subject: true } },
    },
  })
}

export async function addTeacherQualification(
  prisma: PrismaClient,
  teacherId: string,
  subjectId: string
): Promise<TeacherSubject> {
  const organizationId = getCurrentOrganizationId()
  return prisma.teacherSubject.create({
    data: {
      organizationId,
      teacherId,
      subjectId,
    },
    include: {
      subject: true,
    },
  })
}
