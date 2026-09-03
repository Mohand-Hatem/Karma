import { Router } from 'express'
import { z } from 'zod'
import { rawPrisma } from '../../db/prisma'
import { authenticate, requireAuth, requireRole, resolveTenant } from '../../middleware/auth-guard'
import { validateBody, validateQuery } from '../../middleware/validator'
import {
  createStudentProfile,
  getStudentById,
  listStudents,
  enrollStudent,
  linkParentToStudent,
} from './student.service'

export const studentRouter = Router()

// Apply authentication and tenant resolution to all student endpoints
studentRouter.use(authenticate, requireAuth, resolveTenant)

// 1. Zod Schemas
const CreateStudentSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  studentCode: z.string().min(2, 'Student code must be at least 2 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  firstNameAr: z.string().optional(),
  lastNameAr: z.string().optional(),
  dateOfBirth: z.coerce.date(),
  admissionDate: z.coerce.date(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
})

const StudentFilterSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE', 'SUSPENDED', 'ARCHIVED']).optional(),
  search: z.string().optional(),
  cursor: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
})

const EnrollStudentSchema = z.object({
  classId: z.string().min(1, 'Class ID is required'),
  academicYearId: z.string().min(1, 'Academic year ID is required'),
})

const LinkParentSchema = z.object({
  parentId: z.string().min(1, 'Parent ID is required'),
  relationship: z.enum(['FATHER', 'MOTHER', 'GUARDIAN', 'OTHER']),
  isPrimaryContact: z.boolean().optional(),
})

// 2. Endpoints
// POST /api/students - Register Student (ADMIN only)
studentRouter.post(
  '/',
  requireRole(['ADMIN']),
  validateBody(CreateStudentSchema),
  async (req, res, next) => {
    try {
      const student = await createStudentProfile(rawPrisma, req.body)
      res.status(201).json({ success: true, data: student })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/students - List Students (ADMIN or TEACHER)
studentRouter.get(
  '/',
  requireRole(['ADMIN', 'TEACHER']),
  validateQuery(StudentFilterSchema),
  async (req, res, next) => {
    try {
      const students = await listStudents(rawPrisma, req.query)
      res.status(200).json({ success: true, data: students })
    } catch (err) {
      next(err)
    }
  }
)

// GET /api/students/:id - Get Student Profile (ADMIN or TEACHER)
studentRouter.get('/:id', requireRole(['ADMIN', 'TEACHER']), async (req, res, next) => {
  try {
    const student = await getStudentById(rawPrisma, req.params.id as string)
    res.status(200).json({ success: true, data: student })
  } catch (err) {
    next(err)
  }
})

// POST /api/students/:id/enroll - Enroll or Transfer Student (ADMIN only)
studentRouter.post(
  '/:id/enroll',
  requireRole(['ADMIN']),
  validateBody(EnrollStudentSchema),
  async (req, res, next) => {
    try {
      const enrollment = await enrollStudent(rawPrisma, {
        studentId: req.params.id as string,
        classId: req.body.classId,
        academicYearId: req.body.academicYearId,
      })
      res.status(201).json({ success: true, data: enrollment })
    } catch (err) {
      next(err)
    }
  }
)

// POST /api/students/:id/parents - Link Parent to Student (ADMIN only)
studentRouter.post(
  '/:id/parents',
  requireRole(['ADMIN']),
  validateBody(LinkParentSchema),
  async (req, res, next) => {
    try {
      const link = await linkParentToStudent(rawPrisma, {
        studentId: req.params.id as string,
        parentId: req.body.parentId,
        relationship: req.body.relationship,
        isPrimaryContact: req.body.isPrimaryContact,
      })
      res.status(201).json({ success: true, data: link })
    } catch (err) {
      next(err)
    }
  }
)
