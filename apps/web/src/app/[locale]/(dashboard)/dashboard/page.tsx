'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import {
  Users,
  GraduationCap,
  BookOpen,
  FileCheck2,
  Clock,
  Calendar,
  Plus,
  ChevronRight,
  CheckCircle2,
  TrendingUp,
  FileText,
  LineChart,
  CalendarCheck,
  Building2,
  Coffee,
  Check,
  AlertTriangle,
  Smile,
  Download,
} from 'lucide-react'
import { useShellStore } from '../../../../stores/shell-store'
import {
  MiniSparkline,
  MiniAttendanceBars,
} from '../../../../components/ui/data-viz'
import { GradeDistributionChart } from '../../../../components/charts/grade-distribution-chart'
import { SubjectRadarChart } from '../../../../components/charts/subject-radar-chart'

export default function DashboardPage({
  params,
}: {
  params?: Promise<{ locale: string }>
}) {
  const [locale, setLocale] = useState('en')
  if (params && typeof params.then === 'function') {
    params.then((p) => {
      if (p?.locale && p.locale !== locale) setLocale(p.locale)
    })
  }

  const t = useTranslations('dashboard')
  const { activeRole } = useShellStore()

  if (activeRole === 'TEACHER') {
    return <TeacherDashboardView locale={locale} t={t} />
  }

  if (activeRole === 'STUDENT') {
    return <StudentDashboardView locale={locale} _t={t} />
  }

  if (activeRole === 'PARENT') {
    return <ParentDashboardView locale={locale} t={t} />
  }

  // Default: ADMIN Dashboard
  return <AdminDashboardView locale={locale} t={t} />
}

/* ──────────────────────────────────────────────────────────────────────────
 * 1. Admin Dashboard View — Cloned from Stitch Screens 03 & 31
 * ────────────────────────────────────────────────────────────────────────── */

