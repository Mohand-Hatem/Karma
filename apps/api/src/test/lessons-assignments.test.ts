import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import request from 'supertest'
import { createApp } from '../app'
import { rawPrisma } from '../db/prisma'

describe('Lessons, Assignments & Submissions (Task 1.4 Integration)', () => {
  const app = createApp()
  const orgId = `la-test-org-${Date.now()}`
  let teacherAgent: ReturnType<typeof request.agent>
  let studentAgent: ReturnType<typeof request.agent>
  let teacherId: string
  let studentId: string
  let classSubjectId: string

  beforeAll(async () => {
    // 1. Create Organization
    await rawPrisma.organization.create({
      data: { id: orgId, name: 'Learning Management Academy' },
    })

    // 2. Create Teacher and session
    teacherAgent = request.agent(app)
    const teacherEmail = `teacher-la-${Date.now()}@karma.dev`
    await teacherAgent.post('/api/auth/sign-up/email').send({
      email: teacherEmail,
      name: 'Professor Amina',
      password: 'StrongTeacherPassword123!',
    })
    const teacherSession = await teacherAgent.get('/api/auth/get-session')
    const teacherUserId = teacherSession.body.user.id

    await rawPrisma.member.create({
      data: {
        id: `mem-t-${Date.now()}`,
        organizationId: orgId,
        userId: teacherUserId,
        role: 'TEACHER',
      },
    })

    const teacher = await rawPrisma.teacher.create({
      data: {
        organizationId: orgId,
        userId: teacherUserId,
        employeeCode: `EMP-LA-${Date.now()}`,
        firstName: 'Amina',
        lastName: 'Zaki',
        hireDate: new Date('2023-09-01'),
      },
    })
    teacherId = teacher.id

    // 3. Create Student and session
    studentAgent = request.agent(app)
    const studentEmail = `student-la-${Date.now()}@karma.dev`
    await studentAgent.post('/api/auth/sign-up/email').send({
      email: studentEmail,
      name: 'Youssef Nabil',
      password: 'StrongStudentPassword123!',
    })
    const studentSession = await studentAgent.get('/api/auth/get-session')
    const studentUserId = studentSession.body.user.id

    await rawPrisma.member.create({
      data: {
        id: `mem-s-${Date.now()}`,
        organizationId: orgId,
        userId: studentUserId,
        role: 'STUDENT',
      },
    })

    const student = await rawPrisma.student.create({
      data: {
        organizationId: orgId,
        userId: studentUserId,
        studentCode: `STU-LA-${Date.now()}`,
        firstName: 'Youssef',
        lastName: 'Nabil',
        dateOfBirth: new Date('2010-06-15'),
        admissionDate: new Date('2025-09-01'),
      },
    })
    studentId = student.id

    // 4. Setup Year, Term, Class, Subject, TeacherSubject, ClassSubject, Enrollment
    const year = await rawPrisma.academicYear.create({
      data: {
        organizationId: orgId,
        name: `Year-${Date.now()}`,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2026-06-30'),
        status: 'ACTIVE',
      },
    })

    const classRecord = await rawPrisma.class.create({
      data: {
        organizationId: orgId,
        academicYearId: year.id,
        name: 'Grade 11 Literature',
        gradeLevel: 11,
      },
    })

    const subject = await rawPrisma.subject.create({
      data: {
        organizationId: orgId,
        code: `LIT-${Date.now()}`,
        name: 'World Literature',
      },
    })

    await rawPrisma.teacherSubject.create({
      data: {
        organizationId: orgId,
        teacherId,
        subjectId: subject.id,
      },
    })

    const cs = await rawPrisma.classSubject.create({
      data: {
        organizationId: orgId,
        classId: classRecord.id,
        subjectId: subject.id,
        teacherId,
      },
    })
    classSubjectId = cs.id

    await rawPrisma.studentEnrollment.create({
      data: {
        organizationId: orgId,
        studentId,
        classId: classRecord.id,
        academicYearId: year.id,
        status: 'ACTIVE',
      },
    })
  })

  afterAll(async () => {
    await rawPrisma.organization.delete({ where: { id: orgId } })
  })

  describe('Lessons Flow', () => {
    let lessonId: string

    it('teacher creates a draft lesson (POST /api/lessons)', async () => {
      const res = await teacherAgent
        .post('/api/lessons')
        .set('x-organization-id', orgId)
        .send({
          classSubjectId,
          title: 'Introduction to Modernist Poetry',
          description: 'Overview of T.S. Eliot and Ezra Pound',
          status: 'DRAFT',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('DRAFT')
      lessonId = res.body.data.id
    })

    it('student cannot view unpublished draft lesson (GET /api/lessons/:id -> 403)', async () => {
      const res = await studentAgent
        .get(`/api/lessons/${lessonId}`)
        .set('x-organization-id', orgId)

      expect(res.status).toBe(403)
      expect(res.body.error.code).toBe('FORBIDDEN')
    })

    it('teacher publishes lesson (POST /api/lessons/:id/publish)', async () => {
      const res = await teacherAgent
        .post(`/api/lessons/${lessonId}/publish`)
        .set('x-organization-id', orgId)

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('PUBLISHED')
    })

    it('student can now view published lesson (GET /api/lessons/:id)', async () => {
      const res = await studentAgent
        .get(`/api/lessons/${lessonId}`)
        .set('x-organization-id', orgId)

      expect(res.status).toBe(200)
      expect(res.body.data.id).toBe(lessonId)
      expect(res.body.data.title).toBe('Introduction to Modernist Poetry')
    })
  })

  describe('Assignments & Submissions Flow', () => {
    let assignmentId: string
    let submissionId: string

    it('teacher creates an assignment (POST /api/assignments)', async () => {
      const futureDueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

      const res = await teacherAgent
        .post('/api/assignments')
        .set('x-organization-id', orgId)
        .send({
          classSubjectId,
          title: 'Essay: The Waste Land Critical Analysis',
          description: 'Analyze motifs of fragmentation in 1,200 words.',
          maxScore: 50,
          dueAt: futureDueDate,
          status: 'PUBLISHED',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      expect(Number(res.body.data.maxScore)).toBe(50)
      assignmentId = res.body.data.id
    })

    it('student submits assignment work (POST /api/assignments/:id/submit)', async () => {
      const res = await studentAgent
        .post(`/api/assignments/${assignmentId}/submit`)
        .set('x-organization-id', orgId)
        .send({
          content: 'Here is my critical analysis of The Waste Land focusing on the burial of the dead motif.',
        })

      expect(res.status).toBe(201)
      expect(res.body.data.id).toBeDefined()
      expect(res.body.data.status).toBe('SUBMITTED')
      submissionId = res.body.data.id
    })

    it('rejects duplicate student submission for same assignment (POST /api/assignments/:id/submit -> 409)', async () => {
      const res = await studentAgent
        .post(`/api/assignments/${assignmentId}/submit`)
        .set('x-organization-id', orgId)
        .send({
          content: 'Attempting to resubmit my essay.',
        })

      expect(res.status).toBe(409)
      expect(res.body.error.code).toBe('CONFLICT')
    })

    it('teacher grades submission (POST /api/assignments/submissions/:id/grade)', async () => {
      const res = await teacherAgent
        .post(`/api/assignments/submissions/${submissionId}/grade`)
        .set('x-organization-id', orgId)
        .send({
          score: 47.5,
          feedback: 'Insightful textual analysis and solid thesis construction.',
        })

      expect(res.status).toBe(200)
      expect(res.body.data.status).toBe('GRADED')
      expect(Number(res.body.data.score)).toBe(47.5)
      expect(res.body.data.feedback).toBe(
        'Insightful textual analysis and solid thesis construction.'
      )
    })

    it('rejects grading score exceeding maxScore (POST /api/assignments/submissions/:id/grade -> 400)', async () => {
      const res = await teacherAgent
        .post(`/api/assignments/submissions/${submissionId}/grade`)
        .set('x-organization-id', orgId)
        .send({
          score: 65, // Max score is 50!
          feedback: 'Too high score',
        })

      expect(res.status).toBe(400)
      expect(res.body.error.code).toBe('BAD_REQUEST')
    })
  })
})
