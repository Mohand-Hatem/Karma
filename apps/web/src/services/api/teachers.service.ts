import { apiClient } from '../../lib/api-client'

export interface TeacherListItem {
  id: string
  name: string
  arabicName: string
  employeeId: string
  department: string
  roleTitle: string
  status: 'ACTIVE' | 'ON_LEAVE'
  phone: string
  email: string
  classesCount: number
  totalStudents: number
  initials: string
}

export const MOCK_TEACHERS: TeacherListItem[] = [
  {
    id: 'tch-1',
    name: 'Mr. Ahmed Hassan',
    arabicName: 'أحمد حسن',
    employeeId: 'EMP-2018-042',
    department: 'Sciences',
    roleTitle: 'Senior Physics Teacher',
    status: 'ACTIVE',
    phone: '+971 50 123 4567',
    email: 'ahmed.hassan@karma.edu',
    classesCount: 4,
    totalStudents: 112,
    initials: 'AH',
  },
  {
    id: 'tch-2',
    name: 'Ms. Sarah Miller',
    arabicName: 'سارة ميلر',
    employeeId: 'EMP-2020-018',
    department: 'Mathematics',
    roleTitle: 'Head of Mathematics',
    status: 'ACTIVE',
    phone: '+971 50 234 5678',
    email: 'sarah.miller@karma.edu',
    classesCount: 5,
    totalStudents: 135,
    initials: 'SM',
  },
  {
    id: 'tch-3',
    name: 'Dr. Tariq Al-Mansoor',
    arabicName: 'طارق المنصور',
    employeeId: 'EMP-2015-003',
    department: 'Humanities',
    roleTitle: 'History Department Lead',
    status: 'ACTIVE',
    phone: '+971 50 345 6789',
    email: 'tariq.mansoor@karma.edu',
    classesCount: 3,
    totalStudents: 85,
    initials: 'TM',
  },
]

export interface GetTeachersParams {
  search?: string
  department?: string
}

export async function fetchTeachers(params?: GetTeachersParams): Promise<{
  data: TeacherListItem[]
  total: number
}> {
  try {
    const res = await apiClient.get('/api/teachers', { params })
    if (res.data && Array.isArray(res.data.items)) {
      return { data: res.data.items, total: res.data.total }
    }
  } catch {
    // Fallback to mock
  }

  let filtered = [...MOCK_TEACHERS]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.employeeId.toLowerCase().includes(q) ||
        t.department.toLowerCase().includes(q)
    )
  }
  if (params?.department && params.department !== 'All') {
    filtered = filtered.filter((t) => t.department === params.department)
  }

  return { data: filtered, total: filtered.length }
}

export async function fetchTeacherById(id: string): Promise<TeacherListItem | null> {
  try {
    const res = await apiClient.get(`/api/teachers/${id}`)
    if (res.data) return res.data
  } catch {
    // Fallback
  }

  const found = MOCK_TEACHERS.find((t) => t.id === id)
  return found || MOCK_TEACHERS[0]
}
