'use client'

import { useState, use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Edit,
  Search,
  UserPlus,
  Users,
  BookOpen,
  Calendar,
  ExternalLink,
} from 'lucide-react'

export default function ClassDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  const [activeTab, setActiveTab] = useState<'roster' | 'teachers' | 'timetable'>('roster')
  const [searchQuery, setSearchQuery] = useState('')

  const ROSTER_STUDENTS = [
    { id: 'stu-1', name: 'Omar Hatem', arabicName: 'عمر حاتم', code: 'STU-2026-0042', status: 'Active', absences: 2 },
    { id: 'stu-2', name: 'Sarah Jenkins', arabicName: 'سارة جنكينز', code: 'STU-2026-0012', status: 'Active', absences: 1 },
    { id: 'stu-3', name: 'Michael Chang', arabicName: 'مايكل تشانغ', code: 'STU-2026-0089', status: 'Active', absences: 3 },
    { id: 'stu-4', name: 'Layla Mahmoud', arabicName: 'ليلى محمود', code: 'STU-2026-0104', status: 'Active', absences: 0 },
    { id: 'stu-5', name: 'Youssef Nabil', arabicName: 'يوسف نبيل', code: 'STU-2026-0055', status: 'Active', absences: 1 },
  ]

  const filteredRoster = ROSTER_STUDENTS.filter(
    (s) =>
      !searchQuery ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation with mobile horizontal scroll */}
      <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        <Link
          href={`/${locale}/dashboard/classes`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Classes Management</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-bold">Class 10A</span>
      </nav>

      {/* Page Header (Stitch Screen 12 exact header) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b border-outline-variant pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded bg-surface-container-high text-on-surface-variant text-[10px] font-bold uppercase tracking-wider">
              High School
            </span>
            <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
              Active
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-on-surface">
            Class 10A
          </h1>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            Academic Year 2025/2026 • Science Stream • Capacity: 28 / 30 Students
          </p>
        </div>

        <button
          onClick={() => alert('Editing Class details...')}
          className="px-4 py-2 border border-outline-variant bg-surface-container-low text-on-surface rounded-lg text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5 shadow-2xs self-start sm:self-auto"
        >
          <Edit className="w-3.5 h-3.5" />
          <span>Edit Class</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-outline-variant flex gap-6 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'roster'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Student Roster (28)</span>
        </button>
        <button
          onClick={() => setActiveTab('teachers')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'teachers'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Assigned Subject Teachers</span>
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-2.5 border-b-2 font-semibold text-xs transition-colors flex items-center gap-2 ${
            activeTab === 'timetable'
              ? 'border-primary text-primary'
              : 'border-transparent text-on-surface-variant hover:text-on-surface'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Class Timetable</span>
        </button>
      </div>

      {/* Tab 1: Student Roster (Stitch Screen 12 exact table) */}
      {activeTab === 'roster' && (
        <div className="bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-outline-variant bg-surface-container-low flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search students by name or ID..."
                className="w-full pl-9 pr-3 py-1.5 bg-surface-container-lowest rounded-lg border border-outline-variant text-xs text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <button
              onClick={() => alert('Enrolling new student in Class 10A...')}
              className="px-3.5 py-1.5 bg-primary text-on-primary rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5 shadow-xs self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Enroll Student</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-surface-container-low/60 border-b border-outline-variant text-on-surface-variant uppercase tracking-wider font-semibold">
                  <th className="p-4">Student Name</th>
                  <th className="p-4">ID Number</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Absences</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {filteredRoster.map((student) => (
                  <tr
                    key={student.id}
                    className="hover:bg-surface-container-low/40 transition-colors group"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-outline-variant">
                          {student.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <Link
                            href={`/${locale}/dashboard/students/${student.id}`}
                            className="font-bold text-on-surface hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span>{student.name}</span>
                            <ExternalLink className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                          </Link>
                          <span className="text-[11px] text-on-surface-variant" dir="rtl">
                            {student.arabicName}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-on-surface-variant font-semibold">
                      {student.code}
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {student.status}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-on-surface">
                      {student.absences} Days
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/${locale}/dashboard/students/${student.id}`}
                        className="px-2.5 py-1 rounded bg-surface-container border border-outline-variant text-[11px] font-semibold text-on-surface hover:bg-surface-container-high transition-colors"
                      >
                        360° Profile
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Assigned Teachers */}
      {activeTab === 'teachers' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
            <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Physics</span>
            <h3 className="font-bold text-sm text-on-surface mt-1">Mr. Ahmed Hassan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">5 periods / week • Lab 3</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
            <span className="text-[10px] font-bold text-secondary uppercase tracking-wider">Mathematics</span>
            <h3 className="font-bold text-sm text-on-surface mt-1">Dr. Mona Zaki</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">6 periods / week • Room 302</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-container-lowest border border-outline-variant shadow-xs">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">English</span>
            <h3 className="font-bold text-sm text-on-surface mt-1">Ms. Emma Roberts</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">4 periods / week • Room 204</p>
          </div>
        </div>
      )}

      {/* Tab 3: Class Timetable */}
      {activeTab === 'timetable' && (
        <div className="p-6 bg-surface-container-lowest rounded-xl border border-outline-variant shadow-xs space-y-3">
          <h2 className="text-sm font-bold text-on-surface">Weekly Class Schedule for 10A</h2>
          <p className="text-xs text-on-surface-variant">
            Class 10A meets daily from 08:00 AM to 01:30 PM across Rooms 302, 204, and Science Lab 3.
          </p>
        </div>
      )}
    </div>
  )
}
