'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Plus,
  Filter,
  FileText,
  Play,
  ClipboardList,
  MoreVertical,
  CalendarDays,
  ArrowRight,
  FolderOpen,
  BookOpen,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { useShellStore } from '../../../../../stores/shell-store'

/* ─────────────────────────── Types ─────────────────────────── */

type LessonStatus = 'PUBLISHED' | 'DRAFT'

interface ResourceAttachment {
  type: 'pdf' | 'video' | 'worksheet'
  label: string
}

interface LessonItem {
  id: string
  title: string
  date: string
  period: string
  status: LessonStatus
  resources: ResourceAttachment[]
}

interface UnitWeek {
  unit: string
  week: string
  lessons: LessonItem[]
}

/* ─────────────────────────── Static Data ─────────────────────────── */

const RESOURCE_ICON: Record<ResourceAttachment['type'], React.ReactNode> = {
  pdf: <FileText className="w-3.5 h-3.5" />,
  video: <Play className="w-3.5 h-3.5" />,
  worksheet: <ClipboardList className="w-3.5 h-3.5" />,
}

const INITIAL_UNITS: UnitWeek[] = [
  {
    unit: 'Unit 1: Mechanics',
    week: 'Week 1',
    lessons: [
      {
        id: 'les-1',
        title: 'Kinematics Intro',
        date: 'Oct 12, 2023',
        period: 'Period 2',
        status: 'PUBLISHED',
        resources: [
          { type: 'pdf', label: 'Slides.pdf' },
          { type: 'video', label: 'Demo Video' },
        ],
      },
      {
        id: 'les-2',
        title: 'Velocity vs Time',
        date: 'Oct 14, 2023',
        period: 'Period 4',
        status: 'PUBLISHED',
        resources: [{ type: 'worksheet', label: 'Worksheet' }],
      },
    ],
  },
  {
    unit: 'Unit 1: Mechanics',
    week: 'Week 2',
    lessons: [
      {
        id: 'les-3',
        title: "Newton's First Law",
        date: 'Oct 19, 2023',
        period: 'Period 2',
        status: 'DRAFT',
        resources: [],
      },
    ],
  },
  {
    unit: 'Unit 2: Forces',
    week: 'Week 3',
    lessons: [
      {
        id: 'les-4',
        title: 'Circular Motion & Gravity',
        date: 'Oct 26, 2023',
        period: 'Period 3',
        status: 'PUBLISHED',
        resources: [
          { type: 'pdf', label: 'Lesson Slides' },
          { type: 'pdf', label: 'Formula Sheet' },
        ],
      },
      {
        id: 'les-5',
        title: "Newton's Law of Gravitation",
        date: 'Oct 28, 2023',
        period: 'Period 1',
        status: 'DRAFT',
        resources: [],
      },
    ],
  },
]

/* ─────────────────────────── Main Page ─────────────────────────── */

