import { apiClient } from '../../lib/api-client'

export interface ClassListItem {
  id: string
  name: string
  grade: string
  stream: string
  room: string
  homeroomTeacher: string
  studentsCount: number
  capacity: number
  status: 'ACTIVE' | 'ARCHIVED'
}

export const MOCK_CLASSES: ClassListItem[] = [
  {
    id: 'cls-1',
    name: 'Class 10A',
    grade: 'Grade 10',
    stream: 'Sciences',
    room: 'Room 204 (Science Wing)',
    homeroomTeacher: 'Mr. David Miller',
    studentsCount: 28,
    capacity: 30,
    status: 'ACTIVE',
  },
  {
    id: 'cls-2',
    name: 'Class 10B',
    grade: 'Grade 10',
    stream: 'General',
    room: 'Room 205 (Science Wing)',
    homeroomTeacher: 'Ms. Sarah Miller',
    studentsCount: 30,
    capacity: 30,
    status: 'ACTIVE',
  },
  {
    id: 'cls-3',
    name: 'Class 11A',
    grade: 'Grade 11',
    stream: 'Advanced Sciences',
    room: 'Lab 3 (North Block)',
    homeroomTeacher: 'Mr. Ahmed Hassan',
    studentsCount: 24,
    capacity: 28,
    status: 'ACTIVE',
  },
]

export async function fetchClasses(params?: { grade?: string; search?: string }): Promise<ClassListItem[]> {
  try {
    const res = await apiClient.get('/api/classes', { params })
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items
    }
  } catch {
    // Fallback
  }

  let filtered = [...MOCK_CLASSES]
  if (params?.grade && params.grade !== 'All') {
    filtered = filtered.filter((c) => c.grade === params.grade)
  }
  if (params?.search) {
    const q = params.search.toLowerCase()
    filtered = filtered.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.homeroomTeacher.toLowerCase().includes(q) ||
        c.room.toLowerCase().includes(q)
    )
  }

  return filtered
}

export async function fetchClassById(id: string): Promise<ClassListItem | null> {
  try {
    const res = await apiClient.get(`/api/classes/${id}`)
    if (res.data) return res.data
  } catch {
    // Fallback
  }

  const found = MOCK_CLASSES.find((c) => c.id === id)
  return found || MOCK_CLASSES[0]
}
