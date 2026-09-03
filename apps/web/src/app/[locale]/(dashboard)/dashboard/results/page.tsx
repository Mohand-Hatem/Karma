'use client'

import { useTranslations } from 'next-intl'
import { Award, ShieldCheck, Download } from 'lucide-react'

interface ResultRecord {
  id: string
  studentName: string
  studentCode: string
  subject: string
  term: string
  score: number
  letterGrade: string
  breakdown: { category: string; score: number; weight: number }[]
  version: number
}

const REPORT_RESULTS: ResultRecord[] = [
  {
    id: 'res-1',
    studentName: 'Youssef Nabil',
    studentCode: 'STU-2026-001',
    subject: 'World Literature',
    term: 'Fall Term 2025/2026',
    score: 94.5,
    letterGrade: 'A',
    breakdown: [
      { category: 'Class Participation', score: 95, weight: 20 },
      { category: 'Midterm Essay', score: 92, weight: 30 },
      { category: 'Final Project', score: 96, weight: 50 },
    ],
    version: 1,
  },
  {
    id: 'res-2',
    studentName: 'Youssef Nabil',
    studentCode: 'STU-2026-001',
    subject: 'Advanced Calculus',
    term: 'Fall Term 2025/2026',
    score: 88.0,
    letterGrade: 'B+',
    breakdown: [
      { category: 'Quizzes', score: 85, weight: 20 },
      { category: 'Midterm Exam', score: 87, weight: 30 },
      { category: 'Final Exam', score: 90, weight: 50 },
    ],
    version: 1,
  },
  {
    id: 'res-3',
    studentName: 'Youssef Nabil',
    studentCode: 'STU-2026-001',
    subject: 'Organic Chemistry',
    term: 'Fall Term 2025/2026',
    score: 91.0,
    letterGrade: 'A-',
    breakdown: [
      { category: 'Lab Reports', score: 94, weight: 25 },
      { category: 'Midterm Test', score: 88, weight: 25 },
      { category: 'Final Exam', score: 92, weight: 50 },
    ],
    version: 2, // Corrected version
  },
]

export default function ResultsPage() {
  const t = useTranslations('features.results')

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t('description')}
          </p>
        </div>

        <button
          onClick={() => alert('Exporting official PDF report card...')}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer shadow-xs"
        >
          <Download className="w-4 h-4 text-blue-500" />
          <span>Export Transcript (PDF)</span>
        </button>
      </div>

      {/* Results Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-6 text-start">{t('subject')}</th>
                <th className="py-3.5 px-6 text-start">Student</th>
                <th className="py-3.5 px-6 text-center">{t('score')}</th>
                <th className="py-3.5 px-6 text-center">{t('letterGrade')}</th>
                <th className="py-3.5 px-6 text-center">Version</th>
                <th className="py-3.5 px-6 text-end">{t('status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {REPORT_RESULTS.map((res) => (
                <tr key={res.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                  <td className="py-4 px-6 font-semibold text-slate-900 dark:text-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-xs">
                        <Award className="w-4 h-4" />
                      </div>
                      <div>
                        <span>{res.subject}</span>
                        <p className="text-xs text-slate-400 font-normal">{res.term}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                    <span>{res.studentName}</span>
                    <p className="text-xs text-slate-400">{res.studentCode}</p>
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-slate-900 dark:text-white">
                    {res.score}%
                  </td>
                  <td className="py-4 px-6 text-center">
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300">
                      {res.letterGrade}
                    </span>
                  </td>
                  <td className="py-4 px-6 text-center text-xs text-slate-400 font-medium">
                    v{res.version} {res.version > 1 ? '(Corrected)' : ''}
                  </td>
                  <td className="py-4 px-6 text-end">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t('verified')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
