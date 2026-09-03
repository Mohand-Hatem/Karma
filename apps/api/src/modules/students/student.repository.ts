import type { PrismaClient, Student, StudentEnrollment, ParentStudent, ProfileStatus, Gender, Relationship } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

export type CreateStudentInput = {
  userId: string
  studentCode: string
  firstName: string
  lastName: string
  firstNameAr?: string
  lastNameAr?: string
  dateOfBirth: Date
  admissionDate: Date
  gender?: Gender
  phone?: string
  address?: string
  status?: ProfileStatus
}

export type StudentFilter = {
  status?: ProfileStatus
  search?: string
  cursor?: string
  limit?: number
}

export async function createStudent(prisma: PrismaClient, data: CreateStudentInput): Promise<Student> {
  const organizationId = getCurrentOrganizationId()
  return prisma.student.create({
    data: {
      organizationId,
      userId: data.userId,
      studentCode: data.studentCode,
      firstName: data.firstName,
      lastName: data.lastName,
      firstNameAr: data.firstNameAr,
      lastNameAr: data.lastNameAr,
      dateOfBirth: data.dateOfBirth,
      admissionDate: data.admissionDate,
      gender: data.gender,
      phone: data.phone,
      address: data.address,
      status: data.status ?? 'ACTIVE',
    },
    include: {
      user: true,
    },
  })
}

export async function findStudentById(prisma: PrismaClient, id: string) {
  return prisma.student.findFirst({
    where: { id },
    include: {
      user: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { class: true, academicYear: true },
      },
      parentLinks: {
        include: { parent: { include: { user: true } } },
      },
    },
  })
}

export async function findStudentByCode(prisma: PrismaClient, studentCode: string) {
  return prisma.student.findFirst({
    where: { studentCode },
    include: {
      user: true,
    },
  })
}

export async function findStudentByUserId(prisma: PrismaClient, userId: string) {
  return prisma.student.findFirst({
    where: { userId },
    include: { user: true },
  })
}

export async function listStudents(prisma: PrismaClient, filter: StudentFilter = {}) {
  const limit = filter.limit ?? 20
  const where: Record<string, unknown> = {}

  if (filter.status) {
    where.status = filter.status
  }

  if (filter.search) {
    where.OR = [
      { firstName: { contains: filter.search, mode: 'insensitive' } },
      { lastName: { contains: filter.search, mode: 'insensitive' } },
      { studentCode: { contains: filter.search, mode: 'insensitive' } },
    ]
  }

  return prisma.student.findMany({
    where,
    take: limit,
    skip: filter.cursor ? 1 : 0,
    cursor: filter.cursor ? { id: filter.cursor } : undefined,
    orderBy: { createdAt: 'desc' },
    include: {
      user: true,
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { class: true },
      },
    },
  })
}

export async function linkParent(
  prisma: PrismaClient,
  data: {
    parentId: string
    studentId: string
    relationship: Relationship
    isPrimaryContact?: boolean
  }
): Promise<ParentStudent> {
  const organizationId = getCurrentOrganizationId()
  return prisma.parentStudent.create({
    data: {
      organizationId,
      parentId: data.parentId,
      studentId: data.studentId,
      relationship: data.relationship,
      isPrimaryContact: data.isPrimaryContact ?? false,
    },
  })
}

export async function enrollStudentInClass(
  prisma: PrismaClient,
  data: {
    studentId: string
    classId: string
    academicYearId: string
  }
): Promise<StudentEnrollment> {
  const organizationId = getCurrentOrganizationId()
  return prisma.studentEnrollment.create({
    data: {
      organizationId,
      studentId: data.studentId,
      classId: data.classId,
      academicYearId: data.academicYearId,
      status: 'ACTIVE',
    },
    include: {
      class: true,
      academicYear: true,
    },
  })
}
