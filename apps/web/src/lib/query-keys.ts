/**
 * Centralized TanStack React Query Key Factory for @karma/web
 * 
 * Provides deterministic, hierarchical query keys for all domain models,
 * ensuring clean cache invalidation, mutation updates, and zero key typos.
 */

export const queryKeys = {
  auth: {
    all: ['auth'] as const,
    session: () => [...queryKeys.auth.all, 'session'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    organization: () => [...queryKeys.auth.all, 'organization'] as const,
  },
  dashboard: {
    all: ['dashboard'] as const,
    stats: (role: string) => [...queryKeys.dashboard.all, 'stats', role] as const,
    executive: () => [...queryKeys.dashboard.all, 'executive'] as const,
  },
  students: {
    all: ['students'] as const,
    lists: () => [...queryKeys.students.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.students.lists(), params] as const) : queryKeys.students.lists(),
    details: () => [...queryKeys.students.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.students.details(), id] as const,
  },
  teachers: {
    all: ['teachers'] as const,
    lists: () => [...queryKeys.teachers.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.teachers.lists(), params] as const) : queryKeys.teachers.lists(),
    details: () => [...queryKeys.teachers.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.teachers.details(), id] as const,
  },
  classes: {
    all: ['classes'] as const,
    lists: () => [...queryKeys.classes.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.classes.lists(), params] as const) : queryKeys.classes.lists(),
    details: () => [...queryKeys.classes.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.classes.details(), id] as const,
    roster: (id: string) => [...queryKeys.classes.detail(id), 'roster'] as const,
  },
  assignments: {
    all: ['assignments'] as const,
    lists: () => [...queryKeys.assignments.all, 'list'] as const,
    list: (params?: Record<string, unknown>) =>
      params ? ([...queryKeys.assignments.lists(), params] as const) : queryKeys.assignments.lists(),
    details: () => [...queryKeys.assignments.all, 'detail'] as const,
    detail: (id: string) => [...queryKeys.assignments.details(), id] as const,
    submissions: (id: string) => [...queryKeys.assignments.detail(id), 'submissions'] as const,
  },
  attendance: {
    all: ['attendance'] as const,
    register: (classId: string, date: string) =>
      [...queryKeys.attendance.all, 'register', classId, date] as const,
    analytics: (cohortId: string, termId: string) =>
      [...queryKeys.attendance.all, 'analytics', cohortId, termId] as const,
    watchlist: () => [...queryKeys.attendance.all, 'watchlist'] as const,
  },
  academic: {
    all: ['academic'] as const,
    years: () => [...queryKeys.academic.all, 'years'] as const,
    terms: (yearId?: string) => [...queryKeys.academic.all, 'terms', yearId || 'current'] as const,
    subjects: () => [...queryKeys.academic.all, 'subjects'] as const,
  },
  notifications: {
    all: ['notifications'] as const,
    list: (filter?: string) => [...queryKeys.notifications.all, 'list', filter || 'all'] as const,
    unreadCount: () => [...queryKeys.notifications.all, 'unread-count'] as const,
  },
}
