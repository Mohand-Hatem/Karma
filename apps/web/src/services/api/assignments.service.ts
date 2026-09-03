import { apiClient } from '../../lib/api-client'

export interface AssignmentListItem {
  id: string
  title: string
  subject: string
  subjectColor: 'indigo' | 'emerald' | 'amber' | 'cyan' | 'blue'
  cohort: string
  dueDate: string
  window: 'active' | 'upcoming' | 'closed'
  total: number
  submitted: number
  graded: number
}

export const MOCK_ASSIGNMENTS: AssignmentListItem[] = [
  {
    id: 'asg-1',
    title: 'Kinematics: Velocity & Vectors Problem Set',
    subject: 'Physics',
    subjectColor: 'indigo',
    cohort: 'Grade 10A • Cohort 2026',
    dueDate: 'Tomorrow, 23:59',
    window: 'active',
    total: 28,
    submitted: 22,
    graded: 18,
  },
  {
    id: 'asg-2',
    title: 'Differential Calculus Midterm Problem Sheet',
    subject: 'Math',
    subjectColor: 'emerald',
    cohort: 'Grade 11B • Pure Math',
    dueDate: 'Oct 28, 23:59',
    window: 'upcoming',
    total: 25,
    submitted: 14,
    graded: 5,
  },
  {
    id: 'asg-3',
    title: 'Organic Compounds Synthesis Lab Writeup',
    subject: 'Chemistry',
    subjectColor: 'amber',
    cohort: 'Grade 12A • Chem Honors',
    dueDate: 'Yesterday, 17:00',
    window: 'closed',
    total: 30,
    submitted: 28,
    graded: 28,
  },
]

export async function fetchAssignments(): Promise<AssignmentListItem[]> {
  try {
    const res = await apiClient.get('/api/assignments')
    if (res.data && Array.isArray(res.data.items)) {
      return res.data.items
    }
  } catch {
    // Fallback
  }

  return MOCK_ASSIGNMENTS
}
