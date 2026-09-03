'use client'

import { useState, useMemo } from 'react'
import { useTranslations } from 'next-intl'
import {
  Layers,
  Search,
  Plus,
  Filter,
  ArrowUpDown,
  LayoutGrid,
  List,
  MoreVertical,
  CheckCircle2,
  BookOpen,
  Users,
  X,
  Clock,
  GraduationCap,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Data Models
 * ────────────────────────────────────────────────────────────────────────── */

export type DepartmentType =
  | 'ALL'
  | 'Science'
  | 'Mathematics'
  | 'Languages'
  | 'Humanities'
  | 'Arts'

export interface SubjectItem {
  id: string
  code: string
  nameEn: string
  nameAr: string
  department: 'Science' | 'Mathematics' | 'Languages' | 'Humanities' | 'Arts'
  teachersCount: number
  teacherInitials: string[]
  assignedClasses: string[]
  weeklyHours: number
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch Screen 17)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_SUBJECTS: SubjectItem[] = [
  {
    id: 'sub-1',
    code: 'PHY-101',
    nameEn: 'Physics',
    nameAr: 'الفيزياء',
    department: 'Science',
    teachersCount: 4,
    teacherInitials: ['AH', 'SK', 'MD'],
    assignedClasses: ['10A', '10B', '11A'],
    weeklyHours: 5,
  },
  {
    id: 'sub-2',
    code: 'MAT-201',
    nameEn: 'Advanced Mathematics',
    nameAr: 'الرياضيات المتقدمة',
    department: 'Mathematics',
    teachersCount: 6,
    teacherInitials: ['MZ', 'TF', 'RS'],
    assignedClasses: ['11A', '12A'],
    weeklyHours: 6,
  },
  {
    id: 'sub-3',
    code: 'ENG-102',
    nameEn: 'English Literature',
    nameAr: 'الأدب الإنجليزي',
    department: 'Languages',
    teachersCount: 5,
    teacherInitials: ['ER', 'JL', 'KP'],
    assignedClasses: ['10A', '10B', '11B'],
    weeklyHours: 4,
  },
  {
    id: 'sub-4',
    code: 'BIO-301',
    nameEn: 'Cellular Biology',
    nameAr: 'علم الأحياء الخلوي',
    department: 'Science',
    teachersCount: 3,
    teacherInitials: ['SA', 'NM'],
    assignedClasses: ['11B', '12A'],
    weeklyHours: 4,
  },
  {
    id: 'sub-5',
    code: 'HIS-202',
    nameEn: 'World History',
    nameAr: 'تاريخ العالم الحديث',
    department: 'Humanities',
    teachersCount: 4,
    teacherInitials: ['DA', 'RK', 'LH'],
    assignedClasses: ['10A', '10B', '12B'],
    weeklyHours: 3,
  },
  {
    id: 'sub-6',
    code: 'ART-101',
    nameEn: 'Visual & Fine Arts',
    nameAr: 'الفنون البصرية والتشكيلية',
    department: 'Arts',
    teachersCount: 2,
    teacherInitials: ['FA', 'MS'],
    assignedClasses: ['10A', '11A'],
    weeklyHours: 2,
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: SubjectsCataloguePage
 * ────────────────────────────────────────────────────────────────────────── */

export default function SubjectsCataloguePage() {
  const t = useTranslations('features.subjects')
  const { activeRole } = useShellStore()
  const canAdd = activeRole === 'ADMIN'

  // Catalogue State
  const [subjects, setSubjects] = useState<SubjectItem[]>(INITIAL_SUBJECTS)
  const [departmentFilter, setDepartmentFilter] = useState<DepartmentType>('ALL')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<'code' | 'teachers' | 'name'>('code')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Drawer State
  const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false)
  const [newCode, setNewCode] = useState('')
  const [newNameEn, setNewNameEn] = useState('')
  const [newNameAr, setNewNameAr] = useState('')
  const [newDept, setNewDept] = useState<
    'Science' | 'Mathematics' | 'Languages' | 'Humanities' | 'Arts'
  >('Science')
  const [newHours, setNewHours] = useState(4)

  // Filtered & Sorted Subjects
  const filteredSubjects = useMemo(() => {
    return subjects
      .filter((sub) => {
        const q = searchQuery.toLowerCase().trim()
        const matchesSearch =
          !q ||
          sub.code.toLowerCase().includes(q) ||
          sub.nameEn.toLowerCase().includes(q) ||
          sub.nameAr.toLowerCase().includes(q) ||
          sub.department.toLowerCase().includes(q)

        const matchesDept =
          departmentFilter === 'ALL' || sub.department === departmentFilter

        return matchesSearch && matchesDept
      })
      .sort((a, b) => {
        if (sortBy === 'code') return a.code.localeCompare(b.code)
        if (sortBy === 'name') return a.nameEn.localeCompare(b.nameEn)
        if (sortBy === 'teachers') return b.teachersCount - a.teachersCount
        return 0
      })
  }, [subjects, searchQuery, departmentFilter, sortBy])

  // Handlers
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCode.trim() || !newNameEn.trim() || !newNameAr.trim()) return

    const newSub: SubjectItem = {
      id: `sub-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      nameEn: newNameEn.trim(),
      nameAr: newNameAr.trim(),
      department: newDept,
      teachersCount: 1,
      teacherInitials: ['KM'],
      assignedClasses: ['10A'],
      weeklyHours: newHours,
    }

    setSubjects([newSub, ...subjects])
    setIsAddDrawerOpen(false)
    setNewCode('')
    setNewNameEn('')
    setNewNameAr('')
    setToastMessage(t('subjectPublished'))
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Stitch Screen 17 exact header) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Layers className="w-7 h-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        {canAdd && (
          <button
            onClick={() => setIsAddDrawerOpen(true)}
            className="flex items-center justify-center gap-2 bg-primary text-on-primary px-4 py-2 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-xs self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addSubject')}</span>
          </button>
        )}
      </div>

      {/* Controls & Filter Bar (Stitch Screen 17 exact controls) */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between shadow-xs">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Department Filter Dropdown */}
          <div className="relative">
            <Filter className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value as DepartmentType)}
              className="pl-8 pr-6 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-outline"
            >
              <option value="ALL">{t('allDepartments')}</option>
              <option value="Science">{t('deptScience')}</option>
              <option value="Mathematics">{t('deptMath')}</option>
              <option value="Languages">{t('deptLanguages')}</option>
              <option value="Humanities">{t('deptHumanities')}</option>
              <option value="Arts">{t('deptArts')}</option>
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="relative">
            <ArrowUpDown className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none" />
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as 'code' | 'teachers' | 'name')
              }
              className="pl-8 pr-6 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer hover:border-outline"
            >
              <option value="code">{t('sortCode')}</option>
              <option value="teachers">{t('sortTeachers')}</option>
              <option value="name">{t('sortName')}</option>
            </select>
          </div>
        </div>

        {/* View Switcher: List vs Grid */}
        <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-lg border border-outline-variant/60">
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-md transition-colors ${
              viewMode === 'grid'
                ? 'bg-surface-container-lowest text-primary shadow-2xs'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Content View: List View (Stitch Screen 17 exact table)
       * ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'list' && (
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs flex flex-col">
          {filteredSubjects.length === 0 ? (
            <EmptyState
              icon={BookOpen}
              title="No subjects match your filter"
              description="Try adjusting your department filter or search terms."
              actionLabel="Reset Filters"
              onAction={() => {
                setDepartmentFilter('ALL')
                setSearchQuery('')
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant">
                    <th className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colCode')}
                    </th>
                    <th className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colName')}
                    </th>
                    <th className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colDepartment')}
                    </th>
                    <th className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colTeachers')}
                    </th>
                    <th className="py-3 px-4 font-semibold text-on-surface-variant uppercase tracking-wider">
                      {t('colAssigned')}
                    </th>
                    <th className="py-3 px-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  {filteredSubjects.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-surface-container-low/40 transition-colors group"
                    >
                      {/* Code Badge */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="font-semibold text-on-surface bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant">
                          {sub.code}
                        </span>
                      </td>

                      {/* Bilingual Name */}
                      <td className="py-4 px-4">
                        <div className="font-bold text-sm text-on-surface">
                          {sub.nameEn}
                        </div>
                        <div
                          className="text-xs text-on-surface-variant mt-0.5"
                          dir="rtl"
                        >
                          {sub.nameAr}
                        </div>
                      </td>

                      {/* Department Pill */}
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            sub.department === 'Science'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : sub.department === 'Mathematics'
                                ? 'bg-secondary-container text-on-secondary-container'
                                : sub.department === 'Languages'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-purple-50 text-purple-800 border border-purple-200'
                          }`}
                        >
                          {sub.department}
                        </span>
                      </td>

                      {/* Teachers Avatar Stack */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1.5">
                            {sub.teacherInitials.map((init, i) => (
                              <div
                                key={i}
                                className="w-6 h-6 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-[10px] border-2 border-surface-container-lowest"
                              >
                                {init}
                              </div>
                            ))}
                          </div>
                          <span className="text-xs font-semibold text-on-surface">
                            {sub.teachersCount} {t('qualified')}
                          </span>
                        </div>
                      </td>

                      {/* Assigned Classes */}
                      <td className="py-4 px-4">
                        <div className="flex flex-wrap gap-1">
                          {sub.assignedClasses.map((cls, idx) => (
                            <span
                              key={idx}
                              className="text-[11px] font-semibold bg-surface-container px-2 py-0.5 rounded border border-outline-variant text-on-surface"
                            >
                              {cls}
                            </span>
                          ))}
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => {
                            setToastMessage(`Viewing options for ${sub.code}`)
                            setTimeout(() => setToastMessage(null), 2500)
                          }}
                          className="p-1.5 text-outline hover:text-on-surface rounded-full hover:bg-surface-container transition-colors"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer stats */}
          <div className="border-t border-outline-variant p-4 flex items-center justify-between text-xs text-on-surface-variant bg-surface-container-low/30">
            <span>
              Showing {filteredSubjects.length} of {subjects.length} subjects
            </span>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Content View: Grid View (Bento Cards)
       * ────────────────────────────────────────────────────────────────────────── */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((sub) => (
            <div
              key={sub.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs hover:border-primary/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="font-bold text-xs bg-surface-container px-2.5 py-1 rounded-md border border-outline-variant text-on-surface">
                    {sub.code}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      sub.department === 'Science'
                        ? 'bg-primary/10 text-primary border border-primary/20'
                        : sub.department === 'Mathematics'
                          ? 'bg-secondary-container text-on-secondary-container'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {sub.department}
                  </span>
                </div>

                <h3 className="text-base font-bold text-on-surface">
                  {sub.nameEn}
                </h3>
                <p className="text-xs text-on-surface-variant mt-0.5" dir="rtl">
                  {sub.nameAr}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-3 border-t border-outline-variant/60 text-xs text-on-surface-variant">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-outline" />
                    <span>{sub.teachersCount} {t('qualified')}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-outline" />
                    <span>{sub.weeklyHours}h / week</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-outline-variant/60 flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {sub.assignedClasses.map((cls, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] font-semibold bg-surface-container px-1.5 py-0.5 rounded border border-outline-variant"
                    >
                      {cls}
                    </span>
                  ))}
                </div>
                <GraduationCap className="w-4 h-4 text-outline" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Add Subject Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isAddDrawerOpen}
        onClose={() => setIsAddDrawerOpen(false)}
        title={t('newSubjectTitle')}
        maxWidth="lg"
      >
        <form onSubmit={handleAddSubject} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            {t('newSubjectSubtitle')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('subjectCode')} *
            </label>
            <input
              type="text"
              required
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              placeholder="e.g. CHE-101"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('subjectNameEn')} *
              </label>
              <input
                type="text"
                required
                value={newNameEn}
                onChange={(e) => setNewNameEn(e.target.value)}
                placeholder="e.g. Chemistry"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('subjectNameAr')} *
              </label>
              <input
                type="text"
                required
                value={newNameAr}
                onChange={(e) => setNewNameAr(e.target.value)}
                placeholder="e.g. الكيمياء"
                dir="rtl"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('department')}
            </label>
            <select
              value={newDept}
              onChange={(e) =>
                setNewDept(
                  e.target.value as
                    | 'Science'
                    | 'Mathematics'
                    | 'Languages'
                    | 'Humanities'
                    | 'Arts'
                )
              }
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Science">Science</option>
              <option value="Mathematics">Mathematics</option>
              <option value="Languages">Languages</option>
              <option value="Humanities">Humanities</option>
              <option value="Arts">Arts</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('weeklyHours')}
            </label>
            <input
              type="number"
              min={1}
              max={15}
              value={newHours}
              onChange={(e) => setNewHours(Number(e.target.value))}
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsAddDrawerOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-xs"
            >
              {t('publishSubject')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
