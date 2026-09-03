'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Download,
  Plus,
  Search,
  CheckCircle2,
  TrendingUp,
  User,
  Phone,
  Mail,
  PieChart,
  ArrowRight,
  BookOpen,
  FlaskConical,
  Calculator,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  X,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { StatusBadge } from '../../../../../components/ui/status-badge'
import { useShellStore } from '../../../../../stores/shell-store'
import { useQueryClient } from '@tanstack/react-query'
import { useStudentsQuery } from '../../../../../hooks/use-domain-queries'
import { queryKeys } from '../../../../../lib/query-keys'

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

type StudentStatus = 'Active' | 'Inactive' | 'Pending'

interface SubjectEnrollment {
  id: string
  name: string
  teacher: string
  mark: number
  icon: 'physics' | 'math' | 'chemistry' | 'english'
}

interface StudentItem {
  id: string
  code: string
  name: string
  arabicName?: string
  avatarInitials: string
  dob: string
  grade: number
  section: string
  parentName: string
  parentRelation: string
  parentPhone: string
  parentEmail: string
  attendanceRate: number
  gpa: number
  homeroomTeacher: string
  status: StudentStatus
  subjects: SubjectEnrollment[]
  attendanceBreakdown: {
    present: number
    late: number
    excused: number
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * Static Mock Data
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_STUDENTS: StudentItem[] = [
  {
    id: 'stu-1',
    code: 'STU-24-1042',
    name: 'Sarah Al-Fayed',
    arabicName: 'سارة الفايد',
    avatarInitials: 'SA',
    dob: '12 May 2008',
    grade: 10,
    section: 'A',
    parentName: 'Tariq Al-Fayed',
    parentRelation: 'Father',
    parentPhone: '+971 50 123 4567',
    parentEmail: 't.alfayed@example.com',
    attendanceRate: 98,
    gpa: 3.92,
    homeroomTeacher: 'Sarah Jenkins',
    status: 'Active',
    attendanceBreakdown: { present: 145, late: 2, excused: 1 },
    subjects: [
      { id: 'sub-1', name: 'Physics (HL)', teacher: 'Mr. A. Jenkins', mark: 95, icon: 'physics' },
      { id: 'sub-2', name: 'Calculus BC', teacher: 'Dr. Maha Kamal', mark: 98, icon: 'math' },
      { id: 'sub-3', name: 'Chemistry', teacher: 'Dr. Tariq Mansour', mark: 92, icon: 'chemistry' },
      { id: 'sub-4', name: 'World Literature', teacher: 'Elena Rostova', mark: 94, icon: 'english' },
    ],
  },
  {
    id: 'stu-2',
    code: 'STU-2026-0042',
    name: 'Omar Hatem',
    arabicName: 'عمر حاتم',
    avatarInitials: 'OH',
    dob: '18 Sep 2008',
    grade: 10,
    section: 'A',
    parentName: 'Mariam Hatem',
    parentRelation: 'Mother',
    parentPhone: '+971 50 987 6543',
    parentEmail: 'm.hatem@example.com',
    attendanceRate: 96.2,
    gpa: 3.85,
    homeroomTeacher: 'Mr. David Miller',
    status: 'Active',
    attendanceBreakdown: { present: 142, late: 6, excused: 3 },
    subjects: [
      { id: 'sub-1', name: 'Physics (HL)', teacher: 'Mr. A. Jenkins', mark: 92, icon: 'physics' },
      { id: 'sub-2', name: 'Calculus BC', teacher: 'Dr. Maha Kamal', mark: 88, icon: 'math' },
      { id: 'sub-3', name: 'Organic Chemistry', teacher: 'Dr. Tariq Mansour', mark: 91, icon: 'chemistry' },
      { id: 'sub-4', name: 'World Literature', teacher: 'Elena Rostova', mark: 86, icon: 'english' },
    ],
  },
  {
    id: 'stu-3',
    code: 'STU-24-1088',
    name: 'Zainab Al-Rashid',
    arabicName: 'زينب الرشيد',
    avatarInitials: 'ZR',
    dob: '04 Nov 2007',
    grade: 11,
    section: 'B',
    parentName: 'Rashid Al-Rashid',
    parentRelation: 'Father',
    parentPhone: '+971 55 456 7890',
    parentEmail: 'r.rashid@example.com',
    attendanceRate: 94,
    gpa: 3.74,
    homeroomTeacher: 'Michael Chen',
    status: 'Active',
    attendanceBreakdown: { present: 138, late: 5, excused: 4 },
    subjects: [
      { id: 'sub-1', name: 'Physics (HL)', teacher: 'Mr. A. Jenkins', mark: 89, icon: 'physics' },
      { id: 'sub-2', name: 'Advanced Calculus', teacher: 'Dr. Maha Kamal', mark: 91, icon: 'math' },
      { id: 'sub-3', name: 'Organic Chemistry', teacher: 'Dr. Tariq Mansour', mark: 87, icon: 'chemistry' },
    ],
  },
  {
    id: 'stu-4',
    code: 'STU-24-1105',
    name: 'Kareem Tarek',
    arabicName: 'كريم طارق',
    avatarInitials: 'KT',
    dob: '22 Jan 2009',
    grade: 9,
    section: 'C',
    parentName: 'Tarek Mansour',
    parentRelation: 'Father',
    parentPhone: '+971 52 333 4444',
    parentEmail: 'tarek.m@example.com',
    attendanceRate: 91,
    gpa: 3.45,
    homeroomTeacher: 'David Alaba',
    status: 'Active',
    attendanceBreakdown: { present: 132, late: 8, excused: 6 },
    subjects: [
      { id: 'sub-1', name: 'General Science', teacher: 'Sarah Jenkins', mark: 84, icon: 'physics' },
      { id: 'sub-2', name: 'Algebra I', teacher: 'Michael Chen', mark: 88, icon: 'math' },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Page: Students Directory
 * ────────────────────────────────────────────────────────────────────────── */

export default function StudentsPage() {
  const t = useTranslations('features.students')
  const { activeRole } = useShellStore()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const [students, setStudents] = useState<StudentItem[]>(INITIAL_STUDENTS)
  const [selectedStudent, setSelectedStudent] = useState<StudentItem | null>(null)
  const [is360Open, setIs360Open] = useState(false)
  const [active360Tab, setActive360Tab] = useState<
    'overview' | 'attendance' | 'assignments' | 'quizzes' | 'results'
  >('overview')

  // Filters state
  const [searchQuery, setSearchQuery] = useState('')
  const [gradeFilter, setGradeFilter] = useState<string>('')
  const [sectionFilter, setSectionFilter] = useState<string>('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const queryClient = useQueryClient()
  useStudentsQuery({
    search: searchQuery,
    grade: gradeFilter,
    status: statusFilter,
  })

  // Enroll Drawer state
  const [isEnrollOpen, setIsEnrollOpen] = useState(false)
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [newDob, setNewDob] = useState('')
  const [newGrade, setNewGrade] = useState(10)
  const [newSection, setNewSection] = useState('A')
  const [newParentName, setNewParentName] = useState('')
  const [newParentPhone, setNewParentPhone] = useState('')
  const [enrollSuccess, setEnrollSuccess] = useState(false)

  const isTeacherOrAdmin = activeRole === 'ADMIN' || activeRole === 'TEACHER'

  // Filter logic
  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.arabicName && s.arabicName.includes(searchQuery))
    const matchesGrade = gradeFilter ? s.grade === Number(gradeFilter) : true
    const matchesSection = sectionFilter ? s.section === sectionFilter : true
    const matchesStatus = statusFilter ? s.status === statusFilter : true
    return matchesSearch && matchesGrade && matchesSection && matchesStatus
  })

  const handleOpen360 = (student: StudentItem) => {
    setSelectedStudent(student)
    setActive360Tab('overview')
    setIs360Open(true)
    router.push(`/${locale}/dashboard/students/${student.id}`)
  }

  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === filteredStudents.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredStudents.map((s) => s.id))
    }
  }

  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newStudentName) return

    const newStudent: StudentItem = {
      id: `stu-${Date.now()}`,
      code: `STU-24-${Math.floor(1000 + Math.random() * 9000)}`,
      name: newStudentName,
      avatarInitials: newStudentName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
      dob: newDob || '15 Jan 2008',
      grade: newGrade,
      section: newSection,
      parentName: newParentName || 'Guardian',
      parentRelation: 'Parent',
      parentPhone: newParentPhone || '+971 50 000 0000',
      parentEmail: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
      attendanceRate: 100,
      gpa: 4.0,
      homeroomTeacher: 'Sarah Jenkins',
      status: 'Active',
      attendanceBreakdown: { present: 1, late: 0, excused: 0 },
      subjects: [
        { id: 'sub-1', name: 'Physics (HL)', teacher: 'Mr. A. Jenkins', mark: 90, icon: 'physics' },
        { id: 'sub-2', name: 'Calculus BC', teacher: 'Dr. Maha Kamal', mark: 92, icon: 'math' },
      ],
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.students.all })
    setStudents([newStudent, ...students])
    setEnrollSuccess(true)
    setTimeout(() => {
      setEnrollSuccess(false)
      setIsEnrollOpen(false)
      setNewStudentName('')
      setNewStudentEmail('')
      setNewDob('')
      setNewParentName('')
      setNewParentPhone('')
    }, 1200)
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Page Header (Stitch Screen 18b5b6c2) ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">
            {t('title')}{' '}
            <span className="text-lg text-on-surface-variant font-normal">
              {t('countSubtitle', { count: students.length })}
            </span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('description')}</p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors shadow-xs"
          >
            <Download className="w-4 h-4" />
            <span>{t('exportCsv')}</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={() => setIsEnrollOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('enrollStudent')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Filter Toolbar ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 shadow-xs flex flex-col md:flex-row gap-4 items-end">
        {/* Search */}
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            {t('searchLabel')}
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full ps-9 pe-9 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface p-0.5 rounded transition-colors"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grade Level Dropdown */}
        <div className="w-full md:w-40 shrink-0">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            {t('gradeLevel')}
          </label>
          <select
            value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">{t('allGrades')}</option>
            <option value="9">Grade 9</option>
            <option value="10">Grade 10</option>
            <option value="11">Grade 11</option>
            <option value="12">Grade 12</option>
          </select>
        </div>

        {/* Class Dropdown */}
        <div className="w-full md:w-36 shrink-0">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            {t('class')}
          </label>
          <select
            value={sectionFilter}
            onChange={(e) => setSectionFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">{t('allClasses')}</option>
            <option value="A">Section A</option>
            <option value="B">Section B</option>
            <option value="C">Section C</option>
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="w-full md:w-36 shrink-0">
          <label className="block text-xs font-semibold text-on-surface-variant mb-1.5 uppercase tracking-wider">
            {t('status')}
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
          >
            <option value="">{t('allStatuses')}</option>
            <option value="Active">{t('active')}</option>
            <option value="Inactive">{t('inactive')}</option>
            <option value="Pending">{t('pending')}</option>
          </select>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === filteredStudents.length &&
                      filteredStudents.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                  />
                </th>
                <th className="py-3 px-4 text-start">{t('colStudent')}</th>
                <th className="py-3 px-4 text-start">{t('colCode')}</th>
                <th className="py-3 px-4 text-start">{t('colGradeClass')}</th>
                <th className="py-3 px-4 text-start">{t('colParent')}</th>
                <th className="py-3 px-4 text-start">{t('colAttendance')}</th>
                <th className="py-3 px-4 text-start">{t('colStatus')}</th>
                <th className="py-3 px-4 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8">
                    <EmptyState
                      title="No students found"
                      description="We couldn't find any students matching your criteria. Try adjusting your search query or reset the filters."
                      actionLabel="Reset filters"
                      onAction={() => {
                        setSearchQuery('')
                        setGradeFilter('')
                        setSectionFilter('')
                        setStatusFilter('')
                      }}
                    />
                  </td>
                </tr>
              ) : (
                filteredStudents.map((student) => {
                  const isChecked = selectedIds.includes(student.id)

                  return (
                    <tr
                      key={student.id}
                      className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                      onClick={() => handleOpen360(student)}
                    >
                      {/* Checkbox */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleSelect(student.id)
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleSelect(student.id)}
                          className="w-4 h-4 rounded border-outline-variant text-primary focus:ring-primary cursor-pointer"
                        />
                      </td>

                      {/* Student Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                            {student.avatarInitials}
                          </div>
                          <div>
                            <div className="font-semibold text-on-surface group-hover:text-primary transition-colors">
                              {student.name}
                            </div>
                            <div className="text-xs text-on-surface-variant">DOB: {student.dob}</div>
                          </div>
                        </div>
                      </td>

                      {/* Code */}
                      <td className="py-3.5 px-4 font-mono text-xs text-on-surface-variant">
                        {student.code}
                      </td>

                      {/* Grade & Class */}
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-on-surface">Grade {student.grade}</div>
                        <div className="text-xs text-on-surface-variant">Section {student.section}</div>
                      </td>

                      {/* Primary Parent */}
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-on-surface">{student.parentName}</div>
                        <div className="text-xs text-on-surface-variant">{student.parentPhone}</div>
                      </td>

                      {/* Attendance */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-on-surface w-9">
                            {student.attendanceRate}%
                          </span>
                          <div className="w-16 h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                student.attendanceRate >= 95
                                  ? 'bg-emerald-500'
                                  : student.attendanceRate >= 90
                                    ? 'bg-amber-500'
                                    : 'bg-error'
                              }`}
                              style={{ width: `${student.attendanceRate}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <StatusBadge status={student.status} />
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-4 text-end">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleOpen360(student)
                          }}
                          className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                          title={t('viewProfile')}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center text-sm text-on-surface-variant bg-surface-container-lowest">
          <span>
            {t('showingStudents', { count: filteredStudents.length, total: students.length })}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              className="p-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors disabled:opacity-40"
              disabled
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              className="p-1.5 rounded-md border border-outline-variant hover:bg-surface-container transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Student Details 360° Profile Drawer (Stitch Screen 47ddc868) ── */}
      <Drawer
        isOpen={is360Open}
        onClose={() => setIs360Open(false)}
        title={selectedStudent ? selectedStudent.name : t('viewProfile')}
        description={selectedStudent ? `${selectedStudent.code} • Grade ${selectedStudent.grade} Section ${selectedStudent.section}` : ''}
        maxWidth="3xl"
      >
        {selectedStudent && (
          <div className="space-y-6 pb-8">
            {/* Top Profile Header Card */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden shadow-xs">
              {/* Identity */}
              <div className="flex items-start gap-5 flex-1 z-10">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-2xl shadow-sm border border-outline-variant">
                    {selectedStudent.avatarInitials}
                  </div>
                  <div
                    className="absolute bottom-0 end-0 w-4 h-4 bg-emerald-500 border-2 border-surface-container-lowest rounded-full shadow-xs"
                    title="Active"
                  />
                </div>

                <div className="space-y-2">
                  <div>
                    <h2 className="text-xl font-bold text-on-surface flex items-center gap-2">
                      {selectedStudent.name}
                      {selectedStudent.arabicName && (
                        <span className="text-sm text-on-surface-variant font-normal">
                          / {selectedStudent.arabicName}
                        </span>
                      )}
                    </h2>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="font-mono text-xs text-on-surface-variant bg-surface-container px-2 py-0.5 rounded border border-outline-variant">
                        {selectedStudent.code}
                      </span>
                      <span className="text-xs font-semibold bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded-full">
                        Grade {selectedStudent.grade} - Class {selectedStudent.grade}{selectedStudent.section}
                      </span>
                      <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-700 px-2.5 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {selectedStudent.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="flex flex-col justify-between items-start md:items-end gap-3 z-10 md:w-80 shrink-0">
                <div className="grid grid-cols-2 gap-2 w-full text-xs">
                  <div className="bg-surface-container rounded-lg p-2.5 border border-outline-variant flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('homeroom')}
                    </span>
                    <span className="font-semibold text-on-surface truncate">
                      {selectedStudent.homeroomTeacher}
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-2.5 border border-outline-variant flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colAttendance')}
                    </span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {selectedStudent.attendanceRate}%
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-2.5 border border-outline-variant flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('gpa')}
                    </span>
                    <span className="font-bold text-on-surface font-mono">
                      {selectedStudent.gpa} <span className="text-on-surface-variant text-[10px]">/ 4.0</span>
                    </span>
                  </div>
                  <div className="bg-surface-container rounded-lg p-2.5 border border-outline-variant flex flex-col gap-0.5">
                    <span className="text-[10px] font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('linkedParent')}
                    </span>
                    <span className="font-semibold text-on-surface truncate">
                      {selectedStudent.parentName}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Tabs Bar ── */}
            <div className="border-b border-outline-variant">
              <nav className="flex gap-6 overflow-x-auto text-sm">
                <button
                  type="button"
                  onClick={() => setActive360Tab('overview')}
                  className={`py-3 px-1 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    active360Tab === 'overview'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>{t('academicOverview')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActive360Tab('attendance')}
                  className={`py-3 px-1 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    active360Tab === 'attendance'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <PieChart className="w-4 h-4" />
                  <span>{t('attendanceHistory')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActive360Tab('assignments')}
                  className={`py-3 px-1 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    active360Tab === 'assignments'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{t('assignments')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActive360Tab('quizzes')}
                  className={`py-3 px-1 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    active360Tab === 'quizzes'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{t('quizzesExams')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActive360Tab('results')}
                  className={`py-3 px-1 border-b-2 font-semibold transition-colors flex items-center gap-2 whitespace-nowrap ${
                    active360Tab === 'results'
                      ? 'border-primary text-primary'
                      : 'border-transparent text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <span>{t('publishedResults')}</span>
                </button>
              </nav>
            </div>

            {/* ── Active Tab Content (Academic Overview) ── */}
            {active360Tab === 'overview' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Column: Enrolled Subjects */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-xs">
                    <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container">
                      <h3 className="text-sm font-bold text-on-surface">{t('enrolledSubjects')}</h3>
                      <button
                        type="button"
                        className="text-primary text-xs font-semibold hover:underline flex items-center gap-1"
                      >
                        {t('viewFullTranscript')}
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="divide-y divide-outline-variant">
                      {selectedStudent.subjects.map((sub) => {
                        const IconComponent =
                          sub.icon === 'physics'
                            ? FlaskConical
                            : sub.icon === 'math'
                              ? Calculator
                              : BookOpen

                        return (
                          <div
                            key={sub.id}
                            className="p-4 hover:bg-surface-container-low transition-colors flex items-center justify-between"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                                <IconComponent className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-on-surface">{sub.name}</p>
                                <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                                  <User className="w-3 h-3" />
                                  {sub.teacher}
                                </p>
                              </div>
                            </div>
                            <div className="text-end">
                              <p className="text-sm font-bold text-on-surface font-mono">{sub.mark}%</p>
                              <p className="text-[11px] text-on-surface-variant">{t('termMark')}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>

                {/* Right Column: Attendance & Parent */}
                <div className="lg:col-span-5 space-y-6">
                  {/* Attendance Breakdown Donut Card */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-5 space-y-4">
                    <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-on-surface-variant" />
                      {t('attendanceBreakdown')}
                    </h3>

                    <div className="flex items-center gap-5">
                      {/* Donut circle */}
                      <div
                        className="relative w-20 h-20 shrink-0 rounded-full flex items-center justify-center shadow-xs"
                        style={{
                          background:
                            'conic-gradient(from 0deg, #10b981 0% 94%, #f59e0b 94% 98%, #ef4444 98% 100%)',
                        }}
                      >
                        <div className="absolute inset-2 bg-surface-container-lowest rounded-full flex items-center justify-center">
                          <span className="text-base font-bold text-on-surface">
                            {selectedStudent.attendanceRate}%
                          </span>
                        </div>
                      </div>

                      {/* Legend counts */}
                      <div className="flex-1 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                            <span className="text-on-surface-variant">{t('present')}</span>
                          </div>
                          <span className="font-semibold text-on-surface">
                            {t('days', { count: selectedStudent.attendanceBreakdown.present })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-on-surface-variant">{t('late')}</span>
                          </div>
                          <span className="font-semibold text-on-surface">
                            {t('days', { count: selectedStudent.attendanceBreakdown.late })}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-error" />
                            <span className="text-on-surface-variant">{t('excused')}</span>
                          </div>
                          <span className="font-semibold text-on-surface">
                            {t('days', { count: selectedStudent.attendanceBreakdown.excused })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Parent & Emergency Contact */}
                  <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-5 space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                        <User className="w-4 h-4 text-on-surface-variant" />
                        {t('primaryContact')}
                      </h3>
                      <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                        {selectedStudent.parentRelation}
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-xs shrink-0">
                          {selectedStudent.parentName
                            .split(' ')
                            .map((p) => p[0])
                            .slice(0, 2)
                            .join('')}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-on-surface">
                            {selectedStudent.parentName}
                          </p>
                          <p className="text-xs text-on-surface-variant">{t('legalGuardian')}</p>
                        </div>
                      </div>

                      <div className="bg-surface-container rounded-lg p-3 space-y-2.5 border border-outline-variant text-xs">
                        <div className="flex items-center gap-2 text-on-surface">
                          <Phone className="w-3.5 h-3.5 text-on-surface-variant" />
                          <span>{selectedStudent.parentPhone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-on-surface truncate">
                          <Mail className="w-3.5 h-3.5 text-on-surface-variant" />
                          <span className="truncate">{selectedStudent.parentEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Placeholder Content for remaining tabs */}
            {active360Tab !== 'overview' && (
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-8 text-center space-y-2">
                <BookOpen className="w-8 h-8 text-primary mx-auto" />
                <h4 className="text-sm font-bold text-on-surface">
                  {active360Tab === 'attendance'
                    ? t('attendanceHistory')
                    : active360Tab === 'assignments'
                      ? t('assignments')
                      : active360Tab === 'quizzes'
                        ? t('quizzesExams')
                        : t('publishedResults')}
                </h4>
                <p className="text-xs text-on-surface-variant max-w-sm mx-auto">
                  Comprehensive historical logs, grades, and evaluations recorded for {selectedStudent.name}.
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* ── Enroll Student Drawer ── */}
      <Drawer
        isOpen={isEnrollOpen}
        onClose={() => setIsEnrollOpen(false)}
        title={t('enrollStudentTitle')}
        description={t('description')}
      >
        <form onSubmit={handleEnrollSubmit} className="space-y-4">
          {enrollSuccess && (
            <div className="p-3 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('enrolledSuccess')}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              {t('studentName')}
            </label>
            <input
              type="text"
              required
              value={newStudentName}
              onChange={(e) => setNewStudentName(e.target.value)}
              placeholder="e.g. Ziad Mansour"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                {t('dob')}
              </label>
              <input
                type="date"
                value={newDob}
                onChange={(e) => setNewDob(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                {t('studentEmail')}
              </label>
              <input
                type="email"
                value={newStudentEmail}
                onChange={(e) => setNewStudentEmail(e.target.value)}
                placeholder="ziad@karmaschool.edu"
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                {t('gradeLevel')}
              </label>
              <select
                value={newGrade}
                onChange={(e) => setNewGrade(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary"
              >
                <option value={9}>Grade 9</option>
                <option value={10}>Grade 10</option>
                <option value={11}>Grade 11</option>
                <option value={12}>Grade 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                {t('class')}
              </label>
              <select
                value={newSection}
                onChange={(e) => setNewSection(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary"
              >
                <option value="A">Section A</option>
                <option value="B">Section B</option>
                <option value="C">Section C</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              {t('parentName')}
            </label>
            <input
              type="text"
              value={newParentName}
              onChange={(e) => setNewParentName(e.target.value)}
              placeholder="e.g. Mansour Ziad"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1">
              {t('parentPhone')}
            </label>
            <input
              type="tel"
              value={newParentPhone}
              onChange={(e) => setNewParentPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsEnrollOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm transition-colors"
            >
              Save Student
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
