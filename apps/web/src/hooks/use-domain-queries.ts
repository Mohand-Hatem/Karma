'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '../lib/query-keys'
import {
  fetchStudents,
  fetchStudentById,
  type GetStudentsParams,
} from '../services/api/students.service'
import {
  fetchTeachers,
  fetchTeacherById,
  type GetTeachersParams,
} from '../services/api/teachers.service'
import {
  fetchClasses,
  fetchClassById,
} from '../services/api/classes.service'
import { fetchAssignments } from '../services/api/assignments.service'
import { fetchAttendanceRegister } from '../services/api/attendance.service'

/**
 * React Query Hooks for Domain Entities
 * 
 * Provides unified caching, deduplication, and background synchronization.
 * In Phase 2, these hooks bind directly to live Prisma backend routes with 0 UI changes.
 */

export function useStudentsQuery(params?: GetStudentsParams) {
  return useQuery({
    queryKey: queryKeys.students.list(params as Record<string, unknown>),
    queryFn: () => fetchStudents(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useStudentDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.students.detail(id),
    queryFn: () => fetchStudentById(id),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(id),
  })
}

export function useTeachersQuery(params?: GetTeachersParams) {
  return useQuery({
    queryKey: queryKeys.teachers.list(params as Record<string, unknown>),
    queryFn: () => fetchTeachers(params),
    staleTime: 5 * 60 * 1000,
  })
}

export function useTeacherDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.teachers.detail(id),
    queryFn: () => fetchTeacherById(id),
    staleTime: 5 * 60 * 1000,
    enabled: Boolean(id),
  })
}

export function useClassesQuery(params?: { grade?: string; search?: string }) {
  return useQuery({
    queryKey: queryKeys.classes.list(params as Record<string, unknown>),
    queryFn: () => fetchClasses(params),
    staleTime: 15 * 60 * 1000, // 15 minutes
  })
}

export function useClassDetailQuery(id: string) {
  return useQuery({
    queryKey: queryKeys.classes.detail(id),
    queryFn: () => fetchClassById(id),
    staleTime: 15 * 60 * 1000,
    enabled: Boolean(id),
  })
}

export function useAssignmentsQuery() {
  return useQuery({
    queryKey: queryKeys.assignments.lists(),
    queryFn: () => fetchAssignments(),
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export function useAttendanceRegisterQuery(classId: string, date: string) {
  return useQuery({
    queryKey: queryKeys.attendance.register(classId, date),
    queryFn: () => fetchAttendanceRegister(classId, date),
    staleTime: 30 * 1000, // 30 seconds for live roll call
  })
}
