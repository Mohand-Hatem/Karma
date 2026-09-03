'use client'

import { useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Plus,
  Filter,
  LayoutList,
  LayoutGrid,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  FileText,
  MessageSquare,
  Star,
  CheckCircle2,
  AlertCircle,
  Send,
  Undo2,
  Bold,
  Italic,
  List,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { MiniSegmentedBar } from '../../../../../components/ui/data-viz'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { useShellStore } from '../../../../../stores/shell-store'
import { useQueryClient } from '@tanstack/react-query'
import { useAssignmentsQuery } from '../../../../../hooks/use-domain-queries'
import { queryKeys } from '../../../../../lib/query-keys'

/* ─────────────────────── Types ─────────────────────── */

type SubmissionStatus = 'SUBMITTED' | 'GRADED'
type WindowStatus = 'active' | 'late' | 'closed'

interface RubricItem {
  label: string
  score: number
  max: number
  passed: boolean
  note?: string
}

interface StudentSubmission {
  id: string
  studentName: string
  fileName: string
  fileSize: string
  submittedAt: string
  studentNote: string
  status: SubmissionStatus
  score?: number
  feedback?: string
}

interface AssignmentRow {
  id: string
  title: string
  cohort: string
  subject: string
  subjectColor: 'primary' | 'teal' | 'neutral'
  dueDate: string
  dueTime: string
  window: WindowStatus
  submitted: number
  total: number
  graded: number
  submissions: StudentSubmission[]
  maxScore: number
  rubric: RubricItem[]
}

/* ─────────────────────── Static Data ─────────────────────── */

const QUICK_SNIPPETS = [
  'Great effort!',
  'Check calculations in section 3',
  'Improve graph labeling',
  'Well-structured argument',
  'Needs more evidence',
]

const INITIAL_ASSIGNMENTS: AssignmentRow[] = [
  {
    id: 'asg-1',
    title: 'Q3 Final Project: Ecosystems',
    cohort: 'Grade 10 · Section A',
    subject: 'Biology',
    subjectColor: 'primary',
    dueDate: 'Oct 24, 11:59 PM',
    dueTime: '2026-10-24',
    window: 'late',
    submitted: 24,
    total: 28,
    graded: 18,
    maxScore: 100,
    rubric: [
      { label: 'Hypothesis Formulation', score: 10, max: 10, passed: true },
      { label: 'Methodology & Procedure', score: 20, max: 20, passed: true },
      { label: 'Data Analysis & Graphs', score: 35, max: 40, passed: true },
      { label: 'Conclusion & Evaluation', score: 23, max: 30, passed: false, note: 'Needs more detail on error sources.' },
    ],
    submissions: [
      {
        id: 'sub-1',
        studentName: 'Zainab Al-Rashid',
        fileName: 'physics_lab_report_zainab.pdf',
        fileSize: '2.4 MB',
        submittedAt: 'Oct 24, 18:00',
        studentNote: 'I completed the experiment on Tuesday, apologies for the slight delay in submission.',
        status: 'SUBMITTED',
        score: 88,
        feedback: 'Solid grasp of the concepts, Zainab. Your methodology was clear and easy to follow.\n\nHowever, your conclusion lacked a deep dive into the potential sources of error during the friction measurement phase. Next time, try to quantify how much those errors might have skewed your final results.',
      },
    ],
  },
  {
    id: 'asg-2',
    title: 'Chapter 4 Problem Set',
    cohort: 'Grade 11 · AP Calc',
    subject: 'Mathematics',
    subjectColor: 'teal',
    dueDate: 'Oct 26, 8:00 AM',
    dueTime: '2026-10-26',
    window: 'active',
    submitted: 12,
    total: 30,
    graded: 0,
    maxScore: 50,
    rubric: [
      { label: 'Concept Understanding', score: 0, max: 20, passed: false },
      { label: 'Solution Steps', score: 0, max: 20, passed: false },
      { label: 'Final Answers', score: 0, max: 10, passed: false },
    ],
    submissions: [],
  },
  {
    id: 'asg-3',
    title: 'World War II Essay Draft',
    cohort: 'Grade 9 · History',
    subject: 'History',
    subjectColor: 'neutral',
    dueDate: 'Oct 20, 11:59 PM',
    dueTime: '2026-10-20',
    window: 'closed',
    submitted: 25,
    total: 25,
    graded: 25,
    maxScore: 60,
    rubric: [
      { label: 'Thesis Statement', score: 15, max: 15, passed: true },
      { label: 'Historical Evidence', score: 25, max: 25, passed: true },
      { label: 'Analysis & Argument', score: 20, max: 20, passed: true },
    ],
    submissions: [],
  },
]

/* ─────────────────────── Helpers ─────────────────────── */

const SUBJECT_CHIP: Record<string, string> = {
  primary: 'bg-primary-fixed text-on-primary-fixed-variant',
  teal: 'bg-secondary-container text-on-secondary-container',
  neutral: 'bg-surface-container text-on-surface-variant',
}

const WINDOW_CHIP: Record<WindowStatus, { label: string; cls: string }> = {
  active: { label: 'Active', cls: 'bg-emerald-500/10 text-emerald-700 border border-emerald-200' },
  late: { label: 'Late window open', cls: 'bg-amber-500/10 text-amber-700 border border-amber-200' },
  closed: { label: 'Closed', cls: 'bg-surface-container text-on-surface-variant' },
}

/* ─────────────────────── Page ─────────────────────── */

export default function AssignmentsPage() {
  const t = useTranslations('features.assignments')
  const tCommon = useTranslations('common')
  const { activeRole } = useShellStore()

  const queryClient = useQueryClient()
  useAssignmentsQuery()

  const [assignments, setAssignments] = useState<AssignmentRow[]>(INITIAL_ASSIGNMENTS)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')

  // Create Assignment drawer
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newMaxScore, setNewMaxScore] = useState(100)
  const [newDueAt, setNewDueAt] = useState('')

  // Grading drawer
  const [gradingOpen, setGradingOpen] = useState(false)
  const [selectedAsg, setSelectedAsg] = useState<AssignmentRow | null>(null)
  const [awardedScore, setAwardedScore] = useState(88)
  const [feedbackText, setFeedbackText] = useState('')

  // Student submit drawer
  const [submitOpen, setSubmitOpen] = useState(false)
  const [submitAsgId, setSubmitAsgId] = useState<string>('')
  const [submissionText, setSubmissionText] = useState('')

  const isTeacherOrAdmin = activeRole === 'ADMIN' || activeRole === 'TEACHER'

  const activeCount = assignments.filter((a) => a.window === 'active').length
  const gradingCount = assignments.filter((a) => a.graded < a.submitted).length
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  const handleOpenGrading = (asg: AssignmentRow) => {
    setSelectedAsg(asg)
    setAwardedScore(asg.submissions[0]?.score ?? 88)
    setFeedbackText(asg.submissions[0]?.feedback ?? '')
    setGradingOpen(true)
    router.push(`/${locale}/dashboard/assignments/${asg.id}`)
  }

  const handlePublishGrade = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedAsg) return
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === selectedAsg.id
          ? {
              ...a,
              graded: Math.min(a.submitted, a.graded + 1),
              submissions: a.submissions.map((s, i) =>
                i === 0 ? { ...s, status: 'GRADED', score: awardedScore, feedback: feedbackText } : s
              ),
            }
          : a
      )
    )
    setGradingOpen(false)
  }

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle) return
    const newAsg: AssignmentRow = {
      id: `asg-${Date.now()}`,
      title: newTitle,
      cohort: 'Grade 10 · Section A',
      subject: 'General',
      subjectColor: 'neutral',
      dueDate: newDueAt,
      dueTime: newDueAt,
      window: 'active',
      submitted: 0,
      total: 30,
      graded: 0,
      maxScore: newMaxScore,
      rubric: [],
      submissions: [],
    }
    queryClient.invalidateQueries({ queryKey: queryKeys.assignments.all })
    setAssignments((prev) => [newAsg, ...prev])
    setNewTitle('')
    setNewMaxScore(100)
    setNewDueAt('')
    setCreateOpen(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === submitAsgId
          ? { ...a, submitted: Math.min(a.submitted + 1, a.total) }
          : a
      )
    )
    setSubmissionText('')
    setSubmitOpen(false)
  }

  return (
    <div className="space-y-6">
      {/* ── Header (Stitch 8178afd7) ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">{t('title')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('description')}</p>
        </div>
        <div className="flex gap-3 w-full sm:w-auto">
          <button className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors">
            <Filter className="w-4 h-4" />
            {t('filter')}
          </button>
          {isTeacherOrAdmin && (
            <button
              onClick={() => setCreateOpen(true)}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('createAssignment')}
            </button>
          )}
        </div>
      </div>

      {/* ── View Toggle + Stats ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex bg-surface-container p-1 rounded-lg gap-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'list'
                ? 'bg-surface-container-lowest shadow-sm text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <LayoutList className="w-4 h-4" />
            {t('listView')}
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
              viewMode === 'grid'
                ? 'bg-surface-container-lowest shadow-sm text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            {t('gridView')}
          </button>
        </div>

        <div className="flex gap-4 text-sm text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            {t('active')} ({activeCount})
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-warning" />
            {t('grading')} ({gradingCount})
          </span>
        </div>
      </div>

      {/* ── Data Table ── */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-start border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                <th className="p-4 text-start w-1/4">{t('assignmentTitle')}</th>
                <th className="p-4 text-start w-1/6">{t('subject')}</th>
                <th className="p-4 text-start w-1/6">{t('dueAt')}</th>
                <th className="p-4 text-start w-1/4">{t('submissions')}</th>
                <th className="p-4 text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {assignments.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8">
                    <EmptyState
                      title="No assignments found"
                      description="No active or pending assignments to show for this view."
                      actionLabel={isTeacherOrAdmin ? "Create Assignment" : undefined}
                      onAction={isTeacherOrAdmin ? () => setCreateOpen(true) : undefined}
                    />
                  </td>
                </tr>
              ) : (
                assignments.map((asg) => {
                const pct = asg.total > 0 ? Math.round((asg.submitted / asg.total) * 100) : 0
                const window = WINDOW_CHIP[asg.window]
                return (
                  <tr
                    key={asg.id}
                    className="hover:bg-surface-container-low transition-colors group cursor-pointer"
                    onClick={() => isTeacherOrAdmin && asg.submissions.length > 0 && handleOpenGrading(asg)}
                  >
                    {/* Title */}
                    <td className="p-4">
                      <div className="text-sm font-semibold text-on-surface">{asg.title}</div>
                      <div className="text-xs text-on-surface-variant mt-0.5">{asg.cohort}</div>
                    </td>

                    {/* Subject */}
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${SUBJECT_CHIP[asg.subjectColor]}`}>
                        {asg.subject}
                      </span>
                    </td>

                    {/* Due date */}
                    <td className="p-4">
                      <div className={`text-sm font-medium ${asg.window === 'closed' ? 'text-error' : 'text-on-surface'}`}>
                        {asg.dueDate}
                      </div>
                      <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold ${window.cls}`}>
                        {window.label}
                      </span>
                    </td>

                    {/* Submissions progress */}
                    <td className="p-4">
                      <div className="flex items-center justify-between text-xs mb-1.5">
                        <span className="text-on-surface font-semibold">{asg.submitted}/{asg.total} {t('submitted')}</span>
                        <span className="text-on-surface-variant font-mono">{pct}%</span>
                      </div>
                      <MiniSegmentedBar
                        segments={[
                          { label: 'Graded', value: asg.graded, colorClass: 'bg-primary' },
                          { label: 'Pending Review', value: Math.max(0, asg.submitted - asg.graded), colorClass: 'bg-amber-500' },
                          { label: 'Unsubmitted', value: Math.max(0, asg.total - asg.submitted), colorClass: 'bg-surface-container-high' },
                        ]}
                        height={6}
                        ariaLabel={`${asg.graded} graded, ${asg.submitted - asg.graded} pending review, ${asg.total - asg.submitted} unsubmitted out of ${asg.total}`}
                      />
                      <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-1.5">
                        <span>{asg.graded} {t('graded')}</span>
                        {asg.submitted > asg.graded && (
                          <span className="text-amber-600 font-semibold">{asg.submitted - asg.graded} to grade</span>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="p-4 text-end">
                      {activeRole === 'STUDENT' && asg.window === 'active' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setSubmitAsgId(asg.id)
                            setSubmitOpen(true)
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container transition-colors shadow-sm ms-auto"
                        >
                          <Send className="w-3.5 h-3.5" />
                          {t('submitWork')}
                        </button>
                      )}
                      {isTeacherOrAdmin && (
                        <button
                          onClick={(e) => { e.stopPropagation() }}
                          className="p-1.5 text-on-surface-variant hover:text-primary rounded-md hover:bg-surface-container transition-colors opacity-0 group-hover:opacity-100 ms-auto"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                )
              }))}
            </tbody>
          </table>
        </div>

        {/* Pagination footer */}
        <div className="p-4 border-t border-outline-variant flex justify-between items-center text-sm text-on-surface-variant bg-surface-container-lowest">
          <span>{t('showing', { count: assignments.length })}</span>
          <div className="flex gap-2">
            <button className="p-1 rounded-md hover:bg-surface-container transition-colors disabled:opacity-40" disabled>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="p-1 rounded-md hover:bg-surface-container transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Create Assignment Drawer ── */}
      <Drawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        title={t('createAssignment')}
        description={t('createAssignmentDesc')}
      >
        <form onSubmit={handleCreate} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">
              {t('assignmentTitle')}
            </label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Critical Analysis Essay"
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">{t('maxScore')}</label>
              <input
                type="number"
                required
                min={1}
                value={newMaxScore}
                onChange={(e) => setNewMaxScore(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1.5">{t('dueAt')}</label>
              <input
                type="date"
                required
                value={newDueAt}
                onChange={(e) => setNewDueAt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant">
            <button type="button" onClick={() => setCreateOpen(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              {tCommon('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm transition-colors">
              {tCommon('save')}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Student Submit Drawer ── */}
      <Drawer
        isOpen={submitOpen}
        onClose={() => setSubmitOpen(false)}
        title={t('submitWork')}
        description={t('submitWorkDesc')}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-medium text-on-surface-variant mb-1.5">{t('yourSubmission')}</label>
            <textarea
              rows={6}
              required
              value={submissionText}
              onChange={(e) => setSubmissionText(e.target.value)}
              placeholder="Paste or write your coursework response..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-outline-variant bg-surface-container-lowest text-sm text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
            />
          </div>
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-outline-variant">
            <button type="button" onClick={() => setSubmitOpen(false)} className="px-4 py-2 rounded-lg text-xs font-medium text-on-surface-variant hover:bg-surface-container transition-colors">
              {tCommon('cancel')}
            </button>
            <button type="submit" className="px-4 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary-container shadow-sm transition-colors flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5" />
              {t('submitWork')}
            </button>
          </div>
        </form>
      </Drawer>

      {/* ── Grading Drawer (Stitch 34d8a7fb) ── */}
      <Drawer
        isOpen={gradingOpen}
        onClose={() => setGradingOpen(false)}
        title={selectedAsg ? selectedAsg.title : t('gradeWork')}
        description={selectedAsg?.submissions[0]
          ? `${selectedAsg.submissions[0].studentName} · ${selectedAsg.submissions[0].submittedAt}`
          : t('gradeWork')}
        maxWidth="2xl"
      >
        {selectedAsg && selectedAsg.submissions.length > 0 && (
          <form onSubmit={handlePublishGrade} className="space-y-0 flex flex-col h-full">
            <div className="space-y-6 flex-1 overflow-y-auto pb-24">
              {/* Section 1: Submission file */}
              <section>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-on-surface-variant" />
                  {t('submittedWork')}
                </h4>
                <div className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-error/10 text-error flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-on-surface">{selectedAsg.submissions[0].fileName}</p>
                      <p className="text-xs text-on-surface-variant">{selectedAsg.submissions[0].fileSize} · {selectedAsg.submissions[0].submittedAt}</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Section 2: Student note */}
              <section>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-on-surface-variant" />
                  {t('studentComments')}
                </h4>
                <blockquote className="ps-4 py-2 border-s-4 border-primary-fixed-dim bg-surface-container p-3 rounded-e-lg text-sm text-on-surface-variant italic">
                  &ldquo;{selectedAsg.submissions[0].studentNote}&rdquo;
                </blockquote>
              </section>

              <hr className="border-outline-variant" />

              {/* Section 3: Grading */}
              <section>
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Star className="w-4 h-4 text-on-surface-variant" />
                  {t('gradingEvaluation')}
                </h4>

                {/* Score input */}
                <div className="grid grid-cols-2 gap-6 mb-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-on-surface-variant">{t('finalScore')}</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0}
                        max={selectedAsg.maxScore}
                        value={awardedScore}
                        onChange={(e) => setAwardedScore(Number(e.target.value))}
                        className="w-24 px-3 py-2 border border-outline-variant rounded-lg text-2xl font-bold text-on-surface text-center bg-surface-container-lowest focus:ring-2 focus:ring-primary focus:outline-none"
                      />
                      <span className="text-sm text-on-surface-variant">/ {selectedAsg.maxScore}</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 text-success">
                        {Math.round((awardedScore / selectedAsg.maxScore) * 100)}%
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-medium text-on-surface-variant">{t('gradeCategory')}</label>
                    <div className="py-2.5 px-3 border border-outline-variant rounded-lg bg-surface-container-lowest text-sm text-on-surface flex items-center justify-between">
                      <span>Lab Work</span>
                      <span className="text-xs text-on-surface-variant">Weight: 25%</span>
                    </div>
                  </div>
                </div>

                {/* Rubric checklist */}
                <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-4">
                  <h5 className="text-[11px] font-bold text-on-surface uppercase tracking-wider mb-3">{t('rubricCriteria')}</h5>
                  <ul className="space-y-3">
                    {selectedAsg.rubric.map((item, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {item.passed ? (
                          <CheckCircle2 className="w-4 h-4 text-success mt-0.5 shrink-0" />
                        ) : (
                          <AlertCircle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
                        )}
                        <div className="flex-1">
                          <span className="text-sm text-on-surface">{item.label}</span>
                          {item.note && <p className="text-xs text-on-surface-variant mt-0.5">{item.note}</p>}
                        </div>
                        <span className="text-xs text-on-surface-variant shrink-0">{item.score}/{item.max}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>

              {/* Section 4: Feedback */}
              <section className="pb-4">
                <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-on-surface-variant" />
                  {t('teacherFeedback')}
                </h4>

                {/* Rich textarea with toolbar */}
                <div className="border border-outline-variant rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
                  <div className="bg-surface-container-low border-b border-outline-variant px-2 py-1.5 flex gap-1">
                    <button type="button" className="p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors"><Bold className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors"><Italic className="w-3.5 h-3.5" /></button>
                    <button type="button" className="p-1 rounded text-on-surface-variant hover:bg-surface-container transition-colors"><List className="w-3.5 h-3.5" /></button>
                  </div>
                  <textarea
                    rows={5}
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder={t('feedbackPlaceholder')}
                    className="w-full p-3 border-none resize-y text-sm text-on-surface bg-transparent focus:outline-none focus:ring-0"
                  />
                </div>

                {/* Quick insert snippets */}
                <div className="mt-3">
                  <span className="text-[11px] font-semibold text-on-surface-variant uppercase tracking-wider mb-2 block">{t('quickInsert')}</span>
                  <div className="flex flex-wrap gap-2">
                    {QUICK_SNIPPETS.map((snippet) => (
                      <button
                        key={snippet}
                        type="button"
                        onClick={() => setFeedbackText((prev) => prev ? `${prev}\n${snippet}` : snippet)}
                        className="px-2.5 py-1 rounded-full border border-outline-variant bg-surface-container-lowest text-xs text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
                      >
                        {snippet}
                      </button>
                    ))}
                  </div>
                </div>
              </section>
            </div>

            {/* Sticky footer */}
            <div className="border-t border-outline-variant bg-surface-container-lowest px-0 py-4 flex items-center justify-between mt-auto">
              <button
                type="button"
                className="text-sm text-on-surface-variant hover:text-primary transition-colors flex items-center gap-1.5"
              >
                <Undo2 className="w-4 h-4" />
                {t('reopenResubmission')}
              </button>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setGradingOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-sm font-medium text-on-surface hover:bg-surface-container transition-colors"
                >
                  {t('saveDraft')}
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-container transition-colors shadow-sm"
                >
                  {t('publishGrade')}
                </button>
              </div>
            </div>
          </form>
        )}
      </Drawer>
    </div>
  )
}
