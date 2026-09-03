'use client'

import { useState, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  Download,
  Plus,
  Search,
  Mail,
  Phone,
  BookOpen,
  Clock,
  X,
  GraduationCap,
  Calendar,
  Building2,
  Send,
  CheckCircle2,
  Sparkles,
} from 'lucide-react'
import { Drawer } from '../../../../../components/ui/drawer'
import { EmptyState } from '../../../../../components/ui/empty-state'
import { StatusBadge } from '../../../../../components/ui/status-badge'
import { useShellStore } from '../../../../../stores/shell-store'
import { useQueryClient } from '@tanstack/react-query'
import { useTeachersQuery } from '../../../../../hooks/use-domain-queries'
import { queryKeys } from '../../../../../lib/query-keys'

/* ──────────────────────────────────────────────────────────────────────────
 * Types & Interfaces
 * ────────────────────────────────────────────────────────────────────────── */

export type TeacherStatus = 'Active' | 'On Leave' | 'Inactive'

export interface ClassScheduleItem {
  id: string
  day: string
  time: string
  className: string
  room: string
  subject: string
}

export interface AssignedClass {
  id: string
  name: string
  grade: number
  section: string
  studentCount: number
  room: string
  nextSession: string
}

export interface TeacherItem {
  id: string
  employeeCode: string
  nameEn: string
  nameAr: string
  avatarUrl?: string
  avatarInitials: string
  title: string
  department: string
  specialization: string
  email: string
  phone: string
  officeRoom: string
  hireDate: string
  status: TeacherStatus
  weeklyHours: number
  assignedClasses: string[]
  classesDetail: AssignedClass[]
  schedule: ClassScheduleItem[]
  qualifications: string[]
  bio: string
}

/* ──────────────────────────────────────────────────────────────────────────
 * Initial Mock Faculty Data (cloned from Stitch screens)
 * ────────────────────────────────────────────────────────────────────────── */

