'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  CalendarCheck,
  Search,
  CheckCheck,
  Clock,
  Sparkles,
  AlertTriangle,
  TrendingUp,
  BarChart3,
  CheckCircle2,
  X,
  User,
  Bell,
} from 'lucide-react'
import { EmptyState } from '../../../../../components/ui/empty-state'
import {
  MiniSparkline,
  MiniAttendanceBars,
} from '../../../../../components/ui/data-viz'
import { AttendanceTrendChart } from '../../../../../components/charts/attendance-trend-chart'
import { useQueryClient } from '@tanstack/react-query'
import { useAttendanceRegisterQuery } from '../../../../../hooks/use-domain-queries'
import { queryKeys } from '../../../../../lib/query-keys'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type AttendanceStatus = 'P' | 'A' | 'L' | 'E' // Present, Absent, Late, Excused

export interface StudentAttendanceRecord {
  id: string
  num: number
  nameEn: string
  nameAr: string
  code: string
  avatarUrl?: string
  initials: string
  status: AttendanceStatus
  note?: string
  historicalRate: number
}

export interface ChronicAbsenteeRecord {
  id: string
  nameEn: string
  nameAr: string
  code: string
  gradeClass: string
  unexcusedAbsences: number
  totalRate: number
  interventionStatus: 'Pending Review' | 'Parent Contacted' | 'Meeting Scheduled'
  parentName: string
  parentPhone: string
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch 05_take_attendance_register & 28_heatmap)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_STUDENTS: StudentAttendanceRecord[] = [
  {
    id: 's-1',
    num: 1,
    nameEn: 'Omar Al-Farsi',
    nameAr: 'عمر الفارسي',
    code: 'STD-10042',
    initials: 'OA',
    status: 'P',
    historicalRate: 98,
  },
  {
    id: 's-2',
    num: 2,
    nameEn: 'Faisal Abdullah',
    nameAr: 'فيصل عبدالله',
    code: 'STD-10087',
    initials: 'FA',
    status: 'A',
    historicalRate: 82,
  },
  {
    id: 's-3',
    num: 3,
    nameEn: 'Layla Mahmoud',
    nameAr: 'ليلى محمود',
    code: 'STD-10102',
    initials: 'LM',
    status: 'L',
    note: '12m late',
    historicalRate: 91,
  },
  {
    id: 's-4',
    num: 4,
    nameEn: 'Tariq Haddad',
    nameAr: 'طارق حداد',
    code: 'STD-10155',
    initials: 'TH',
    status: 'E',
    note: 'Medical',
    historicalRate: 95,
  },
  {
    id: 's-5',
    num: 5,
    nameEn: 'Sara Naser',
    nameAr: 'سارة ناصر',
    code: 'STD-10188',
    initials: 'SN',
    status: 'P',
    historicalRate: 99,
  },
  {
    id: 's-6',
    num: 6,
    nameEn: 'Ziad Mansour',
    nameAr: 'زياد منصور',
    code: 'STD-10214',
    initials: 'ZM',
    status: 'P',
    historicalRate: 94,
  },
  {
    id: 's-7',
    num: 7,
    nameEn: 'Mariam Al-Khatib',
    nameAr: 'مريم الخطيب',
    code: 'STD-10245',
    initials: 'MK',
    status: 'P',
    historicalRate: 97,
  },
  {
    id: 's-8',
    num: 8,
    nameEn: 'Hassan Al-Banna',
    nameAr: 'حسن البنا',
    code: 'STD-10290',
    initials: 'HB',
    status: 'P',
    historicalRate: 93,
  },
]

