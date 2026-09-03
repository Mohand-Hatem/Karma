import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { withTenantScope } from '../../tenant/prisma-extension'
import { runWithOrganization } from '../../tenant/context'
import { findActiveResult } from './result.repository'
import { publishResult, correctResult } from './result.service'

describe('ResultService Integration (Functional)', () => {
  const orgId = `result-test-org-${Date.now()}`
  const scopedPrisma = withTenantScope(rawPrisma)
  let studentId: string
  let classSubjectId: string
  let termId: string
  let teacherUserId: string

  beforeAll(async () => {
    // 1. Create Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Result Service Test School' },
    })

    // 2. Setup Year, Term, Class, Subject, Teacher, ClassSubject
    const year = await rawPrisma.academicYear.create({
      data: {
        organizationId: orgId,
        name: `AcademicYear-${Date.now()}`,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    })

    const term = await rawPrisma.term.create({
      data: {
        organizationId: orgId,
        academicYearId: year.id,
        name: 'First Semester',
        order: 1,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-01-15'),
      },
    })
    termId = term.id

    const studentUser = await rawPrisma.user.create({
      data: {
        id: `usr-s-res-${Date.now()}`,
        email: `student-res-${Date.now()}@karma.dev`,
        name: 'Omar Farouk',
      },
    })
    const student = await rawPrisma.student.create({
      data: {
        organizationId: orgId,
        userId: studentUser.id,
        studentCode: `STU-RES-${Date.now()}`,
        firstName: 'Omar',
        lastName: 'Farouk',
        dateOfBirth: new Date('2010-08-12'),
        admissionDate: new Date('2025-09-01'),
      },
    })
    studentId = student.id

    const teacherUser = await rawPrisma.user.create({
      data: {
        id: `usr-t-res-${Date.now()}`,
        email: `teacher-res-${Date.now()}@karma.dev`,
        name: 'Teacher Nour',
      },
    })
    teacherUserId = teacherUser.id

    const teacher = await rawPrisma.teacher.create({
      data: {
        organizationId: orgId,
        userId: teacherUserId,
        employeeCode: `EMP-RES-${Date.now()}`,
        firstName: 'Nour',
        lastName: 'Hany',
        hireDate: new Date('2023-09-01'),
      },
    })

    const classRecord = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId: year.id,
        name: '12 Literature',
        gradeLevel: 12,
      },
    })

    const subject = await rawPrisma.subject.create({
      data: {
        organizationId: orgId,
        code: `ENG-${Date.now()}`,
        name: 'English Literature',
      },
    })

    const cs = await rawPrisma.classSubject.create({
      data: {
        organizationId: orgId,
        classId: classRecord.id,
        subjectId: subject.id,
        teacherId: teacher.id,
      },
    })
    classSubjectId = cs.id
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  it('publishes frozen result snapshot and prevents duplicate active results', async () => {
    await runWithOrganization(orgId, async () => {
      const result = await publishResult(scopedPrisma, {
        studentId,
        classSubjectId,
        termId,
        score: 88.5,
        letterGrade: 'B+',
        breakdown: [
          { category: 'Coursework', weight: 40, earned: 35, possible: 40 },
          { category: 'Final Exam', weight: 60, earned: 53.5, possible: 60 },
        ],
        publishedById: teacherUserId,
        comment: 'Good effort throughout the semester.',
      })

      expect(result.id).toBeDefined()
      expect(result.version).toBe(1)
      expect(result.score.toString()).toBe('88.5')
      expect(result.supersededAt).toBeNull()

      // Attempting to publish again for the same student/subject/term throws ConflictError
      await expect(
        publishResult(scopedPrisma, {
          studentId,
          classSubjectId,
          termId,
          score: 90,
          breakdown: [],
          publishedById: teacherUserId,
        })
      ).rejects.toThrow(/already exists/)
    })
  })

  it('corrects result immutably: generates version 2, marks version 1 superseded, and records AuditLog', async () => {
    await runWithOrganization(orgId, async () => {
      const activeResult = await findActiveResult(
        scopedPrisma,
        studentId,
        classSubjectId,
        termId
      )
      expect(activeResult).not.toBeNull()

      // Correct the result with a mandatory reason
      const correctedResult = await correctResult(scopedPrisma, {
        priorResultId: activeResult!.id,
        newScore: 92.0,
        newLetterGrade: 'A-',
        newBreakdown: [
          { category: 'Coursework', weight: 40, earned: 38.5, possible: 40 }, // Regraded essay
          { category: 'Final Exam', weight: 60, earned: 53.5, possible: 60 },
        ],
        correctionReason: 'Essay 2 regraded following moderation review.',
        actorUserId: teacherUserId,
      })

      expect(correctedResult.version).toBe(2)
      expect(correctedResult.score.toString()).toBe('92')
      expect(correctedResult.correctionReason).toBe('Essay 2 regraded following moderation review.')

      // 1. Verify prior version (version 1) was superseded
      const originalRow = await rawPrisma.result.findUnique({
        where: { id: activeResult!.id },
      })
      expect(originalRow?.supersededAt).not.toBeNull()
      expect(originalRow?.supersededById).toBe(correctedResult.id)

      // 2. Verify AuditLog was appended
      const auditLog = await rawPrisma.auditLog.findFirst({
        where: {
          resourceType: 'Result',
          resourceId: correctedResult.id,
        },
      })
      expect(auditLog).not.toBeNull()
      expect(auditLog?.action).toBe('RESULT_CORRECTED')
      expect(auditLog?.reason).toBe('Essay 2 regraded following moderation review.')
    })
  })
})