const INITIAL_TEACHERS: TeacherItem[] = [
  {
    id: 'tch-1',
    employeeCode: 'EMP-2018-042',
    nameEn: 'Mr. Ahmed Hassan',
    nameAr: 'أحمد حسن',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA5VES31eSXietf9TxMKdg-pjXICay9o_xeIwK3_3wkdNfFE1Za3zVYmkdqvlLrR4QEvEVvvg-xq9eUP7t8bUPwZVSI4sSyKrYH1Cn375oAspqpoKJLe0I5TE7t3GGVsTf9ZAgZuOTuw_8LIQRoLOeBzIjjFEGSD3mnhAlT3nLD6u_OFHTsdSi0Vd2Z38kEDjeQkl_OAVwvbJ4TUSf47Yk6Uj_QKrX90V4uW8V-eN-ZX62mIYR7fqnxyg',
    avatarInitials: 'AH',
    title: 'Senior Physics Teacher & Dept Lead',
    department: 'Natural Sciences',
    specialization: 'Physics / Pure Math',
    email: 'ahmed.hassan@karma-edu.com',
    phone: '+971 50 234 5678',
    officeRoom: 'Science Block B, Rm 302',
    hireDate: 'Aug 2018',
    status: 'Active',
    weeklyHours: 18,
    assignedClasses: ['10A', '10B', '11A'],
    qualifications: ['M.Sc. Applied Physics (Cairo Univ)', 'Cambridge IGCSE Certified Examiner', '12+ Years Teaching Experience'],
    bio: 'Specializes in classical mechanics, thermodynamics, and IB Higher Level Physics. Leads the high school Robotics & Applied Mechanics Club.',
    classesDetail: [
      { id: 'c-1', name: '10A', grade: 10, section: 'A', studentCount: 28, room: 'Lab B1', nextSession: 'Tomorrow, 08:30 AM' },
      { id: 'c-2', name: '10B', grade: 10, section: 'B', studentCount: 26, room: 'Lab B1', nextSession: 'Today, 01:15 PM' },
      { id: 'c-3', name: '11A', grade: 11, section: 'A', studentCount: 24, room: 'Lab B3', nextSession: 'Thu, 10:45 AM' },
    ],
    schedule: [
      { id: 's-1', day: 'Monday', time: '08:30 - 09:15 AM', className: '10A', room: 'Lab B1', subject: 'Mechanics & Newton Laws' },
      { id: 's-2', day: 'Monday', time: '11:00 - 11:45 AM', className: '11A', room: 'Lab B3', subject: 'Electromagnetic Induction' },
      { id: 's-3', day: 'Tuesday', time: '09:30 - 10:15 AM', className: '10B', room: 'Lab B1', subject: 'Kinematics Lab Experiments' },
      { id: 's-4', day: 'Wednesday', time: '08:30 - 09:15 AM', className: '10A', room: 'Lab B1', subject: 'Optics & Wave Motion' },
      { id: 's-5', day: 'Thursday', time: '10:45 - 11:30 AM', className: '11A', room: 'Lab B3', subject: 'Nuclear Physics HL' },
    ],
  },
  {
    id: 'tch-2',
    employeeCode: 'EMP-2019-108',
    nameEn: 'Dr. Sarah Williams',
    nameAr: 'د. سارة ويليامز',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkuPJ2hj0iH4WFuQc7rWO3HBJrOxUI9J77hOFK91aZs-Dm5nfJL7JqouCRIe0hD_BfFSWkLmuPIDYzkVgk4dHhM8DHch06SnTFQfvCd5bHCHKFpRTsWkUajBU7kdLaBnTIEyYpKHMhRvebekfo4g8zSOKzVaZxNJav-Vzf-VBnRqn_Y-96mK5tYVLRB8SOfoEtKCII02GtQtua01wRg4KjlLAm1FiA9SgYYJ7MtBt7_ATrg5oBC2AoeQ',
    avatarInitials: 'SW',
    title: 'Lead Chemistry Specialist',
    department: 'Natural Sciences',
    specialization: 'Chemistry',
    email: 'sarah.williams@karma-edu.com',
    phone: '+971 52 789 0123',
    officeRoom: 'Science Block B, Rm 304',
    hireDate: 'Jan 2019',
    status: 'Active',
    weeklyHours: 22,
    assignedClasses: ['9A', '9B', '11C', '12A'],
    qualifications: ['Ph.D. Organic Chemistry (Oxford Univ)', 'Head of Science Fair Committee', '8 Years International Schooling'],
    bio: 'Passionate about environmental and organic chemistry. Oversees safety compliance and modern laboratory curriculum across Grades 9–12.',
    classesDetail: [
      { id: 'c-4', name: '9A', grade: 9, section: 'A', studentCount: 30, room: 'Lab C2', nextSession: 'Today, 11:00 AM' },
      { id: 'c-5', name: '9B', grade: 9, section: 'B', studentCount: 29, room: 'Lab C2', nextSession: 'Wed, 09:30 AM' },
      { id: 'c-6', name: '11C', grade: 11, section: 'C', studentCount: 22, room: 'Lab C1', nextSession: 'Tomorrow, 08:30 AM' },
      { id: 'c-7', name: '12A', grade: 12, section: 'A', studentCount: 20, room: 'Lab C1', nextSession: 'Thu, 01:15 PM' },
    ],
    schedule: [
      { id: 's-6', day: 'Monday', time: '10:00 - 10:45 AM', className: '9A', room: 'Lab C2', subject: 'Periodic Table Trends' },
      { id: 's-7', day: 'Tuesday', time: '08:30 - 09:15 AM', className: '12A', room: 'Lab C1', subject: 'Organic Synthesis Pathways' },
      { id: 's-8', day: 'Wednesday', time: '09:30 - 10:15 AM', className: '9B', room: 'Lab C2', subject: 'Acids & Bases Titration' },
      { id: 's-9', day: 'Thursday', time: '11:00 - 11:45 AM', className: '11C', room: 'Lab C1', subject: 'Thermodynamics & Enthalpy' },
    ],
  },
  {
    id: 'tch-3',
    employeeCode: 'EMP-2021-015',
    nameEn: 'Elena Rostova',
    nameAr: 'إيلينا روستوفا',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr3pvKD9HHsYkfzhipJrAFPb1ryan8YkIG8EWleDCY-rd-PG8snFZ-vACnhPcQIQ13_bBn-BxieemvCS3JAfquBJAv85vhh6FTI-poLB-Ik5zlqR02kpMteBoY_ZMJy69dPd6BRreSlSY9WmN8vR9M-GhKoIMmON3Q6AsOgC47iv2t3yTPuCAOUtrUKpTesgB39UmAywcx1uVzstaPDhAaFhzy15GyrJOLCto3dXw99kp_cAAqZ56Nyg',
    avatarInitials: 'ER',
    title: 'Senior Literature & Rhetoric Instructor',
    department: 'Humanities & Languages',
    specialization: 'World Literature',
    email: 'elena.rostova@karma-edu.com',
    phone: '+971 55 456 7890',
    officeRoom: 'Humanities Wing, Rm 112',
    hireDate: 'Sep 2021',
    status: 'Active',
    weeklyHours: 16,
    assignedClasses: ['10A', '10C', '12B'],
    qualifications: ['M.A. Comparative Literature (Sorbonne)', 'Debate & Public Speaking Coach', 'Published Essayist'],
    bio: 'Dedicated to classical rhetorical analysis and world literature synthesis. Moderates Model United Nations and annual creative writing workshops.',
    classesDetail: [
      { id: 'c-8', name: '10A', grade: 10, section: 'A', studentCount: 28, room: 'Room 112', nextSession: 'Today, 02:00 PM' },
      { id: 'c-9', name: '10C', grade: 10, section: 'C', studentCount: 27, room: 'Room 112', nextSession: 'Tomorrow, 10:00 AM' },
      { id: 'c-10', name: '12B', grade: 12, section: 'B', studentCount: 21, room: 'Seminar Rm 4', nextSession: 'Fri, 09:00 AM' },
    ],
    schedule: [
      { id: 's-10', day: 'Monday', time: '11:15 - 12:00 PM', className: '10A', room: 'Room 112', subject: 'Shakespearean Tragedy Analysis' },
      { id: 's-11', day: 'Tuesday', time: '10:00 - 10:45 AM', className: '10C', room: 'Room 112', subject: 'Comparative World Epics' },
      { id: 's-12', day: 'Thursday', time: '01:15 - 02:00 PM', className: '12B', room: 'Seminar Rm 4', subject: 'Modern Postcolonial Prose' },
    ],
  },
  {
    id: 'tch-4',
    employeeCode: 'EMP-2020-077',
    nameEn: 'Dr. Tariq Mansour',
    nameAr: 'د. طارق منصور',
    avatarInitials: 'TM',
    title: 'Head of Mathematics & Calculus',
    department: 'Mathematics & Computing',
    specialization: 'Pure Mathematics & Calculus',
    email: 'tariq.mansour@karma-edu.com',
    phone: '+971 50 998 1234',
    officeRoom: 'Math Department, Rm 205',
    hireDate: 'Aug 2020',
    status: 'Active',
    weeklyHours: 20,
    assignedClasses: ['11A', '11B', '12A'],
    qualifications: ['Ph.D. Applied Mathematics', 'National Math Olympiad Team Mentor', 'Curriculum Committee Member'],
    bio: 'Specializes in Advanced Placement Calculus BC, Linear Algebra, and Mathematical Modeling for STEM student pathways.',
    classesDetail: [
      { id: 'c-11', name: '11A', grade: 11, section: 'A', studentCount: 24, room: 'Room 205', nextSession: 'Today, 09:00 AM' },
      { id: 'c-12', name: '11B', grade: 11, section: 'B', studentCount: 25, room: 'Room 205', nextSession: 'Tomorrow, 11:30 AM' },
      { id: 'c-13', name: '12A', grade: 12, section: 'A', studentCount: 20, room: 'Room 208', nextSession: 'Thu, 08:30 AM' },
    ],
    schedule: [
      { id: 's-13', day: 'Monday', time: '09:00 - 09:45 AM', className: '11A', room: 'Room 205', subject: 'Differential Calculus & Limits' },
      { id: 's-14', day: 'Wednesday', time: '11:30 - 12:15 PM', className: '11B', room: 'Room 205', subject: 'Integration & Area Under Curves' },
      { id: 's-15', day: 'Thursday', time: '08:30 - 09:15 AM', className: '12A', room: 'Room 208', subject: 'Multivariable Calculus Seminar' },
    ],
  },
  {
    id: 'tch-5',
    employeeCode: 'EMP-2022-033',
    nameEn: 'Nour El-Din Sherif',
    nameAr: 'نور الدين شريف',
    avatarInitials: 'NS',
    title: 'Computer Science & AI Educator',
    department: 'Mathematics & Computing',
    specialization: 'Computer Science & Python',
    email: 'nour.sherif@karma-edu.com',
    phone: '+971 56 321 6547',
    officeRoom: 'Tech Hub, Studio 4',
    hireDate: 'Aug 2022',
    status: 'Active',
    weeklyHours: 18,
    assignedClasses: ['9A', '10B', '11C'],
    qualifications: ['B.Sc. Software Engineering', 'AWS Certified Solutions Architect', 'Google for Education Certified Trainer'],
    bio: 'Guides students through computational thinking, Python algorithms, web architectures, and introductory machine learning projects.',
    classesDetail: [
      { id: 'c-14', name: '9A', grade: 9, section: 'A', studentCount: 30, room: 'Tech Lab 1', nextSession: 'Tomorrow, 01:00 PM' },
      { id: 'c-15', name: '10B', grade: 10, section: 'B', studentCount: 26, room: 'Tech Lab 1', nextSession: 'Wed, 10:30 AM' },
      { id: 'c-16', name: '11C', grade: 11, section: 'C', studentCount: 22, room: 'Tech Lab 2', nextSession: 'Fri, 11:00 AM' },
    ],
    schedule: [
      { id: 's-16', day: 'Tuesday', time: '01:00 - 01:45 PM', className: '9A', room: 'Tech Lab 1', subject: 'Data Structures & Algorithms' },
      { id: 's-17', day: 'Wednesday', time: '10:30 - 11:15 AM', className: '10B', room: 'Tech Lab 1', subject: 'Object-Oriented Programming' },
      { id: 's-18', day: 'Friday', time: '11:00 - 11:45 AM', className: '11C', room: 'Tech Lab 2', subject: 'Fullstack App Prototyping' },
    ],
  },
  {
    id: 'tch-6',
    employeeCode: 'EMP-2023-019',
    nameEn: 'Layla Al-Khatib',
    nameAr: 'ليلى الخطيب',
    avatarInitials: 'LK',
    title: 'Biology & Environmental Ecology Teacher',
    department: 'Natural Sciences',
    specialization: 'Biology & Ecology',
    email: 'layla.alkhatib@karma-edu.com',
    phone: '+971 50 776 5432',
    officeRoom: 'Science Block B, Rm 306',
    hireDate: 'Jan 2023',
    status: 'On Leave',
    weeklyHours: 14,
    assignedClasses: ['9B', '10C'],
    qualifications: ['M.Sc. Molecular Genetics', 'Field Biology Researcher', 'Eco-Schools Coordinator'],
    bio: 'Currently on academic sabbatical completing research in Mediterranean biodiversity. Classes temporarily supported by co-faculty.',
    classesDetail: [
      { id: 'c-17', name: '9B', grade: 9, section: 'B', studentCount: 29, room: 'Bio Lab', nextSession: 'Mon, 10:00 AM' },
      { id: 'c-18', name: '10C', grade: 10, section: 'C', studentCount: 27, room: 'Bio Lab', nextSession: 'Wed, 01:15 PM' },
    ],
    schedule: [
      { id: 's-19', day: 'Monday', time: '10:00 - 10:45 AM', className: '9B', room: 'Bio Lab', subject: 'Cellular Respiration' },
      { id: 's-20', day: 'Wednesday', time: '01:15 - 02:00 PM', className: '10C', room: 'Bio Lab', subject: 'Mendelian Genetics Lab' },
    ],
  },
]

