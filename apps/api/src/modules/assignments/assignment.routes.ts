import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { ForbiddenError } from '../../middleware/error-handler'
import { validateBody, validateQuery } from '../../middleware/validator'
import { findStudentByUserId } from '../students/student.repository'
import { findTeacherByUserId } from '../teachers/teacher.repository'
import {
  createAssignmentRecord,
  getAssignment,
  listClassAssignments,
  submitStudentAssignment,
  gradeStudentSubmission,
} from './assignment.service'

export const assignmentRouter = Router()

assignmentRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const CreateAssignmentSchema = z.object({
  classSubjectId: z.string().min(1, 'Class Subject ID is required'),
  gradeCategoryId: z.string().optional(),
  title: z.string().min(1, 'Title is required'),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  instructions: z.string().optional(),
  maxScore: z.number().positive('Max score must be greater than 0'),
  dueAt: z.coerce.date(),
  lateUntil: z.coerce.date().optional(),
  allowLateSubmission: z.boolean().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
})

const AssignmentFilterSchema = z.object({
  classSubjectId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'CLOSED']).optional(),
})

const SubmitAssignmentSchema = z.object({
  content: z.string().min(1, 'Submission content is required'),
})

const GradeSubmissionSchema = z.object({
  score: z.number().min(0, 'Score cannot be negative'),
  feedback: z.string().optional(),
})

// 2. Endpoints
// POST /api/assignments - Create Assignment (TEACHER or ADMIN)
assignmentRouter.post(
  '/',
  requireRole(['TEACHER', 'ADMIN']),
  validateBody(CreateAssignmentSchema),
  async (req, res, next) => {
    try {
      let teacherId = req.session!.user.id
      if (req.member?.role === 'TEACHER') {
        const teacher = await findTeacherByUserId(rawPrisma, req.session!.user.id)
        if (!teacher) throw new ForbiddenError('Teacher profile required')
        teacherId = teacher.id
      }

      const assignment = await createAssignmentRecord(
        rawPrisma,
        {
          ...req.body,
          createdById: teacherId,
        },
        req.member?.role === 'TEACHER' ? teacherId : undefined
      )
      res.status(201).json({ success: true, data: assignment })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/assignments - List Assignments
assignmentRouter.get(
  '/',
  requireRole(['ADMIN', 'TEACHER', 'STUDENT']),
  validateQuery(AssignmentFilterSchema),
  async (req, res, next) => {
    try {
      const assignments = await listClassAssignments(
        rawPrisma,
        req.query,
        req.member?.role
      )
      res.status(200).json({ success: true, data: assignments })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/assignments/:id - Get Assignment Details
assignmentRouter.get('/:id', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), async (req, res, next) => {
  try {
    const assignment = await getAssignment(rawPrisma, req.params.id as string, req.member?.role)
    res.status(200).json({ success: true, data: assignment })
  } catch (err) {
    next(err)
  }
})

// POST /api/assignments/:id/submit - Submit Student Work (STUDENT only)
assignmentRouter.post(
  '/:id/submit',
  requireRole(['STUDENT']),
  validateBody(SubmitAssignmentSchema),
  async (req, res, next) => {
    try {
      const student = await findStudentByUserId(rawPrisma, req.session!.user.id)
      if (!student) throw new ForbiddenError('Student profile required')

      const submission = await submitStudentAssignment(rawPrisma, {
        assignmentId: req.params.id as string,
        studentId: student.id,
        content: req.body.content,
      })
      res.status(201).json({ success: true, data: submission })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/assignments/submissions/:id/grade - Grade Submission (TEACHER only)
assignmentRouter.post(
  '/submissions/:id/grade',
  requireRole(['TEACHER', 'ADMIN']),
  validateBody(GradeSubmissionSchema),
  async (req, res, next) => {
    try {
      const teacher = await findTeacherByUserId(rawPrisma, req.session!.user.id)
      if (!teacher) throw new ForbiddenError('Teacher profile required')

      const graded = await gradeStudentSubmission(rawPrisma, {
        submissionId: req.params.id as string,
        score: req.body.score,
        feedback: req.body.feedback,
        actorTeacherId: teacher.id,
      })
      res.status(200).json({ success: true, data: graded })
    } catch (err) {
      next(err)
    }
  }
)