export default function LessonsPage() {
  const t = useTranslations('features.lessons')
  const tCommon = useTranslations('common')
  const { activeRole } = useShellStore()

  const [units, setUnits] = useState<UnitWeek[]>(INITIAL_UNITS)
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // New Lesson Form state
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDate, setNewDate] = useState('')
  const [newPeriod, setNewPeriod] = useState('Period 1')

  const isTeacherOrAdmin = activeRole === 'ADMIN' || activeRole === 'TEACHER'
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const handleOpenLesson = (lesson: LessonItem) => {
    setSelectedLesson(lesson)
    setIsDrawerOpen(true)
    router.push(`/${locale}/dashboard/lessons/${lesson.id}`)
  }

  const handlePublish = (lessonId: string) => {
    setUnits((prev) =>
      prev.map((u) => ({
        ...u,
        lessons: u.lessons.map((l) =>
          l.id === lessonId ? { ...l, status: 'PUBLISHED' as LessonStatus } : l
        ),
      }))
    )
    if (selectedLesson?.id === lessonId) {
      setSelectedLesson((prev) => prev ? { ...prev, status: 'PUBLISHED' } : null)
    }
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return
    const newLesson: LessonItem = {
      id: `les-${Date.now()}`,
      title: newTitle,
      date: newDate || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      period: newPeriod,
      status: 'DRAFT',
      resources: [],
    }
    setUnits((prev) => {
      const updated = [...prev]
      if (updated.length > 0) {
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          lessons: [...updated[updated.length - 1].lessons, newLesson],
        }
      }
      return updated
    })
    setNewTitle('')
    setNewDate('')
    setNewPeriod('Period 1')
    setIsCreateOpen(false)
  }

  return (
    <div className="space-y-8">
      {/* ── Page Header (Stitch Screen 9f985cd6) ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs font-semibold text-on-surface-variant uppercase tracking-wide mb-1">
            <span>{t('breadcrumbAcademic')}</span>
            <span className="text-outline">›</span>
            <span>Grade 10</span>
            <span className="text-outline">›</span>
            <span className="text-primary font-bold">Physics</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            {t('title')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">{t('description')}</p>
        </div>

        {isTeacherOrAdmin && (
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors">
              <Filter className="w-4 h-4" />
              {t('filter')}
            </button>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('newLesson')}
            </button>
          </div>
        )}
      </div>

      {/* ── Unit / Week Groups ── */}
      <div className="space-y-8">
        {units.map((unitWeek, idx) => (
          <section key={idx}>
            {/* Section header */}
            <h3 className="text-base font-bold text-on-surface mb-4 flex items-center gap-2 pb-2 border-b border-outline-variant">
              <span className="text-on-surface-variant text-sm font-normal">{unitWeek.unit} /</span>
              {unitWeek.week}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {unitWeek.lessons.map((lesson) => (
                <LessonCard
                  key={lesson.id}
                  lesson={lesson}
                  isTeacherOrAdmin={isTeacherOrAdmin}
                  t={t}
                  onOpen={() => handleOpenLesson(lesson)}
                  onPublish={() => handlePublish(lesson.id)}
                />
              ))}

              {/* Draft "Add Lesson" placeholder shown only to teachers/admins */}
              {isTeacherOrAdmin && (
                <button
                  onClick={() => setIsCreateOpen(true)}
                  className="bg-surface-container-lowest rounded-xl border border-dashed border-outline p-4 opacity-60 hover:opacity-100 hover:bg-surface-container-low transition-all flex flex-col items-center justify-center gap-2 text-on-surface-variant min-h-[130px]"
                >
                  <Plus className="w-5 h-5" />
                  <span className="text-xs font-medium">{t('addLesson')}</span>
                </button>
              )}
            </div>
          </section>
        ))}
      </div>

      {/* ── Create Lesson Drawer ── */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={t('newLesson')}
        description={t('newLessonDescription')}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              {t('lessonTitle')}
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Newton's First Law"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                {t('date')}
              </label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
                {t('period')}
              </label>
              <select
                value={newPeriod}
                onChange={(e) => setNewPeriod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((p) => (
                  <option key={p} value={`Period ${p}`}>
                    Period {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              {t('lessonContent')}
            </label>
            <textarea
              rows={4}
              placeholder={t('lessonContentPlaceholder')}
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors"
            >
              {tCommon('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm transition-colors"
            >
              {tCommon('save')}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Lesson Details Drawer (Stitch Screen 93abe2428) ── */}
      <Drawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        title={selectedLesson?.title ?? ''}
        description={
          selectedLesson
            ? `${selectedLesson.date} · ${selectedLesson.period}`
            : ''
        }
        maxWidth="2xl"
      >
        {selectedLesson && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Left: Lesson Content */}
            <div className="md:col-span-2 space-y-6">
              {/* Status + Publish */}
              <div className="flex items-center justify-between">
                <StatusChip status={selectedLesson.status} t={t} />
                {isTeacherOrAdmin && selectedLesson.status === 'DRAFT' && (
                  <button
                    onClick={() => handlePublish(selectedLesson.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm"
                  >
                    {t('publishLesson')}
                  </button>
                )}
              </div>

              {/* Section 1: Content */}
              <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-on-surface">1. {t('lessonContent')}</h2>
                <div className="text-sm text-on-surface-variant leading-relaxed space-y-3">
                  <p>
                    An object undergoing uniform circular motion travels at a constant speed, but its
                    direction changes continuously. This requires a centripetal acceleration directed
                    towards the center of the circular path.
                  </p>
                  {/* Formula block */}
                  <div className="my-4 p-4 bg-surface-container rounded-lg border-s-4 border-primary">
                    <h4 className="text-xs font-bold text-on-surface mb-1 uppercase tracking-wider">
                      Centripetal Acceleration
                    </h4>
                    <p className="text-sm mb-2">
                      The acceleration points towards the center of the circle:
                    </p>
                    <div className="text-center font-bold text-lg text-primary py-1">
                      a<sub>c</sub> = v<sup>2</sup> / r
                    </div>
                  </div>
                  <p>
                    According to Newton's Second Law, this acceleration requires a net force directed
                    toward the center, known as the centripetal force.
                  </p>
                </div>
              </section>

              {/* Section 2: Diagram placeholder */}
              <section className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
                <div className="h-48 bg-surface-container flex items-center justify-center border-b border-outline-variant">
                  <div className="text-center text-on-surface-variant">
                    <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-xs">Figure 1.1 — Circular Motion Diagram</p>
                  </div>
                </div>
                <div className="p-3 bg-surface-container-lowest">
                  <p className="text-[11px] text-on-surface-variant text-center">
                    Velocity vector v is tangent to the path, while force F<sub>c</sub> is radial.
                  </p>
                </div>
              </section>

              {/* Section 3: Second formula block */}
              <section className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-on-surface">2. Newton's Law of Universal Gravitation</h2>
                <div className="text-sm text-on-surface-variant space-y-3">
                  <p>
                    Every point mass attracts every other point mass with a force proportional to the
                    product of their masses and inversely proportional to the square of the distance.
                  </p>
                  <div className="my-4 p-4 bg-surface-container rounded-lg flex flex-col md:flex-row items-center gap-6">
                    <div className="flex-1 text-center font-bold text-xl text-tertiary">
                      F = G(m<sub>1</sub>m<sub>2</sub>) / r<sup>2</sup>
                    </div>
                    <div className="flex-1 text-xs border-s-2 border-outline-variant ps-4 space-y-1">
                      <p><strong>F:</strong> Gravitational force</p>
                      <p><strong>G:</strong> 6.674 × 10<sup>-11</sup> N·m²/kg²</p>
                      <p><strong>m₁, m₂:</strong> Masses of the objects</p>
                      <p><strong>r:</strong> Distance between centers</p>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Right Sidebar: Resources & Homework */}
            <div className="space-y-6">
              {/* Downloadable Resources */}
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm">
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-4">
                  <FolderOpen className="w-4 h-4 text-primary" />
                  {t('resources')}
                </h3>
                <ul className="space-y-2">
                  {selectedLesson.resources.length > 0 ? (
                    selectedLesson.resources.map((res, i) => (
                      <li key={i}>
                        <button className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-surface-container transition-colors group text-start">
                          <div className="bg-error-container text-on-error-container p-2 rounded shrink-0">
                            {RESOURCE_ICON[res.type]}
                          </div>
                          <div>
                            <p className="text-xs font-medium text-on-surface group-hover:text-primary transition-colors">
                              {res.label}
                            </p>
                            <p className="text-[11px] text-on-surface-variant">PDF</p>
                          </div>
                        </button>
                      </li>
                    ))
                  ) : (
                    <li>
                      {isTeacherOrAdmin && (
                        <button className="w-full flex items-center gap-2 p-2.5 rounded-lg border border-dashed border-outline text-xs text-primary hover:bg-surface-container transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                          {t('addResource')}
                        </button>
                      )}
                    </li>
                  )}
                  {selectedLesson.resources.length > 0 && isTeacherOrAdmin && (
                    <li>
                      <button className="w-full flex items-center gap-2 p-2 rounded-lg text-xs text-primary hover:bg-surface-container transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                        {t('addResource')}
                      </button>
                    </li>
                  )}
                </ul>
              </div>

              {/* Homework Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-sm relative overflow-hidden">
                <div className="absolute top-0 start-0 w-1 h-full bg-warning" />
                <h3 className="text-sm font-bold text-on-surface flex items-center gap-2 mb-2">
                  <ClipboardList className="w-4 h-4 text-warning" />
                  {t('homework')}
                </h3>
                <p className="text-xs text-on-surface-variant mb-4 leading-relaxed">
                  Problem Set 4: Gravitational Forces is due before the next lecture.
                </p>
                <div className="flex items-center justify-between mb-4 text-xs">
                  <span className="text-on-surface-variant">{t('due')}:</span>
                  <span className="text-on-surface font-semibold">Oct 24, 11:59 PM</span>
                </div>
                <button className="w-full bg-surface-container text-on-surface hover:bg-surface-container-high py-2 px-3 rounded-lg text-xs font-medium transition-colors border border-outline-variant flex items-center justify-center gap-2">
                  {t('goToAssignment')}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Up Next */}
              <div className="bg-surface-container-low rounded-xl p-4 border border-dashed border-outline-variant">
                <div className="flex items-center gap-2 mb-1">
                  <CalendarDays className="w-3.5 h-3.5 text-on-surface-variant" />
                  <p className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wide">{t('upNext')}</p>
                </div>
                <p className="text-xs text-on-surface font-medium">
                  Lesson 5: Work, Energy, and Power
                </p>
              </div>
            </div>
          </div>
        )}
      </Drawer>
    </div>
  )
}

/* ─────────────────────────── Sub-components ─────────────────────────── */

function StatusChip({
  status,
  t,
}: {
  status: LessonStatus
  t: ReturnType<typeof useTranslations>
}) {
  if (status === 'PUBLISHED') {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 uppercase tracking-wider">
        {t('published')}
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-surface-container text-on-surface-variant uppercase tracking-wider">
      {t('draft')}
    </span>
  )
}

function LessonCard({
  lesson,
  isTeacherOrAdmin,
  t,
  onOpen,
  onPublish,
}: {
  lesson: LessonItem
  isTeacherOrAdmin: boolean
  t: ReturnType<typeof useTranslations>
  onOpen: () => void
  onPublish: () => void
}) {
  const isDraft = lesson.status === 'DRAFT'

  return (
    <div
      onClick={onOpen}
      className={`bg-surface-container-lowest rounded-xl border p-4 transition-all group cursor-pointer ${
        isDraft
          ? 'border-dashed border-outline opacity-75 hover:opacity-100 hover:bg-surface-container-low'
          : 'border-outline-variant hover:bg-surface-container-low'
      }`}
    >
      {/* Top row: status + menu */}
      <div className="flex justify-between items-start mb-3">
        <StatusChip status={lesson.status} t={t} />
        <button
          onClick={(e) => { e.stopPropagation() }}
          className="text-on-surface-variant opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-surface-container rounded"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <h4 className="text-sm font-bold text-on-surface mb-1">{lesson.title}</h4>

      {/* Date & Period */}
      <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mb-4">
        <CalendarDays className="w-3.5 h-3.5" />
        {lesson.date}
        <span className="text-outline mx-0.5">·</span>
        {lesson.period}
      </div>

      {/* Resources or Add Resource */}
      <div className="flex flex-wrap gap-2 mt-auto">
        {lesson.resources.length > 0
          ? lesson.resources.map((res, i) => (
              <div
                key={i}
                className="flex items-center gap-1 bg-surface-container px-2 py-1 rounded-md text-[11px] font-medium text-on-surface-variant"
              >
                {RESOURCE_ICON[res.type]}
                {res.label}
              </div>
            ))
          : isTeacherOrAdmin && (
              <button
                onClick={(e) => { e.stopPropagation() }}
                className="flex items-center gap-1 text-primary text-xs font-medium hover:underline"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('addResource')}
              </button>
            )}
      </div>

      {/* Publish action for draft (teacher/admin only) */}
      {isDraft && isTeacherOrAdmin && (
        <div className="mt-3 pt-3 border-t border-outline-variant">
          <button
            onClick={(e) => { e.stopPropagation(); onPublish() }}
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            {t('publishLesson')}
          </button>
        </div>
      )}
    </div>
  )
}