/* ──────────────────────────────────────────────────────────────────────────
 * Main Component: TeachersPage
 * ────────────────────────────────────────────────────────────────────────── */

export default function TeachersPage() {
  const t = useTranslations('features.teachers')
  const { activeRole } = useShellStore()
  const canManage = activeRole === 'ADMIN'
  const router = useRouter()
  const params = useParams()
  const locale = (params?.locale as string) || 'en'

  // State
  const [teachers, setTeachers] = useState<TeacherItem[]>(INITIAL_TEACHERS)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDept, setSelectedDept] = useState<string>('ALL')
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL')
  const [activeTeacher, setActiveTeacher] = useState<TeacherItem | null>(null)
  const [isInviteOpen, setIsInviteOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const queryClient = useQueryClient()
  useTeachersQuery({
    search: searchQuery,
    department: selectedDept,
  })

  // New Teacher Form State
  const [formNameEn, setFormNameEn] = useState('')
  const [formNameAr, setFormNameAr] = useState('')
  const [formEmail, setFormEmail] = useState('')
  const [formPhone, setFormPhone] = useState('')
  const [formSpecialization, setFormSpecialization] = useState('')
  const [formDepartment, setFormDepartment] = useState('Natural Sciences')
  const [formClasses, setFormClasses] = useState('10A, 10B')

  // Available Departments
  const departments = useMemo(() => {
    const set = new Set<string>()
    teachers.forEach((tch) => set.add(tch.department))
    return Array.from(set)
  }, [teachers])

  // Filtered Teachers
  const filteredTeachers = useMemo(() => {
    return teachers.filter((tch) => {
      const q = searchQuery.toLowerCase().trim()
      const matchesQuery =
        !q ||
        tch.nameEn.toLowerCase().includes(q) ||
        tch.nameAr.includes(q) ||
        tch.specialization.toLowerCase().includes(q) ||
        tch.employeeCode.toLowerCase().includes(q) ||
        tch.assignedClasses.some((cls) => cls.toLowerCase().includes(q))

      const matchesDept = selectedDept === 'ALL' || tch.department === selectedDept
      const matchesStatus = selectedStatus === 'ALL' || tch.status === selectedStatus

      return matchesQuery && matchesDept && matchesStatus
    })
  }, [teachers, searchQuery, selectedDept, selectedStatus])

  // Handlers
  const handleExportCsv = () => {
    const headers = ['Employee Code,Name En,Name Ar,Specialization,Department,Weekly Hours,Assigned Classes,Status,Email,Phone']
    const rows = filteredTeachers.map(
      (tch) =>
        `"${tch.employeeCode}","${tch.nameEn}","${tch.nameAr}","${tch.specialization}","${tch.department}",${tch.weeklyHours},"${tch.assignedClasses.join(', ')}","${tch.status}","${tch.email}","${tch.phone}"`
    )
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', 'teachers_directory.csv')
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleInviteSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formNameEn.trim() || !formEmail.trim()) return

    const newTeacher: TeacherItem = {
      id: `tch-${Date.now()}`,
      employeeCode: `EMP-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
      nameEn: formNameEn.trim(),
      nameAr: formNameAr.trim() || formNameEn.trim(),
      avatarInitials: formNameEn
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      title: `${formSpecialization.trim() || 'Subject'} Educator`,
      department: formDepartment,
      specialization: formSpecialization.trim() || 'General Academics',
      email: formEmail.trim(),
      phone: formPhone.trim() || '+971 50 000 0000',
      officeRoom: 'Academic Building, Rm 101',
      hireDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      status: 'Active',
      weeklyHours: 18,
      assignedClasses: formClasses.split(',').map((c) => c.trim()).filter(Boolean),
      classesDetail: formClasses
        .split(',')
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c, idx) => ({
          id: `c-new-${idx}`,
          name: c,
          grade: 10,
          section: c.slice(-1) || 'A',
          studentCount: 25,
          room: 'Main Hall',
          nextSession: 'Upcoming',
        })),
      schedule: [],
      qualifications: ['Faculty Member', 'Verified Teaching License'],
      bio: 'Newly invited faculty member to the academic department.',
    }

    queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all })
    setTeachers([newTeacher, ...teachers])
    setIsInviteOpen(false)
    setFormNameEn('')
    setFormNameAr('')
    setFormEmail('')
    setFormPhone('')
    setFormSpecialization('')
    setToastMessage(t('inviteSuccess'))
    setTimeout(() => setToastMessage(null), 4000)
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-600 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5" />
          <span className="text-sm font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Page Header (Stitch Screen 161ed54a) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-primary" />
            {t('title')}
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {t('countSubtitle', { count: teachers.length })}
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-outline-variant bg-surface-container-lowest text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors shadow-sm"
          >
            <Download className="w-4 h-4 text-on-surface-variant" />
            {t('exportCsv')}
          </button>

          {canManage && (
            <button
              onClick={() => setIsInviteOpen(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              {t('inviteTeacher')}
            </button>
          )}
        </div>
      </div>

      {/* Filters / Search Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-3 flex flex-col md:flex-row items-center gap-3 shadow-sm">
        {/* Search Input */}
        <div className="flex-1 relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="w-full pl-9 pr-8 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="h-6 w-px bg-outline-variant hidden md:block" />

        {/* Department Filter */}
        <div className="w-full md:w-auto">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full md:w-48 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="ALL">{t('allDepartments')}</option>
            {departments.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <div className="w-full md:w-auto">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full md:w-36 px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary font-medium"
          >
            <option value="ALL">{t('allStatuses')}</option>
            <option value="Active">{t('active')}</option>
            <option value="On Leave">{t('onLeave')}</option>
            <option value="Inactive">{t('inactive')}</option>
          </select>
        </div>
      </div>

      {/* Teachers Grid or Empty State */}
      {filteredTeachers.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No teachers found"
          description="Try adjusting your search criteria or clear the filters to view all faculty."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('')
            setSelectedDept('ALL')
            setSelectedStatus('ALL')
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {filteredTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden hover:border-primary/40 hover:shadow-md transition-all duration-200 group flex flex-col h-full"
            >
              <div className="p-4 flex-1 flex flex-col">
                {/* Header: Avatar + Menu */}
                <div className="flex items-start justify-between mb-3.5">
                  <div className="relative">
                    {teacher.avatarUrl ? (
                      <img
                        src={teacher.avatarUrl}
                        alt={teacher.nameEn}
                        className="w-12 h-12 rounded-full object-cover border border-outline-variant shrink-0 bg-surface-container-high"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full border border-outline-variant shrink-0 bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-sm">
                        {teacher.avatarInitials}
                      </div>
                    )}
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white ${
                        teacher.status === 'Active'
                          ? 'bg-emerald-500'
                          : teacher.status === 'On Leave'
                            ? 'bg-amber-500'
                            : 'bg-zinc-400'
                      }`}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <StatusBadge
                      status={teacher.status === 'Active' ? t('active') : teacher.status === 'On Leave' ? t('onLeave') : t('inactive')}
                      variant={teacher.status === 'Active' ? 'active' : teacher.status === 'On Leave' ? 'pending' : 'inactive'}
                    />
                  </div>
                </div>

                {/* Name & Arabic Name */}
                <div className="mb-3">
                  <h3 className="text-base font-semibold text-on-surface group-hover:text-primary transition-colors line-clamp-1">
                    {teacher.nameEn}
                  </h3>
                  <p className="text-xs text-on-surface-variant font-medium mt-0.5" dir="rtl">
                    {teacher.nameAr}
                  </p>
                </div>

                {/* Specialization Badge */}
                <div className="mb-4">
                  <span className="inline-block bg-secondary-container text-on-secondary-container px-2.5 py-0.5 rounded text-xs font-medium border border-secondary-fixed">
                    {teacher.specialization}
                  </span>
                </div>

                {/* Assigned Classes */}
                <div className="mt-auto">
                  <p className="text-[11px] font-semibold text-outline mb-1.5 uppercase tracking-wider">
                    {t('assignedClasses')}
                  </p>
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {teacher.assignedClasses.map((cls) => (
                      <span
                        key={cls}
                        className="bg-surface-container px-2 py-0.5 rounded text-xs font-medium text-on-surface-variant border border-outline-variant"
                      >
                        {cls}
                      </span>
                    ))}
                  </div>

                  {/* Weekly Hours Load */}
                  <div className="flex items-center justify-between text-xs text-on-surface-variant bg-surface-bright rounded-lg p-2 border border-surface-container-highest">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-outline" />
                      <span>{t('hoursPerWeek')}</span>
                    </div>
                    <span className="font-semibold text-on-surface">
                      {t('hours', { count: teacher.weeklyHours })}
                    </span>
                  </div>
                </div>
              </div>

              {/* View Profile Action */}
              <div className="border-t border-outline-variant p-2.5 bg-surface-bright/50">
                <button
                  onClick={() => {
                    setActiveTeacher(teacher)
                    router.push(`/${locale}/dashboard/teachers/${teacher.id}`)
                  }}
                  className="w-full text-center text-primary hover:text-primary/80 text-sm font-semibold transition-colors py-1 rounded hover:bg-surface-container-low"
                >
                  {t('viewProfile')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────────
       * Teacher Details 360° Profile Drawer (Stitch Screen ee4f3567)
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={!!activeTeacher}
        onClose={() => setActiveTeacher(null)}
        title={activeTeacher ? activeTeacher.nameEn : ''}
        maxWidth="xl"
      >
        {activeTeacher && (
          <div className="space-y-6">
            {/* Identity Card Bento */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 relative overflow-hidden">
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="relative shrink-0">
                  {activeTeacher.avatarUrl ? (
                    <img
                      src={activeTeacher.avatarUrl}
                      alt={activeTeacher.nameEn}
                      className="w-24 h-24 rounded-xl object-cover border border-outline-variant shadow-sm"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-xl border border-outline-variant bg-primary-fixed flex items-center justify-center text-on-primary-fixed font-bold text-2xl">
                      {activeTeacher.avatarInitials}
                    </div>
                  )}
                  <div
                    className={`absolute -bottom-2 -right-2 font-semibold text-[11px] px-2 py-0.5 rounded-full border shadow-sm flex items-center gap-1 ${
                      activeTeacher.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : activeTeacher.status === 'On Leave'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-zinc-50 text-zinc-700 border-zinc-200'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        activeTeacher.status === 'Active'
                          ? 'bg-emerald-500'
                          : activeTeacher.status === 'On Leave'
                            ? 'bg-amber-500'
                            : 'bg-zinc-400'
                      }`}
                    />
                    {activeTeacher.status === 'Active'
                      ? t('active')
                      : activeTeacher.status === 'On Leave'
                        ? t('onLeave')
                        : t('inactive')}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-on-surface">
                        {activeTeacher.nameEn}
                      </h2>
                      <p className="text-sm font-medium text-on-surface-variant" dir="rtl">
                        {activeTeacher.nameAr}
                      </p>
                      <p className="text-sm text-primary font-medium mt-1 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4" />
                        {activeTeacher.title}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`mailto:${activeTeacher.email}`}
                        className="px-3 py-1.5 rounded-lg border border-outline-variant text-on-surface text-xs font-medium hover:bg-surface-container-high transition-colors flex items-center gap-1.5 shadow-sm"
                      >
                        <Mail className="w-3.5 h-3.5 text-outline" />
                        {t('message')}
                      </a>
                    </div>
                  </div>

                  {/* Metadata grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-outline-variant">
                    <div>
                      <span className="block text-[11px] font-semibold text-outline uppercase">
                        {t('employeeId')}
                      </span>
                      <span className="text-sm font-semibold text-on-surface mt-0.5 block">
                        {activeTeacher.employeeCode}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-outline uppercase">
                        {t('joined')}
                      </span>
                      <span className="text-sm font-semibold text-on-surface mt-0.5 block">
                        {activeTeacher.hireDate}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-outline uppercase">
                        {t('department')}
                      </span>
                      <span className="text-sm font-semibold text-on-surface mt-0.5 block truncate">
                        {activeTeacher.department}
                      </span>
                    </div>
                    <div>
                      <span className="block text-[11px] font-semibold text-outline uppercase">
                        {t('scheduleLoad')}
                      </span>
                      <span className="text-sm font-semibold text-primary mt-0.5 block">
                        {t('hours', { count: activeTeacher.weeklyHours })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Metrics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                <div className="flex items-center gap-2 text-outline mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">{t('hoursPerWeek')}</span>
                </div>
                <div className="text-2xl font-bold text-on-surface">
                  {t('hours', { count: activeTeacher.weeklyHours })}
                </div>
                <span className="text-xs text-on-surface-variant mt-1 block">Full Curriculum Load</span>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                <div className="flex items-center gap-2 text-outline mb-1">
                  <BookOpen className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">{t('classesTaught')}</span>
                </div>
                <div className="text-2xl font-bold text-on-surface">
                  {t('classesCount', { count: activeTeacher.assignedClasses.length })}
                </div>
                <span className="text-xs text-on-surface-variant mt-1 block">
                  {activeTeacher.assignedClasses.join(', ')}
                </span>
              </div>

              <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-4">
                <div className="flex items-center gap-2 text-outline mb-1">
                  <GraduationCap className="w-4 h-4" />
                  <span className="text-xs font-medium uppercase">{t('studentsTaught')}</span>
                </div>
                <div className="text-2xl font-bold text-on-surface">
                  {t('studentsCount', {
                    count: activeTeacher.classesDetail.reduce((acc, c) => acc + c.studentCount, 0),
                  })}
                </div>
                <span className="text-xs text-on-surface-variant mt-1 block">Enrolled Roster Total</span>
              </div>
            </div>

            {/* Teaching Schedule & Timetable Slots */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-on-surface flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  {t('teachingSchedule')}
                </h3>
                <span className="text-xs text-outline font-medium">Term 1 — 2025/2026</span>
              </div>

              {activeTeacher.schedule.length > 0 ? (
                <div className="space-y-2">
                  {activeTeacher.schedule.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant gap-2"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-20 text-xs font-bold text-primary uppercase">
                          {slot.day}
                        </span>
                        <div>
                          <p className="text-sm font-medium text-on-surface">{slot.subject}</p>
                          <p className="text-xs text-on-surface-variant flex items-center gap-1.5 mt-0.5">
                            <span className="font-semibold text-on-surface">{slot.className}</span>
                            <span>•</span>
                            <span>{slot.room}</span>
                          </p>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-outline bg-surface-container-lowest px-2.5 py-1 rounded border border-outline-variant self-start sm:self-auto">
                        {slot.time}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-on-surface-variant italic">
                  No active timetable sessions recorded for this term.
                </p>
              )}
            </div>

            {/* Assigned Classes Roster */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5">
              <h3 className="text-base font-semibold text-on-surface mb-3 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                {t('classesTaught')}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {activeTeacher.classesDetail.map((cls) => (
                  <div
                    key={cls.id}
                    className="p-3.5 rounded-lg border border-outline-variant bg-surface-container-low flex items-start justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-on-surface">
                          Grade {cls.grade} — Class {cls.name}
                        </span>
                        <span className="bg-primary/10 text-primary text-[11px] font-semibold px-2 py-0.5 rounded">
                          {cls.room}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant mt-1.5">
                        {t('studentsCount', { count: cls.studentCount })} enrolled
                      </p>
                      <p className="text-xs text-outline mt-0.5">
                        Next: {cls.nextSession}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Biography & Qualifications */}
            <div className="bg-surface-container-lowest rounded-xl border border-outline-variant p-5 space-y-4">
              <div>
                <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                  Academic Background & Bio
                </h4>
                <p className="text-sm text-on-surface leading-relaxed">{activeTeacher.bio}</p>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-outline uppercase tracking-wider mb-2">
                  {t('qualifications')}
                </h4>
                <ul className="space-y-1.5">
                  {activeTeacher.qualifications.map((q, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-xs text-on-surface-variant">
                      <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                      <span>{q}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Direct Contact Links */}
              <div className="pt-3 border-t border-outline-variant flex flex-wrap gap-4 text-xs text-on-surface-variant">
                <a
                  href={`mailto:${activeTeacher.email}`}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4 text-outline" />
                  <span>{activeTeacher.email}</span>
                </a>
                <a
                  href={`tel:${activeTeacher.phone}`}
                  className="flex items-center gap-1.5 hover:text-primary transition-colors"
                >
                  <Phone className="w-4 h-4 text-outline" />
                  <span>{activeTeacher.phone}</span>
                </a>
                <span className="flex items-center gap-1.5 text-outline">
                  <Building2 className="w-4 h-4" />
                  <span>{activeTeacher.officeRoom}</span>
                </span>
              </div>
            </div>
          </div>
        )}
      </Drawer>

      {/* ──────────────────────────────────────────────────────────────────────────
       * Invite / Add Teacher Drawer (Admin Action)
       * ────────────────────────────────────────────────────────────────────────── */}
      <Drawer
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title={t('inviteTitle')}
        maxWidth="md"
      >
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <p className="text-xs text-on-surface-variant">
            {t('inviteSubtitle')}
          </p>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('fullNameEn')} *
            </label>
            <input
              type="text"
              required
              value={formNameEn}
              onChange={(e) => setFormNameEn(e.target.value)}
              placeholder="e.g. Dr. Maria Garcia"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('fullNameAr')}
            </label>
            <input
              type="text"
              dir="rtl"
              value={formNameAr}
              onChange={(e) => setFormNameAr(e.target.value)}
              placeholder="مثال: د. ماريا جارسيا"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('email')} *
            </label>
            <input
              type="email"
              required
              value={formEmail}
              onChange={(e) => setFormEmail(e.target.value)}
              placeholder="m.garcia@karma-edu.com"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('phone')}
            </label>
            <input
              type="tel"
              value={formPhone}
              onChange={(e) => setFormPhone(e.target.value)}
              placeholder="+971 50 123 4567"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('department')}
              </label>
              <select
                value={formDepartment}
                onChange={(e) => setFormDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="Natural Sciences">Natural Sciences</option>
                <option value="Mathematics & Computing">Mathematics & Computing</option>
                <option value="Humanities & Languages">Humanities & Languages</option>
                <option value="Arts & Physical Ed">Arts & Physical Ed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface mb-1">
                {t('specialization')}
              </label>
              <input
                type="text"
                value={formSpecialization}
                onChange={(e) => setFormSpecialization(e.target.value)}
                placeholder="e.g. Pure Mathematics"
                className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {t('assignedClassesInput')}
            </label>
            <input
              type="text"
              value={formClasses}
              onChange={(e) => setFormClasses(e.target.value)}
              placeholder="e.g. 10A, 10B, 11C"
              className="w-full px-3 py-2 bg-surface-container-low border border-outline-variant rounded-lg text-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={() => setIsInviteOpen(false)}
              className="px-4 py-2 rounded-lg border border-outline-variant text-on-surface text-sm font-medium hover:bg-surface-container-high transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-primary text-on-primary text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              {t('sendInvite')}
            </button>
          </div>
        </form>
      </Drawer>
    </div>
  )
}
