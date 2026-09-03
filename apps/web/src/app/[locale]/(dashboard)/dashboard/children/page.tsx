'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  HeartHandshake,
  Award,
  Clock,
  Sparkles,
  Calendar,
  BookOpen,
  Mail,
  Phone,
  CheckCircle2,
  CalendarDays,
  User,
} from 'lucide-react'
import {
  MiniSparkline,
  MiniAttendanceBars,
} from '../../../../../components/ui/data-viz'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export interface GradeEntry {
  id: string
  subject: string
  teacher: string
  assessment: string
  score: number
  letterGrade: string
  feedback: string
  iconName: 'math' | 'physics' | 'literature' | 'chemistry'
}

export interface UpcomingEvent {
  id: string
  dateMonth: string
  dateDay: string
  title: string
  location: string
  time: string
  isUrgent?: boolean
}

export interface ChildDashboardData {
  id: string
  name: string
  nameAr: string
  code: string
  gradeClass: string
  grade: number
  section: string
  avatarUrl?: string
  gpa: number
  letterGrade: string
  classPercentile: number
  attendanceRate: number
  absencesCount: number
  missingSubmissions: number
  homeroomTeacher: {
    name: string
    title: string
    email: string
    phone: string
    avatarInitials: string
  }
  recentGrades: GradeEntry[]
  upcomingExams: UpcomingEvent[]
  attendanceBreakdown: {
    present: number
    late: number
    excused: number
  }
}

/* ──────────────────────────────────────────────────────────────────────────
 * Mock Children Data (cloned from Stitch screen 07_parent_dashboard 084087e0)
 * ────────────────────────────────────────────────────────────────────────── */

