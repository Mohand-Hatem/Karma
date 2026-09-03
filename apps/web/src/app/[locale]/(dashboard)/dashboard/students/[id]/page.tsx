'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ChevronRight,
  TrendingUp,
  Download,
  Edit,
  BookOpen,
  Calendar,
  FileCheck2,
  HelpCircle,
  User,
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  Calculator,
  Layers,
  Phone,
  Mail,
} from 'lucide-react'
import {
  MiniSparkline,
  MiniAttendanceBars,
} from '../../../../../../components/ui/data-viz'

export default function StudentDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  const [activeTab, setActiveTab] = useState<
    'overview' | 'attendance' | 'assignments' | 'quizzes' | 'results'
  >('overview')

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Top Breadcrumb with mobile horizontal scroll */}
      <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        <Link
          href={`/${locale}/dashboard/students`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Students Directory</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span>Grade 10A</span>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-bold">Omar Hatem</span>
      </nav>

      {/* Top Profile Header Card (Stitch Screen 01 exact clone) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs p-6 flex flex-col md:flex-row gap-6 relative overflow-hidden">
        {/* Left: Profile Identity */}
        <div className="flex items-start gap-5 flex-1 z-10">
          <div className="relative shrink-0">
            <div className="w-20 h-20 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-2xl border-2 border-surface-container-lowest shadow-xs ring-1 ring-outline-variant">
              OH
            </div>
            <div
              className="absolute bottom-0 right-0 w-4 h-4 bg-emerald-500 border-2 border-surface-container-lowest rounded-full shadow-xs"
              title="Active Status"
            />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                Omar Hatem
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                Active
              </span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1 flex items-center gap-2 flex-wrap font-medium">
              <span>STU-2026-0042</span>
              <span>•</span>
              <span>Grade 10 - Class 10A</span>
              <span>•</span>
              <span>General Academic Track</span>
            </p>
            <div className="flex items-center gap-3 mt-3 text-xs text-on-surface-variant flex-wrap">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-outline" /> omar.hatem@student.karma.edu
              </span>
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-outline" /> +971 50 987 6543
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Stats & Actions (Stitch Screen 01 exact pills enhanced with micro-viz) */}
        <div className="flex flex-col justify-between items-start md:items-end gap-4 z-10 md:w-80 shrink-0">
          <div className="grid grid-cols-2 gap-2 w-full text-xs">
            <div className="bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Homeroom
              </span>
              <span className="font-semibold text-on-surface truncate mt-1" title="Mr. David Miller">
                Mr. David Miller
              </span>
            </div>
            <div className="bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/60 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Attendance
                </span>
                <span className="font-semibold text-emerald-600 flex items-center gap-1 text-[11px]">
                  <TrendingUp className="w-3 h-3" /> 96.2%
                </span>
              </div>
              <MiniAttendanceBars
                days={[95, 96, 94, 97, 96.2]}
                height={16}
                className="mt-1"
                ariaLabel="Weekly attendance rate: 96.2%"
              />
            </div>
            <div className="bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/60 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  GPA
                </span>
                <span className="font-semibold text-on-surface font-mono text-[11px]">
                  3.85 <span className="text-on-surface-variant text-[9px]">/ 4.0</span>
                </span>
              </div>
              <MiniSparkline
                data={[3.65, 3.72, 3.78, 3.82, 3.85]}
                width={64}
                height={16}
                className="mt-1"
                ariaLabel="GPA trend: 3.65 to 3.85"
              />
            </div>
            <div className="bg-surface-container-low rounded-lg p-2.5 border border-outline-variant/60 flex flex-col justify-between">
              <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                Linked Parent
              </span>
              <span className="font-semibold text-on-surface truncate mt-1" title="Mariam Hatem">
                Mariam Hatem
              </span>
            </div>
          </div> 
          
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => alert('Exporting Student 360° Profile PDF...')}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
            </button>
            <button
              onClick={() => alert('Editing Student Profile...')}
              className="flex-1 sm:flex-none px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation Bar */}
      <div className="border-b border-outline-variant">
        <nav className="flex gap-6 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'overview'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Academic Overview</span>
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'attendance'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Attendance History</span>
          </button>
          <button
            onClick={() => setActiveTab('assignments')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'assignments'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => setActiveTab('quizzes')}
            className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
              activeTab === 'quizzes'
                ? 'border-primary text-primary'
                : 'border-transparent text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Quizzes &amp; Exams</span>
          </button>
        </nav>
      </div>

      {/* Tab Content 1: Academic Overview (Stitch Screen 01) */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Enrolled Subjects & Teachers (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h2 className="text-sm font-bold text-on-surface">Enrolled Subjects</h2>
              <Link
                href={`/${locale}/dashboard/results`}
                className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
              >
                <span>View Full Transcript</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-outline-variant">
              {/* Subject 1 */}
              <div className="p-4 hover:bg-surface-container-low/40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Physics (HL)</p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" /> Mr. A. Jenkins
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface font-mono">92%</p>
                  <p className="text-[10px] text-on-surface-variant">Term Mark</p>
                </div>
              </div>

              {/* Subject 2 */}
              <div className="p-4 hover:bg-surface-container-low/40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-secondary-container text-on-secondary-container flex items-center justify-center shrink-0 font-bold">
                    <Calculator className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">Pure Mathematics</p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" /> Ms. S. Patel
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface font-mono">88%</p>
                  <p className="text-[10px] text-on-surface-variant">Term Mark</p>
                </div>
              </div>

              {/* Subject 3 */}
              <div className="p-4 hover:bg-surface-container-low/40 transition-colors flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0 font-bold">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">English Literature</p>
                    <p className="text-[11px] text-on-surface-variant flex items-center gap-1 mt-0.5">
                      <User className="w-3 h-3" /> Dr. L. Barnes
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-on-surface font-mono">85%</p>
                  <p className="text-[10px] text-on-surface-variant">Term Mark</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Guardian & Contact Details (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
              <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-2">
                <User className="w-4 h-4 text-primary" />
                Primary Guardian Details
              </h3>
              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                    Parent / Guardian
                  </span>
                  <span className="text-on-surface font-bold">Mariam Hatem (Mother)</span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                    Contact Phone
                  </span>
                  <span className="text-on-surface font-mono flex items-center gap-1 mt-0.5">
                    <Phone className="w-3 h-3 text-outline" /> +971 50 987 6543
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-on-surface-variant uppercase font-semibold block">
                    Emergency Email
                  </span>
                  <span className="text-on-surface flex items-center gap-1 mt-0.5">
                    <Mail className="w-3 h-3 text-outline" /> mariam.hatem@parent.school.edu
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 2: Attendance History */}
      {activeTab === 'attendance' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-on-surface">Term Attendance Log</h2>
          <p className="text-xs text-on-surface-variant">
            Recorded 96.2% overall term attendance (50/52 days present, 2 excused absences).
          </p>
          <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/60 flex items-center justify-between text-xs">
            <div>
              <p className="font-bold text-on-surface">Oct 18, 2023</p>
              <p className="text-on-surface-variant">Excused Medical Absence (Doctor Note on file)</p>
            </div>
            <span className="text-amber-600 font-semibold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Excused
            </span>
          </div>
        </div>
      )}

      {/* Tab Content 3: Assignments */}
      {activeTab === 'assignments' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-on-surface">Recent Submissions &amp; Grades</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface">Physics Lab Report #3: Newton's Laws</p>
                <p className="text-[11px] text-on-surface-variant">Submitted Oct 24 • Physics (HL)</p>
              </div>
              <span className="text-xs font-bold text-emerald-600">92 / 100 (A)</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 4: Quizzes */}
      {activeTab === 'quizzes' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs space-y-4">
          <h2 className="text-base font-bold text-on-surface">Quiz &amp; Exam Performances</h2>
          <div className="space-y-3">
            <div className="p-4 rounded-lg bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-on-surface">Kinematics Diagnostic Quiz</p>
                <p className="text-[11px] text-on-surface-variant">Completed Oct 15 • Score: 18/20</p>
              </div>
              <span className="text-xs font-bold text-primary">90%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
