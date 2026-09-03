import { apiClient } from '../../lib/api-client'

export interface StudentListItem {
  id: string
  name: string
  arabicName: string
  studentId: string
  grade: string
  class: string
  attendance: number
  gpa: number
  status: 'ACTIVE' | 'AT_RISK' | 'INACTIVE'
  parentName: string
  parentPhone: string
  parentEmail: string
  stream: string
}

export const MOCK_STUDENTS: StudentListItem[] = [
  {
    id: 'stu-1',
    name: 'Omar Hatem',
    arabicName: 'عمر حاتم',
    studentId: 'STU-2026-0042',
    grade: 'Grade 10',
    class: '10A',
    attendance: 96.2,
    gpa: 3.85,
    status: 'ACTIVE',
    parentName: 'Mariam Hatem',
    parentPhone: '+971 50 987 6543',
    parentEmail: 'mariam.hatem@parent.karma.edu',
    stream: 'Science',
  },
  {
    id: 'stu-2',
    name: 'Sarah Jenkins',
    arabicName: 'سارة جنكينز',
    studentId: 'STU-2026-0012',
    grade: 'Grade 10',
    class: '10A',
    attendance: 98.0,
    gpa: 3.92,
    status: 'ACTIVE',
    parentName: 'David Jenkins',
    parentPhone: '+971 50 123 4567',
    parentEmail: 'd.jenkins@example.com',
    stream: 'General',
  },
  {
    id: 'stu-3',
    name: 'Michael Chang',
    arabicName: 'مايكل تشانغ',
    studentId: 'STU-2026-0089',
    grade: 'Grade 10',
    class: '10B',
    attendance: 84.5,
    gpa: 2.75,
    status: 'AT_RISK',
    parentName: 'Li Wei Chang',
    parentPhone: '+971 55 456 7890',
    parentEmail: 'lw.chang@example.com',
    stream: 'Science',
  },
  {
    id: 'stu-4',
    name: 'Layla Mahmoud',
    arabicName: 'ليلى محمود',
    studentId: 'STU-2026-0104',
    grade: 'Grade 11',
    class: '11A',
    attendance: 95.0,
    gpa: 3.65,
    status: 'ACTIVE',
    parentName: 'Mahmoud Al-Sayed',
    parentPhone: '+971 52 789 0123',
    parentEmail: 'm.sayed@example.com',
    stream: 'Humanities',
  },
  {
    id: 'stu-5',
    name: 'Youssef Nabil',
    arabicName: 'يوسف نبيل',
    studentId: 'STU-2026-0055',
    grade: 'Grade 12',
    class: '12C',
    attendance: 91.0,
    gpa: 3.40,
    status: 'ACTIVE',
    parentName: 'Nabil Farouk',
    parentPhone: '+971 54 321 6547',
    parentEmail: 'nabil.f@example.com',
    stream: 'Science',
  },
]

export interface GetStudentsParams {
  search?: string
  grade?: string
  status?: string
  page?: number
  limit?: number
}

export async function fetchStudents(params?: GetStudentsParams): Promise<{
  data: StudentListItem[]
  total: number
}> {
  try {
    const res = await apiClient.get('/api/students', { params })
    if (res.data && Array.isArray(res.data.items)) {
      return { data: res.data.items, total: res.data.total }
    }
  } catch {
    // Graceful fallback to mock data while backend seed routes are configured in Phase 2
  }

  let filtered = [...MOCK_STUDENTS]
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.studentId.toLowerCase().includes(q) ||
        s.arabicName.includes(q)
    )
  }
  if (params?.grade && params.grade !== 'All') {
    filtered = filtered.filter((s) => s.grade === params.grade)
  }
  if (params?.status && params.status !== 'All') {
    filtered = filtered.filter((s) => s.status === params.status)
  }

  return { data: filtered, total: filtered.length }
}

export async function fetchStudentById(id: string): Promise<StudentListItem | null> {
  try {
    const res = await apiClient.get(`/api/students/${id}`)
    if (res.data) return res.data
  } catch {
    // Fallback to mock
  }

  const found = MOCK_STUDENTS.find((s) => s.id === id)
  return found || MOCK_STUDENTS[0]
}
