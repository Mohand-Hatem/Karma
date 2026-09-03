import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { rawPrisma } from '../../db/prisma'
import { withTenantScope } from '../../tenant/prisma-extension'
import { runWithOrganization } from '../../tenant/context'
import { findTeacherByUserId } from './teacher.repository'
import { createTeacherProfile, qualifyTeacherForSubject } from './teacher.service'

describe('TeacherService Integration (Functional)', () => {
  const orgId = `teacher-test-org-${Date.now()}`
  const scopedPrisma = withTenantScope(rawPrisma)
  let teacherUserId: string
  let subjectId: string

  beforeAll(async () => {
    // 1. Create Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Teacher Service Test School' },
    })

    // 2. Create User for Teacher
    const user = await rawPrisma.user.create({
      data: {
        id: `usr-t-svc-${Date.now()}`,
        email: `teacher-svc-${Date.now()}@karma.dev`,
        name: 'Sara Adel',
      },
    })
    teacherUserId = user.id

    // 3. Create Subject
    const subject = await rawPrisma.subject.create({
      data: {
        organizationId: orgId,
        code: `BIO-${Date.now()}`,
        name: 'Biology',
      },
    })
    subjectId = subject.id
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  it('creates teacher profile and enforces employee code uniqueness', async () => {
    await runWithOrganization(orgId, async () => {
      const employeeCode = `EMP-TEST-${Date.now()}`

      const teacher = await createTeacherProfile(scopedPrisma, {
        userId: teacherUserId,
        employeeCode,
        firstName: 'Sara',
        lastName: 'Adel',
        specialization: 'Life Sciences',
        hireDate: new Date('2023-08-15'),
      })

      expect(teacher.id).toBeDefined()
      expect(teacher.employeeCode).toBe(employeeCode)

      // Duplicate employee code rejected
      await expect(
        createTeacherProfile(scopedPrisma, {
          userId: `usr-other-tch-${Date.now()}`,
          employeeCode,
          firstName: 'Another',
          lastName: 'Teacher',
          hireDate: new Date('2024-01-01'),
        })
      ).rejects.toThrow()
    })
  })

  it('qualifies teacher for subject and rejects duplicate qualifications', async () => {
    await runWithOrganization(orgId, async () => {
      const teacher = await findTeacherByUserId(scopedPrisma, teacherUserId)
      expect(teacher).not.toBeNull()

      const qual = await qualifyTeacherForSubject(scopedPrisma, teacher!.id, subjectId)
      expect(qual.teacherId).toBe(teacher!.id)
      expect(qual.subjectId).toBe(subjectId)

      // Duplicate qualification rejected
      await expect(
        qualifyTeacherForSubject(scopedPrisma, teacher!.id, subjectId)
      ).rejects.toThrow()
    })
  })
})
