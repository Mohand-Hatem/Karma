import type { PrismaClient } from '@prisma/client'
import { ConflictError, NotFoundError } from '../../middleware/error-handler'
import {
  createTeacher,
  findTeacherByEmployeeCode,
  findTeacherById,
  findTeacherByUserId,
  listTeachers as queryTeachers,
  addTeacherQualification,
  type CreateTeacherInput,
  type TeacherFilter,
} from './teacher.repository'

export async function createTeacherProfile(prisma: PrismaClient, input: CreateTeacherInput) {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  })
  if (!user) {
    throw new NotFoundError(`User with ID ${input.userId} does not exist`)
  }

  // 2. Check if user already has a teacher profile
  const existingProfile = await findTeacherByUserId(prisma, input.userId)
  if (existingProfile) {
    throw new ConflictError('A teacher profile already exists for this user')
  }

  // 3. Check employee code uniqueness within organization
  const existingCode = await findTeacherByEmployeeCode(prisma, input.employeeCode)
  if (existingCode) {
    throw new ConflictError(`Employee code ${input.employeeCode} is already in use`)
  }

  return createTeacher(prisma, input)
}

export async function getTeacherById(prisma: PrismaClient, id: string) {
  const teacher = await findTeacherById(prisma, id)
  if (!teacher) {
    throw new NotFoundError(`Teacher with ID ${id} not found`)
  }
  return teacher
}

export async function listTeachers(prisma: PrismaClient, filter: TeacherFilter = {}) {
  return queryTeachers(prisma, filter)
}

export async function qualifyTeacherForSubject(prisma: PrismaClient, teacherId: string, subjectId: string) {
  // 1. Verify teacher exists
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId },
  })
  if (!teacher) {
    throw new NotFoundError(`Teacher with ID ${teacherId} not found`)
  }

  // 2. Verify subject exists
  const subject = await prisma.subject.findFirst({
    where: { id: subjectId },
  })
  if (!subject) {
    throw new NotFoundError(`Subject with ID ${subjectId} not found`)
  }

  // 3. Check if already qualified
  const existing = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId,
        subjectId,
      },
    },
  })
  if (existing) {
    throw new ConflictError('Teacher is already qualified for this subject')
  }

  return addTeacherQualification(prisma, teacherId, subjectId)
}
