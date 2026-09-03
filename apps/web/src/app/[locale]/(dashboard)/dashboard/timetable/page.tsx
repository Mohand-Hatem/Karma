'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import {
  Calendar,
  Clock,
  Printer,
  Upload,
  AlertTriangle,
  GripVertical,
  Plus,
  Coffee,
  CheckCircle2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  User,
  MapPin,
  Eye,
  Users,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type TimetableDay = 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday'

export interface TimetableSlot {
  id: string
  day: TimetableDay
  periodIndex: number // 1 to 5
  subject: string
  teacher: string
  room: string
  color: 'primary' | 'secondary' | 'tertiary' | 'emerald'
  hasConflict?: boolean
  conflictMessage?: string
}

export type EventCategory = 'School' | 'Holiday' | 'Exam' | 'Meeting'

export interface SchoolEvent {
  id: string
  title: string
  category: EventCategory
  day: number // Day of month 1 to 31
  time: string
  audience: string
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Data (cloned from Stitch screens 16 & 26)
 * ────────────────────────────────────────────────────────────────────────── */

const TIMETABLE_PERIODS = [
  { index: 1, time: '08:00', label: 'Period 1' },
  { index: 2, time: '09:15', label: 'Period 2' },
  { index: 3, time: '10:30', label: 'Period 3' },
  { index: 4, time: '12:00', label: 'Period 4' },
  { index: 5, time: '13:15', label: 'Period 5' },
]

const INITIAL_SLOTS: TimetableSlot[] = [
  // Period 1 (08:00)
  {
    id: 's-1',
    day: 'Sunday',
    periodIndex: 1,
    subject: 'Advanced Calculus',
    teacher: 'Dr. A. Turing',
    room: 'Room 302',
    color: 'primary',
  },
  {
    id: 's-2',
    day: 'Tuesday',
    periodIndex: 1,
    subject: 'Physics 101',
    teacher: 'Prof. R. Feynman',
    room: 'Room 302 (Conflict)',
    color: 'secondary',
    hasConflict: true,
    conflictMessage: 'Double Booked Room 302 with Grade 11A!',
  },
  {
    id: 's-3',
    day: 'Wednesday',
    periodIndex: 1,
    subject: 'World Literature',
    teacher: 'Mrs. V. Woolf',
    room: 'Library Rm A',
    color: 'tertiary',
  },

  // Period 2 (09:15)
  {
    id: 's-4',
    day: 'Sunday',
    periodIndex: 2,
    subject: 'Organic Chemistry',
    teacher: 'Dr. M. Curie',
    room: 'Science Lab B',
    color: 'emerald',
  },
  {
    id: 's-5',
    day: 'Monday',
    periodIndex: 2,
    subject: 'World History',
    teacher: 'Mr. E. Hobsbawm',
    room: 'Room 204',
    color: 'primary',
  },
  {
    id: 's-6',
    day: 'Tuesday',
    periodIndex: 2,
    subject: 'Applied Computing',
    teacher: 'Eng. K. Thompson',
    room: 'Computer Lab 1',
    color: 'primary',
  },
  {
    id: 's-7',
    day: 'Thursday',
    periodIndex: 2,
    subject: 'English Rhetoric',
    teacher: 'Mrs. V. Woolf',
    room: 'Room 105',
    color: 'tertiary',
  },

  // Period 3 (10:30)
  {
    id: 's-8',
    day: 'Monday',
    periodIndex: 3,
    subject: 'Advanced Calculus',
    teacher: 'Dr. A. Turing',
    room: 'Room 302',
    color: 'primary',
  },
  {
    id: 's-9',
    day: 'Wednesday',
    periodIndex: 3,
    subject: 'Physical Education',
    teacher: 'Coach S. Taylor',
    room: 'Sports Arena',
    color: 'secondary',
  },
  {
    id: 's-10',
    day: 'Thursday',
    periodIndex: 3,
    subject: 'Arabic Literature',
    teacher: 'Mr. T. Hussein',
    room: 'Room 201',
    color: 'emerald',
  },

  // Period 4 (12:00)
  {
    id: 's-11',
    day: 'Sunday',
    periodIndex: 4,
    subject: 'Islamic Studies',
    teacher: 'Sheikh O. Farooq',
    room: 'Hall A',
    color: 'tertiary',
  },
  {
    id: 's-12',
    day: 'Tuesday',
    periodIndex: 4,
    subject: 'French Language',
    teacher: 'Mme. C. Deneuve',
    room: 'Language Lab',
    color: 'secondary',
  },

  // Period 5 (13:15)
  {
    id: 's-13',
    day: 'Monday',
    periodIndex: 5,
    subject: 'Fine Arts & Design',
    teacher: 'Ms. G. O’Keeffe',
    room: 'Studio 4',
    color: 'emerald',
  },
  {
    id: 's-14',
    day: 'Wednesday',
    periodIndex: 5,
    subject: 'Physics Tutorial',
    teacher: 'Prof. R. Feynman',
    room: 'Room 204',
    color: 'primary',
  },
]

const INITIAL_EVENTS: SchoolEvent[] = [
  { id: 'e-1', title: 'Fall Term Welcome Assembly', category: 'School', day: 2, time: '08:30 AM', audience: 'All School' },
  { id: 'e-2', title: 'Calculus Midterm Examination', category: 'Exam', day: 14, time: '10:00 AM', audience: 'Grade 10 & 11' },
  { id: 'e-3', title: 'Parent-Teacher Consultations', category: 'Meeting', day: 18, time: '04:00 PM', audience: 'Parents' },
  { id: 'e-4', title: 'National Commemoration Day', category: 'Holiday', day: 24, time: 'All Day', audience: 'All School' },
  { id: 'e-5', title: 'STEM Robotics Showcase', category: 'School', day: 28, time: '01:00 PM', audience: 'High School' },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: TimetablePage
 * ────────────────────────────────────────────────────────────────────────── */

export default function TimetablePage() {
  const t = useTranslations('features.timetable')

  // Main Active Tab
  const [activeTab, setActiveTab] = useState<'timetable' | 'calendar'>('timetable')

  // Timetable State
  const [slots] = useState<TimetableSlot[]>(INITIAL_SLOTS)
  const [viewMode, setViewMode] = useState('By Class')
  const [cohort, setCohort] = useState('Grade 10 - Alpha')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Calendar State
  const [events, setEvents] = useState<SchoolEvent[]>(INITIAL_EVENTS)
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month')
  const [isEventDrawerOpen, setIsEventDrawerOpen] = useState(false)

  // Event Form State
  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventCategory, setNewEventCategory] = useState<EventCategory>('School')
  const [newEventDay, setNewEventDay] = useState('15')
  const [newEventTime, setNewEventTime] = useState('10:00 AM')
  const [newEventAudience, setNewEventAudience] = useState('All School')

  const handlePublish = () => {
    setToastMessage(t('publishSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  const handlePrint = () => {
    window.print()
  }

  const handleCreateEventSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return

    const newEvent: SchoolEvent = {
      id: `e-${Date.now()}`,
      title: newEventTitle.trim(),
      category: newEventCategory,
      day: parseInt(newEventDay) || 15,
      time: newEventTime.trim() || '09:00 AM',
      audience: newEventAudience,
    }

    setEvents([...events, newEvent])
    setIsEventDrawerOpen(false)
    setNewEventTitle('')
    setToastMessage(t('eventCreatedSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  const DAYS: TimetableDay[] = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday']

  return (
    <div className="space-y-6 pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header & Tab Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <Calendar className="w-7 h-7 text-primary" />
            {activeTab === 'timetable' ? t('title') : 'School Events Calendar'}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('subtitle')}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="bg-surface-container-high rounded-xl p-1 flex border border-outline-variant/60 shadow-xs self-start sm:self-auto">
          <button
            onClick={() => setActiveTab('timetable')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'timetable'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>{t('timetableTab')}</span>
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === 'calendar'
                ? 'bg-surface-container-lowest text-primary shadow-sm border border-outline-variant/40'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <CalendarDays className="w-4 h-4" />
            <span>{t('calendarTab')}</span>
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 1: TIMETABLE MATRIX (Stitch Screen 16 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'timetable' && (
        <div className="space-y-4">
          {/* Controls & Filter Bar (Stitch Screen 16 exact layout) */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 bg-surface-container-lowest p-3 rounded-xl border border-outline-variant shadow-xs">
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter: View Mode */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <Eye className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={viewMode}
                  onChange={(e) => setViewMode(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer"
                >
                  <option value="By Class">{t('byClass')}</option>
                  <option value="By Teacher">{t('byTeacher')}</option>
                  <option value="By Room">{t('byRoom')}</option>
                </select>
              </div>

              {/* Filter: Academic Year */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <Calendar className="w-4 h-4 text-on-surface-variant" />
                <select className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer">
                  <option>AY 2026-27 (Active)</option>
                  <option>AY 2025-26</option>
                </select>
              </div>

              {/* Filter: Cohort */}
              <div className="flex items-center gap-2 px-2.5 py-1 bg-surface-container-low rounded-lg border border-outline-variant/60">
                <Users className="w-4 h-4 text-on-surface-variant" />
                <select
                  value={cohort}
                  onChange={(e) => setCohort(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-on-surface outline-none cursor-pointer"
                >
                  <option value="Grade 10 - Alpha">Grade 10 - Alpha</option>
                  <option value="Grade 10 - Beta">Grade 10 - Beta</option>
                  <option value="Grade 11 - Science">Grade 11 - Science</option>
                </select>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2.5 self-end xl:self-auto">
              <button
                onClick={handlePrint}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container-high transition-colors shadow-xs"
                title="Print Schedule"
              >
                <Printer className="w-4 h-4 text-on-surface-variant" />
                <span>{t('print')}</span>
              </button>

              <button
                onClick={handlePublish}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm"
              >
                <Upload className="w-4 h-4" />
                <span>{t('publish')}</span>
              </button>
            </div>
          </div>

          {/* Timetable Grid Container (Horizontal scroll on mobile, Stitch exact matrix) */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto min-w-[850px]">
              {/* Day Columns Header */}
              <div className="grid grid-cols-[110px_repeat(5,1fr)] bg-surface-container-low border-b border-outline-variant text-xs font-semibold text-on-surface">
                <div className="p-3 text-center border-r border-outline-variant text-outline uppercase tracking-wider">
                  Time
                </div>
                {DAYS.map((day) => {
                  const isToday = day === 'Tuesday'
                  return (
                    <div
                      key={day}
                      className={`p-3 text-center border-r border-outline-variant last:border-r-0 relative ${
                        isToday ? 'bg-primary/5 font-bold' : ''
                      }`}
                    >
                      {isToday && (
                        <div className="absolute top-0 left-0 right-0 h-1 bg-primary" />
                      )}
                      <span>{day}</span>
                      {isToday && (
                        <span className="ml-2 px-2 py-0.5 bg-primary text-on-primary rounded-full text-[10px] font-bold">
                          {t('today')}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Rows */}
              <div className="divide-y divide-outline-variant">
                {TIMETABLE_PERIODS.map((period) => (
                  <div key={period.index}>
                    {/* Period Row */}
                    <div className="grid grid-cols-[110px_repeat(5,1fr)] min-h-[105px]">
                      {/* Time Label */}
                      <div className="p-3 flex flex-col items-center justify-center border-r border-outline-variant bg-surface-container-low/40">
                        <span className="text-xs font-bold text-on-surface">
                          {period.time}
                        </span>
                        <span className="text-[11px] text-outline font-medium">
                          {period.label}
                        </span>
                      </div>

                      {/* 5 Day Cells */}
                      {DAYS.map((day) => {
                        const slot = slots.find(
                          (s) => s.day === day && s.periodIndex === period.index
                        )

                        return (
                          <div
                            key={`${day}-${period.index}`}
                            className="p-2 border-r border-outline-variant last:border-r-0 relative group/cell hover:bg-surface-container-low/30 transition-colors"
                          >
                            {slot ? (
                              <div
                                className={`p-3 rounded-lg border transition-all relative h-full flex flex-col justify-between shadow-xs ${
                                  slot.hasConflict
                                    ? 'bg-red-50 border-red-300 text-red-950 ring-1 ring-red-400'
                                    : slot.color === 'primary'
                                      ? 'bg-primary/10 border-primary/20 text-on-surface'
                                      : slot.color === 'secondary'
                                        ? 'bg-secondary-container/40 border-secondary-fixed text-on-surface'
                                        : slot.color === 'emerald'
                                          ? 'bg-emerald-50 border-emerald-200 text-on-surface'
                                          : 'bg-amber-50 border-amber-200 text-on-surface'
                                }`}
                              >
                                {/* Conflict Alert Badge */}
                                {slot.hasConflict && (
                                  <div
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md border-2 border-surface-container-lowest animate-pulse"
                                    title={slot.conflictMessage}
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" />
                                  </div>
                                )}

                                <div className="flex items-start justify-between gap-1">
                                  <h4 className="text-xs font-bold leading-tight">
                                    {slot.subject}
                                  </h4>
                                  <GripVertical className="w-3.5 h-3.5 text-outline opacity-0 group-hover/cell:opacity-100 transition-opacity shrink-0 cursor-grab" />
                                </div>

                                <div className="space-y-0.5 mt-2 text-[11px] text-on-surface-variant font-medium">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-outline" />
                                    <span className="truncate">{slot.teacher}</span>
                                  </div>
                                  <div
                                    className={`flex items-center gap-1 ${
                                      slot.hasConflict ? 'text-red-700 font-bold' : ''
                                    }`}
                                  >
                                    <MapPin className="w-3 h-3 text-outline" />
                                    <span className="truncate">{slot.room}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="w-full h-full rounded-lg border-2 border-dashed border-transparent hover:border-outline-variant/60 flex items-center justify-center transition-colors">
                                <button
                                  onClick={() => {
                                    setToastMessage(`Adding session for ${day} ${period.label}`)
                                    setTimeout(() => setToastMessage(null), 3000)
                                  }}
                                  className="w-6 h-6 rounded-full bg-surface-container text-outline hover:text-primary hover:bg-primary/10 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-all"
                                  title="Add Subject"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>

                    {/* Morning Break Divider between Period 1 and Period 2 */}
                    {period.index === 1 && (
                      <div className="grid grid-cols-[110px_1fr] bg-surface-container-high/60 border-y border-outline-variant">
                        <div className="p-1.5 text-center border-r border-outline-variant text-[11px] font-bold text-on-surface-variant">
                          09:00
                        </div>
                        <div className="p-1.5 flex items-center justify-center gap-2 text-[11px] font-bold text-on-surface-variant uppercase tracking-widest">
                          <Coffee className="w-3.5 h-3.5 text-primary" />
                          <span>{t('morningBreak')} (15 mins)</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * TAB 2: SCHOOL EVENTS CALENDAR (Stitch Screen 26 exact clone)
       * ────────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'calendar' && (
        <div className="space-y-4">
          {/* Calendar Header Controls (Stitch Screen 26 exact controls) */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest rounded-xl p-4 border border-outline-variant shadow-xs">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-on-surface">October 2026</h2>
              <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/60">
                <button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button className="px-3 py-1 text-xs font-semibold text-on-surface">
                  {t('today')}
                </button>
                <button className="p-1 rounded hover:bg-surface-container-high transition-colors text-on-surface-variant">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
              <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/60">
                <button
                  onClick={() => setCalendarView('month')}
                  className={`px-3.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    calendarView === 'month'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('month')}
                </button>
                <button
                  onClick={() => setCalendarView('week')}
                  className={`px-3.5 py-1 rounded-md text-xs font-semibold transition-colors ${
                    calendarView === 'week'
                      ? 'bg-surface-container-lowest text-primary shadow-xs'
                      : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  {t('week')}
                </button>
              </div>

              <button
                onClick={() => setIsEventDrawerOpen(true)}
                className="px-4 py-2 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                {t('createEvent')}
              </button>
            </div>
          </div>

          {/* Legend & Categories */}
          <div className="flex flex-wrap items-center gap-4 px-1 text-xs font-semibold text-on-surface-variant">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-primary" />
              <span>{t('schoolEvents')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
              <span>{t('holidays')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span>{t('exams')}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
              <span>{t('parentMeetings')}</span>
            </div>
          </div>

          {/* 7x5 Calendar Grid */}
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
            {/* Days Header */}
            <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low text-center text-xs font-bold text-on-surface-variant uppercase tracking-wider py-2.5">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* 35 Days Matrix */}
            <div className="grid grid-cols-7 border-collapse divide-x divide-y divide-outline-variant/60">
              {Array.from({ length: 35 }).map((_, idx) => {
                const dayNum = idx + 1 <= 31 ? idx + 1 : idx + 1 - 31
                const isCurrentMonth = idx + 1 <= 31
                const dayEvents = events.filter((e) => e.day === dayNum && isCurrentMonth)

                return (
                  <div
                    key={idx}
                    className={`min-h-[105px] p-2 flex flex-col justify-between transition-colors hover:bg-surface-container-low/40 ${
                      !isCurrentMonth ? 'opacity-40 bg-surface-container-low/20' : ''
                    }`}
                  >
                    <span className="text-xs font-bold text-on-surface self-end">
                      {dayNum}
                    </span>

                    <div className="space-y-1 mt-1 flex-1">
                      {dayEvents.map((evt) => (
                        <div
                          key={evt.id}
                          className={`px-2 py-1 rounded text-[11px] font-bold truncate leading-tight shadow-xs ${
                            evt.category === 'School'
                              ? 'bg-primary/10 text-primary border border-primary/20'
                              : evt.category === 'Holiday'
                                ? 'bg-red-50 text-red-700 border border-red-200'
                                : evt.category === 'Exam'
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-purple-50 text-purple-700 border border-purple-200'
                          }`}
                        >
                          {evt.title}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Create Event Drawer
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isEventDrawerOpen}
        onClose={() => setIsEventDrawerOpen(false)}
        title={t('createEvent')}
        maxWidth="md"
      >
        <form onSubmit={handleCreateEventSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('eventTitle')} *
            </label>
            <input
              type="text"
              required
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g. Science Fair Presentation"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('eventCategory')}
              </label>
              <select
                value={newEventCategory}
                onChange={(e) => setNewEventCategory(e.target.value as EventCategory)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="School">{t('schoolEvents')}</option>
                <option value="Holiday">{t('holidays')}</option>
                <option value="Exam">{t('exams')}</option>
                <option value="Meeting">{t('parentMeetings')}</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('eventDate')} (Day of Month)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={newEventDay}
                onChange={(e) => setNewEventDay(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('eventTime')}
              </label>
              <input
                type="text"
                value={newEventTime}
                onChange={(e) => setNewEventTime(e.target.value)}
                placeholder="10:00 AM"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('targetAudience')}
              </label>
              <input
                type="text"
                value={newEventAudience}
                onChange={(e) => setNewEventAudience(e.target.value)}
                placeholder="All School"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsEventDrawerOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              {t('saveEvent')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
