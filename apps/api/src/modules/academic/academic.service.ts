import type { PrismaClient, AcademicYearStatus, ProfileStatus } from '@prisma/client'
import { BadRequestError, ConflictError, NotFoundError } from '../../middleware/error-handler'
import { getCurrentOrganizationId } from '../../tenant/context'
import {
  createAcademicYear as insertAcademicYear,
  createTerm as insertTerm,
  createSubject as insertSubject,
  createClass as insertClass,
  assignClassSubject as insertClassSubject,
  findSubjectByCode,
  findClassSubject,
} from './academic.repository'

// Enforces: Exactly 1 ACTIVE academic year per organization
export async function createAcademicYear(
  prisma: PrismaClient,
  data: {
    name: string
    startDate: Date
    endDate: Date
    status?: AcademicYearStatus
  }
) {
  if (data.startDate >= data.endDate) {
    throw new BadRequestError('Academic year startDate must be before endDate')
  }

  if (data.status === 'ACTIVE') {
    return prisma.$transaction(async (tx) => {
      // Set any existing ACTIVE year to CLOSED
      await tx.academicYear.updateMany({
        where: { status: 'ACTIVE' },
        data: { status: 'CLOSED' },
      })

      const organizationId = getCurrentOrganizationId()
      return tx.academicYear.create({
        data: {
          organizationId,
          name: data.name,
          startDate: data.startDate,
          endDate: data.endDate,
          status: 'ACTIVE',
        },
      })
    })
  }

  return insertAcademicYear(prisma, data)
}

export async function createTerm(
  prisma: PrismaClient,
  data: {
    academicYearId: string
    name: string
    nameAr?: string
    order: number
    startDate: Date
    endDate: Date
  }
) {
  const year = await prisma.academicYear.findFirst({
    where: { id: data.academicYearId },
  })
  if (!year) {
    throw new NotFoundError(`Academic year ${data.academicYearId} not found`)
  }

  if (data.startDate >= data.endDate) {
    throw new BadRequestError('Term startDate must be before endDate')
  }

  if (data.startDate < year.startDate || data.endDate > year.endDate) {
    throw new BadRequestError('Term dates must fall within the academic year dates')
  }

  return insertTerm(prisma, data)
}

export async function createSubject(
  prisma: PrismaClient,
  data: {
    code: string
    name: string
    nameAr?: string
    description?: string
    status?: ProfileStatus
  }
) {
  const existing = await findSubjectByCode(prisma, data.code)
  if (existing) {
    throw new ConflictError(`Subject with code ${data.code} already exists`)
  }

  return insertSubject(prisma, data)
}

export async function createClass(
  prisma: PrismaClient,
  data: {
    academicYearId: string
    name: string
    nameAr?: string
    gradeLevel: number
    section?: string
    homeroomTeacherId?: string
    capacity?: number
    status?: ProfileStatus
  }
) {
  const year = await prisma.academicYear.findFirst({
    where: { id: data.academicYearId },
  })
  if (!year) {
    throw new NotFoundError(`Academic year ${data.academicYearId} not found`)
  }

  if (data.homeroomTeacherId) {
    const teacher = await prisma.teacher.findFirst({
      where: { id: data.homeroomTeacherId },
    })
    if (!teacher) {
      throw new NotFoundError(`Teacher ${data.homeroomTeacherId} not found`)
    }
  }

  return insertClass(prisma, data)
}

// Enforces qualification check before assigning teacher to class subject
export async function assignTeacherToClassSubject(
  prisma: PrismaClient,
  data: {
    classId: string
    subjectId: string
    teacherId: string
  }
) {
  // 1. Verify class exists
  const classRecord = await prisma.class.findFirst({
    where: { id: data.classId },
  })
  if (!classRecord) {
    throw new NotFoundError(`Class ${data.classId} not found`)
  }

  // 2. Verify subject exists
  const subjectRecord = await prisma.subject.findFirst({
    where: { id: data.subjectId },
  })
  if (!subjectRecord) {
    throw new NotFoundError(`Subject ${data.subjectId} not found`)
  }

  // 3. Verify teacher exists
  const teacherRecord = await prisma.teacher.findFirst({
    where: { id: data.teacherId },
  })
  if (!teacherRecord) {
    throw new NotFoundError(`Teacher ${data.teacherId} not found`)
  }

  // 4. Invariant: Teacher must hold a qualification (TeacherSubject) for this subject
  const qualification = await prisma.teacherSubject.findUnique({
    where: {
      teacherId_subjectId: {
        teacherId: data.teacherId,
        subjectId: data.subjectId,
      },
    },
  })
  if (!qualification) {
    throw new BadRequestError(
      `Teacher ${teacherRecord.firstName} ${teacherRecord.lastName} is not qualified to teach ${subjectRecord.name}`
    )
  }

  // 5. Verify pairing does not already exist
  const existing = await findClassSubject(prisma, data.classId, data.subjectId)
  if (existing) {
    throw new ConflictError(`Class is already assigned to this subject`)
  }

  return insertClassSubject(prisma, data)
}
