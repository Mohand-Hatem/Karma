'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocale, useTranslations } from 'next-intl'
import {
  Search,
  Plus,
  User,
  CheckCircle2,
  Filter,
  Calendar,
  BookOpen,
  MoreVertical,
  ArrowUpDown,
  UserMinus,
  GraduationCap,
  X,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { useShellStore } from '../../../../../stores/shell-store'
import { useQueryClient } from '@tanstack/react-query'
import { useClassesQuery } from '../../../../../hooks/use-domain-queries'
import { queryKeys } from '../../../../../lib/query-keys'

interface StudentRecord {
  id: string
  name: string
  email: string
  status: 'Enrolled' | 'Pending'
  absences: number
  avatarInitials: string
}

interface ClassData {
  id: string
  name: string
  gradeLevel: number
  stream: string
  homeroomTeacher: string
  teacherInitials: string
  teacherBadgeBg: string
  teacherBadgeText: string
  enrolledStudentsCount: number
  capacity: number
  subjectsCount: number
  students: StudentRecord[]
}

const INITIAL_CLASSES: ClassData[] = [
  {
    id: 'cls-10a',
    name: 'Class 10A',
    gradeLevel: 10,
    stream: 'Science Stream',
    homeroomTeacher: 'Sarah Jenkins',
    teacherInitials: 'SJ',
    teacherBadgeBg: 'bg-secondary-container',
    teacherBadgeText: 'text-on-secondary-container',
    enrolledStudentsCount: 28,
    capacity: 30,
    subjectsCount: 6,
    students: [
      {
        id: 'STU-2025-001',
        name: 'Ahmad Ibrahim',
        email: 'ahmad.i@karmaschool.edu',
        status: 'Enrolled',
        absences: 2,
        avatarInitials: 'AI',
      },
      {
        id: 'STU-2025-002',
        name: 'Fatima Mahmoud',
        email: 'f.mahmoud@karmaschool.edu',
        status: 'Enrolled',
        absences: 0,
        avatarInitials: 'FM',
      },
      {
        id: 'STU-2025-003',
        name: 'Omar Hatem',
        email: 'omar.h@karmaschool.edu',
        status: 'Enrolled',
        absences: 1,
        avatarInitials: 'OH',
      },
      {
        id: 'STU-2025-004',
        name: 'Layla Mansour',
        email: 'layla.m@karmaschool.edu',
        status: 'Enrolled',
        absences: 0,
        avatarInitials: 'LM',
      },
      {
        id: 'STU-2025-005',
        name: 'Youssef Nabil',
        email: 'youssef.n@karmaschool.edu',
        status: 'Enrolled',
        absences: 3,
        avatarInitials: 'YN',
      },
    ],
  },
  {
    id: 'cls-10b',
    name: 'Class 10B',
    gradeLevel: 10,
    stream: 'Science Stream',
    homeroomTeacher: 'Michael Chen',
    teacherInitials: 'MC',
    teacherBadgeBg: 'bg-primary-container',
    teacherBadgeText: 'text-on-primary-container',
    enrolledStudentsCount: 30,
    capacity: 30,
    subjectsCount: 6,
    students: [
      {
        id: 'STU-2025-010',
        name: 'Kareem Tarek',
        email: 'kareem.t@karmaschool.edu',
        status: 'Enrolled',
        absences: 1,
        avatarInitials: 'KT',
      },
      {
        id: 'STU-2025-011',
        name: 'Hana Adel',
        email: 'hana.a@karmaschool.edu',
        status: 'Enrolled',
        absences: 0,
        avatarInitials: 'HA',
      },
    ],
  },
  {
    id: 'cls-10c',
    name: 'Class 10C',
    gradeLevel: 10,
    stream: 'General Stream',
    homeroomTeacher: 'David Alaba',
    teacherInitials: 'DA',
    teacherBadgeBg: 'bg-secondary-container',
    teacherBadgeText: 'text-on-secondary-container',
    enrolledStudentsCount: 24,
    capacity: 30,
    subjectsCount: 5,
    students: [
      {
        id: 'STU-2025-020',
        name: 'Ziad Sherif',
        email: 'ziad.s@karmaschool.edu',
        status: 'Enrolled',
        absences: 2,
        avatarInitials: 'ZS',
      },
      {
        id: 'STU-2025-021',
        name: 'Nour El-Din',
        email: 'nour.e@karmaschool.edu',
        status: 'Enrolled',
        absences: 1,
        avatarInitials: 'NE',
      },
    ],
  },
  {
    id: 'cls-11a',
    name: 'Class 11A',
    gradeLevel: 11,
    stream: 'Literature & Arts',
    homeroomTeacher: 'Elena Rostova',
    teacherInitials: 'ER',
    teacherBadgeBg: 'bg-primary-container',
    teacherBadgeText: 'text-on-primary-container',
    enrolledStudentsCount: 29,
    capacity: 30,
    subjectsCount: 6,
    students: [
      {
        id: 'STU-2025-030',
        name: 'Salma Youssef',
        email: 'salma.y@karmaschool.edu',
        status: 'Enrolled',
        absences: 0,
        avatarInitials: 'SY',
      },
      {
        id: 'STU-2025-031',
        name: 'Mustafa Hassan',
        email: 'mustafa.h@karmaschool.edu',
        status: 'Enrolled',
        absences: 4,
        avatarInitials: 'MH',
      },
    ],
  },
  {
    id: 'cls-11b',
    name: 'Class 11B',
    gradeLevel: 11,
    stream: 'Advanced Sciences',
    homeroomTeacher: 'Dr. Tariq Mansour',
    teacherInitials: 'TM',
    teacherBadgeBg: 'bg-secondary-container',
    teacherBadgeText: 'text-on-secondary-container',
    enrolledStudentsCount: 25,
    capacity: 30,
    subjectsCount: 7,
    students: [
      {
        id: 'STU-2025-040',
        name: 'Farah Nabil',
        email: 'farah.n@karmaschool.edu',
        status: 'Enrolled',
        absences: 1,
        avatarInitials: 'FN',
      },
      {
        id: 'STU-2025-041',
        name: 'Ali Mahmoud',
        email: 'ali.m@karmaschool.edu',
        status: 'Enrolled',
        absences: 2,
        avatarInitials: 'AM',
      },
    ],
  },
]

export default function ClassesPage() {
  const t = useTranslations('features.classes')
  const tCommon = useTranslations('common')
  const locale = useLocale()
  const { activeRole } = useShellStore()

  const [classes, setClasses] = useState<ClassData[]>(INITIAL_CLASSES)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClass, setSelectedClass] = useState<ClassData | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'roster' | 'teachers' | 'timetable'>('roster')
  const [studentSearch, setStudentSearch] = useState('')

  const queryClient = useQueryClient()
  useClassesQuery({ search: searchQuery })

  // New Student Enrollment inside Drawer
  const [newStudentName, setNewStudentName] = useState('')
  const [newStudentEmail, setNewStudentEmail] = useState('')
  const [enrollSuccess, setEnrollSuccess] = useState(false)
  const [showEnrollForm, setShowEnrollForm] = useState(false)

  // Filter classes based on search
  const filteredClasses = classes.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.homeroomTeacher.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.stream.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const grade10Classes = filteredClasses.filter((c) => c.gradeLevel === 10)
  const grade11Classes = filteredClasses.filter((c) => c.gradeLevel === 11)

  const router = useRouter()

  const handleOpenRoster = (cls: ClassData) => {
    setSelectedClass(cls)
    setIsDrawerOpen(true)
    setActiveTab('roster')
    setShowEnrollForm(false)
    router.push(`/${locale}/dashboard/classes/${cls.id}`)
  }

  const handleEnrollStudent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClass || !newStudentName) return

    const newStudent: StudentRecord = {
      id: `STU-2025-0${Math.floor(100 + Math.random() * 900)}`,
      name: newStudentName,
      email: newStudentEmail || `${newStudentName.toLowerCase().replace(/\s+/g, '.')}@karmaschool.edu`,
      status: 'Enrolled',
      absences: 0,
      avatarInitials: newStudentName
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.classes.all })
    setClasses((prev) =>
      prev.map((c) => {
        if (c.id === selectedClass.id) {
          return {
            ...c,
            enrolledStudentsCount: Math.min(c.enrolledStudentsCount + 1, c.capacity),
            students: [newStudent, ...c.students],
          }
        }
        return c
      })
    )

    setSelectedClass((prev) =>
      prev
        ? {
            ...prev,
            enrolledStudentsCount: Math.min(prev.enrolledStudentsCount + 1, prev.capacity),
            students: [newStudent, ...prev.students],
          }
        : null
    )

    setNewStudentName('')
    setNewStudentEmail('')
    setEnrollSuccess(true)
    setTimeout(() => {
      setEnrollSuccess(false)
      setShowEnrollForm(false)
    }, 1500)
  }

  return (
    <div className="space-y-8">
      {/* Header Section (Stitch Screen 6084953b) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            {t('title')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('description')}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchClasses')}
              className="w-full ps-9 pe-9 py-2 bg-surface-container-lowest rounded-lg border border-outline-variant text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-all placeholder:text-on-surface-variant"
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

          {activeRole === 'ADMIN' && (
            <button
              onClick={() => {
                if (classes.length > 0) {
                  handleOpenRoster(classes[0])
                  setShowEnrollForm(true)
                }
              }}
              className="bg-primary hover:bg-primary-container text-on-primary px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{t('addClass')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Grade 10 Section */}
      {grade10Classes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
            <h3 className="text-lg font-bold text-on-surface">
              Grade 10
            </h3>
            <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {grade10Classes.length} {t('title')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {grade10Classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                t={t}
                onViewDetails={() => handleOpenRoster(cls)}
                onManageRoster={() => handleOpenRoster(cls)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Grade 11 Section */}
      {grade11Classes.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3 border-b border-outline-variant pb-2">
            <h3 className="text-lg font-bold text-on-surface">
              Grade 11
            </h3>
            <span className="bg-surface-container text-on-surface-variant px-2.5 py-0.5 rounded-full text-xs font-semibold">
              {grade11Classes.length} {t('title')}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {grade11Classes.map((cls) => (
              <ClassCard
                key={cls.id}
                cls={cls}
                t={t}
                onViewDetails={() => handleOpenRoster(cls)}
                onManageRoster={() => handleOpenRoster(cls)}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty State when no classes found */}
      {filteredClasses.length === 0 && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-12 shadow-xs">
          <EmptyState
            icon={BookOpen}
            title="No classes found"
            description="No academic classes match your search query. Try searching for a different class name, teacher, or academic stream."
            actionLabel="Clear search"
            onAction={() => setSearchQuery('')}
          />
        </div>
      )}

      {/* Class Details & Student Roster Slide-Over Drawer (Stitch Screen 116950c7) */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedClass ? `${selectedClass.name} — ${selectedClass.stream}` : t('enrollmentTitle')}
        description={`Academic Year 2025/2026 • ${selectedClass?.enrolledStudentsCount || 0}/${selectedClass?.capacity || 30} ${t('students')}`}
        locale={locale}
        maxWidth="2xl"
      >
        {selectedClass && (
          <div className="space-y-6">
            {/* Header Badges */}
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-md bg-surface-container text-on-surface-variant text-xs font-bold uppercase tracking-wider">
                Grade {selectedClass.gradeLevel}
              </span>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-xs font-semibold border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Active
              </span>
            </div>

            {/* Tab Strip */}
            <div className="flex border-b border-outline-variant gap-6 overflow-x-auto text-sm">
              <button
                onClick={() => setActiveTab('roster')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'roster'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('studentRoster')} ({selectedClass.students.length})
              </button>
              <button
                onClick={() => setActiveTab('teachers')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'teachers'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('assignedTeachers')}
              </button>
              <button
                onClick={() => setActiveTab('timetable')}
                className={`pb-2.5 font-semibold transition-colors relative ${
                  activeTab === 'timetable'
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {t('classTimetable')}
              </button>
            </div>

            {/* Tab: Student Roster */}
            {activeTab === 'roster' && (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                    <input
                      type="text"
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      placeholder={t('searchStudentsPlaceholder')}
                      className="w-full ps-9 pe-3 py-1.5 bg-surface-subtle rounded-lg border border-outline-variant text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface-variant text-xs font-semibold hover:bg-surface-container flex items-center gap-1 transition-colors"
                    >
                      <Filter className="w-3.5 h-3.5" />
                      <span>{t('filter')}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowEnrollForm(!showEnrollForm)}
                      className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t('enroll')}</span>
                    </button>
                  </div>
                </div>

                {/* Enroll Form (Toggleable) */}
                {showEnrollForm && (
                  <form
                    onSubmit={handleEnrollStudent}
                    className="p-4 rounded-xl bg-primary-fixed/10 border border-primary-fixed-dim/30 space-y-3"
                  >
                    <h4 className="text-xs font-bold text-primary">
                      {t('enrollStudent')} to {selectedClass.name}
                    </h4>

                    {enrollSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>{t('enrolledSuccess')}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          {t('studentName')}
                        </label>
                        <input
                          type="text"
                          required
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          placeholder="e.g. Ziad Mansour"
                          className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-medium text-on-surface-variant mb-1">
                          Email (Optional)
                        </label>
                        <input
                          type="email"
                          value={newStudentEmail}
                          onChange={(e) => setNewStudentEmail(e.target.value)}
                          placeholder="ziad.m@karmaschool.edu"
                          className="w-full px-3 py-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-xs text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setShowEnrollForm(false)}
                        className="px-3 py-1 rounded-lg text-xs text-on-surface-variant hover:bg-surface-container transition-colors"
                      >
                        {tCommon('cancel')}
                      </button>
                      <button
                        type="submit"
                        className="px-3 py-1 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm"
                      >
                        {tCommon('save')}
                      </button>
                    </div>
                  </form>
                )}

                {/* Data Table */}
                <div className="border border-outline-variant rounded-xl overflow-hidden shadow-xs">
                  <div className="overflow-x-auto">
                    <table className="w-full text-start border-collapse text-xs">
                      <thead>
                        <tr className="bg-surface-container border-b border-outline-variant text-on-surface-variant uppercase tracking-wider font-semibold">
                          <th className="p-3 w-10 text-center">
                            <input
                              type="checkbox"
                              className="rounded border-outline-variant text-primary focus:ring-primary"
                            />
                          </th>
                          <th className="p-3 text-start">{t('studentName')}</th>
                          <th className="p-3 text-start">{t('idNumber')}</th>
                          <th className="p-3 text-start">{t('status')}</th>
                          <th className="p-3 text-center">{t('absences')}</th>
                          <th className="p-3 text-end">{t('actions')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
                        {selectedClass.students
                          .filter(
                            (s) =>
                              s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
                              s.id.toLowerCase().includes(studentSearch.toLowerCase())
                          )
                          .map((student) => (
                            <tr
                              key={student.id}
                              className="hover:bg-surface-container-low transition-colors group"
                            >
                              <td className="p-3 text-center">
                                <input
                                  type="checkbox"
                                  className="rounded border-outline-variant text-primary focus:ring-primary"
                                />
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2.5">
                                  <div className="w-7 h-7 rounded-full bg-primary-fixed text-on-primary-fixed dark:bg-primary-container dark:text-on-primary-container flex items-center justify-center font-bold text-[11px] shrink-0">
                                    {student.avatarInitials}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-on-surface">
                                      {student.name}
                                    </p>
                                    <p className="text-[11px] text-on-surface-variant">
                                      {student.email}
                                    </p>
                                  </div>
                                </div>
                              </td>
                              <td className="p-3 text-on-surface-variant font-mono text-[11px]">
                                {student.id}
                              </td>
                              <td className="p-3">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 text-[11px] font-medium border border-emerald-200 dark:border-emerald-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                  {t('enrolled')}
                                </span>
                              </td>
                              <td className="p-3 text-center font-semibold text-on-surface">
                                {student.absences}
                              </td>
                              <td className="p-3 text-end">
                                <div className="flex items-center justify-end gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                  <button
                                    title="Transfer Student"
                                    className="p-1 rounded text-on-surface-variant hover:text-primary hover:bg-surface-container transition-colors"
                                  >
                                    <ArrowUpDown className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="Remove from Class"
                                    className="p-1 rounded text-on-surface-variant hover:text-error hover:bg-error-container/20 transition-colors"
                                  >
                                    <UserMinus className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    title="More Options"
                                    className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                                  >
                                    <MoreVertical className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Tab: Assigned Teachers */}
            {activeTab === 'teachers' && (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary-container text-on-secondary-container font-bold flex items-center justify-center text-xs">
                      {selectedClass.teacherInitials}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">
                        {selectedClass.homeroomTeacher}
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Homeroom & Advisory Lead
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-primary bg-primary-fixed/20 px-2 py-0.5 rounded">
                    Homeroom
                  </span>
                </div>

                <div className="p-3.5 rounded-xl border border-outline-variant bg-surface-container-lowest flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed font-bold flex items-center justify-center text-xs">
                      MK
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-on-surface">
                        Dr. Maha Kamal
                      </h4>
                      <p className="text-[11px] text-on-surface-variant">
                        Advanced Mathematics & Calculus
                      </p>
                    </div>
                  </div>
                  <span className="text-[11px] font-semibold text-on-surface-variant bg-surface-container px-2 py-0.5 rounded">
                    4 Periods / wk
                  </span>
                </div>
              </div>
            )}

            {/* Tab: Timetable */}
            {activeTab === 'timetable' && (
              <div className="p-6 rounded-xl border border-outline-variant bg-surface-container-lowest text-center space-y-2">
                <Calendar className="w-8 h-8 text-primary mx-auto" />
                <h4 className="text-xs font-bold text-on-surface">
                  Weekly Class Timetable Configured
                </h4>
                <p className="text-[11px] text-on-surface-variant max-w-sm mx-auto">
                  Sunday to Thursday • 35 periods scheduled with zero room conflicts.
                </p>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </div>
  )
}

/**
 * Pure Functional Class Card Component (Cloned from Stitch Screen 6084953b)
 */
function ClassCard({
  cls,
  t,
  onViewDetails,
  onManageRoster,
}: {
  cls: ClassData
  t: ReturnType<typeof useTranslations>
  onViewDetails: () => void
  onManageRoster: () => void
}) {
  const fillPercentage = Math.min(100, Math.round((cls.enrolledStudentsCount / cls.capacity) * 100))

  // Color coded threshold matching Stitch specification
  const progressColorClass =
    fillPercentage >= 100
      ? 'bg-error'
      : fillPercentage >= 90
        ? 'bg-warning'
        : 'bg-primary'

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-6 hover:bg-surface-container-low transition-all shadow-xs flex flex-col justify-between group">
      <div>
        {/* Top: Class Title and Teacher Badge */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h4 className="text-base font-bold text-on-surface tracking-tight">
              {cls.name}
            </h4>
            <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-1">
              <User className="w-3.5 h-3.5" />
              <span>
                {t('homeroom')}: <strong className="text-on-surface font-semibold">{cls.homeroomTeacher}</strong>
              </span>
            </p>
          </div>

          <div
            className={`w-10 h-10 rounded-full ${cls.teacherBadgeBg} ${cls.teacherBadgeText} flex items-center justify-center font-bold text-xs shrink-0 shadow-xs`}
          >
            {cls.teacherInitials}
          </div>
        </div>

        {/* Stream and Subject count badge */}
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-surface-container text-on-surface-variant">
            <GraduationCap className="w-3 h-3" />
            {cls.stream}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-primary-fixed/20 text-primary">
            <BookOpen className="w-3 h-3" />
            {cls.subjectsCount} Subjects
          </span>
        </div>

        {/* Middle: Capacity Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-on-surface-variant font-medium">
              {t('capacity')}
            </span>
            <span className="text-on-surface font-bold">
              {cls.enrolledStudentsCount}/{cls.capacity} {t('students')}
            </span>
          </div>
          <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
            <div
              className={`${progressColorClass} h-2 rounded-full transition-all duration-300`}
              style={{ width: `${fillPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom: Action Buttons */}
      <div className="flex gap-3 pt-2 border-t border-outline-variant">
        <button
          onClick={onViewDetails}
          className="flex-1 bg-surface-container border border-outline-variant text-on-surface-variant px-3 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container-high transition-colors cursor-pointer text-center"
        >
          {t('viewDetails')}
        </button>
        <button
          onClick={onManageRoster}
          className="flex-1 bg-primary hover:bg-primary-container text-on-primary px-3 py-2 rounded-lg text-xs font-semibold transition-colors shadow-xs cursor-pointer text-center"
        >
          {t('manageRoster')}
        </button>
      </div>
    </div>
  )
}
