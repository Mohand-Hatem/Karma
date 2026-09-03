'use client'

import { useState } from 'react'
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Plus,
  CheckCircle2,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { useShellStore } from '../../../../../stores/shell-store'

interface CalendarEvent {
  id: string
  day: number
  title: string
  type: 'school' | 'holiday' | 'exam' | 'meeting'
  time: string
}

export default function EventsCalendarPage() {
  const { activeRole } = useShellStore()
  const canCreate = activeRole === 'ADMIN' || activeRole === 'TEACHER'

  const [currentMonth, setCurrentMonth] = useState('October 2025')
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month')
  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const [newEventTitle, setNewEventTitle] = useState('')
  const [newEventType, setNewEventType] = useState<'school' | 'holiday' | 'exam' | 'meeting'>('school')
  const [newEventDay, setNewEventDay] = useState(15)

  const [events, setEvents] = useState<CalendarEvent[]>([
    { id: 'ev-1', day: 3, title: 'Term 1 Midterm Exams', type: 'exam', time: '09:00 AM' },
    { id: 'ev-2', day: 12, title: 'National Teachers Day (Holiday)', type: 'holiday', time: 'All Day' },
    { id: 'ev-3', day: 15, title: 'Science Fair Registration Deadline', type: 'school', time: '05:00 PM' },
    { id: 'ev-4', day: 24, title: 'Parent-Teacher Consultations', type: 'meeting', time: '02:00 PM' },
    { id: 'ev-5', day: 28, title: 'Sports Day & Track Meet', type: 'school', time: '08:30 AM' },
  ])

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEventTitle.trim()) return

    const newEv: CalendarEvent = {
      id: `ev-${Date.now()}`,
      day: newEventDay,
      title: newEventTitle.trim(),
      type: newEventType,
      time: '10:00 AM',
    }

    setEvents([...events, newEv])
    setIsCreateOpen(false)
    setNewEventTitle('')
    setToastMessage('Event scheduled successfully.')
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Generate 31 days for calendar grid
  const days = Array.from({ length: 31 }, (_, i) => i + 1)

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls (Stitch Screen 26 exact controls) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-surface-container-lowest p-4 rounded-xl border border-outline-variant shadow-xs">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            {currentMonth}
          </h1>

          <div className="flex items-center bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/60">
            <button
              onClick={() => setCurrentMonth('September 2025')}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonth('October 2025')}
              className="px-2.5 py-0.5 text-xs font-semibold text-on-surface"
            >
              Today
            </button>
            <button
              onClick={() => setCurrentMonth('November 2025')}
              className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex bg-surface-container-low rounded-lg p-0.5 border border-outline-variant/60 w-full sm:w-auto">
            <button
              onClick={() => setViewMode('month')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'month'
                  ? 'bg-surface-container-lowest text-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`flex-1 sm:flex-none px-3 py-1 rounded text-xs font-semibold transition-all ${
                viewMode === 'week'
                  ? 'bg-surface-container-lowest text-primary shadow-2xs'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Week
            </button>
          </div>

          {canCreate && (
            <button
              onClick={() => setIsCreateOpen(true)}
              className="bg-primary text-on-primary px-3.5 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5 whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Event</span>
            </button>
          )}
        </div>
      </div>

      {/* Legend Bar (Stitch Screen 26 exact legend) */}
      <div className="flex flex-wrap items-center gap-4 px-1 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
          <span className="font-semibold text-on-surface-variant">School Events</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500" />
          <span className="font-semibold text-on-surface-variant">Holidays</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
          <span className="font-semibold text-on-surface-variant">Exams</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
          <span className="font-semibold text-on-surface-variant">Parent Meetings</span>
        </div>
      </div>

      {/* Calendar Grid (Month View) (Stitch Screen 26) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
        {/* Day Header */}
        <div className="grid grid-cols-7 border-b border-outline-variant bg-surface-container-low text-center text-xs font-bold text-on-surface-variant py-2">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Day Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-outline-variant">
          {days.map((day) => {
            const dayEvents = events.filter((e) => e.day === day)
            return (
              <div
                key={day}
                className="min-h-[105px] p-2 hover:bg-surface-container-low/30 transition-colors flex flex-col justify-between"
              >
                <div className="flex justify-between items-start">
                  <span
                    className={`text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full ${
                      day === 15
                        ? 'bg-primary text-on-primary shadow-xs'
                        : 'text-on-surface'
                    }`}
                  >
                    {day}
                  </span>
                </div>

                <div className="space-y-1 mt-1">
                  {dayEvents.map((ev) => (
                    <div
                      key={ev.id}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border ${
                        ev.type === 'school'
                          ? 'bg-primary/10 text-primary border-primary/20'
                          : ev.type === 'holiday'
                            ? 'bg-red-50 text-red-700 border-red-200'
                            : ev.type === 'exam'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-purple-50 text-purple-700 border-purple-200'
                      }`}
                      title={`${ev.title} (${ev.time})`}
                    >
                      {ev.title}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Create Event Drawer */}
      <Drawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Schedule Academic Event"
        maxWidth="md"
      >
        <form onSubmit={handleCreateEvent} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Event Title *
            </label>
            <input
              type="text"
              required
              value={newEventTitle}
              onChange={(e) => setNewEventTitle(e.target.value)}
              placeholder="e.g. Science Fair Registration Deadline"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Event Type
              </label>
              <select
                value={newEventType}
                onChange={(e) => setNewEventType(e.target.value as 'school' | 'holiday' | 'exam' | 'meeting')}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="school">School Event</option>
                <option value="holiday">Holiday</option>
                <option value="exam">Exam</option>
                <option value="meeting">Parent Meeting</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Day of Month (1 - 31)
              </label>
              <input
                type="number"
                min={1}
                max={31}
                value={newEventDay}
                onChange={(e) => setNewEventDay(Number(e.target.value))}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-3 py-1.5 border border-outline-variant rounded-lg text-xs font-semibold text-on-surface hover:bg-surface-container transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
            >
              Save Event
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
