import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { validateBody, validateQuery } from '../../middleware/validator'
import { findTeacherByUserId } from '../teachers/teacher.repository'
import {
  createLessonRecord,
  getLesson,
  listClassLessons,
  publishLesson,
} from './lesson.service'

export const lessonRouter = Router()

lessonRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const CreateLessonSchema = z.object({
  classSubjectId: z.string().min(1, 'Class Subject ID is required'),
  title: z.string().min(1, 'Title is required'),
  titleAr: z.string().optional(),
  description: z.string().optional(),
  content: z.string().optional(),
  scheduledAt: z.coerce.date().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

const LessonFilterSchema = z.object({
  classSubjectId: z.string().optional(),
  status: z.enum(['DRAFT', 'PUBLISHED']).optional(),
})

// 2. Endpoints
// POST /api/lessons - Create Lesson (TEACHER or ADMIN)
lessonRouter.post(
  '/',
  requireRole(['TEACHER', 'ADMIN']),
  validateBody(CreateLessonSchema),
  async (req, res, next) => {
    try {
      let teacherId: string | undefined
      if (req.member?.role === 'TEACHER') {
        const teacher = await findTeacherByUserId(rawPrisma, req.session!.user.id)
        teacherId = teacher?.id
      }

      const lesson = await createLessonRecord(
        rawPrisma,
        {
          ...req.body,
          createdById: req.session!.user.id,
        },
        teacherId
      )
      res.status(201).json({ success: true, data: lesson })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/lessons - List Lessons
lessonRouter.get(
  '/',
  requireRole(['ADMIN', 'TEACHER', 'STUDENT']),
  validateQuery(LessonFilterSchema),
  async (req, res, next) => {
    try {
      const lessons = await listClassLessons(
        rawPrisma,
        req.query,
        req.member?.role
      )
      res.status(200).json({ success: true, data: lessons })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/lessons/:id - Get Lesson Details
lessonRouter.get('/:id', requireRole(['ADMIN', 'TEACHER', 'STUDENT']), async (req, res, next) => {
  try {
    const lesson = await getLesson(rawPrisma, req.params.id as string, req.member?.role)
    res.status(200).json({ success: true, data: lesson })
  } catch (err) {
    next(err)
  }
})

// POST /api/lessons/:id/publish - Publish Lesson (TEACHER or ADMIN)
lessonRouter.post(
  '/:id/publish',
  requireRole(['TEACHER', 'ADMIN']),
  async (req, res, next) => {
    try {
      let teacherId: string | undefined
      if (req.member?.role === 'TEACHER') {
        const teacher = await findTeacherByUserId(rawPrisma, req.session!.user.id)
        teacherId = teacher?.id
      }

      const lesson = await publishLesson(rawPrisma, req.params.id as string, teacherId)
      res.status(200).json({ success: true, data: lesson })
    } catch (err) {
      next(err)
    }
  }
)