const CHRONIC_WATCHLIST: ChronicAbsenteeRecord[] = [
  {
    id: 'ca-1',
    nameEn: 'Faisal Abdullah',
    nameAr: 'فيصل عبدالله',
    code: 'STD-10087',
    gradeClass: 'Grade 10A',
    unexcusedAbsences: 5,
    totalRate: 82,
    interventionStatus: 'Pending Review',
    parentName: 'Abdullah Al-Ghamdi',
    parentPhone: '+971 50 221 4433',
  },
  {
    id: 'ca-2',
    nameEn: 'Karim Mansour',
    nameAr: 'كريم منصور',
    code: 'STD-10012',
    gradeClass: 'Grade 11B',
    unexcusedAbsences: 4,
    totalRate: 84,
    interventionStatus: 'Parent Contacted',
    parentName: 'Khaled Mansour',
    parentPhone: '+971 56 312 7788',
  },
  {
    id: 'ca-3',
    nameEn: 'Rami Qasim',
    nameAr: 'رامي قاسم',
    code: 'STD-10331',
    gradeClass: 'Grade 9C',
    unexcusedAbsences: 6,
    totalRate: 79,
    interventionStatus: 'Meeting Scheduled',
    parentName: 'Qasim Al-Hassan',
    parentPhone: '+971 52 884 1029',
  },
]

