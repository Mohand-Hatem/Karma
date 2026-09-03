import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { validateBody } from '../../middleware/validator'
import { findClassById } from './academic.repository'
import {
  createAcademicYear,
  createTerm,
  createClass,
  createSubject,
  assignTeacherToClassSubject,
} from './academic.service'

export const academicRouter = Router()

academicRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const CreateAcademicYearSchema = z.object({
  name: z.string().min(1, 'Academic year name is required'),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
  status: z.enum(['UPCOMING', 'ACTIVE', 'CLOSED', 'ARCHIVED']).optional(),
})

const CreateTermSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  name: z.string().min(1, 'Term name is required'),
  nameAr: z.string().optional(),
  order: z.number().int().min(1),
  startDate: z.coerce.date(),
  endDate: z.coerce.date(),
})

const CreateSubjectSchema = z.object({
  code: z.string().min(1, 'Subject code is required'),
  name: z.string().min(1, 'Subject name is required'),
  nameAr: z.string().optional(),
  description: z.string().optional(),
})

const CreateClassSchema = z.object({
  academicYearId: z.string().min(1, 'Academic year ID is required'),
  name: z.string().min(1, 'Class name is required'),
  nameAr: z.string().optional(),
  gradeLevel: z.number().int().min(1).max(12),
  section: z.string().optional(),
  homeroomTeacherId: z.string().optional(),
  capacity: z.number().int().min(1).optional(),
})

const AssignClassSubjectSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
  teacherId: z.string().min(1, 'Teacher ID is required'),
})

// 2. Endpoints
// POST /api/academic/years (ADMIN only)
academicRouter.post(
  '/years',
  requireRole(['ADMIN']),
  validateBody(CreateAcademicYearSchema),
  async (req, res, next) => {
    try {
      const year = await createAcademicYear(rawPrisma, req.body)
      res.status(201).json({ success: true, data: year })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/academic/terms (ADMIN only)
academicRouter.post(
  '/terms',
  requireRole(['ADMIN']),
  validateBody(CreateTermSchema),
  async (req, res, next) => {
    try {
      const term = await createTerm(rawPrisma, req.body)
      res.status(201).json({ success: true, data: term })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/academic/subjects (ADMIN only)
academicRouter.post(
  '/subjects',
  requireRole(['ADMIN']),
  validateBody(CreateSubjectSchema),
  async (req, res, next) => {
    try {
      const subject = await createSubject(rawPrisma, req.body)
      res.status(201).json({ success: true, data: subject })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/academic/classes (ADMIN only)
academicRouter.post(
  '/classes',
  requireRole(['ADMIN']),
  validateBody(CreateClassSchema),
  async (req, res, next) => {
    try {
      const classRecord = await createClass(rawPrisma, req.body)
      res.status(201).json({ success: true, data: classRecord })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/academic/classes/:id (ADMIN or TEACHER)
academicRouter.get('/classes/:id', requireRole(['ADMIN', 'TEACHER']), async (req, res, next) => {
  try {
    const classRecord = await findClassById(rawPrisma, req.params.id as string)
    res.status(200).json({ success: true, data: classRecord })
  } catch (err) {
    next(err)
  }
})

// POST /api/academic/classes/:id/subjects (ADMIN only - Assign teacher to class subject)
academicRouter.post(
  '/classes/:id/subjects',
  requireRole(['ADMIN']),
  validateBody(AssignClassSubjectSchema),
  async (req, res, next) => {
    try {
      const classSubject = await assignTeacherToClassSubject(rawPrisma, {
        classId: req.params.id as string,
        subjectId: req.body.subjectId,
        teacherId: req.body.teacherId,
      })
      res.status(201).json({ success: true, data: classSubject })
    } catch (err) {
      next(err)
    }
  }
)
