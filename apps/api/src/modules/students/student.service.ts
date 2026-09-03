import type { PrismaClient, Relationship } from '@prisma/client'
import { ConflictError, NotFoundError } from '../../middleware/error-handler'
import { getCurrentOrganizationId } from '../../tenant/context'
import {
  createStudent,
  findStudentByCode,
  findStudentById,
  findStudentByUserId,
  listStudents as queryStudents,
  linkParent as insertParentLink,
  enrollStudentInClass,
  type CreateStudentInput,
  type StudentFilter,
} from './student.repository'

export async function createStudentProfile(prisma: PrismaClient, input: CreateStudentInput) {
  // 1. Verify user exists
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
  })
  if (!user) {
    throw new NotFoundError(`User with ID ${input.userId} does not exist`)
  }

  // 2. Check if user already has a student profile
  const existingProfile = await findStudentByUserId(prisma, input.userId)
  if (existingProfile) {
    throw new ConflictError('A student profile already exists for this user')
  }

  // 3. Check student code uniqueness within organization
  const existingCode = await findStudentByCode(prisma, input.studentCode)
  if (existingCode) {
    throw new ConflictError(`Student code ${input.studentCode} is already in use`)
  }

  return createStudent(prisma, input)
}

export async function getStudentById(prisma: PrismaClient, id: string) {
  const student = await findStudentById(prisma, id)
  if (!student) {
    throw new NotFoundError(`Student with ID ${id} not found`)
  }
  return student
}

export async function listStudents(prisma: PrismaClient, filter: StudentFilter = {}) {
  return queryStudents(prisma, filter)
}

export async function enrollStudent(
  prisma: PrismaClient,
  data: { studentId: string; classId: string; academicYearId: string }
) {
  // 1. Verify student exists
  const student = await prisma.student.findFirst({
    where: { id: data.studentId },
  })
  if (!student) {
    throw new NotFoundError(`Student with ID ${data.studentId} not found`)
  }

  // 2. Verify class exists and belongs to the specified academic year
  const targetClass = await prisma.class.findFirst({
    where: { id: data.classId, academicYearId: data.academicYearId },
  })
  if (!targetClass) {
    throw new NotFoundError(`Class ${data.classId} not found in academic year ${data.academicYearId}`)
  }

  // 3. Check for existing active enrollment in this academic year
  const existingActive = await prisma.studentEnrollment.findFirst({
    where: {
      studentId: data.studentId,
      academicYearId: data.academicYearId,
      status: 'ACTIVE',
    },
  })

  if (existingActive) {
    if (existingActive.classId === data.classId) {
      return existingActive
    }

    // Mid-year transfer: mark old enrollment as TRANSFERRED inside transaction
    const organizationId = getCurrentOrganizationId()
    return prisma.$transaction(async (tx) => {
      await tx.studentEnrollment.update({
        where: { id: existingActive.id },
        data: { status: 'TRANSFERRED', leftAt: new Date() },
      })

      return tx.studentEnrollment.create({
        data: {
          organizationId,
          studentId: data.studentId,
          classId: data.classId,
          academicYearId: data.academicYearId,
          status: 'ACTIVE',
        },
        include: { class: true, academicYear: true },
      })
    })
  }

  return enrollStudentInClass(prisma, data)
}

export async function linkParentToStudent(
  prisma: PrismaClient,
  data: {
    parentId: string
    studentId: string
    relationship: Relationship
    isPrimaryContact?: boolean
  }
) {
  // 1. Verify parent exists
  const parent = await prisma.parent.findFirst({
    where: { id: data.parentId },
  })
  if (!parent) {
    throw new NotFoundError(`Parent with ID ${data.parentId} not found`)
  }

  // 2. Verify student exists
  const student = await prisma.student.findFirst({
    where: { id: data.studentId },
  })
  if (!student) {
    throw new NotFoundError(`Student with ID ${data.studentId} not found`)
  }

  // 3. Check if link already exists
  const existing = await prisma.parentStudent.findUnique({
    where: {
      parentId_studentId: {
        parentId: data.parentId,
        studentId: data.studentId,
      },
    },
  })
  if (existing) {
    throw new ConflictError('Parent is already linked to this student')
  }

  return insertParentLink(prisma, data)
}
