'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  FileText,
  Download,
  Eye,
  CheckCircle2,
  Clock,
  Save,
  Send,
  MessageSquare,
  Award,
} from 'lucide-react'

export default function AssignmentGradingPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  // Students list mock
  const [submissions, setSubmissions] = useState([
    {
      id: 'sub-1',
      studentName: 'Ahmad Khalid (10A)',
      initials: 'AK',
      submittedAt: 'Oct 23, 14:30',
      status: 'Graded',
      score: 92,
      fileName: 'newtons_laws_ahmad.pdf',
      comments: 'All questions completed with apparatus diagrams.',
    },
    {
      id: 'sub-2',
      studentName: 'Zainab Al-Fassi (10A)',
      initials: 'ZA',
      submittedAt: 'Oct 24, 18:00',
      status: 'Late',
      score: 88,
      fileName: 'physics_lab_report_zainab.pdf',
      comments: 'I completed the experiment on Tuesday, apologies for the slight delay in submission.',
    },
    {
      id: 'sub-3',
      studentName: 'Faisal Abdullah (10B)',
      initials: 'FA',
      submittedAt: 'Oct 24, 09:15',
      status: 'Submitted',
      score: null,
      fileName: 'lab_report_faisal.pdf',
      comments: 'Attached my calculations spreadsheet data.',
    },
    {
      id: 'sub-4',
      studentName: 'Sara Mansour (10A)',
      initials: 'SM',
      submittedAt: '-',
      status: 'Missing',
      score: 0,
      fileName: null,
      comments: '',
    },
  ])

  const [selectedSubId, setSelectedSubId] = useState('sub-2')
  const [scoreInput, setScoreInput] = useState(88)
  const [feedbackInput, setFeedbackInput] = useState('Excellent methodology and error analysis. Pay close attention to unit conversions in table 2.')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const activeSub = submissions.find((s) => s.id === selectedSubId) || submissions[0]

  const handleSaveGrade = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmissions((prev) =>
      prev.map((s) =>
        s.id === selectedSubId
          ? { ...s, score: scoreInput, status: 'Graded' }
          : s
      )
    )
    setToastMessage(`Grade saved for ${activeSub.studentName}`)
    setTimeout(() => setToastMessage(null), 3000)
  }

  return (
    <div className="space-y-6 pb-20 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumbs Navigation with mobile horizontal scroll */}
      <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        <Link
          href={`/${locale}/dashboard/assignments`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Assignments Center</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span>Physics 101</span>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-bold">Physics Lab Report #3</span>
      </nav>

      {/* Assignment Header (Stitch Screen 04 exact header) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-5">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            Physics Lab Report #3: Newton&apos;s Laws
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Due: Oct 24, 2023 • 32 Students • Weight: 25% of Term Grade
          </p>
        </div>

        <div className="flex gap-2 self-start sm:self-auto">
          <button
            onClick={() => {
              setToastMessage('All grades published to student portal.')
              setTimeout(() => setToastMessage(null), 3000)
            }}
            className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish All Grades</span>
          </button>
        </div>
      </div>

      {/* Two-Column Dedicated Grading Layout (Stitch Screen 04 exact split) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Submissions Table (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider">
              Student Submissions ({submissions.length})
            </h2>
          </div>

          <div className="divide-y divide-outline-variant overflow-y-auto max-h-[600px]">
            {submissions.map((sub) => {
              const isSelected = sub.id === selectedSubId
              return (
                <div
                  key={sub.id}
                  onClick={() => {
                    setSelectedSubId(sub.id)
                    setScoreInput(sub.score ?? 85)
                  }}
                  className={`p-3.5 cursor-pointer transition-colors flex items-center justify-between ${
                    isSelected
                      ? 'bg-primary/5 border-l-4 border-primary'
                      : 'hover:bg-surface-container-low/40'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-secondary-container text-on-secondary-container flex items-center justify-center font-bold text-xs shrink-0">
                      {sub.initials}
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-on-surface">
                        {sub.studentName}
                      </h3>
                      <p className="text-[11px] text-on-surface-variant">
                        {sub.submittedAt}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        sub.status === 'Graded'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : sub.status === 'Late'
                            ? 'bg-amber-50 text-amber-800 border border-amber-200'
                            : sub.status === 'Submitted'
                              ? 'bg-blue-50 text-blue-800 border border-blue-200'
                              : 'bg-red-50 text-red-800 border border-red-200'
                      }`}
                    >
                      {sub.status}
                    </span>
                    <p className="text-xs font-bold text-on-surface font-mono mt-0.5">
                      {sub.score !== null ? `${sub.score} / 100` : '- / 100'}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Right Column: Dedicated Grading Workspace (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-6 space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-outline-variant pb-4">
            <div>
              <h2 className="text-lg font-bold text-on-surface">
                {activeSub.studentName}
              </h2>
              <span className="text-xs text-on-surface-variant">
                Submission Status: <strong className="text-on-surface">{activeSub.status}</strong>
              </span>
            </div>

            {activeSub.status === 'Late' && (
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                Submitted 2h after deadline
              </span>
            )}
          </div>

          {/* Section 1: Submitted Files */}
          <div>
            <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-primary" />
              Submitted Files
            </h3>

            {activeSub.fileName ? (
              <div className="p-3 border border-outline-variant rounded-lg bg-surface-container-low flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-red-50 text-red-600">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      {activeSub.fileName}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      2.4 MB • Uploaded {activeSub.submittedAt}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => alert(`Previewing ${activeSub.fileName}`)}
                    className="p-1.5 text-outline hover:text-on-surface rounded-md hover:bg-surface-container transition-colors"
                    title="Preview"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => alert(`Downloading ${activeSub.fileName}`)}
                    className="p-1.5 text-outline hover:text-on-surface rounded-md hover:bg-surface-container transition-colors"
                    title="Download"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant text-xs text-on-surface-variant italic">
                No file submitted by this student.
              </div>
            )}
          </div>

          {/* Section 2: Student Comments */}
          {activeSub.comments && (
            <div>
              <h3 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-secondary" />
                Student Comments
              </h3>
              <blockquote className="pl-3 py-2 border-l-4 border-primary bg-surface-container-low rounded-r-lg text-xs text-on-surface italic">
                &ldquo;{activeSub.comments}&rdquo;
              </blockquote>
            </div>
          )}

          {/* Section 3: Rubric & Score Input */}
          <form onSubmit={handleSaveGrade} className="space-y-5 pt-2 border-t border-outline-variant">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Final Score (Out of 100) *
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    required
                    value={scoreInput}
                    onChange={(e) => setScoreInput(Number(e.target.value))}
                    className="w-24 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-lg font-bold font-mono text-center text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <span className="text-xs font-bold text-on-surface-variant">/ 100</span>
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {scoreInput}%
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-on-surface mb-1">
                  Grade Category
                </label>
                <div className="py-2.5 px-3 border border-outline-variant rounded-lg bg-surface-container-low text-xs font-semibold text-on-surface flex items-center justify-between">
                  <span>Lab Work</span>
                  <span className="text-on-surface-variant">Weight: 25%</span>
                </div>
              </div>
            </div>

            {/* Rubric Criteria (Stitch Screen 04 exact checklist) */}
            <div className="bg-surface-container-low border border-outline-variant rounded-lg p-4 space-y-2.5">
              <h4 className="text-xs font-bold text-on-surface uppercase tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-primary" />
                Rubric Breakdown
              </h4>
              <ul className="space-y-2 text-xs">
                <li className="flex items-center justify-between">
                  <span className="font-medium text-on-surface">Hypothesis Formulation</span>
                  <span className="font-mono font-bold text-emerald-600">10 / 10</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-medium text-on-surface">Methodology &amp; Procedure</span>
                  <span className="font-mono font-bold text-emerald-600">20 / 20</span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="font-medium text-on-surface">Data Analysis &amp; Graphs</span>
                  <span className="font-mono font-bold text-primary">35 / 40</span>
                </li>
              </ul>
            </div>

            {/* Teacher Feedback Textarea */}
            <div>
              <label className="block text-xs font-bold text-on-surface mb-1">
                Teacher Feedback &amp; Suggestions
              </label>
              <textarea
                rows={3}
                value={feedbackInput}
                onChange={(e) => setFeedbackInput(e.target.value)}
                placeholder="Add constructive feedback for the student..."
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="submit"
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Grade &amp; Next</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
