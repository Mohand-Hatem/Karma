import { apiClient } from '../../lib/api-client'

export type AttendanceStatus = 'P' | 'A' | 'L' | 'E'

export interface AttendanceRecord {
  id: string
  num: number
  nameEn: string
  nameAr: string
  code: string
  initials: string
  status: AttendanceStatus
  note?: string
  historicalRate: number
}

export const MOCK_ATTENDANCE_REGISTER: AttendanceRecord[] = [
  {
    id: 's-1',
    num: 1,
    nameEn: 'Omar Hatem',
    nameAr: 'عمر حاتم',
    code: 'STD-10042',
    initials: 'OH',
    status: 'P',
    historicalRate: 98,
  },
  {
    id: 's-2',
    num: 2,
    nameEn: 'Sarah Jenkins',
    nameAr: 'سارة جنكينز',
    code: 'STD-10089',
    initials: 'SJ',
    status: 'P',
    historicalRate: 96,
  },
  {
    id: 's-3',
    num: 3,
    nameEn: 'Michael Chang',
    nameAr: 'مايكل تشانغ',
    code: 'STD-10112',
    initials: 'MC',
    status: 'L',
    note: 'Bus delay',
    historicalRate: 88,
  },
  {
    id: 's-4',
    num: 4,
    nameEn: 'Layla Mahmoud',
    nameAr: 'ليلى محمود',
    code: 'STD-10155',
    initials: 'LM',
    status: 'A',
    note: 'Unexcused',
    historicalRate: 82,
  },
]

export async function fetchAttendanceRegister(classId: string, date: string): Promise<AttendanceRecord[]> {
  try {
    const res = await apiClient.get(`/api/attendance/register`, { params: { classId, date } })
    if (res.data && Array.isArray(res.data.records)) {
      return res.data.records
    }
  } catch {
    // Fallback
  }

  return MOCK_ATTENDANCE_REGISTER
}
