import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { validateBody, validateQuery } from '../../middleware/validator'
import {
  createTeacherProfile,
  getTeacherById,
  listTeachers,
  qualifyTeacherForSubject,
} from './teacher.service'

export const teacherRouter = Router()

// Apply authentication and tenant resolution
teacherRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const CreateTeacherSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  employeeCode: z.string().min(2, 'Employee code must be at least 2 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  specialization: z.string().optional(),
  hireDate: z.coerce.date(),
})

const TeacherFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
})

const AddQualificationSchema = z.object({
  subjectId: z.string().min(1, 'Subject ID is required'),
})

// 2. Endpoints
// POST /api/teachers - Register Teacher Profile (ADMIN only)
teacherRouter.post(
  '/',
  requireRole(['ADMIN']),
  validateBody(CreateTeacherSchema),
  async (req, res, next) => {
    try {
      const teacher = await createTeacherProfile(rawPrisma, req.body)
      res.status(201).json({ success: true, data: teacher })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/teachers - List Teachers (ADMIN or TEACHER)
teacherRouter.get(
  '/',
  requireRole(['ADMIN', 'TEACHER']),
  validateQuery(TeacherFilterSchema),
  async (req, res, next) => {
    try {
      const teachers = await listTeachers(rawPrisma, req.query)
      res.status(200).json({ success: true, data: teachers })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/teachers/:id - Get Teacher Profile
teacherRouter.get('/:id', requireRole(['ADMIN', 'TEACHER']), async (req, res, next) => {
  try {
    const teacher = await getTeacherById(rawPrisma, req.params.id as string)
    res.status(200).json({ success: true, data: teacher })
  } catch (err) {
    next(err)
  }
})

// POST /api/teachers/:id/qualifications - Add Subject Qualification (ADMIN only)
teacherRouter.post(
  '/:id/qualifications',
  requireRole(['ADMIN']),
  validateBody(AddQualificationSchema),
  async (req, res, next) => {
    try {
      const qual = await qualifyTeacherForSubject(rawPrisma, req.params.id as string, req.body.subjectId)
      res.status(201).json({ success: true, data: qual })
    } catch (err) {
      next(err)
    }
  }
)
