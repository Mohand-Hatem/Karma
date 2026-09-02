import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rawPrisma } from '../db/prisma'

describe('Phase 1 Database Schema Integration', () => {
  const orgId = `schema-test-org-${Date.now()}`
  let academicYearId: string
  let studentId: string
  let classId: string
  let classId2: string
  let teacherId: string
  let subjectId: string
  let classSubjectId: string

  beforeAll(async () => {
    // Setup organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Phase 1 Schema Test School' },
    })

    // Setup Academic Year
    const year = await rawPrisma.academicYear.create({
      data: {
        organizationId: orgId,
        name: `2025/2026-${Date.now()}`,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    })
    academicYearId = year.id

    // Setup User & Student profile
    const studentUser = await rawPrisma.user.create({
      data: {
        id: `usr-std-${Date.now()}`,
        email: `student-${Date.now()}@karma.dev`,
        name: 'Youssef Ahmed',
      },
    })
    const student = await rawPrisma.student.create({
      data: {
        organizationId: orgId,
        userId: studentUser.id,
        studentCode: `STU-${Date.now()}`,
        firstName: 'Youssef',
        lastName: 'Ahmed',
        firstNameAr: 'يوسف',
        lastNameAr: 'أحمد',
        dateOfBirth: new Date('2010-05-15'),
        admissionDate: new Date('2025-09-01'),
        status: 'ACTIVE',
      },
    })
    studentId = student.id

    // Setup User & Teacher profile
    const teacherUser = await rawPrisma.user.create({
      data: {
        id: `usr-tch-${Date.now()}`,
        email: `teacher-${Date.now()}@karma.dev`,
        name: 'Mona Ali',
      },
    })
    const teacher = await rawPrisma.teacher.create({
      data: {
        organizationId: orgId,
        userId: teacherUser.id,
        employeeCode: `EMP-${Date.now()}`,
        firstName: 'Mona',
        lastName: 'Ali',
        hireDate: new Date('2023-08-01'),
        status: 'ACTIVE',
      },
    })
    teacherId = teacher.id

    // Setup Classes
    const c1 = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId,
        name: '10A',
        gradeLevel: 10,
        homeroomTeacherId: teacherId,
        status: 'ACTIVE',
      },
    })
    classId = c1.id

    const c2 = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId,
        name: '10B',
        gradeLevel: 10,
        status: 'ACTIVE',
      },
    })
    classId2 = c2.id

    // Setup Subject
    const subject = await rawPrisma.subject.create({
      data: {
        organizationId: orgId,
        code: `MATH-${Date.now()}`,
        name: 'Mathematics',
        nameAr: 'الرياضيات',
        status: 'ACTIVE',
      },
    })
    subjectId = subject.id

    // Teacher Qualification
    await rawPrisma.teacherSubject.create({
      data: {
        organizationId: orgId,
        teacherId,
        subjectId,
      },
    })

    // ClassSubject assignment
    const cs = await rawPrisma.classSubject.create({
      data: {
        organizationId: orgId,
        classId,
        subjectId,
        teacherId,
      },
    })
    classSubjectId = cs.id
  })

  afterAll(async () => {
    // Cleanup cascade
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  it('proves student enrollment and enforces single active enrollment per academic year constraint', async () => {
    // First active enrollment succeeds
    await rawPrisma.studentEnrollment.create({
      data: {
        organizationId: orgId,
        studentId,
        classId,
        academicYearId,
        status: 'ACTIVE',
      },
    })

    // Second active enrollment in same academic year violates partial unique index
    await expect(
      rawPrisma.studentEnrollment.create({
        data: {
          organizationId: orgId,
          studentId,
          classId: classId2,
          academicYearId,
          status: 'ACTIVE',
        },
      })
    ).rejects.toThrow()
  })

  it('proves Lesson, Assignment, and Result models with breakdown snapshot', async () => {
    // Create published lesson
    const lesson = await rawPrisma.lesson.create({
      data: {
        organizationId: orgId,
        classSubjectId,
        title: 'Quadratic Equations',
        status: 'PUBLISHED',
        publishedAt: new Date(),
        createdById: teacherId,
      },
    })
    expect(lesson.id).toBeDefined()

    // Create published assignment
    const assignment = await rawPrisma.assignment.create({
      data: {
        organizationId: orgId,
        classSubjectId,
        title: 'Problem Set 1',
        maxScore: 100,
        dueAt: new Date(Date.now() + 86400000),
        status: 'PUBLISHED',
        createdById: teacherId,
      },
    })
    expect(assignment.id).toBeDefined()

    // Create Term
    const term = await rawPrisma.term.create({
      data: {
        organizationId: orgId,
        academicYearId,
        name: 'Term 1',
        order: 1,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
      },
    })

    // Create Result with frozen breakdown
    const result = await rawPrisma.result.create({
      data: {
        organizationId: orgId,
        studentId,
        classSubjectId,
        termId: term.id,
        version: 1,
        score: 95.5,
        letterGrade: 'A',
        breakdown: [
          { category: 'Assignments', weight: 40, earned: 38, possible: 40 },
          { category: 'Exam', weight: 60, earned: 57.5, possible: 60 },
        ],
        publishedById: teacherId,
      },
    })
    expect(result.score.toString()).toBe('95.5')
    expect(result.version).toBe(1)
  })
})
