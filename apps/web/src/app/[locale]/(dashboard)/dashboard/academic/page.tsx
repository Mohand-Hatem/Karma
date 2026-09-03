'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  CalendarDays,
  Calendar,
  School,
  Star,
  Plus,
  Sliders,
  CheckCircle2,
  Clock,
  History,
  Edit,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { useShellStore } from '../../../../../stores/shell-store'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type CycleStatus = 'ACTIVE' | 'UPCOMING' | 'ARCHIVED'

export interface TermData {
  id: string
  name: string
  nameAr: string
  season: string
  status: 'Active' | 'Upcoming' | 'Completed'
  dates: string
  days: number
  progress: number
  color: 'secondary' | 'primary' | 'tertiary'
}

export interface AcademicCycle {
  id: string
  name: string
  shortLabel: string
  status: CycleStatus
  startDate: string
  endDate: string
  instructionalDays: number
  terms: TermData[]
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch 18_academic_years_terms)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_CYCLES: AcademicCycle[] = [
  {
    id: 'ay-25-26',
    name: '2025/2026',
    shortLabel: '25/26',
    status: 'ACTIVE',
    startDate: 'Sep 1, 2025',
    endDate: 'Jun 30, 2026',
    instructionalDays: 180,
    terms: [
      {
        id: 't-1',
        name: 'Term 1',
        nameAr: 'الفصل الأول',
        season: 'Fall Semester',
        status: 'Active',
        dates: 'Sep 1 – Dec 15',
        days: 72,
        progress: 45,
        color: 'secondary',
      },
      {
        id: 't-2',
        name: 'Term 2',
        nameAr: 'الفصل الثاني',
        season: 'Winter Semester',
        status: 'Upcoming',
        dates: 'Jan 5 – Mar 20',
        days: 54,
        progress: 0,
        color: 'primary',
      },
      {
        id: 't-3',
        name: 'Term 3',
        nameAr: 'الفصل الثالث',
        season: 'Spring Semester',
        status: 'Upcoming',
        dates: 'Apr 1 – Jun 30',
        days: 54,
        progress: 0,
        color: 'tertiary',
      },
    ],
  },
  {
    id: 'ay-26-27',
    name: '2026/2027',
    shortLabel: '26/27',
    status: 'UPCOMING',
    startDate: 'Sep 1, 2026',
    endDate: 'Jun 30, 2027',
    instructionalDays: 180,
    terms: [
      {
        id: 't-4',
        name: 'Term 1',
        nameAr: 'الفصل الأول',
        season: 'Fall Semester',
        status: 'Upcoming',
        dates: 'Sep 1 – Dec 15',
        days: 72,
        progress: 0,
        color: 'primary',
      },
      {
        id: 't-5',
        name: 'Term 2',
        nameAr: 'الفصل الثاني',
        season: 'Winter Semester',
        status: 'Upcoming',
        dates: 'Jan 5 – Mar 20',
        days: 54,
        progress: 0,
        color: 'primary',
      },
    ],
  },
  {
    id: 'ay-24-25',
    name: '2024/2025',
    shortLabel: '24/25',
    status: 'ARCHIVED',
    startDate: 'Sep 1, 2024',
    endDate: 'Jun 28, 2025',
    instructionalDays: 180,
    terms: [
      {
        id: 't-6',
        name: 'Term 1',
        nameAr: 'الفصل الأول',
        season: 'Fall Semester',
        status: 'Completed',
        dates: 'Sep 1 – Dec 15',
        days: 72,
        progress: 100,
        color: 'secondary',
      },
      {
        id: 't-7',
        name: 'Term 2',
        nameAr: 'الفصل الثاني',
        season: 'Winter Semester',
        status: 'Completed',
        dates: 'Jan 5 – Mar 20',
        days: 54,
        progress: 100,
        color: 'secondary',
      },
      {
        id: 't-8',
        name: 'Term 3',
        nameAr: 'الفصل الثالث',
        season: 'Spring Semester',
        status: 'Completed',
        dates: 'Apr 1 – Jun 28',
        days: 54,
        progress: 100,
        color: 'secondary',
      },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: AcademicPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function AcademicPage() {
  const t = useTranslations('features.academic')
  const { activeRole } = useShellStore()
  const canManage = activeRole === 'ADMIN'

  // State
  const [cycles, setCycles] = useState<AcademicCycle[]>(INITIAL_CYCLES)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Form State
  const [formName, setFormName] = useState('')
  const [formStartDate, setFormStartDate] = useState('')
  const [formEndDate, setFormEndDate] = useState('')
  const [formDays, setFormDays] = useState('180')
  const [formStructure, setFormStructure] = useState('trimester')

  const handleAddCycleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim()) return

    const short = formName.trim().replace(/^20/, '').replace(/\/20/, '/')
    const newCycle: AcademicCycle = {
      id: `ay-${Date.now()}`,
      name: formName.trim(),
      shortLabel: short,
      status: 'UPCOMING',
      startDate: formStartDate || 'Sep 1, 2027',
      endDate: formEndDate || 'Jun 30, 2028',
      instructionalDays: parseInt(formDays) || 180,
      terms: [
        {
          id: `t-new-1-${Date.now()}`,
          name: 'Term 1',
          nameAr: 'الفصل الأول',
          season: 'Fall Semester',
          status: 'Upcoming',
          dates: 'Sep 1 – Dec 15',
          days: 72,
          progress: 0,
          color: 'primary',
        },
        {
          id: `t-new-2-${Date.now()}`,
          name: 'Term 2',
          nameAr: 'الفصل الثاني',
          season: 'Winter Semester',
          status: 'Upcoming',
          dates: 'Jan 5 – Mar 20',
          days: 54,
          progress: 0,
          color: 'primary',
        },
      ],
    }

    setCycles([newCycle, ...cycles])
    setIsAddOpen(false)
    setFormName('')
    setToastMessage(t('cycleCreatedSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Stitch Screen 18 exact header) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <CalendarDays className="w-7 h-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={() => {
              setToastMessage('Term configuration modal is accessible in Settings.')
              setTimeout(() => setToastMessage(null), 3500)
            }}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant text-on-surface rounded-lg text-sm font-semibold hover:bg-surface-container-high transition-colors bg-surface-container-lowest shadow-xs"
          >
            <Sliders className="w-4 h-4 text-on-surface-variant" />
            {t('configureTerms')}
          </button>

          {canManage && (
            <button
              onClick={() => setIsAddOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('addYear')}
            </button>
          )}
        </div>
      </div>

      {/* Timeline Stream Container (Stitch Screen 18 exact vertical stream) */}
      <div className="space-y-10 relative before:absolute before:inset-y-0 before:left-[23px] md:before:left-[95px] before:w-px before:bg-outline-variant before:z-0 ml-1 md:ml-0">
        {cycles.map((cycle) => {
          const isActive = cycle.status === 'ACTIVE'
          const isUpcoming = cycle.status === 'UPCOMING'

          return (
            <div key={cycle.id} className="relative z-10 flex flex-col md:flex-row gap-6 group">
              {/* Timeline Marker & Label */}
              <div className="flex items-center md:items-start md:w-24 shrink-0">
                <div className="hidden md:block font-bold text-lg text-on-surface pt-1 w-full text-right pr-6">
                  {cycle.shortLabel}
                </div>

                {/* Marker Circle */}
                <div
                  className={`w-12 h-12 rounded-full border-4 border-surface-container-lowest shadow-sm flex items-center justify-center relative z-10 -ml-6 md:ml-0 md:absolute md:left-[71px] md:mt-1 ring-2 ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-600 ring-emerald-500/20'
                      : isUpcoming
                        ? 'bg-primary/10 text-primary ring-primary/20'
                        : 'bg-surface-container-high text-on-surface-variant ring-outline-variant/30'
                  }`}
                >
                  {isActive ? (
                    <Star className="w-5 h-5 fill-emerald-600" />
                  ) : isUpcoming ? (
                    <Clock className="w-5 h-5" />
                  ) : (
                    <History className="w-5 h-5" />
                  )}
                </div>

                <div className="md:hidden font-bold text-base text-on-surface ml-4">
                  {cycle.name}
                </div>
              </div>

              {/* Year Card (Bento Style) */}
              <div className="flex-1 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-xs overflow-hidden hover:border-primary/40 transition-colors">
                {/* Card Header */}
                <div className="p-5 border-b border-outline-variant flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-surface-container-lowest to-surface-container-low">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-xl font-bold text-on-surface tracking-tight">
                        {cycle.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : isUpcoming
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-surface-container-high text-on-surface-variant border border-outline-variant'
                        }`}
                      >
                        {isActive
                          ? t('currentActive')
                          : isUpcoming
                            ? t('upcoming')
                            : t('archived')}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-on-surface-variant text-xs font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-outline" />
                        {cycle.startDate} – {cycle.endDate}
                      </span>
                      <span className="w-1 h-1 rounded-full bg-outline-variant" />
                      <span className="text-primary font-semibold">
                        {t('instructionalDays', { count: cycle.instructionalDays })}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <button
                      onClick={() => {
                        setToastMessage(`Editing terms for ${cycle.name}`)
                        setTimeout(() => setToastMessage(null), 3000)
                      }}
                      className="p-1.5 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors"
                      title="Edit Year"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Terms Grid (Stitch Screen 18 exact 3-column bento) */}
                <div className="p-5 grid grid-cols-1 lg:grid-cols-3 gap-4 bg-surface-container-low/40">
                  {cycle.terms.map((term) => (
                    <div
                      key={term.id}
                      className="border border-outline-variant rounded-xl p-4 bg-surface-container-lowest hover:bg-surface-container-low/60 transition-colors relative overflow-hidden shadow-xs"
                    >
                      <div
                        className={`absolute top-0 left-0 w-1.5 h-full ${
                          term.color === 'secondary'
                            ? 'bg-secondary'
                            : term.color === 'primary'
                              ? 'bg-primary'
                              : 'bg-amber-500'
                        }`}
                      />
                      <div className="flex justify-between items-start mb-2.5 pl-2">
                        <div>
                          <h4 className="text-base font-bold text-on-surface">
                            {term.name}
                          </h4>
                          <p className="text-xs text-on-surface-variant font-medium">
                            {term.season}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold ${
                            term.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : term.status === 'Completed'
                                ? 'bg-surface-container-high text-on-surface-variant'
                                : 'bg-surface-container-low text-outline border border-outline-variant'
                          }`}
                        >
                          {term.status}
                        </span>
                      </div>

                      <div className="space-y-1.5 pl-2 text-xs text-on-surface-variant">
                        <div className="flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-outline" />
                            {term.dates}
                          </span>
                        </div>
                        <div className="flex items-center justify-between font-medium">
                          <span className="flex items-center gap-1">
                            <School className="w-3.5 h-3.5 text-outline" />
                            {t('daysCount', { count: term.days })}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-3.5 pl-2">
                        <div className="flex justify-between text-[11px] font-semibold text-on-surface-variant mb-1">
                          <span>{t('termProgress')}</span>
                          <span>{term.progress}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-surface-container-high rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              term.color === 'secondary'
                                ? 'bg-secondary'
                                : term.color === 'primary'
                                  ? 'bg-primary'
                                  : 'bg-amber-500'
                            }`}
                            style={{ width: `${term.progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Add Academic Year Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title={t('addYearTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleAddCycleSubmit} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            {t('addYearSubtitle')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('cycleName')} *
            </label>
            <input
              type="text"
              required
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. 2027/2028"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('startDate')} *
              </label>
              <input
                type="text"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                placeholder="Sep 1, 2027"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('endDate')} *
              </label>
              <input
                type="text"
                value={formEndDate}
                onChange={(e) => setFormEndDate(e.target.value)}
                placeholder="Jun 30, 2028"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Instructional Days
              </label>
              <input
                type="number"
                value={formDays}
                onChange={(e) => setFormDays(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('termStructure')}
              </label>
              <select
                value={formStructure}
                onChange={(e) => setFormStructure(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="trimester">{t('trimester')}</option>
                <option value="semester">{t('semester')}</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsAddOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t('saveCycle')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
