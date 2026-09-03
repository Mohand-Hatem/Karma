import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { withTenantScope } from '../../tenant/prisma-extension'
import { runWithOrganization } from '../../tenant/context'
import { findActiveAcademicYear } from './academic.repository'
import {
  createAcademicYear,
  createClass,
  createSubject,
  assignTeacherToClassSubject,
} from './academic.service'

describe('AcademicService Integration (Functional)', () => {
  const orgId = `academic-test-org-${Date.now()}`
  const scopedPrisma = withTenantScope(rawPrisma)
  let teacherId: string
  let subjectId: string
  let classId: string

  beforeAll(async () => {
    // 1. Setup Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Academic Service Test School' },
    })

    // 2. Create Teacher
    const teacherUser = await rawPrisma.user.create({
      data: {
        id: `usr-tch-acad-${Date.now()}`,
        email: `teacher-acad-${Date.now()}@karma.dev`,
        name: 'Hassan Sherif',
      },
    })
    const teacher = await rawPrisma.teacher.create({
      data: {
        organizationId: orgId,
        userId: teacherUser.id,
        employeeCode: `EMP-${Date.now()}`,
        firstName: 'Hassan',
        lastName: 'Sherif',
        hireDate: new Date('2024-01-15'),
      },
    })
    teacherId = teacher.id

    // 3. Create Subject inside tenant context
    const subject = await runWithOrganization(orgId, () =>
      createSubject(scopedPrisma, {
        code: `PHYS-${Date.now()}`,
        name: 'Physics',
        nameAr: 'الفيزياء',
      })
    )
    subjectId = subject.id
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  it('enforces exactly one ACTIVE academic year per organization', async () => {
    await runWithOrganization(orgId, async () => {
      // 1. Create first ACTIVE year
      const year1 = await createAcademicYear(scopedPrisma, {
        name: `2024/2025-${Date.now()}`,
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-06-30'),
        status: 'ACTIVE',
      })
      expect(year1.status).toBe('ACTIVE')

      // 2. Create second ACTIVE year
      const year2 = await createAcademicYear(scopedPrisma, {
        name: `2025/2026-${Date.now()}`,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      })
      expect(year2.status).toBe('ACTIVE')

      // 3. Verify year1 was automatically moved to CLOSED
      const checkYear1 = await rawPrisma.academicYear.findUnique({
        where: { id: year1.id },
      })
      expect(checkYear1?.status).toBe('CLOSED')
    })
  })

  it('enforces teacher qualification before assigning to class subject', async () => {
    await runWithOrganization(orgId, async () => {
      // Create class
      const activeYear = await findActiveAcademicYear(scopedPrisma)
      expect(activeYear).not.toBeNull()

      const newClass = await createClass(scopedPrisma, {
        academicYearId: activeYear!.id,
        name: '11 Science',
        gradeLevel: 11,
      })
      classId = newClass.id

      // 1. Attempting assignment without qualification MUST FAIL with BadRequestError
      await expect(
        assignTeacherToClassSubject(scopedPrisma, {
          classId,
          subjectId,
          teacherId,
        })
      ).rejects.toThrow(/not qualified/)

      // 2. Now qualify the teacher
      await rawPrisma.teacherSubject.create({
        data: {
          organizationId: orgId,
          teacherId,
          subjectId,
        },
      })

      // 3. Assignment now succeeds!
      const classSubject = await assignTeacherToClassSubject(scopedPrisma, {
        classId,
        subjectId,
        teacherId,
      })
      expect(classSubject.id).toBeDefined()
      expect(classSubject.teacherId).toBe(teacherId)
      expect(classSubject.subjectId).toBe(subjectId)
    })
  })
})