const CHILDREN_DATA: ChildDashboardData[] = [
  {
    id: 'ch-1',
    name: 'Omar Hatem',
    nameAr: 'عمر حاتم',
    code: 'STU-24-1042',
    gradeClass: 'Gr 10A',
    grade: 10,
    section: 'A',
    gpa: 3.85,
    letterGrade: 'A',
    classPercentile: 15,
    attendanceRate: 96.2,
    absencesCount: 2,
    missingSubmissions: 0,
    homeroomTeacher: {
      name: 'Mr. Ahmed Hassan',
      title: 'Senior Physics & Homeroom Teacher',
      email: 'ahmed.hassan@karma-edu.com',
      phone: '+971 50 234 5678',
      avatarInitials: 'AH',
    },
    recentGrades: [
      {
        id: 'g-1',
        subject: 'Advanced Mathematics',
        teacher: 'Dr. Tariq Mansour',
        assessment: 'Term 1 Calculus Midterm Exam',
        score: 92,
        letterGrade: 'A-',
        feedback: 'Omar shows great improvement in differential limits and calculus concepts. Keep up the high diligence.',
        iconName: 'math',
      },
      {
        id: 'g-2',
        subject: 'Physics (HL)',
        teacher: 'Mr. Ahmed Hassan',
        assessment: 'Lab Report 4 — Electromagnetism',
        score: 88,
        letterGrade: 'B+',
        feedback: 'Excellent experimental methodology and rigorous error margin calculations. Needs slightly more detail in theoretical conclusion.',
        iconName: 'physics',
      },
      {
        id: 'g-3',
        subject: 'World Literature',
        teacher: 'Elena Rostova',
        assessment: 'Comparative Rhetoric Essay',
        score: 95,
        letterGrade: 'A',
        feedback: 'Superb textual analysis and nuanced comparative thesis. A model essay for the seminar cohort.',
        iconName: 'literature',
      },
    ],
    upcomingExams: [
      {
        id: 'u-1',
        dateMonth: 'OCT',
        dateDay: '14',
        title: 'History Midterm Examination',
        location: 'Room 302 • Main Academic Hall',
        time: '10:00 AM - 11:30 AM',
        isUrgent: true,
      },
      {
        id: 'u-2',
        dateMonth: 'OCT',
        dateDay: '18',
        title: 'English Literature Essay Draft',
        location: 'Submit via Portal Assignment Hub',
        time: 'Due 11:59 PM',
        isUrgent: false,
      },
      {
        id: 'u-3',
        dateMonth: 'NOV',
        dateDay: '02',
        title: 'Chemistry Organic Synthesis Practical',
        location: 'Science Block Lab C1',
        time: '08:30 AM - 10:00 AM',
        isUrgent: false,
      },
    ],
    attendanceBreakdown: {
      present: 82,
      late: 2,
      excused: 2,
    },
  },
  {
    id: 'ch-2',
    name: 'Sara Hatem',
    nameAr: 'سارة حاتم',
    code: 'STU-24-0719',
    gradeClass: 'Gr 7B',
    grade: 7,
    section: 'B',
    gpa: 3.92,
    letterGrade: 'A+',
    classPercentile: 8,
    attendanceRate: 98.8,
    absencesCount: 1,
    missingSubmissions: 0,
    homeroomTeacher: {
      name: 'Dr. Sarah Williams',
      title: 'General Science & Middle School Advisor',
      email: 'sarah.williams@karma-edu.com',
      phone: '+971 52 789 0123',
      avatarInitials: 'SW',
    },
    recentGrades: [
      {
        id: 'g-4',
        subject: 'Middle School Science',
        teacher: 'Dr. Sarah Williams',
        assessment: 'Ecosystem & Biodiversity Quiz',
        score: 96,
        letterGrade: 'A+',
        feedback: 'Sara demonstrates profound curiosity and meticulous notes in natural ecosystems and ecology.',
        iconName: 'chemistry',
      },
      {
        id: 'g-5',
        subject: 'Pre-Algebra & Geometry',
        teacher: 'Mr. David Miller',
        assessment: 'Linear Equations Assessment',
        score: 90,
        letterGrade: 'A-',
        feedback: 'Solid problem-solving steps and geometric proofs. Excellent class participation.',
        iconName: 'math',
      },
    ],
    upcomingExams: [
      {
        id: 'u-4',
        dateMonth: 'OCT',
        dateDay: '16',
        title: 'Middle School STEM Science Fair Poster',
        location: 'Exhibition Hall B',
        time: 'Due 09:00 AM',
        isUrgent: true,
      },
      {
        id: 'u-5',
        dateMonth: 'OCT',
        dateDay: '24',
        title: 'Arabic Language Grammar Quiz',
        location: 'Room 104',
        time: '11:00 AM - 11:45 AM',
        isUrgent: false,
      },
    ],
    attendanceBreakdown: {
      present: 84,
      late: 1,
      excused: 1,
    },
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: ChildrenPage (Parent Monitoring Dashboard)
 * ────────────────────────────────────────────────────────────────────────── */

export default function ChildrenPage() {
  const t = useTranslations('features.children')
  const [selectedChildId, setSelectedChildId] = useState<string>(CHILDREN_DATA[0].id)

  const activeChild = CHILDREN_DATA.find((c) => c.id === selectedChildId) || CHILDREN_DATA[0]

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header & Child Segmented Switcher (Stitch Screen 07_parent_dashboard 084087e0) */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <HeartHandshake className="w-7 h-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('parentSubtitle', { count: CHILDREN_DATA.length })}
          </p>
        </div>

        {/* Segmented Control for Child Switcher */}
        <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs self-start md:self-auto">
          {CHILDREN_DATA.map((child) => {
            const isSelected = child.id === activeChild.id
            return (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  isSelected
                    ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-primary" />
                <span>{child.name}</span>
                <span className="text-xs text-outline font-normal">({child.gradeClass})</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Top Row Bento Metrics Cards (Stitch exact layout) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Overall GPA */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('overallGrade')}
            </span>
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold text-on-surface">{activeChild.gpa}</span>
                <span className="text-sm font-bold text-secondary bg-secondary-container px-2 py-0.5 rounded border border-secondary-fixed">
                  {activeChild.letterGrade}
                </span>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {t('topPercentile', { percent: activeChild.classPercentile })}
              </p>
            </div>
            <MiniSparkline
              data={[3.60, 3.72, 3.78, 3.82, activeChild.gpa]}
              width={68}
              height={22}
              ariaLabel={`GPA progression: steady increase to ${activeChild.gpa}`}
            />
          </div>
        </div>

        {/* Metric 2: Term Attendance */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('attendanceRate')}
            </span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div>
              <span className="text-3xl font-bold text-on-surface">
                {activeChild.attendanceRate}%
              </span>
              <p className="text-xs text-on-surface-variant mt-1">
                {t('absencesCount', { count: activeChild.absencesCount })}
              </p>
            </div>
            <MiniAttendanceBars
              days={[95, 96, 94, 98, activeChild.attendanceRate]}
              height={22}
              ariaLabel={`Weekly attendance rates: average ${activeChild.attendanceRate}%`}
            />
          </div>
        </div>

        {/* Metric 3: Missing Submissions */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 shadow-xs">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              {t('missingSubmissions')}
            </span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg border border-amber-100">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-end justify-between gap-2 mt-auto">
            <div>
              <span className="text-3xl font-bold text-on-surface">
                {activeChild.missingSubmissions}
              </span>
              <p className="text-xs text-emerald-700 font-medium mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                {t('allCaughtUp')}
              </p>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              100% On Time
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column (Published Grades & Upcoming Exams) + Right Column (Attendance & Advisor) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Published Grades Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="text-base font-semibold text-on-surface flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                {t('recentGrades')}
              </h3>
              <span className="text-xs font-semibold text-primary">{activeChild.gradeClass}</span>
            </div>

            <div className="divide-y divide-outline-variant">
              {activeChild.recentGrades.map((entry) => (
                <div
                  key={entry.id}
                  className="p-4 hover:bg-surface-container-low/50 transition-colors flex flex-col sm:flex-row gap-4 justify-between"
                >
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary-fixed flex items-center justify-center text-on-primary-fixed shrink-0 font-bold text-sm">
                      {entry.subject.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-on-surface">
                        {entry.subject}
                      </h4>
                      <p className="text-xs text-on-surface-variant mt-0.5">
                        {entry.teacher} • {entry.assessment}
                      </p>
                      <p className="text-xs text-on-surface mt-2 italic bg-surface-container-low p-2 rounded-md border border-outline-variant/40">
                        "{entry.feedback}"
                      </p>
                    </div>
                  </div>

                  <div className="text-right sm:self-center shrink-0">
                    <div className="text-xl font-bold text-on-surface">{entry.score}%</div>
                    <div className="text-xs font-semibold text-secondary bg-secondary-container inline-block px-2 py-0.5 rounded mt-0.5 border border-secondary-fixed">
                      {entry.letterGrade}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Exams & Due Dates */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
              <h3 className="text-base font-semibold text-on-surface flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary" />
                {t('upcomingExams')}
              </h3>
              <span className="text-xs text-outline font-medium">Term 1 Schedule</span>
            </div>

            <div className="p-4 space-y-3">
              {activeChild.upcomingExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex items-start gap-3.5 p-3 rounded-lg bg-surface-container-low border border-outline-variant/60 hover:bg-surface-container transition-colors"
                >
                  <div className="w-12 flex flex-col items-center justify-center bg-surface-container-lowest rounded-lg border border-outline-variant py-1 shrink-0">
                    <span
                      className={`text-[10px] font-bold ${
                        exam.isUrgent ? 'text-error' : 'text-primary'
                      }`}
                    >
                      {exam.dateMonth}
                    </span>
                    <span className="text-base font-bold text-on-surface leading-none mt-0.5">
                      {exam.dateDay}
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-on-surface truncate">
                      {exam.title}
                    </h4>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      {exam.location}
                    </p>
                  </div>

                  <span className="text-xs font-medium text-outline bg-surface-container-lowest px-2 py-1 rounded border border-outline-variant shrink-0">
                    {exam.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (col-span-5) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Homeroom Teacher Contact Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              Homeroom Advisor
            </h3>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold text-sm shrink-0 border border-outline-variant">
                {activeChild.homeroomTeacher.avatarInitials}
              </div>
              <div>
                <h4 className="text-sm font-semibold text-on-surface">
                  {activeChild.homeroomTeacher.name}
                </h4>
                <p className="text-xs text-on-surface-variant">
                  {activeChild.homeroomTeacher.title}
                </p>
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-outline-variant">
              <a
                href={`mailto:${activeChild.homeroomTeacher.email}`}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                <Mail className="w-3.5 h-3.5" />
                {t('contactTeacher')}
              </a>

              <a
                href={`tel:${activeChild.homeroomTeacher.phone}`}
                className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-outline-variant text-on-surface text-xs font-medium hover:bg-surface-container-low transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-outline" />
                <span>{activeChild.homeroomTeacher.phone}</span>
              </a>
            </div>
          </div>

          {/* Attendance Breakdown Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-5 shadow-xs">
            <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
              <CalendarDays className="w-4 h-4 text-primary" />
              Attendance Record (Term 1)
            </h3>

            <div className="grid grid-cols-3 gap-2 text-center mb-4">
              <div className="bg-emerald-50 rounded-lg p-2.5 border border-emerald-100">
                <span className="text-lg font-bold text-emerald-800">
                  {activeChild.attendanceBreakdown.present}
                </span>
                <span className="text-[11px] text-emerald-700 block font-medium mt-0.5">
                  Present Days
                </span>
              </div>

              <div className="bg-amber-50 rounded-lg p-2.5 border border-amber-100">
                <span className="text-lg font-bold text-amber-800">
                  {activeChild.attendanceBreakdown.late}
                </span>
                <span className="text-[11px] text-amber-700 block font-medium mt-0.5">
                  Late Days
                </span>
              </div>

              <div className="bg-blue-50 rounded-lg p-2.5 border border-blue-100">
                <span className="text-lg font-bold text-blue-800">
                  {activeChild.attendanceBreakdown.excused}
                </span>
                <span className="text-[11px] text-blue-700 block font-medium mt-0.5">
                  Excused Days
                </span>
              </div>
            </div>

            <div className="w-full bg-surface-container-high rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-full"
                style={{ width: `${activeChild.attendanceRate}%` }}
              />
              <div
                className="bg-amber-500 h-full"
                style={{ width: `${100 - activeChild.attendanceRate}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-on-surface-variant mt-2">
              <span>Overall attendance compliance</span>
              <span className="font-bold text-on-surface">{activeChild.attendanceRate}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