function AdminDashboardView({
  locale,
  t,
}: {
  locale: string
  t: (key: string) => string
}) {
  const [activeTab, setActiveTab] = useState<'overview' | 'executive'>('overview')

  return (
    <div className="space-y-6">
      {/* Header & Sub-view Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            {activeTab === 'overview' ? t('schoolOverview') : t('executiveAnalytics')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('termSubtitle')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Switcher Tab between Overview and Executive Analytics */}
          <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'overview'
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t('schoolOverview')}</span>
            </button>
            <button
              onClick={() => setActiveTab('executive')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'executive'
                  ? 'bg-surface-container-lowest text-primary shadow-xs border border-outline-variant/40'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
              <span>{t('executiveAnalytics')}</span>
            </button>
          </div>

          <Link
            href={`/${locale}/dashboard/classes`}
            className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-on-primary text-xs font-semibold shadow-xs transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t('quickAction')}</span>
          </Link>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Admin Tab 1: Operational School Overview (Stitch Screen 03)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* 4 Stitch KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Total Students */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('totalStudents')}
                </span>
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <GraduationCap className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-on-surface">
                      1,248
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 flex items-center">
                      <TrendingUp className="w-3 h-3 me-0.5" /> +4.2%
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">vs. last term</span>
                </div>
                <MiniSparkline
                  data={[1180, 1195, 1220, 1210, 1235, 1248]}
                  width={76}
                  height={24}
                  ariaLabel="Student enrollment trend: steady increase from 1,180 to 1,248"
                />
              </div>
            </div>

            {/* KPI 2: Total Teachers */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('totalTeachers')}
                </span>
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Users className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-on-surface">
                      84
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      Across 12 depts
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">Student-Teacher ratio 1:15</span>
                </div>
                <span className="px-2 py-1 rounded bg-surface-container text-[10px] font-bold text-on-surface-variant tracking-wider uppercase border border-outline-variant/50">
                  1:15 Ratio
                </span>
              </div>
            </div>

            {/* KPI 3: Daily Attendance */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('dailyAttendance')}
                </span>
                <span className="p-2 rounded-lg bg-secondary-container text-on-secondary-container">
                  <CalendarCheck className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-on-surface">
                      96.2%
                    </span>
                    <span className="text-xs font-semibold text-emerald-600">
                      High
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">5-Day pattern</span>
                </div>
                <MiniAttendanceBars
                  days={[95, 96, 94, 97, 96.2]}
                  height={22}
                  ariaLabel="Weekly attendance rates: Mon 95%, Tue 96%, Wed 94%, Thu 97%, Fri 96.2%"
                />
              </div>
            </div>

            {/* KPI 4: Active Classes */}
            <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant shadow-xs flex flex-col justify-between h-36 hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start">
                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {t('activeClasses')}
                </span>
                <span className="p-2 rounded-lg bg-primary/10 text-primary">
                  <BookOpen className="w-4 h-4" />
                </span>
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl lg:text-3xl font-bold text-on-surface">
                      42
                    </span>
                    <span className="text-xs font-semibold text-on-surface-variant">
                      Streams A-D
                    </span>
                  </div>
                  <span className="text-[11px] text-on-surface-variant">100% room capacity</span>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                  Optimal
                </span>
              </div>
            </div>
          </div>

          {/* Activity and Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
              <h2 className="text-base font-bold text-on-surface mb-4">
                {t('recentActivity')}
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs">
                      <Check className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        Term 1 Exam Timetable Published
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        By Vice Principal • 2 hours ago
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-primary">Completed</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/60">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-on-surface">
                        New Teacher Onboarded: Dr. Mona Zaki
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        Department of Mathematics • Yesterday
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-on-surface-variant">Active</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
              <h2 className="text-base font-bold text-on-surface mb-4">
                {t('quickShortcuts')}
              </h2>
              <div className="space-y-2">
                <Link
                  href={`/${locale}/dashboard/attendance`}
                  className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="text-xs font-semibold text-on-surface">
                    Record Daily Attendance
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </Link>
                <Link
                  href={`/${locale}/dashboard/timetable`}
                  className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="text-xs font-semibold text-on-surface">
                    Timetable Matrix & Calendar
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </Link>
                <Link
                  href={`/${locale}/dashboard/announcements`}
                  className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="text-xs font-semibold text-on-surface">
                    Broadcast School Circular
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </Link>
                <Link
                  href={`/${locale}/dashboard/settings`}
                  className="flex items-center justify-between p-3 rounded-lg border border-outline-variant hover:bg-surface-container-high transition-colors"
                >
                  <span className="text-xs font-semibold text-on-surface">
                    Audit Log & Plan Meters
                  </span>
                  <ChevronRight className="w-4 h-4 text-outline" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Admin Tab 2: Executive Analytics Dashboard (Stitch Screen 31 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'executive' && (
        <div className="space-y-6">
          {/* Executive Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-on-surface">
                Academic Cohort Term 1
              </span>
              <span className="text-xs text-on-surface-variant">• All 12 Campuses</span>
            </div>
            <button
              onClick={() => alert('Exporting Executive Summary PDF report...')}
              className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('exportSummary')}</span>
            </button>
          </div>

          {/* 4 Key Metrics Bento Grid (Stitch Screen 31 exact KPIs) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Metric 1: Avg GPA */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('avgDistrictGpa')}
                </span>
                <TrendingUp className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="text-2xl font-bold text-on-surface">3.42</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    +0.15 from Q1
                  </div>
                </div>
                <MiniSparkline
                  data={[3.22, 3.28, 3.32, 3.35, 3.40, 3.42]}
                  width={68}
                  height={22}
                  ariaLabel="District GPA progression: 3.22 to 3.42"
                />
              </div>
            </div>

            {/* Metric 2: Attendance */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('dailyAttendance')}
                </span>
                <CalendarCheck className="w-4 h-4 text-amber-500" />
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="text-2xl font-bold text-on-surface">94.8%</div>
                  <div className="text-xs text-on-surface-variant mt-0.5">
                    Stable vs last year
                  </div>
                </div>
                <MiniAttendanceBars
                  days={[94, 95, 93, 96, 94.8]}
                  height={20}
                  ariaLabel="District attendance rates: 94.8% average"
                />
              </div>
            </div>

            {/* Metric 3: Critical Interventions */}
            <div className="bg-surface-container-lowest rounded-xl p-4 border border-outline-variant flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
                  {t('criticalInterventions')}
                </span>
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="text-2xl font-bold text-on-surface">142</div>
                  <div className="text-xs text-emerald-600 font-semibold mt-0.5">
                    -12 active cases
                  </div>
                </div>
                <MiniSparkline
                  data={[165, 160, 154, 148, 142]}
                  strokeColor="#059669"
                  fillColor="rgba(5, 150, 105, 0.08)"
                  width={68}
                  height={22}
                  ariaLabel="Critical interventions trend: reduced from 165 to 142"
                />
              </div>
            </div>

            {/* Metric 4: Faculty Sentiment */}
            <div className="bg-secondary-container text-on-secondary-container rounded-xl p-4 border border-outline-variant flex flex-col justify-between shadow-xs hover:shadow-md transition-all duration-200">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                  {t('facultySentiment')}
                </span>
                <Smile className="w-4 h-4" />
              </div>
              <div className="flex items-end justify-between gap-2 mt-auto">
                <div>
                  <div className="text-2xl font-bold">7.8/10</div>
                  <div className="text-xs opacity-80 mt-0.5">Pulse survey Q2</div>
                </div>
                <span className="px-2 py-0.5 rounded bg-white/20 text-xs font-bold">
                  Positive
                </span>
              </div>
            </div>
          </div>

          {/* Charts Section (Stitch Screen 31 visualizers) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grade Distribution Bell Curve (Span 2) */}
            <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-xs flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-on-surface">
                  {t('gradeDistribution')}
                </h3>
                <span className="text-xs bg-surface-container-low px-2 py-0.5 rounded border border-outline-variant font-semibold text-on-surface-variant">
                  {t('allCohorts')}
                </span>
              </div>
              <GradeDistributionChart height={240} />
            </div>

            {/* Subject Performance Radar (Span 1) */}
            <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-xs flex flex-col">
              <h3 className="text-sm font-bold text-on-surface mb-4">
                {t('subjectPerformance')}
              </h3>
              <SubjectRadarChart height={240} />
            </div>

            {/* Attendance vs GPA Correlation (Span 3) */}
            <div className="lg:col-span-3 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant shadow-xs flex flex-col">
              <h3 className="text-sm font-bold text-on-surface mb-4">
                {t('attendanceCorrelation')}
              </h3>
              <div className="flex-1 w-full bg-surface-container-low/50 rounded-lg relative overflow-hidden border border-outline-variant/40 min-h-[220px] p-6">
                {/* Scatter Points */}
                <div className="w-2 h-2 rounded-full bg-primary absolute" style={{ left: '80%', top: '22%' }} />
                <div className="w-2 h-2 rounded-full bg-primary absolute" style={{ left: '85%', top: '18%' }} />
                <div className="w-2 h-2 rounded-full bg-primary absolute" style={{ left: '92%', top: '12%' }} />
                <div className="w-2 h-2 rounded-full bg-secondary absolute" style={{ left: '65%', top: '48%' }} />
                <div className="w-2 h-2 rounded-full bg-secondary absolute" style={{ left: '72%', top: '42%' }} />
                <div className="w-2 h-2 rounded-full bg-amber-500 absolute" style={{ left: '42%', top: '72%' }} />
                <div className="w-2 h-2 rounded-full bg-red-600 absolute" style={{ left: '20%', top: '88%' }} />

                {/* Trend line */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none">
                  <line
                    x1="10%"
                    y1="90%"
                    x2="90%"
                    y2="15%"
                    stroke="#004ac6"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                    opacity="0.6"
                  />
                </svg>

                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[11px] font-bold text-on-surface-variant">
                  Attendance Rate (50% → 100%)
                </div>
                <div className="absolute top-1/2 left-2 -translate-y-1/2 -rotate-90 text-[11px] font-bold text-on-surface-variant">
                  Average GPA (1.0 → 4.0)
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 2. Teacher Dashboard View — Cloned from Stitch Screen 11 (492b265e)
 * ────────────────────────────────────────────────────────────────────────── */

function TeacherDashboardView({
  locale,
  t,
}: {
  locale: string
  t: (key: string) => string
}) {
  return (
    <div className="space-y-6">
      {/* Welcome Banner (Stitch Screen 11 exact banner) */}
      <section className="bg-primary text-on-primary rounded-xl p-6 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="relative z-10 space-y-1">
          <h2 className="text-xl md:text-2xl font-bold">
            Welcome back, Mr. Ahmed Hassan
          </h2>
          <p className="text-primary-fixed text-sm">
            You have 4 periods today and 3 assignments pending review.
          </p>
        </div>
        <div className="relative z-10 flex items-center gap-3 bg-white/10 backdrop-blur-xs py-2 px-4 rounded-lg border border-white/10">
          <Calendar className="w-5 h-5 text-secondary-fixed" />
          <div>
            <p className="text-[10px] text-primary-fixed uppercase tracking-wider font-bold">
              Tuesday, Oct 24
            </p>
            <p className="text-xs font-semibold text-white">Semester 1, Week 8</p>
          </div>
        </div>
      </section>

      {/* Grid Layout: Schedule + Grading (Left) & My Classes (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* Today's Teaching Schedule Timeline */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-on-surface flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                {t('todaySchedule')}
              </h3>
              <Link
                href={`/${locale}/dashboard/timetable`}
                className="text-xs font-semibold text-primary hover:underline flex items-center"
              >
                {t('viewFullTimetable')} <ChevronRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>

            <div className="relative pl-6 border-l-2 border-surface-container-highest space-y-6 ml-2">
              {/* Period 1: Past */}
              <div className="relative opacity-70">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-surface-dim border-2 border-surface-container-highest" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">
                        Period 1
                      </span>
                      <span className="text-xs text-on-surface-variant">08:00 AM - 08:50 AM</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">Grade 10A Physics</p>
                    <p className="text-xs text-on-surface-variant flex items-center gap-1 mt-0.5">
                      Room 302
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Attendance Taken
                  </span>
                </div>
              </div>

              {/* Period 2: Current (Active) */}
              <div className="relative bg-primary/5 -mx-4 p-4 rounded-r-lg border border-primary/20 shadow-xs">
                <div className="absolute -left-[23px] top-5 w-4 h-4 rounded-full bg-primary border-4 border-surface-container-lowest ring-2 ring-primary/20" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold bg-primary text-on-primary px-2 py-0.5 rounded flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        Current Period
                      </span>
                      <span className="text-xs text-primary font-bold">09:00 AM - 09:50 AM</span>
                    </div>
                    <p className="text-base font-bold text-on-surface">Grade 11B Physics</p>
                    <p className="text-xs text-on-surface-variant mt-1">Science Lab 1</p>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/attendance`}
                    className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>{t('takeAttendance')}</span>
                  </Link>
                </div>
              </div>

              {/* Period 3: Planning */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest" />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[11px] font-semibold bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">
                      Period 3
                    </span>
                    <span className="text-xs text-on-surface-variant">10:10 AM - 11:00 AM</span>
                  </div>
                  <p className="text-sm font-semibold text-on-surface flex items-center gap-1.5">
                    <Coffee className="w-4 h-4 text-on-surface-variant" /> Planning Period
                  </p>
                </div>
              </div>

              {/* Period 4: Future */}
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-surface-container-highest border-2 border-surface-container-lowest" />
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[11px] font-semibold bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">
                        Period 4
                      </span>
                      <span className="text-xs text-on-surface-variant">11:10 AM - 12:00 PM</span>
                    </div>
                    <p className="text-sm font-semibold text-on-surface">Grade 10A Physics</p>
                    <p className="text-xs text-on-surface-variant mt-0.5">Room 302</p>
                  </div>
                  <Link
                    href={`/${locale}/dashboard/lessons`}
                    className="border border-outline-variant bg-surface-container-low text-on-surface px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors self-start sm:self-auto"
                  >
                    Prep Material
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Pending Grading Queue (Stitch Screen 11 exact table) */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
            <div className="p-5 border-b border-outline-variant flex justify-between items-center bg-surface-container-low">
              <h3 className="text-sm font-bold text-on-surface flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-primary" />
                {t('pendingGradingQueue')}
              </h3>
              <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded text-xs font-semibold">
                3 Requires Action
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-surface-container-low/60 border-b border-outline-variant text-on-surface-variant uppercase tracking-wider font-semibold">
                    <th className="p-4">Assignment Name</th>
                    <th className="p-4">Class</th>
                    <th className="p-4 w-1/3">Progress</th>
                    <th className="p-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant">
                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-semibold text-on-surface">Kinematics Quiz 1</td>
                    <td className="p-4 text-on-surface-variant">Grade 10A</td>
                    <td className="p-4">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-on-surface-variant">18/25 Graded</span>
                        <span className="text-primary font-bold">72%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div className="bg-primary h-1.5 rounded-full w-[72%]" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/${locale}/dashboard/assignments`}
                        className="border border-primary text-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/5 transition-colors"
                      >
                        Continue
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-semibold text-on-surface">Lab Report: Forces</td>
                    <td className="p-4 text-on-surface-variant">Grade 11B</td>
                    <td className="p-4">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-on-surface-variant">5/20 Graded</span>
                        <span className="text-amber-500 font-bold">25%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div className="bg-amber-500 h-1.5 rounded-full w-[25%]" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/${locale}/dashboard/assignments`}
                        className="bg-primary text-on-primary px-3 py-1.5 rounded-lg font-semibold hover:bg-primary/90 transition-colors shadow-xs"
                      >
                        Grade Now
                      </Link>
                    </td>
                  </tr>

                  <tr className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="p-4 font-semibold text-on-surface">Homework Chapter 3</td>
                    <td className="p-4 text-on-surface-variant">Grade 10B</td>
                    <td className="p-4">
                      <div className="flex items-center justify-between mb-1 text-xs">
                        <span className="text-on-surface-variant">24/25 Graded</span>
                        <span className="text-emerald-600 font-bold">96%</span>
                      </div>
                      <div className="w-full bg-surface-container-highest rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-600 h-1.5 rounded-full w-[96%]" />
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/${locale}/dashboard/assignments`}
                        className="border border-outline-variant text-on-surface px-3 py-1.5 rounded-lg font-semibold hover:bg-surface-container transition-colors"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): My Classes (Stitch Screen 11 Bento) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <h3 className="text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {t('myClasses')}
            </h3>

            <div className="space-y-3">
              {/* Class Card 1 */}
              <div className="border border-outline-variant rounded-xl p-4 hover:border-primary/50 transition-all bg-surface-container-low/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-semibold bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Grade 10A
                    </span>
                    <h4 className="text-sm font-bold text-on-surface mt-1">Physics Core</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs border border-outline-variant">
                    25
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2">
                  <Clock className="w-3.5 h-3.5 text-outline" /> Next class: 11:10 AM
                </div>
              </div>

              {/* Class Card 2 */}
              <div className="border border-outline-variant rounded-xl p-4 hover:border-primary/50 transition-all bg-surface-container-low/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-semibold bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded">
                      Grade 11B
                    </span>
                    <h4 className="text-sm font-bold text-on-surface mt-1">Adv. Physics</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs border border-outline-variant">
                    20
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-primary font-semibold mt-2">
                  <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  In Session Now
                </div>
              </div>

              {/* Class Card 3 */}
              <div className="border border-outline-variant rounded-xl p-4 hover:border-primary/50 transition-all bg-surface-container-low/40">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <span className="text-[11px] font-semibold bg-surface-variant text-on-surface-variant px-2 py-0.5 rounded">
                      Grade 10B
                    </span>
                    <h4 className="text-sm font-bold text-on-surface mt-1">Physics Core</h4>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center font-bold text-xs border border-outline-variant">
                    24
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-on-surface-variant mt-2">
                  <Clock className="w-3.5 h-3.5 text-outline" /> Tomorrow 08:00 AM
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 3. Student Dashboard View — Cloned from Stitch Screen 09 (4b9dedc0)
 * ────────────────────────────────────────────────────────────────────────── */

function StudentDashboardView({
  locale,
  _t,
}: {
  locale: string
  _t: (key: string) => string
}) {
  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-on-surface">
          Good morning, Omar!
        </h2>
        <p className="text-sm text-on-surface-variant mt-1">
          Omar Hatem (Grade 10A) • You have 2 assignments due this week.
        </p>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Today's Timetable */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-on-surface">Today's Timetable</h3>
              <Link
                href={`/${locale}/dashboard/timetable`}
                className="text-xs font-semibold text-primary hover:underline"
              >
                View Full Schedule
              </Link>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2">
              {/* Card 1 */}
              <div className="min-w-[220px] bg-surface-container-low rounded-xl p-4 border border-outline-variant shrink-0 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-bold px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-200">
                    08:00 - 09:30
                  </span>
                </div>
                <h4 className="text-sm font-bold text-on-surface">Physics (HL)</h4>
                <p className="text-xs text-on-surface-variant mb-2">Lab 3 • Mr. Davis</p>
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-semibold bg-emerald-50/80 px-2 py-1 rounded w-fit">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  In Progress
                </div>
              </div>

              {/* Card 2 */}
              <div className="min-w-[220px] bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shrink-0 hover:bg-surface-container-low transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full">
                    09:45 - 11:15
                  </span>
                </div>
                <h4 className="text-sm font-bold text-on-surface">Mathematics</h4>
                <p className="text-xs text-on-surface-variant">Room 102 • Ms. Smith</p>
              </div>

              {/* Card 3 */}
              <div className="min-w-[220px] bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shrink-0 hover:bg-surface-container-low transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[11px] font-semibold px-2 py-0.5 bg-surface-container text-on-surface-variant rounded-full">
                    11:30 - 13:00
                  </span>
                </div>
                <h4 className="text-sm font-bold text-on-surface">World History</h4>
                <p className="text-xs text-on-surface-variant">Room 205 • Dr. Allen</p>
              </div>
            </div>
          </section>

          {/* Upcoming Assignments */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <h3 className="text-base font-bold text-on-surface mb-4">
              Upcoming Assignments &amp; Homework
            </h3>
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0 border border-red-200">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Physics Lab Report: Kinematics
                    </h4>
                    <p className="text-xs text-on-surface-variant">Physics (HL) • Mr. Davis</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 bg-red-50 text-red-700 border border-red-200 rounded">
                      Due Tomorrow, 11:59 PM
                    </span>
                  </div>
                </div>
                <Link
                  href={`/${locale}/dashboard/assignments`}
                  className="bg-primary text-on-primary px-4 py-2 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs whitespace-nowrap self-start sm:self-auto"
                >
                  Start Submission
                </Link>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border border-outline-variant rounded-xl hover:bg-surface-container-low transition-colors gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container text-on-surface-variant flex items-center justify-center shrink-0 border border-outline-variant">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface">
                      Calculus Worksheet Ch. 4
                    </h4>
                    <p className="text-xs text-on-surface-variant">Mathematics • Ms. Smith</p>
                    <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 bg-surface-container text-on-surface-variant border border-outline-variant rounded">
                      Due in 3 days
                    </span>
                  </div>
                </div>
                <Link
                  href={`/${locale}/dashboard/assignments`}
                  className="border border-outline-variant text-on-surface px-4 py-2 rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors whitespace-nowrap self-start sm:self-auto"
                >
                  Start Submission
                </Link>
              </div>
            </div>
          </section>

          {/* Recent Quiz Results */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <h3 className="text-base font-bold text-on-surface mb-4">
              Recent Quiz Results
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 border border-outline-variant rounded-xl flex items-center justify-between bg-surface-container-low/40">
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                    World History
                  </p>
                  <h4 className="text-sm font-bold text-on-surface">Chapter 5 Quiz</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-emerald-600">92%</span>
                  <p className="text-xs font-semibold text-on-surface-variant">Grade A-</p>
                </div>
              </div>

              <div className="p-4 border border-outline-variant rounded-xl flex items-center justify-between bg-surface-container-low/40">
                <div>
                  <p className="text-[11px] font-bold text-on-surface-variant uppercase tracking-wider mb-0.5">
                    Chemistry
                  </p>
                  <h4 className="text-sm font-bold text-on-surface">Mid-Term Assessment</h4>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">88%</span>
                  <p className="text-xs font-semibold text-on-surface-variant">Grade B+</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column (4 cols): Attendance Meter & Announcements */}
        <div className="lg:col-span-4 space-y-6">
          {/* Attendance Meter (Stitch Screen 09 radial gauge) */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col items-center justify-center text-center shadow-xs">
            <h3 className="text-sm font-bold text-on-surface mb-4 self-start">
              My Attendance Rate
            </h3>
            <div className="relative w-40 h-40 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  className="text-surface-container"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="45"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-emerald-500"
                  cx="50"
                  cy="50"
                  fill="transparent"
                  r="45"
                  stroke="currentColor"
                  strokeDasharray="282.7"
                  strokeDashoffset="9.89"
                  strokeWidth="8"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-on-surface">96.5%</span>
                <span className="text-xs font-semibold text-emerald-600">Present</span>
              </div>
            </div>
            <p className="text-xs text-on-surface-variant mt-3">
              You have 2 absences recorded this semester.
            </p>
          </section>

          {/* School Announcements */}
          <section className="bg-surface-container-lowest rounded-xl border border-outline-variant p-6 shadow-xs">
            <h3 className="text-sm font-bold text-on-surface mb-4">
              School Announcements
            </h3>
            <div className="flex gap-3 pb-3 border-b border-outline-variant">
              <div className="flex flex-col items-center justify-center w-11 h-11 rounded-lg bg-primary/10 text-primary shrink-0">
                <span className="text-[10px] font-bold">OCT</span>
                <span className="text-sm font-bold leading-none">15</span>
              </div>
              <div>
                <h4 className="text-xs font-bold text-on-surface hover:text-primary cursor-pointer transition-colors">
                  Science Fair Registration Deadline
                </h4>
                <p className="text-[11px] text-on-surface-variant line-clamp-2 mt-0.5">
                  Register all projects via the student portal before 5 PM.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

/* ──────────────────────────────────────────────────────────────────────────
 * 4. Parent Dashboard View — Cloned from Stitch Screen 07 (084087e0)
 * ────────────────────────────────────────────────────────────────────────── */

function ParentDashboardView({
  locale,
  t,
}: {
  locale: string
  t: (key: string) => string
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-on-surface">
            {t('parentGreeting')}
          </h2>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('parentSubtitle')}
          </p>
        </div>
        <Link
          href={`/${locale}/dashboard/children`}
          className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
        >
          View 360° Child Portal
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-semibold text-on-surface-variant uppercase">
            Active Children
          </span>
          <div className="text-3xl font-bold text-on-surface mt-2">2</div>
          <p className="text-xs text-on-surface-variant mt-1">
            Omar Hatem (Grade 10A), Layla Hatem (Grade 6B)
          </p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-semibold text-on-surface-variant uppercase">
            Average Attendance
          </span>
          <div className="text-3xl font-bold text-emerald-600 mt-2">97.2%</div>
          <p className="text-xs text-on-surface-variant mt-1">Excellent attendance standing</p>
        </div>

        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
          <span className="text-xs font-semibold text-on-surface-variant uppercase">
            Pending Permission Slips
          </span>
          <div className="text-3xl font-bold text-primary mt-2">0</div>
          <p className="text-xs text-on-surface-variant mt-1">All forms signed for Term 1</p>
        </div>
      </div>
    </div>
  )
}
