import type { PrismaClient, AcademicYear, Term, Class, Subject, ClassSubject, AcademicYearStatus, ProfileStatus } from '@prisma/client'
import { getCurrentOrganizationId } from '../../tenant/context'

// --- Academic Year ---
export async function createAcademicYear(
  prisma: PrismaClient,
  data: {
    name: string
    startDate: Date
    endDate: Date
    status?: AcademicYearStatus
  }
): Promise<AcademicYear> {
  const organizationId = getCurrentOrganizationId()
  return prisma.academicYear.create({
    data: {
      organizationId,
      name: data.name,
      startDate: data.startDate,
      endDate: data.endDate,
      status: data.status ?? 'UPCOMING',
    },
  })
}

export async function findActiveAcademicYear(prisma: PrismaClient): Promise<AcademicYear | null> {
  return prisma.academicYear.findFirst({
    where: { status: 'ACTIVE' },
    include: { terms: { orderBy: { order: 'asc' } } },
  })
}

export async function findAcademicYearById(prisma: PrismaClient, id: string) {
  return prisma.academicYear.findFirst({
    where: { id },
    include: {
      terms: { orderBy: { order: 'asc' } },
      classes: { orderBy: { name: 'asc' } },
    },
  })
}

// --- Term ---
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
): Promise<Term> {
  const organizationId = getCurrentOrganizationId()
  return prisma.term.create({
    data: {
      organizationId,
      academicYearId: data.academicYearId,
      name: data.name,
      nameAr: data.nameAr,
      order: data.order,
      startDate: data.startDate,
      endDate: data.endDate,
    },
  })
}

// --- Subject ---
export async function createSubject(
  prisma: PrismaClient,
  data: {
    code: string
    name: string
    nameAr?: string
    description?: string
    status?: ProfileStatus
  }
): Promise<Subject> {
  const organizationId = getCurrentOrganizationId()
  return prisma.subject.create({
    data: {
      organizationId,
      code: data.code,
      name: data.name,
      nameAr: data.nameAr,
      description: data.description,
      status: data.status ?? 'ACTIVE',
    },
  })
}

export async function findSubjectByCode(prisma: PrismaClient, code: string): Promise<Subject | null> {
  return prisma.subject.findFirst({
    where: { code },
  })
}

// --- Class ---
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
): Promise<Class> {
  const organizationId = getCurrentOrganizationId()
  return prisma.class.create({
    data: {
      organizationId,
      academicYearId: data.academicYearId,
      name: data.name,
      nameAr: data.nameAr,
      gradeLevel: data.gradeLevel,
      section: data.section,
      homeroomTeacherId: data.homeroomTeacherId,
      capacity: data.capacity,
      status: data.status ?? 'ACTIVE',
    },
    include: {
      homeroomTeacher: true,
      academicYear: true,
    },
  })
}

export async function findClassById(prisma: PrismaClient, id: string) {
  return prisma.class.findFirst({
    where: { id },
    include: {
      academicYear: true,
      homeroomTeacher: true,
      classSubjects: {
        include: { subject: true, teacher: true },
      },
      enrollments: {
        where: { status: 'ACTIVE' },
        include: { student: true },
      },
    },
  })
}

// --- ClassSubject Assignment Spine ---
export async function assignClassSubject(
  prisma: PrismaClient,
  data: {
    classId: string
    subjectId: string
    teacherId: string
  }
): Promise<ClassSubject> {
  const organizationId = getCurrentOrganizationId()
  return prisma.classSubject.create({
    data: {
      organizationId,
      classId: data.classId,
      subjectId: data.subjectId,
      teacherId: data.teacherId,
    },
    include: {
      class: true,
      subject: true,
      teacher: true,
    },
  })
}

export async function findClassSubject(
  prisma: PrismaClient,
  classId: string,
  subjectId: string
): Promise<ClassSubject | null> {
  return prisma.classSubject.findUnique({
    where: {
      classId_subjectId: {
        classId,
        subjectId,
      },
    },
    include: {
      class: true,
      subject: true,
      teacher: true,
    },
  })
}