// Heatmap 4 Weeks Data (Mon-Fri active rates, Sat-Sun empty)
const HEATMAP_WEEKS = [
  [
    { day: 'Mon', rate: 98, level: 'high' },
    { day: 'Tue', rate: 97, level: 'high' },
    { day: 'Wed', rate: 92, level: 'medium' },
    { day: 'Thu', rate: 96, level: 'high' },
    { day: 'Fri', rate: 84, level: 'low' },
    { day: 'Sat', rate: 0, level: 'empty' },
    { day: 'Sun', rate: 0, level: 'empty' },
  ],
  [
    { day: 'Mon', rate: 99, level: 'high' },
    { day: 'Tue', rate: 98, level: 'high' },
    { day: 'Wed', rate: 95, level: 'high' },
    { day: 'Thu', rate: 91, level: 'medium' },
    { day: 'Fri', rate: 96, level: 'high' },
    { day: 'Sat', rate: 0, level: 'empty' },
    { day: 'Sun', rate: 0, level: 'empty' },
  ],
  [
    { day: 'Mon', rate: 93, level: 'medium' },
    { day: 'Tue', rate: 86, level: 'low' },
    { day: 'Wed', rate: 90, level: 'medium' },
    { day: 'Thu', rate: 97, level: 'high' },
    { day: 'Fri', rate: 98, level: 'high' },
    { day: 'Sat', rate: 0, level: 'empty' },
    { day: 'Sun', rate: 0, level: 'empty' },
  ],
  [
    { day: 'Mon', rate: 96, level: 'high' },
    { day: 'Tue', rate: 95, level: 'high' },
    { day: 'Wed', rate: 97, level: 'high' },
    { day: 'Thu', rate: 99, level: 'high' },
    { day: 'Fri', rate: 92, level: 'medium' },
    { day: 'Sat', rate: 0, level: 'empty' },
    { day: 'Sun', rate: 0, level: 'empty' },
  ],
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: AttendancePage
 * ────────────────────────────────────────────────────────────────────────── */

export default function AttendancePage() {
  const t = useTranslations('features.attendance')

  // Main Active Tab: 'register' | 'analytics'
  const [activeTab, setActiveTab] = useState<'register' | 'analytics'>('register')

  const queryClient = useQueryClient()
  useAttendanceRegisterQuery('cls-10a', '2026-10-24')

  // Register State
  const [students, setStudents] = useState<StudentAttendanceRecord[]>(INITIAL_STUDENTS)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Watchlist State
  const [watchlist, setWatchlist] = useState<ChronicAbsenteeRecord[]>(CHRONIC_WATCHLIST)

  // Filtered Students in Register
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        s.nameEn.toLowerCase().includes(q) ||
        s.nameAr.includes(q) ||
        s.code.toLowerCase().includes(q)

      const matchesStatus = filterStatus === 'ALL' || s.status === filterStatus

      return matchesQuery && matchesStatus
    })
  }, [students, searchQuery, filterStatus])

  // Summary Metrics for Sticky Bottom Bar
  const metrics = useMemo(() => {
    const total = students.length
    const present = students.filter((s) => s.status === 'P').length
    const absent = students.filter((s) => s.status === 'A').length
    const late = students.filter((s) => s.status === 'L').length
    const excused = students.filter((s) => s.status === 'E').length
    const percent = total > 0 ? Math.round((present / total) * 100) : 0

    return { total, present, absent, late, excused, percent }
  }, [students])

  // Handlers
  const handleStatusChange = (id: string, newStatus: AttendanceStatus) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, status: newStatus } : s))
    )
  }

  const handleMarkAllPresent = () => {
    setStudents((prev) => prev.map((s) => ({ ...s, status: 'P' })))
    setToastMessage('All students marked present.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleSaveDraft = () => {
    setToastMessage(t('draftSavedSuccess'))
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleSubmitRegister = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all })
    setToastMessage(t('submittedSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handleNotifyParent = (id: string, studentName: string) => {
    setWatchlist((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, interventionStatus: 'Parent Contacted' } : item
      )
    )
    setToastMessage(t('parentNotified') + ` (${studentName})`)
    setTimeout(() => setToastMessage(null), 3500)
  }

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Tab Selector (Stitch Screen 05 & 28) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <CalendarCheck className="w-7 h-7 text-primary" />
            {activeTab === 'register' ? t('title') : t('analyticsTitle')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {activeTab === 'register'
              ? `${t('period')} • ${t('date')} • ${t('room')} • ${t('teacher')}`
              : t('analyticsSubtitle')}
          </p>
        </div>

        {/* View Switcher Tabs */}
        <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('register')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'register'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <CheckCheck className="w-4 h-4" />
            <span>{t('registerTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'analytics'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            <span>{t('analyticsTab')}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 1: DAILY ATTENDANCE REGISTER (Stitch Screen 05_take_attendance_register)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'register' && (
        <div className="space-y-4">
          {/* 24-Hour Teacher Edit Window Active Banner (Stitch Screen 05 exact banner) */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 rounded-xl px-4 py-3 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <span className="text-xs sm:text-sm font-bold block">
                  {t('editWindowActive')}
                </span>
                <span className="text-xs text-emerald-700 opacity-90">
                  {t('editWindowRemaining')}
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold bg-emerald-600 text-white px-2.5 py-1 rounded-md">
              Period 2
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3 w-full sm:w-auto flex-1">
              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t('searchPlaceholder')}
                  className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Status Filter */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
              >
                <option value="ALL">{t('filterStatus')}: All</option>
                <option value="P">{t('present')}</option>
                <option value="A">{t('absent')}</option>
                <option value="L">{t('late')}</option>
                <option value="E">{t('excused')}</option>
              </select>
            </div>

            {/* Mark All Present Quick Action */}
            <button
              onClick={handleMarkAllPresent}
              className="w-full sm:w-auto px-4 py-2 bg-primary text-on-primary rounded-lg flex items-center justify-center gap-2 text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <CheckCheck className="w-4 h-4" />
              {t('markAllPresent')}
            </button>
          </div>

          {/* Student Roster Table Card (Stitch Screen 05 exact layout) */}
          {filteredStudents.length === 0 ? (
            <EmptyState
              icon={User}
              title="No students found"
              description="No students in this class section match your current search query or filter."
              actionLabel="Clear Filters"
              onAction={() => {
                setSearchQuery('')
                setFilterStatus('ALL')
              }}
            />
          ) : (
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4 w-12 text-center">{t('colNum')}</th>
                      <th className="py-3 px-4 min-w-[240px]">{t('colStudent')}</th>
                      <th className="py-3 px-4 w-32">{t('colCode')}</th>
                      <th className="py-3 px-4 w-[240px]">{t('colStatus')}</th>
                      <th className="py-3 px-4 w-44">{t('colNote')}</th>
                      <th className="py-3 px-4 w-28 text-right">{t('colHistory')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="hover:bg-surface-container-low/60 transition-colors group"
                      >
                        {/* Num */}
                        <td className="py-3 px-4 text-center text-xs text-outline font-medium">
                          {student.num}
                        </td>

                        {/* Student Photo & Name */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-xs shrink-0 border border-outline-variant">
                              {student.initials}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-on-surface">
                                {student.nameEn}
                              </div>
                              <div className="text-xs text-on-surface-variant font-medium mt-0.5" dir="rtl">
                                {student.nameAr}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Code */}
                        <td className="py-3 px-4 text-xs font-mono text-on-surface-variant">
                          {student.code}
                        </td>

                        {/* Segmented Status Selector: P, A, L, E */}
                        <td className="py-3 px-4">
                          <div className="flex bg-surface-container-low p-1 rounded-lg border border-outline-variant/60 w-fit gap-1">
                            <button
                              onClick={() => handleStatusChange(student.id, 'P')}
                              title="Present"
                              className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                                student.status === 'P'
                                  ? 'bg-emerald-600 text-white shadow-xs'
                                  : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
                              }`}
                            >
                              P
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'A')}
                              title="Absent"
                              className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                                student.status === 'A'
                                  ? 'bg-red-600 text-white shadow-xs'
                                  : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
                              }`}
                            >
                              A
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'L')}
                              title="Late"
                              className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                                student.status === 'L'
                                  ? 'bg-amber-500 text-white shadow-xs'
                                  : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
                              }`}
                            >
                              L
                            </button>
                            <button
                              onClick={() => handleStatusChange(student.id, 'E')}
                              title="Excused"
                              className={`w-9 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all ${
                                student.status === 'E'
                                  ? 'bg-blue-600 text-white shadow-xs'
                                  : 'text-outline hover:bg-surface-container-high hover:text-on-surface'
                              }`}
                            >
                              E
                            </button>
                          </div>
                        </td>

                        {/* Note */}
                        <td className="py-3 px-4">
                          {student.note ? (
                            <span
                              className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded border ${
                                student.note.includes('late')
                                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                                  : 'bg-blue-50 text-blue-700 border-blue-200'
                              }`}
                            >
                              {student.note}
                            </span>
                          ) : (
                            <button className="text-primary hover:underline text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                              + {t('addNote')}
                            </button>
                          )}
                        </td>

                        {/* History % */}
                        <td className="py-3 px-4 text-right">
                          <span
                            className={`inline-flex items-center justify-center px-2 py-0.5 rounded text-xs font-bold ${
                              student.historicalRate >= 95
                                ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-200'
                                : student.historicalRate >= 90
                                  ? 'bg-amber-500/10 text-amber-700 border border-amber-200'
                                  : 'bg-red-500/10 text-red-700 border border-red-200'
                            }`}
                          >
                            {student.historicalRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sticky Bottom Summary Action Bar (Stitch Screen 05 exact fixed bar) */}
          <div className="fixed bottom-0 left-0 lg:left-64 right-0 bg-surface-container-lowest border-t border-outline-variant p-4 flex flex-col sm:flex-row justify-between items-center gap-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)] z-30">
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm font-medium bg-surface-container-low px-4 py-2 rounded-xl border border-outline-variant/60">
              <span className="font-bold text-on-surface border-r border-outline-variant pr-3">
                {t('totalStudents', { count: metrics.total })}
              </span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                {t('presentCount', { count: metrics.present, percent: metrics.percent })}
              </span>
              <span className="text-red-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-red-600" />
                {t('absentCount', { count: metrics.absent })}
              </span>
              <span className="text-amber-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                {t('lateCount', { count: metrics.late })}
              </span>
              <span className="text-blue-700 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-600" />
                {t('excusedCount', { count: metrics.excused })}
              </span>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
              <button
                onClick={handleSaveDraft}
                className="px-4 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-semibold hover:bg-surface-container-high transition-colors shadow-xs"
              >
                {t('saveDraft')}
              </button>
              <button
                onClick={handleSubmitRegister}
                className="px-6 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                {t('submitRegister')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 2: ATTENDANCE ANALYTICS & HEATMAP (Stitch Screen 28_attendance_analytics)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          {/* Top Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-xs">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Cohort Scope
            </span>
            <div className="flex flex-wrap gap-2">
              <select className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface outline-none">
                <option>AY 2026-27 (Current)</option>
                <option>AY 2025-26</option>
              </select>
              <select className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface outline-none">
                <option>Term 1</option>
                <option>Term 2</option>
              </select>
              <select className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-xs font-semibold text-on-surface outline-none">
                <option>All Classes (Grade 9–12)</option>
                <option>Grade 10A</option>
                <option>Grade 10B</option>
              </select>
            </div>
          </div>

          {/* Row 1: KPI Bento Cards (Stitch Screen 28 exact metrics enhanced with micro-viz) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* KPI 1: Avg Daily Attendance */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('avgDailyAttendance')}
                  </p>
                  <p className="text-3xl font-bold text-on-surface mt-1.5">94.2%</p>
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    +1.4% from last term
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-secondary-container text-secondary flex items-center justify-center border border-secondary-fixed">
                  <TrendingUp className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
                <span>5-Day Rate</span>
                <MiniAttendanceBars
                  days={[93, 95, 94, 95, 94.2]}
                  height={18}
                  ariaLabel="Weekly attendance rates: average 94.2%"
                />
              </div>
            </div>

            {/* KPI 2: Chronically Absent */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('chronicallyAbsent')}
                  </p>
                  <p className="text-3xl font-bold text-red-600 mt-1.5">4.8%</p>
                  <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" />
                    Down from 6.2%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center border border-red-200">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Improving Trend</span>
                <MiniSparkline
                  data={[6.2, 5.8, 5.5, 5.1, 4.8]}
                  strokeColor="#059669"
                  fillColor="rgba(5, 150, 105, 0.08)"
                  width={68}
                  height={18}
                  ariaLabel="Chronically absent rate: down from 6.2% to 4.8%"
                />
              </div>
            </div>

            {/* KPI 3: Perfect Attendance */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                    {t('perfectAttendance')}
                  </p>
                  <p className="text-3xl font-bold text-primary mt-1.5">18%</p>
                  <p className="text-xs text-primary font-medium mt-1 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    45 students with 100%
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center border border-outline-variant">
                  <Sparkles className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs text-on-surface-variant">
                <span>Honors Cohort</span>
                <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold">
                  Top Tier
                </span>
              </div>
            </div>
          </div>

          {/* Row 2: Monthly Daily Attendance Heatmap Grid (Stitch Screen 28 exact design) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Heatmap Grid (Col 1-8) */}
            <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                  <h3 className="text-base font-semibold text-on-surface">
                    {t('dailyRateHeatmap')}
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    October 2026 — 4 Weeks Class Session Trends
                  </p>
                </div>
                <div className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
                  <span>{t('low')}</span>
                  <div className="w-3.5 h-3.5 rounded-sm bg-red-400" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-amber-400" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-400" />
                  <div className="w-3.5 h-3.5 rounded-sm bg-emerald-600" />
                  <span>{t('high')}</span>
                </div>
              </div>

              {/* Grid 7 Cols (Mon to Sun) */}
              <div className="grid grid-cols-7 gap-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                  <div key={day} className="text-center text-xs font-semibold text-outline pb-1">
                    {day}
                  </div>
                ))}

                {HEATMAP_WEEKS.map((week, wIdx) =>
                  week.map((cell, cIdx) => (
                    <div
                      key={`w${wIdx}-c${cIdx}`}
                      title={cell.rate > 0 ? `${cell.day}: ${cell.rate}% attendance` : 'Weekend'}
                      className={`h-10 rounded-lg flex flex-col items-center justify-center text-[10px] font-bold transition-transform hover:scale-105 cursor-pointer ${
                        cell.level === 'high'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : cell.level === 'medium'
                            ? 'bg-emerald-400 text-slate-900 shadow-xs'
                            : cell.level === 'low'
                              ? 'bg-red-400 text-white shadow-xs'
                              : 'bg-surface-container-high/60 text-outline cursor-default'
                      }`}
                    >
                      {cell.rate > 0 && <span>{cell.rate}%</span>}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Grade Cohort Comparison (Col 9-12) */}
            <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-semibold text-on-surface mb-1">
                  {t('gradeComparison')}
                </h3>
                <p className="text-xs text-on-surface-variant mb-4">
                  Term attendance rate per grade cohort
                </p>

                <div className="space-y-4">
                  {[
                    { grade: 'Grade 9', rate: 95.5, color: 'bg-primary' },
                    { grade: 'Grade 10', rate: 94.2, color: 'bg-secondary' },
                    { grade: 'Grade 11', rate: 92.8, color: 'bg-emerald-500' },
                    { grade: 'Grade 12', rate: 96.1, color: 'bg-primary' },
                  ].map((cohort) => (
                    <div key={cohort.grade} className="space-y-1.5">
                      <div className="flex justify-between text-xs font-semibold text-on-surface">
                        <span>{cohort.grade}</span>
                        <span>{cohort.rate}%</span>
                      </div>
                      <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${cohort.color}`}
                          style={{ width: `${cohort.rate}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-outline-variant text-xs text-on-surface-variant flex items-center justify-between mt-4">
                <span>School Target: 95.0%</span>
                <span className="font-bold text-emerald-700">On Track</span>
              </div>
            </div>
          </div>

          {/* Longitudinal Trajectory Chart (Recharts AreaChart) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div>
                <h3 className="text-sm font-bold text-on-surface">
                  10-Week Attendance Trajectory &amp; Cohort Comparison
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  District-wide trajectory comparing Current Term (94.2% avg) vs Previous Term (92.8% avg)
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold self-start sm:self-auto">
                +1.4% vs Previous Term
              </span>
            </div>
            <AttendanceTrendChart height={220} />
          </div>

          {/* Row 3: Chronic Absenteeism Watchlist Table (Stitch Screen 28 exact design) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-semibold text-on-surface flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  {t('watchlistTitle')}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  {t('watchlistSubtitle')}
                </p>
              </div>
              <span className="text-xs font-bold text-red-600 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md">
                {watchlist.length} Students At Risk
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-surface-container-low/60 border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4 text-center">Unexcused Absences</th>
                    <th className="py-3 px-4 text-center">Attendance %</th>
                    <th className="py-3 px-4">Intervention Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-sm">
                  {watchlist.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-container-low/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-on-surface">{item.nameEn}</div>
                        <div className="text-xs text-on-surface-variant" dir="rtl">{item.nameAr}</div>
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-on-surface-variant">
                        {item.gradeClass}
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-red-600">
                        {item.unexcusedAbsences} days
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 bg-red-50 text-red-700 font-bold text-xs rounded border border-red-200">
                          {item.totalRate}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 text-xs font-semibold rounded ${
                            item.interventionStatus === 'Meeting Scheduled'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : item.interventionStatus === 'Parent Contacted'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-surface-container-high text-on-surface-variant'
                          }`}
                        >
                          {item.interventionStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleNotifyParent(item.id, item.nameEn)}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs inline-flex items-center gap-1.5"
                        >
                          <Bell className="w-3.5 h-3.5" />
                          {t('notifyParent')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
