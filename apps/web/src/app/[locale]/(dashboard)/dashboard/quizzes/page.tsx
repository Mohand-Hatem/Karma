'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  HelpCircle,
  Timer,
  CheckCircle2,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
  ArrowRight,
  Search,
  Filter,
  TrendingUp,
  AlertCircle,
  MoreVertical,
  FlaskConical,
  Calculator,
  BookOpen,
  X,
  Sparkles,
  Award,
} from 'lucide-react'
import { MiniProgressRing } from '../../../../../components/ui/data-viz'
import { useShellStore } from '../../../../../stores/shell-store'
import { EmptyState } from '../../../../../components/ui/empty-state'

/* ──────────────────────────────────────────────────────────────────────────
 * Types
 * ────────────────────────────────────────────────────────────────────────── */

type ViewMode = 'hub' | 'builder' | 'take'

type QuestionType = 'mcq' | 'tf'

interface QuizOption {
  id: string
  text: string
  isCorrect: boolean
}

interface QuizQuestion {
  id: string
  type: QuestionType
  prompt: string
  points: number
  category?: string
  options: QuizOption[]
  selectedOptionId?: string
}

interface AssessmentItem {
  id: string
  title: string
  cohort: string
  subject: string
  subjectIcon: 'science' | 'calc' | 'book'
  category: string
  weight: number
  date: string
  timeRange: string
  maxMarks: number
  status: 'PUBLISHED' | 'DRAFT'
  timeLimitMinutes: number
  questions: QuizQuestion[]
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q-1',
    type: 'mcq',
    prompt: 'Which organelle is known as the powerhouse of the cell?',
    points: 2,
    category: 'Cell Biology',
    options: [
      { id: 'opt-1', text: 'Nucleus', isCorrect: false },
      { id: 'opt-2', text: 'Mitochondria', isCorrect: true },
      { id: 'opt-3', text: 'Ribosome', isCorrect: false },
      { id: 'opt-4', text: 'Endoplasmic Reticulum', isCorrect: false },
    ],
  },
  {
    id: 'q-2',
    type: 'tf',
    prompt: 'All bacteria are harmful to humans.',
    points: 1,
    category: 'Microbiology',
    options: [
      { id: 'opt-tf-1', text: 'True', isCorrect: false },
      { id: 'opt-tf-2', text: 'False', isCorrect: true },
    ],
  },
  {
    id: 'q-3',
    type: 'mcq',
    prompt:
      'A car accelerates uniformly from rest to a speed of 25 m/s in 8.0 seconds. What is the distance traveled by the car during this time?',
    points: 2,
    category: 'Kinematics',
    options: [
      { id: 'opt-k-1', text: '100 meters', isCorrect: true },
      { id: 'opt-k-2', text: '100.0 m', isCorrect: false },
      { id: 'opt-k-3', text: '200 meters', isCorrect: false },
      { id: 'opt-k-4', text: '50 meters', isCorrect: false },
    ],
  },
]

