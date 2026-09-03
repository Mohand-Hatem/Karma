import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { withTenantScope } from '../../tenant/prisma-extension'
import { runWithOrganization } from '../../tenant/context'
import { findStudentByUserId } from './student.repository'
import { createStudentProfile, enrollStudent, linkParentToStudent } from './student.service'

describe('StudentService Integration (Functional)', () => {
  const orgId = `student-test-org-${Date.now()}`
  const scopedPrisma = withTenantScope(rawPrisma)
  let academicYearId: string
  let class1Id: string
  let class2Id: string
  let studentUserId: string
  let parentUserId: string
  let parentId: string

  beforeAll(async () => {
    // 1. Create Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Student Service Test School' },
    })

    // 2. Setup Academic Year & Classes
    const year = await rawPrisma.academicYear.create({
      data: {
        organizationId: orgId,
        name: `Year-${Date.now()}`,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    })
    academicYearId = year.id

    const c1 = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId,
        name: 'Class 9A',
        gradeLevel: 9,
      },
    })
    class1Id = c1.id

    const c2 = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId,
        name: 'Class 9B',
        gradeLevel: 9,
      },
    })
    class2Id = c2.id

    // 3. Create User for Student
    const uStudent = await rawPrisma.user.create({
      data: {
        id: `usr-s-${Date.now()}`,
        name: 'Kareem Tarek',
        email: `kareem-${Date.now()}@karma.dev`,
      },
    })
    studentUserId = uStudent.id

    // 4. Create User & Profile for Parent
    const uParent = await rawPrisma.user.create({
      data: {
        id: `usr-p-${Date.now()}`,
        name: 'Tarek Mahmoud',
        email: `tarek-${Date.now()}@karma.dev`,
      },
    })
    parentUserId = uParent.id

    const parent = await rawPrisma.parent.create({
      data: {
        organizationId: orgId,
        userId: parentUserId,
        firstName: 'Tarek',
        lastName: 'Mahmoud',
        occupation: 'Engineer',
      },
    })
    parentId = parent.id
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  it('creates student profile and prevents duplicate student codes', async () => {
    await runWithOrganization(orgId, async () => {
      const studentCode = `STU-TEST-${Date.now()}`

      const student = await createStudentProfile(scopedPrisma, {
        userId: studentUserId,
        studentCode,
        firstName: 'Kareem',
        lastName: 'Tarek',
        dateOfBirth: new Date('2011-03-20'),
        admissionDate: new Date('2025-09-01'),
      })

      expect(student.id).toBeDefined()
      expect(student.studentCode).toBe(studentCode)

      // Attempting duplicate code throws ConflictError
      await expect(
        createStudentProfile(scopedPrisma, {
          userId: `usr-other-${Date.now()}`,
          studentCode,
          firstName: 'Another',
          lastName: 'Student',
          dateOfBirth: new Date('2011-03-20'),
          admissionDate: new Date('2025-09-01'),
        })
      ).rejects.toThrow()
    })
  })

  it('handles mid-year class transfer cleanly preserving history', async () => {
    await runWithOrganization(orgId, async () => {
      const student = await findStudentByUserId(scopedPrisma, studentUserId)
      expect(student).not.toBeNull()

      // 1. Initial enrollment in Class 9A
      const initialEnrollment = await enrollStudent(scopedPrisma, {
        studentId: student!.id,
        classId: class1Id,
        academicYearId,
      })
      expect(initialEnrollment.status).toBe('ACTIVE')
      expect(initialEnrollment.classId).toBe(class1Id)

      // 2. Mid-year transfer to Class 9B
      const transferEnrollment = await enrollStudent(scopedPrisma, {
        studentId: student!.id,
        classId: class2Id,
        academicYearId,
      })
      expect(transferEnrollment.status).toBe('ACTIVE')
      expect(transferEnrollment.classId).toBe(class2Id)

      // 3. Verify prior enrollment was marked TRANSFERRED with leftAt
      const oldEnrollment = await rawPrisma.studentEnrollment.findUnique({
        where: { id: initialEnrollment.id },
      })
      expect(oldEnrollment?.status).toBe('TRANSFERRED')
      expect(oldEnrollment?.leftAt).not.toBeNull()
    })
  })

  it('links parent to student and prevents duplicate links', async () => {
    await runWithOrganization(orgId, async () => {
      const student = await findStudentByUserId(scopedPrisma, studentUserId)
      expect(student).not.toBeNull()

      const link = await linkParentToStudent(scopedPrisma, {
        parentId,
        studentId: student!.id,
        relationship: 'FATHER',
        isPrimaryContact: true,
      })
      expect(link.id).toBeDefined()
      expect(link.relationship).toBe('FATHER')

      // Duplicate link rejected
      await expect(
        linkParentToStudent(scopedPrisma, {
          parentId,
          studentId: student!.id,
          relationship: 'FATHER',
        })
      ).rejects.toThrow()
    })
  })
})
