'use client'

import { use } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ChevronRight,
  Mail,
  Edit,
  School,
  BookOpen,
  Calendar,
} from 'lucide-react'

export default function TeacherDetailsPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>
}) {
  const resolvedParams = use(params)
  const locale = resolvedParams.locale

  return (
    <div className="space-y-6 pb-16 max-w-7xl mx-auto">
      {/* Breadcrumb Navigation with mobile horizontal scroll */}
      <nav className="flex items-center text-xs font-semibold text-on-surface-variant gap-1.5 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
        <Link
          href={`/${locale}/dashboard/teachers`}
          className="hover:text-primary transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Teachers Directory</span>
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-outline" />
        <span className="text-on-surface font-bold">Mr. Ahmed Hassan</span>
      </nav>

      {/* Header Bento Grid (Stitch Screen 19 exact clone) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Identity Card (2 cols) */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-xl border border-outline-variant p-6 flex flex-col sm:flex-row gap-6 items-start relative overflow-hidden shadow-xs">
          <div className="shrink-0 relative">
            <div className="w-28 h-28 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-3xl border border-outline-variant shadow-xs">
              AH
            </div>
            <div className="absolute -bottom-2 -right-2 bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Active
            </div>
          </div>

          <div className="flex-1 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-on-surface">
                  Mr. Ahmed Hassan
                </h1>
                <p className="text-sm text-on-surface-variant mt-0.5 flex items-center gap-1.5 font-medium">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Senior Physics Teacher
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => alert('Opening message thread...')}
                  className="px-3.5 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-semibold hover:bg-surface-container transition-colors flex items-center gap-1.5"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Message</span>
                </button>
                <button
                  onClick={() => alert('Editing teacher profile...')}
                  className="px-3.5 py-1.5 rounded-lg bg-primary text-on-primary text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs flex items-center gap-1.5"
                >
                  <Edit className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-outline-variant/60">
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Employee ID
                </span>
                <span className="text-xs font-semibold text-on-surface font-mono">
                  EMP-2018-042
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Joined
                </span>
                <span className="text-xs font-semibold text-on-surface">
                  Aug 2018
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Department
                </span>
                <span className="text-xs font-semibold text-on-surface">
                  Sciences
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                  Contact
                </span>
                <span className="text-xs font-semibold text-on-surface font-mono">
                  +971 50 123 4567
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Qualifications & Assigned Classes Stack (1 col) */}
        <div className="flex flex-col gap-6">
          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs flex-1">
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
              <School className="w-4 h-4 text-primary" />
              Qualifications
            </h2>
            <ul className="space-y-3 text-xs">
              <li className="flex gap-2.5 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <div>
                  <p className="font-bold text-on-surface">MSc. Applied Physics</p>
                  <p className="text-[11px] text-on-surface-variant">University of Edinburgh, 2015</p>
                </div>
              </li>
              <li className="flex gap-2.5 items-start">
                <div className="mt-1 w-2 h-2 rounded-full bg-outline shrink-0" />
                <div>
                  <p className="font-bold text-on-surface">BSc. Physics with Education</p>
                  <p className="text-[11px] text-on-surface-variant">Cairo University, 2012</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 shadow-xs">
            <h2 className="text-xs font-bold text-on-surface uppercase tracking-wider mb-3 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-secondary" />
              Assigned Classes
            </h2>
            <div className="flex flex-wrap gap-1.5">
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-xs font-semibold text-on-surface">
                11-A (AP)
              </span>
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-xs font-semibold text-on-surface">
                11-B
              </span>
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-xs font-semibold text-on-surface">
                12-C (AP)
              </span>
              <span className="px-2.5 py-1 bg-surface-container-low border border-outline-variant rounded-md text-xs font-semibold text-on-surface">
                10-Sci-1
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area: Weekly Timetable Grid (Stitch Screen 19 exact matrix) */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden shadow-xs">
        <div className="p-4 border-b border-outline-variant bg-surface-container-low flex justify-between items-center">
          <h2 className="text-sm font-bold text-on-surface flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Weekly Teaching Timetable
          </h2>
          <span className="text-xs font-semibold text-on-surface-variant">
            Semester 1 • Week 8
          </span>
        </div>

        <div className="overflow-x-auto p-4 bg-background">
          <div className="min-w-[700px] grid grid-cols-6 gap-2 text-xs">
            {/* Headers */}
            <div className="h-8" />
            <div className="text-center font-bold text-on-surface-variant uppercase p-2">Monday</div>
            <div className="text-center font-bold text-on-surface-variant uppercase p-2">Tuesday</div>
            <div className="text-center font-bold text-on-surface-variant uppercase p-2">Wednesday</div>
            <div className="text-center font-bold text-on-surface-variant uppercase p-2">Thursday</div>
            <div className="text-center font-bold text-on-surface-variant uppercase p-2">Friday</div>

            {/* Period 1 */}
            <div className="text-right font-bold text-on-surface-variant pr-2 pt-2">
              08:00<br /><span className="text-[10px] text-outline font-normal">08:50</span>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
              <div className="font-bold text-on-surface">11-A (AP)</div>
              <div className="text-[11px] text-primary font-medium">Lab 3</div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-md p-2.5">
              <div className="font-bold text-on-surface">11-B</div>
              <div className="text-[11px] text-on-surface-variant">Room 402</div>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
              <div className="font-bold text-on-surface">12-C (AP)</div>
              <div className="text-[11px] text-primary font-medium">Lab 3</div>
            </div>
            <div className="rounded-md p-2.5 border border-dashed border-outline-variant flex items-center justify-center opacity-60">
              <span className="text-on-surface-variant text-[11px]">Free</span>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-md p-2.5">
              <div className="font-bold text-on-surface">10-Sci-1</div>
              <div className="text-[11px] text-on-surface-variant">Room 401</div>
            </div>

            {/* Period 2 */}
            <div className="text-right font-bold text-on-surface-variant pr-2 pt-2">
              09:00<br /><span className="text-[10px] text-outline font-normal">09:50</span>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
              <div className="font-bold text-on-surface">11-A (AP)</div>
              <div className="text-[11px] text-primary font-medium">Lab 3</div>
            </div>
            <div className="rounded-md p-2.5 border border-dashed border-outline-variant flex items-center justify-center opacity-60">
              <span className="text-on-surface-variant text-[11px]">Prep Period</span>
            </div>
            <div className="bg-primary/10 border border-primary/20 rounded-md p-2.5">
              <div className="font-bold text-on-surface">12-C (AP)</div>
              <div className="text-[11px] text-primary font-medium">Lab 3</div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-md p-2.5">
              <div className="font-bold text-on-surface">11-B</div>
              <div className="text-[11px] text-on-surface-variant">Room 402</div>
            </div>
            <div className="bg-surface-container border border-outline-variant rounded-md p-2.5">
              <div className="font-bold text-on-surface">10-Sci-1</div>
              <div className="text-[11px] text-on-surface-variant">Room 401</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