const INITIAL_ASSESSMENTS: AssessmentItem[] = [
  {
    id: 'asmt-1',
    title: 'Biology 101 - Cell Structure',
    cohort: 'Grade 10 · Sec A, B',
    subject: 'Biology',
    subjectIcon: 'science',
    category: 'Midterm Exams',
    weight: 30,
    date: 'Oct 24, 2026',
    timeRange: '09:00 AM - 10:30 AM',
    maxMarks: 50,
    status: 'PUBLISHED',
    timeLimitMinutes: 45,
    questions: INITIAL_QUESTIONS,
  },
  {
    id: 'asmt-2',
    title: 'Calculus - Limits & Derivatives',
    cohort: 'Grade 12 · Advanced',
    subject: 'Mathematics',
    subjectIcon: 'calc',
    category: 'Pop Quiz',
    weight: 10,
    date: 'Oct 26, 2026',
    timeRange: '11:00 AM - 11:45 AM',
    maxMarks: 25,
    status: 'DRAFT',
    timeLimitMinutes: 30,
    questions: [INITIAL_QUESTIONS[0]],
  },
  {
    id: 'asmt-3',
    title: 'World History - Industrial Revolution',
    cohort: 'Grade 9 · All Sections',
    subject: 'History',
    subjectIcon: 'book',
    category: 'Assignments',
    weight: 20,
    date: 'Oct 20, 2026',
    timeRange: '01:00 PM - 02:30 PM',
    maxMarks: 40,
    status: 'PUBLISHED',
    timeLimitMinutes: 60,
    questions: INITIAL_QUESTIONS,
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Assessment Page
 * ────────────────────────────────────────────────────────────────────────── */

export default function QuizzesPage() {
  const t = useTranslations('features.quizzes')
  const { activeRole } = useShellStore()
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const [viewMode, setViewMode] = useState<ViewMode>('hub')
  const [assessments, setAssessments] = useState<AssessmentItem[]>(INITIAL_ASSESSMENTS)
  const [activeTab, setActiveTab] = useState<'online' | 'offline'>('online')
  const [searchQuery, setSearchQuery] = useState('')

  const isTeacherOrAdmin = activeRole === 'ADMIN' || activeRole === 'TEACHER'

  const filteredAssessments = assessments.filter((a) =>
    a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.cohort.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const [currentAssessment, setCurrentAssessment] = useState<AssessmentItem>(INITIAL_ASSESSMENTS[0])

  const handleCreateNew = () => {
    const newAsmt: AssessmentItem = {
      id: `asmt-${Date.now()}`,
      title: 'New Assessment Title',
      cohort: 'Grade 10 · Section A',
      subject: 'Physics',
      subjectIcon: 'science',
      category: 'Formative Assessment',
      weight: 15,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      timeRange: '10:00 AM - 11:00 AM',
      maxMarks: 20,
      status: 'DRAFT',
      timeLimitMinutes: 45,
      questions: [
        {
          id: `q-${Date.now()}-1`,
          type: 'mcq',
          prompt: '',
          points: 2,
          options: [
            { id: `opt-${Date.now()}-1`, text: '', isCorrect: true },
            { id: `opt-${Date.now()}-2`, text: '', isCorrect: false },
          ],
        },
      ],
    }
    setCurrentAssessment(newAsmt)
    setViewMode('builder')
    router.push(`/${locale}/dashboard/quizzes/builder`)
  }

  const handleEdit = (asmt: AssessmentItem) => {
    setCurrentAssessment(asmt)
    setViewMode('builder')
    router.push(`/${locale}/dashboard/quizzes/builder`)
  }

  const handleStartTaking = (asmt: AssessmentItem) => {
    setCurrentAssessment(asmt)
    setViewMode('take')
    router.push(`/${locale}/dashboard/quizzes/${asmt.id}/take`)
  }

  const handleSaveAssessment = (updated: AssessmentItem, publish = false) => {
    const finalized: AssessmentItem = {
      ...updated,
      status: publish ? 'PUBLISHED' : updated.status,
    }
    setAssessments((prev) => {
      const exists = prev.some((a) => a.id === finalized.id)
      if (exists) {
        return prev.map((a) => (a.id === finalized.id ? finalized : a))
      }
      return [finalized, ...prev]
    })
    setViewMode('hub')
  }

  /* ── Mode 1: Quiz Taking Mode ── */
  if (viewMode === 'take') {
    return (
      <OnlineQuizTaking
        assessment={currentAssessment}
        t={t}
        onExit={() => setViewMode('hub')}
        onSubmit={() => setViewMode('hub')}
      />
    )
  }

  /* ── Mode 2: Quiz Builder Mode ── */
  if (viewMode === 'builder') {
    return (
      <QuizBuilder
        assessment={currentAssessment}
        t={t}
        onBack={() => setViewMode('hub')}
        onPreview={() => setViewMode('take')}
        onSave={(updated, publish) => handleSaveAssessment(updated, publish)}
      />
    )
  }

  /* ── Mode 3: Assessment Hub (Default) ── */
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ── Page Header (Stitch Screen 97f693e9) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">{t('title')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('description')}</p>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            <span>{t('filter')}</span>
          </button>

          {isTeacherOrAdmin && (
            <button
              type="button"
              onClick={handleCreateNew}
              className="px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors flex items-center gap-2 shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>{t('createAssessment')}</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Tabs: Online Quizzes vs Offline Exams ── */}
      <div className="border-b border-outline-variant flex gap-8 overflow-x-auto text-sm">
        <button
          onClick={() => setActiveTab('online')}
          className={`pb-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'online'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {t('tabOnline')}
        </button>
        <button
          onClick={() => setActiveTab('offline')}
          className={`pb-3 font-semibold transition-colors relative whitespace-nowrap ${
            activeTab === 'offline'
              ? 'text-primary border-b-2 border-primary'
              : 'text-on-surface-variant hover:text-on-surface'
          }`}
        >
          {t('tabOffline')}
        </button>
      </div>

      {/* ── Bento Grid Stats ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Stat 1: Active Quizzes */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between h-32 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('activeQuizzes')}
            </span>
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-auto">
            <span className="text-3xl font-bold text-on-surface">12</span>
            <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              8 Active, 4 Drafts
            </span>
          </div>
        </div>

        {/* Stat 2: Needs Grading */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between h-32 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('needsGrading')}
            </span>
            <span className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <AlertCircle className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-baseline justify-between mt-auto">
            <span className="text-3xl font-bold text-on-surface">48</span>
            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Action Needed
            </span>
          </div>
        </div>

        {/* Stat 3: Avg. Completion Rate */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 flex flex-col justify-between h-32 shadow-xs hover:-translate-y-0.5 hover:shadow-md transition-all duration-200">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('avgCompletionRate')}
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="flex items-end justify-between mt-auto">
            <span className="text-3xl font-bold text-on-surface">94%</span>
            <MiniProgressRing
              percentage={94}
              size={32}
              strokeColor="stroke-emerald-600"
              ariaLabel="Average completion rate: 94%"
            />
          </div>
        </div>
      </div>

      {/* ── Data Table Container ── */}
      <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
        {/* Search header */}
        <div className="p-4 border-b border-outline-variant bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('searchAssessments')}
              className="w-full ps-9 pe-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary transition-all placeholder:text-on-surface-variant"
            />
          </div>
        </div>

        {/* Assessments table */}
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse text-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="py-3 px-4 text-start">{t('colNameSubject')}</th>
                <th className="py-3 px-4 text-start">{t('colCategoryWeight')}</th>
                <th className="py-3 px-4 text-start">{t('colDateTime')}</th>
                <th className="py-3 px-4 text-start">{t('colMaxMarks')}</th>
                <th className="py-3 px-4 text-start">{t('colStatus')}</th>
                <th className="py-3 px-4 text-end"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant bg-surface-container-lowest">
              {filteredAssessments.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8">
                    <EmptyState
                      title="No quizzes found"
                      description="No assessment records match your search criteria. Try a different title or filter."
                      actionLabel="Clear search"
                      onAction={() => setSearchQuery('')}
                    />
                  </td>
                </tr>
              ) : (
                filteredAssessments.map((asmt) => {
                const IconComponent =
                  asmt.subjectIcon === 'science'
                    ? FlaskConical
                    : asmt.subjectIcon === 'calc'
                      ? Calculator
                      : BookOpen

                return (
                  <tr
                    key={asmt.id}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                    onClick={() => (isTeacherOrAdmin ? handleEdit(asmt) : handleStartTaking(asmt))}
                  >
                    {/* Title + Subject icon */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <IconComponent className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-on-surface">{asmt.title || 'Untitled Assessment'}</p>
                          <p className="text-xs text-on-surface-variant">{asmt.cohort}</p>
                        </div>
                      </div>
                    </td>

                    {/* Category & Weight */}
                    <td className="py-4 px-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-surface-container text-on-surface-variant border border-outline-variant">
                        {asmt.category} <strong className="ms-1 font-bold">{asmt.weight}%</strong>
                      </span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4">
                      <p className="font-medium text-on-surface">{asmt.date}</p>
                      <p className="text-xs text-on-surface-variant">{asmt.timeRange}</p>
                    </td>

                    {/* Max Marks */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-on-surface">{asmt.maxMarks}</span>
                    </td>

                    {/* Status Chip */}
                    <td className="py-4 px-4">
                      {asmt.status === 'PUBLISHED' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-secondary border border-secondary-fixed-dim/30">
                          <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                          {t('published')}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-surface-container text-on-surface-variant border border-outline-variant">
                          <span className="w-1.5 h-1.5 rounded-full bg-outline"></span>
                          {t('draft')}
                        </span>
                      )}
                    </td>

                    {/* Action button */}
                    <td className="py-4 px-4 text-end">
                      {activeRole === 'STUDENT' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleStartTaking(asmt)
                          }}
                          className="px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-xs"
                        >
                          {t('takeQuiz')}
                        </button>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(asmt)
                            }}
                            className="px-2.5 py-1 rounded-md border border-outline-variant text-xs font-medium text-on-surface hover:bg-surface-container transition-colors"
                          >
                            {t('editQuiz')}
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                            }}
                            className="text-on-surface-variant hover:text-primary transition-colors p-1"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * Subcomponent: Quiz Builder (Stitch Screen 28b27108)
 * ────────────────────────────────────────────────────────────────────────── */

function QuizBuilder({
  assessment,
  t,
  onBack,
  onPreview,
  onSave,
}: {
  assessment: AssessmentItem
  t: ReturnType<typeof useTranslations>
  onBack: () => void
  onPreview: () => void
  onSave: (updated: AssessmentItem, publish?: boolean) => void
}) {
  const [asmt, setAsmt] = useState<AssessmentItem>(assessment)

  const updateQuestionPrompt = (qId: string, prompt: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === qId ? { ...q, prompt } : q)),
    }))
  }

  const updateOptionText = (qId: string, optId: string, text: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) => (opt.id === optId ? { ...opt, text } : opt)),
            }
          : q
      ),
    }))
  }

  const setCorrectOption = (qId: string, optId: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.map((opt) => ({
                ...opt,
                isCorrect: opt.id === optId,
              })),
            }
          : q
      ),
    }))
  }

  const addOption = (qId: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: [
                ...q.options,
                { id: `opt-${Date.now()}-${Math.random()}`, text: '', isCorrect: false },
              ],
            }
          : q
      ),
    }))
  }

  const removeOption = (qId: string, optId: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === qId
          ? {
              ...q,
              options: q.options.filter((opt) => opt.id !== optId),
            }
          : q
      ),
    }))
  }

  const duplicateQuestion = (q: QuizQuestion) => {
    const dup: QuizQuestion = {
      ...q,
      id: `q-dup-${Date.now()}`,
      options: q.options.map((o) => ({ ...o, id: `opt-dup-${Date.now()}-${Math.random()}` })),
    }
    setAsmt((prev) => ({ ...prev, questions: [...prev.questions, dup] }))
  }

  const deleteQuestion = (qId: string) => {
    setAsmt((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== qId),
    }))
  }

  const addMultipleChoice = () => {
    const newQ: QuizQuestion = {
      id: `q-mcq-${Date.now()}`,
      type: 'mcq',
      prompt: '',
      points: 2,
      category: 'General',
      options: [
        { id: `opt-1-${Date.now()}`, text: 'Option A', isCorrect: true },
        { id: `opt-2-${Date.now()}`, text: 'Option B', isCorrect: false },
        { id: `opt-3-${Date.now()}`, text: 'Option C', isCorrect: false },
      ],
    }
    setAsmt((prev) => ({ ...prev, questions: [...prev.questions, newQ] }))
  }

  const addTrueFalse = () => {
    const newQ: QuizQuestion = {
      id: `q-tf-${Date.now()}`,
      type: 'tf',
      prompt: '',
      points: 1,
      category: 'General',
      options: [
        { id: `opt-tf-1-${Date.now()}`, text: 'True', isCorrect: true },
        { id: `opt-tf-2-${Date.now()}`, text: 'False', isCorrect: false },
      ],
    }
    setAsmt((prev) => ({ ...prev, questions: [...prev.questions, newQ] }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-32">
      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors text-on-surface"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">{t('quizBuilder')}</h1>
        </div>

        <button
          type="button"
          onClick={onPreview}
          className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container transition-colors"
        >
          {t('preview')}
        </button>
      </div>

      {/* ── Quiz Metadata Card ── */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Quiz Title */}
          <div className="col-span-1 md:col-span-2">
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
              {t('quizTitle')}
            </label>
            <input
              type="text"
              value={asmt.title}
              onChange={(e) => setAsmt({ ...asmt, title: e.target.value })}
              placeholder={t('quizTitlePlaceholder')}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 text-base font-medium focus:outline-none focus:ring-2 focus:ring-primary transition-shadow"
            />
          </div>

          {/* Subject */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
              {t('subject')}
            </label>
            <select
              value={asmt.subject}
              onChange={(e) => setAsmt({ ...asmt, subject: e.target.value })}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Biology">Biology</option>
              <option value="Chemistry">Chemistry</option>
              <option value="Physics">Physics</option>
              <option value="Mathematics">Mathematics</option>
              <option value="History">History</option>
            </select>
          </div>

          {/* Grade Category */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
              {t('gradeCategory')}
            </label>
            <select
              value={asmt.category}
              onChange={(e) => setAsmt({ ...asmt, category: e.target.value })}
              className="w-full bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="Formative Assessment">{t('formative')}</option>
              <option value="Summative Assessment">{t('summative')}</option>
              <option value="Homework">{t('homework')}</option>
              <option value="Midterm Exams">Midterm Exams</option>
              <option value="Pop Quiz">Pop Quiz</option>
            </select>
          </div>

          {/* Time Limit */}
          <div>
            <label className="block text-xs font-semibold text-on-surface-variant mb-2 uppercase tracking-wider">
              {t('timeLimit')}
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={1}
                max={180}
                value={asmt.timeLimitMinutes}
                onChange={(e) => setAsmt({ ...asmt, timeLimitMinutes: Number(e.target.value) })}
                className="w-24 bg-surface-container-lowest text-on-surface border border-outline-variant rounded-lg px-3 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <span className="text-sm text-on-surface-variant">{t('minutes')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Questions List ── */}
      <div className="space-y-6">
        <div className="flex items-center justify-between border-b border-outline-variant pb-2">
          <h2 className="text-lg font-bold text-on-surface">{t('questions')}</h2>
          <span className="text-xs font-semibold text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
            {t('total')}: {asmt.questions.length}
          </span>
        </div>

        {asmt.questions.map((question, qIdx) => (
          <div
            key={question.id}
            className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs relative group transition-all hover:border-primary-fixed-dim"
          >
            {/* Left color bar */}
            <div className="absolute inset-y-0 start-0 w-1 bg-surface-container rounded-s-xl group-hover:bg-primary transition-colors" />

            {/* Question Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <span className="flex items-center justify-center w-7 h-7 rounded-full bg-surface-container text-xs font-bold text-on-surface-variant">
                  {qIdx + 1}
                </span>
                <span
                  className={`text-xs font-bold uppercase tracking-wider ${
                    question.type === 'mcq' ? 'text-primary' : 'text-secondary'
                  }`}
                >
                  {question.type === 'mcq' ? t('multipleChoice') : t('trueFalse')}
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                <button
                  type="button"
                  onClick={() => duplicateQuestion(question)}
                  className="p-1 text-on-surface-variant hover:text-primary transition-colors"
                  title="Duplicate Question"
                >
                  <Copy className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteQuestion(question.id)}
                  className="p-1 text-on-surface-variant hover:text-error transition-colors"
                  title="Delete Question"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Prompt input */}
            <div className="mb-5">
              <textarea
                rows={2}
                value={question.prompt}
                onChange={(e) => updateQuestionPrompt(question.id, e.target.value)}
                placeholder={t('enterQuestion')}
                className="w-full bg-surface-container-low/50 text-on-surface border border-outline-variant rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary focus:outline-none resize-none"
              />
            </div>

            {/* Options list */}
            {question.type === 'mcq' ? (
              <div className="space-y-3">
                {question.options.map((opt) => (
                  <div
                    key={opt.id}
                    className={`flex items-center gap-3 rounded-lg border p-3 transition-all relative ${
                      opt.isCorrect
                        ? 'bg-primary-container/10 border-primary'
                        : 'bg-surface-container-lowest border-outline-variant focus-within:border-primary'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-correct-${question.id}`}
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(question.id, opt.id)}
                      className="w-4 h-4 text-primary border-outline-variant focus:ring-primary cursor-pointer shrink-0"
                    />
                    <input
                      type="text"
                      value={opt.text}
                      onChange={(e) => updateOptionText(question.id, opt.id, e.target.value)}
                      placeholder="Option text..."
                      className={`flex-1 bg-transparent border-none p-0 text-sm focus:outline-none ${
                        opt.isCorrect ? 'text-on-surface font-semibold' : 'text-on-surface'
                      }`}
                    />
                    {opt.isCorrect && (
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                    )}
                    {question.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(question.id, opt.id)}
                        className="text-on-surface-variant hover:text-error p-0.5"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => addOption(question.id)}
                  className="mt-3 flex items-center gap-1.5 text-primary text-xs font-semibold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{t('addOption')}</span>
                </button>
              </div>
            ) : (
              /* True / False Toggle */
              <div className="flex gap-4">
                {question.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex-1 flex items-center justify-center gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                      opt.isCorrect
                        ? 'border-secondary bg-secondary-container/20 font-bold text-secondary'
                        : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name={`q-tf-${question.id}`}
                      checked={opt.isCorrect}
                      onChange={() => setCorrectOption(question.id, opt.id)}
                      className="w-4 h-4 text-secondary border-outline-variant focus:ring-secondary cursor-pointer"
                    />
                    <span className="text-sm font-semibold">{opt.text}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Add Question Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={addMultipleChoice}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl text-on-surface text-sm font-semibold hover:border-primary hover:text-primary transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addMultipleChoice')}</span>
          </button>
          <button
            type="button"
            onClick={addTrueFalse}
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-surface-container-lowest border border-dashed border-outline-variant rounded-xl text-on-surface text-sm font-semibold hover:border-secondary hover:text-secondary transition-all shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{t('addTrueFalse')}</span>
          </button>
        </div>
      </div>

      {/* ── Sticky Bottom Bar ── */}
      <div className="fixed bottom-0 inset-x-0 bg-surface-container-lowest border-t border-outline-variant p-4 shadow-lg z-50 flex justify-between items-center backdrop-blur-md bg-surface-container-lowest/95">
        <div className="text-xs text-on-surface-variant hidden sm:block">
          {t('lastSaved')}
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onSave(asmt, false)}
            className="flex-1 sm:flex-none px-6 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-semibold hover:bg-surface-container transition-colors"
          >
            {t('saveDraft')}
          </button>
          <button
            type="button"
            onClick={() => onSave(asmt, true)}
            className="flex-1 sm:flex-none px-8 py-2 rounded-lg bg-primary text-on-primary text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>{t('publishQuiz')}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * Subcomponent: Online Quiz Taking Experience (Stitch Screen 356f48c5)
 * ────────────────────────────────────────────────────────────────────────── */

function OnlineQuizTaking({
  assessment,
  t,
  onExit,
  onSubmit,
}: {
  assessment: AssessmentItem
  t: ReturnType<typeof useTranslations>
  onExit: () => void
  onSubmit: () => void
}) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [secondsRemaining, setSecondsRemaining] = useState(assessment.timeLimitMinutes * 60)
  const [isSubmitted, setIsSubmitted] = useState(false)

  // Live ticking countdown timer
  useEffect(() => {
    if (isSubmitted || secondsRemaining <= 0) return
    const timer = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(timer)
  }, [isSubmitted, secondsRemaining])

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60)
    const remSecs = secs % 60
    return `${mins.toString().padStart(2, '0')}:${remSecs.toString().padStart(2, '0')}`
  }

  const currentQ = assessment.questions[currentIndex] || assessment.questions[0]
  const totalQuestions = assessment.questions.length

  const handleSelectOption = (optId: string) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQ.id]: optId,
    }))
  }

  const handleNext = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      setIsSubmitted(true)
    }
  }

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto">
          <Award className="w-8 h-8" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-on-surface">Quiz Completed!</h2>
          <p className="text-sm text-on-surface-variant mt-1">
            Your responses for &quot;{assessment.title}&quot; have been securely recorded.
          </p>
        </div>
        <div className="p-4 bg-surface-container rounded-xl text-sm font-semibold text-on-surface">
          Answered: {Object.keys(answers).length} / {totalQuestions} Questions
        </div>
        <button
          type="button"
          onClick={onSubmit}
          className="w-full py-2.5 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
        >
          {t('backToHub')}
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[85vh] -mx-4 -my-6">
      {/* ── Sticky Top Header (Stitch 356f48c5) ── */}
      <header className="bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant flex justify-between items-center h-16 px-6 w-full sticky top-0 z-40">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onExit}
            className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
            title="Exit Quiz"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-on-surface truncate max-w-xs sm:max-w-md">
            {assessment.title || 'Physics Midterm Quiz 1'}
          </h1>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[11px] font-semibold text-on-surface-variant uppercase">
              {t('progress')}
            </span>
            <span className="text-sm font-bold text-primary">
              {t('questionOf', { current: currentIndex + 1, total: totalQuestions })}
            </span>
          </div>

          {/* Countdown Clock */}
          <div className="flex items-center gap-2 bg-surface-container px-3.5 py-1.5 rounded-full border border-outline-variant">
            <Timer className="w-4 h-4 text-error" />
            <span className="text-sm font-bold text-error tabular-nums">
              {formatCountdown(secondsRemaining)}
            </span>
            <span className="text-xs text-on-surface-variant hidden md:inline">
              {t('remaining')}
            </span>
          </div>
        </div>
      </header>

      {/* ── Main Question Card ── */}
      <main className="flex-1 flex justify-center items-start pt-8 pb-28 px-4 overflow-y-auto">
        <div className="w-full max-w-3xl bg-surface-container-lowest rounded-xl border border-outline-variant p-6 sm:p-8 shadow-xs space-y-6">
          {/* Question Meta & Title */}
          <div className="pb-4 border-b border-outline-variant space-y-3">
            <div className="flex justify-between items-center">
              <span className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-0.5 rounded text-xs font-semibold text-on-surface-variant">
                {currentQ.category || 'General'}
              </span>
              <span className="text-xs font-semibold text-on-surface-variant">
                {t('points', { count: currentQ.points })}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-bold text-on-surface leading-snug">
              {currentQ.prompt || 'No question prompt entered.'}
            </h2>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {currentQ.options.map((opt) => {
              const isSelected = answers[currentQ.id] === opt.id

              return (
                <label
                  key={opt.id}
                  onClick={() => handleSelectOption(opt.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-2 border-primary bg-primary/5 shadow-xs'
                      : 'border-outline-variant bg-surface-container-lowest hover:bg-surface-container'
                  }`}
                >
                  <input
                    type="radio"
                    name={`take-${currentQ.id}`}
                    checked={isSelected}
                    onChange={() => handleSelectOption(opt.id)}
                    className="w-5 h-5 text-primary border-outline-variant focus:ring-primary cursor-pointer shrink-0"
                  />
                  <span
                    className={`text-sm ${
                      isSelected ? 'text-primary font-semibold' : 'text-on-surface'
                    }`}
                  >
                    {opt.text}
                  </span>
                </label>
              )
            })}
          </div>

          {/* Hint note */}
          <div className="pt-4 border-t border-outline-variant flex items-start gap-2 text-xs text-on-surface-variant">
            <AlertCircle className="w-4 h-4 text-on-surface-variant shrink-0 mt-0.5" />
            <p>
              Review your answers carefully before navigating to the next question. You can revisit previous questions anytime before final submission.
            </p>
          </div>
        </div>
      </main>

      {/* ── Sticky Navigator Footer (Stitch 356f48c5) ── */}
      <footer className="bg-surface-container-lowest border-t border-outline-variant fixed bottom-0 inset-x-0 z-40 py-3.5 px-6 flex justify-between items-center shadow-lg">
        <button
          type="button"
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-outline-variant text-on-surface hover:bg-surface-container transition-colors text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="hidden sm:inline">{t('previousQuestion')}</span>
        </button>

        {/* Navigator Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container text-on-surface text-xs font-semibold border border-outline-variant">
          <HelpCircle className="w-4 h-4 text-primary" />
          <span>{t('questionNavigator')}</span>
          <span className="bg-surface-container-lowest px-1.5 py-0.5 rounded text-[11px] border border-outline-variant">
            {currentIndex + 1}/{totalQuestions}
          </span>
        </div>

        <div className="flex gap-2">
          {currentIndex < totalQuestions - 1 && (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-high transition-colors text-sm font-medium hidden sm:inline-flex"
            >
              {t('skipForNow')}
            </button>
          )}

          <button
            type="button"
            onClick={handleNext}
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-primary text-on-primary hover:bg-primary-container transition-colors text-sm font-semibold shadow-sm"
          >
            <span>
              {currentIndex === totalQuestions - 1 ? t('submitQuiz') : t('nextQuestion')}
            </span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </footer>
    </div>
  )
}
