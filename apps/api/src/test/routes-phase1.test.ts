import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { rawPrisma } from '../db/prisma'

describe('Phase 1 REST Endpoints, RBAC & Multi-Tenancy', () => {
  const app = createApp()
  const orgId = `rest-test-org-${Date.now()}`
  let adminAgent: ReturnType<typeof request.agent>
  let adminUserId: string
  let teacherUserId: string
  let studentUserId: string

  beforeAll(async () => {
    // 1. Create Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'REST Integration High School' },
    })

    // 2. Sign up Admin User and establish session
    adminAgent = request.agent(app)
    const adminEmail = `admin-${Date.now()}@karma.dev`
    const signUpRes = await adminAgent.post('/api/auth/sign-up/email').send({
      email: adminEmail,
      name: 'System Administrator',
      password: 'StrongAdminPassword123!',
    })
    expect(signUpRes.status).toBe(200)

    const sessionRes = await adminAgent.get('/api/auth/get-session')
    adminUserId = sessionRes.body.user.id

    // Assign ADMIN role in this organization
    await rawPrisma.member.create({
      data: {
        id: `mem-${Date.now()}`,
        organizationId: orgId,
        userId: adminUserId,
        role: 'ADMIN',
      },
    })

    // 3. Create teacher user & student user for foreign keys
    const tUser = await rawPrisma.user.create({
      data: {
        id: `usr-tch-api-${Date.now()}`,
        email: `teacher-api-${Date.now()}@karma.dev`,
        name: 'Tarek Teacher',
      },
    })
    teacherUserId = tUser.id

    const sUser = await rawPrisma.user.create({
      data: {
        id: `usr-stu-api-${Date.now()}`,
        email: `student-api-${Date.now()}@karma.dev`,
        name: 'Ziad Student',
      },
    })
    studentUserId = sUser.id
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  describe('Security & Middleware Guards', () => {
    it('rejects unauthenticated requests with 401', async () => {
      const res = await request(app)
        .post('/api/students')
        .set('x-organization-id', orgId)
        .send({})
      expect(res.status).toBe(401)
      expect(res.body.error.code).toBe('UNAUTHORIZED')
    })

    it('rejects requests missing x-organization-id header with 400', async () => {
      const res = await adminAgent.post('/api/students').send({})
      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('BAD_REQUEST')
    })

    it('rejects invalid payload with 400 validation error', async () => {
      const res = await adminAgent
        .post('/api/students')
        .set('x-organization-id', orgId)
        .send({ invalidField: true })
      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('VALIDATION_ERROR')
    })
  })

  describe('End-to-End Academic & Grading Flow via REST', () => {
    let academicYearId: string
    let termId: string
    let subjectId: string
    let classId: string
    let teacherId: string
    let classSubjectId: string
    let studentId: string
    let resultId: string

    it('creates an academic year (POST /api/academic/years)', async () => {
      const res = await adminAgent
        .post('/api/academic/years')
        .set('x-organization-id', orgId)
        .send({
          name: `Academic Year ${Date.now()}`,
          startDate: '2025-09-01',
          endDate: '2026-06-30',
          status: 'ACTIVE',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('ACTIVE')
      academicYearId = res.body.data.id
    })

    it('creates an academic term (POST /api/academic/terms)', async () => {
      const res = await adminAgent
        .post('/api/academic/terms')
        .set('x-organization-id', orgId)
        .send({
          academicYearId,
          name: 'Semester 1',
          order: 1,
          startDate: '2025-09-01',
          endDate: '2026-01-20',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      termId = res.body.data.id
    })

    it('creates a subject (POST /api/academic/subjects)', async () => {
      const res = await adminAgent
        .post('/api/academic/subjects')
        .set('x-organization-id', orgId)
        .send({
          code: `CHEM-${Date.now()}`,
          name: 'Chemistry',
          description: 'General Chemistry',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      subjectId = res.body.data.id
    })

    it('creates a class (POST /api/academic/classes)', async () => {
      const res = await adminAgent
        .post('/api/academic/classes')
        .set('x-organization-id', orgId)
        .send({
          academicYearId,
          name: 'Grade 10 Chemistry',
          gradeLevel: 10,
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      classId = res.body.data.id
    })

    it('creates a teacher profile (POST /api/teachers)', async () => {
      const res = await adminAgent
        .post('/api/teachers')
        .set('x-organization-id', orgId)
        .send({
          userId: teacherUserId,
          employeeCode: `EMP-API-${Date.now()}`,
          firstName: 'Tarek',
          lastName: 'Mansour',
          hireDate: '2024-08-01',
          specialization: 'Inorganic Chemistry',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      teacherId = res.body.data.id
    })

    it('qualifies teacher for subject (POST /api/teachers/:id/qualifications)', async () => {
      const res = await adminAgent
        .post(`/api/teachers/${teacherId}/qualifications`)
        .set('x-organization-id', orgId)
        .send({ subjectId })

      expect(res.status).toBe(201)
      expect(res.body.data.subjectId).toBe(subjectId)
    })

    it('assigns qualified teacher to class subject (POST /api/academic/classes/:id/subjects)', async () => {
      const res = await adminAgent
        .post(`/api/academic/classes/${classId}/subjects`)
        .set('x-organization-id', orgId)
        .send({
          subjectId,
          teacherId,
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      classSubjectId = res.body.data.id
    })

    it('creates a student profile (POST /api/students)', async () => {
      const res = await adminAgent
        .post('/api/students')
        .set('x-organization-id', orgId)
        .send({
          userId: studentUserId,
          studentCode: `STU-API-${Date.now()}`,
          firstName: 'Ziad',
          lastName: 'Hatem',
          dateOfBirth: '2010-04-12',
          admissionDate: '2025-09-01',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      studentId = res.body.data.id
    })

    it('enrolls student in class (POST /api/students/:id/enroll)', async () => {
      const res = await adminAgent
        .post(`/api/students/${studentId}/enroll`)
        .set('x-organization-id', orgId)
        .send({
          classId,
          academicYearId,
        })

      expect(res.status).toBe(201)
      expect(res.body.data.status).toBe('ACTIVE')
      expect(res.body.data.classId).toBe(classId)
    })

    it('publishes frozen result snapshot (POST /api/results/publish)', async () => {
      const res = await adminAgent
        .post('/api/results/publish')
        .set('x-organization-id', orgId)
        .send({
          studentId,
          classSubjectId,
          termId,
          score: 94.5,
          letterGrade: 'A',
          breakdown: [
            { category: 'Quizzes', weight: 30, earned: 28.5, possible: 30 },
            { category: 'Final', weight: 70, earned: 66, possible: 70 },
          ],
          comment: 'Outstanding practical lab performance.',
        })

      expect(res.status).toBe(201)
      resultId = res.body.data.id
      expect(resultId).toBeDefined()
      expect(res.body.data.version).toBe(1)
      expect(Number(res.body.data.score)).toBe(94.5)
    })

    it('corrects result immutably with audit trail (POST /api/results/:id/correct)', async () => {
      const res = await adminAgent
        .post(`/api/results/${resultId}/correct`)
        .set('x-organization-id', orgId)
        .send({
          newScore: 97.0,
          newLetterGrade: 'A+',
          newBreakdown: [
            { category: 'Quizzes', weight: 30, earned: 30, possible: 30 },
            { category: 'Final', weight: 70, earned: 67, possible: 70 },
          ],
          correctionReason: 'Lab report quiz 2 recalculation approved by department head.',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.version).toBe(2)
      expect(Number(res.body.data.score)).toBe(97)
      expect(res.body.data.correctionReason).toBe(
        'Lab report quiz 2 recalculation approved by department head.'
      )
    })
  })
})
