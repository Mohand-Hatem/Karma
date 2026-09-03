import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { validateBody } from '../../middleware/validator'
import {
  publishResult,
  correctResult,
  getResultById,
  listStudentResults,
} from './result.service'

export const resultRouter = Router()

resultRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const GradeBreakdownItemSchema = z.object({
  category: z.string().min(1),
  weight: z.number().min(0),
  earned: z.number().min(0),
  possible: z.number().min(0),
})

const PublishResultSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  classSubjectId: z.string().min(1, 'Class Subject ID is required'),
  termId: z.string().min(1, 'Term ID is required'),
  score: z.number().min(0).max(100),
  letterGrade: z.string().optional(),
  breakdown: z.array(GradeBreakdownItemSchema),
  comment: z.string().optional(),
})

const CorrectResultSchema = z.object({
  newScore: z.number().min(0).max(100),
  newLetterGrade: z.string().optional(),
  newBreakdown: z.array(GradeBreakdownItemSchema),
  correctionReason: z.string().min(5, 'Correction reason must explain why the grade was revised'),
})

// 2. Endpoints
// POST /api/results/publish (ADMIN or TEACHER)
resultRouter.post(
  '/publish',
  requireRole(['ADMIN', 'TEACHER']),
  validateBody(PublishResultSchema),
  async (req, res, next) => {
    try {
      const result = await publishResult(rawPrisma, {
        ...req.body,
        publishedById: req.session!.user.id,
      })
      res.status(201).json({ success: true, data: result })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/results/:id/correct (ADMIN or TEACHER)
resultRouter.post(
  '/:id/correct',
  requireRole(['ADMIN', 'TEACHER']),
  validateBody(CorrectResultSchema),
  async (req, res, next) => {
    try {
      const corrected = await correctResult(rawPrisma, {
        priorResultId: req.params.id as string,
        newScore: req.body.newScore,
        newLetterGrade: req.body.newLetterGrade,
        newBreakdown: req.body.newBreakdown,
        correctionReason: req.body.correctionReason,
        actorUserId: req.session!.user.id,
      })
      res.status(200).json({ success: true, data: corrected })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/results/:id (ADMIN or TEACHER)
resultRouter.get('/:id', requireRole(['ADMIN', 'TEACHER']), async (req, res, next) => {
  try {
    const result = await getResultById(rawPrisma, req.params.id as string)
    res.status(200).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
})

// GET /api/results/student/:studentId (ADMIN or TEACHER)
resultRouter.get(
  '/student/:studentId',
  requireRole(['ADMIN', 'TEACHER']),
  async (req, res, next) => {
    try {
      const termId = typeof req.query.termId === 'string' ? req.query.termId : undefined
      const results = await listStudentResults(rawPrisma, req.params.studentId as string, termId)
      res.status(200).json({ success: true, data: results })
    } catch (err) {
      next(err)
    }
  }
)
