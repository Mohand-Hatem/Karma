'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  CalendarDays,
  FileSpreadsheet,
  CheckSquare,
  Award,
  Settings,
  ChevronLeft,
  ChevronRight,
  HeartHandshake,
  HelpCircle,
  CalendarCheck,
  Calendar,
  Megaphone,
  Sparkles,
  Layers,
} from 'lucide-react'
import { useShellStore, type UserRole } from '../../stores/shell-store'

interface NavItem {
  key: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const NAV_ITEMS: NavItem[] = [
  {
    key: 'dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  },
  { key: 'students', href: '/dashboard/students', icon: GraduationCap, roles: ['ADMIN', 'TEACHER'] },
  { key: 'teachers', href: '/dashboard/teachers', icon: Users, roles: ['ADMIN', 'TEACHER'] },
  { key: 'parents', href: '/dashboard/parents', icon: HeartHandshake, roles: ['ADMIN'] },
  { key: 'attendance', href: '/dashboard/attendance', icon: CalendarCheck, roles: ['ADMIN', 'TEACHER'] },
  { key: 'academic', href: '/dashboard/academic', icon: CalendarDays, roles: ['ADMIN'] },
  {
    key: 'timetable',
    href: '/dashboard/timetable',
    icon: Calendar,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'calendar',
    href: '/dashboard/calendar',
    icon: CalendarDays,
    roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  },
  {
    key: 'subjects',
    href: '/dashboard/subjects',
    icon: Layers,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'classes',
    href: '/dashboard/classes',
    icon: BookOpen,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'lessons',
    href: '/dashboard/lessons',
    icon: FileSpreadsheet,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'assignments',
    href: '/dashboard/assignments',
    icon: CheckSquare,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'quizzes',
    href: '/dashboard/quizzes',
    icon: HelpCircle,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  {
    key: 'results',
    href: '/dashboard/results',
    icon: Award,
    roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  },
  {
    key: 'announcements',
    href: '/dashboard/announcements',
    icon: Megaphone,
    roles: ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT'],
  },
  {
    key: 'ai',
    href: '/dashboard/ai',
    icon: Sparkles,
    roles: ['ADMIN', 'TEACHER', 'STUDENT'],
  },
  { key: 'children', href: '/dashboard/children', icon: HeartHandshake, roles: ['PARENT'] },
  { key: 'settings', href: '/dashboard/settings', icon: Settings, roles: ['ADMIN'] },
]

export function Sidebar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const { sidebarCollapsed, toggleSidebar, activeRole, mobileNavOpen, setMobileNavOpen } =
    useShellStore()

  const isRtl = locale === 'ar'
  const filteredNavItems = NAV_ITEMS.filter((item) => item.roles.includes(activeRole))

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileNavOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileNavOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 z-50 flex flex-col bg-surface-container-lowest border-e border-outline-variant transition-all duration-300 shadow-xs
        ${isRtl ? 'right-0' : 'left-0'}
        ${sidebarCollapsed ? 'w-20' : 'w-64'}
        ${mobileNavOpen ? 'translate-x-0' : isRtl ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-3.5 border-b border-outline-variant">
          <Link href={`/${locale}/dashboard`} className="flex items-center overflow-hidden group gap-2">
            <Image
              src="/logo.png"
              alt="Karma Logo"
              width={150}
              height={150}
              className="h-10 w-auto object-contain shrink-0"
              priority
            />
            {!sidebarCollapsed && (
              <span className="font-bold text-lg tracking-tight text-on-surface truncate group-hover:text-primary transition-colors">
                Karma
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={toggleSidebar}
            className="hidden lg:flex p-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95"
            title="Toggle Sidebar"
          >
            {sidebarCollapsed ? (
              isRtl ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )
            ) : isRtl ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <ChevronLeft className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredNavItems.map((item) => {
            const Icon = item.icon
            const localizedHref = `/${locale}${item.href}`
            const isActive = pathname === localizedHref || pathname.startsWith(`${localizedHref}/`)

            return (
              <Link
                key={item.key}
                href={localizedHref}
                onClick={() => setMobileNavOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all group relative active:scale-[0.99]
                  ${
                    isActive
                      ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  }
                  ${sidebarCollapsed ? 'justify-center' : ''}
                `}
                title={sidebarCollapsed ? t(item.key as never) : undefined}
              >
                <Icon
                  className={`w-5 h-5 shrink-0 transition-colors ${isActive ? 'text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}
                />
                {!sidebarCollapsed && <span className="truncate">{t(item.key as never)}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Footer info */}
        <div className="p-4 border-t border-outline-variant text-xs text-on-surface-variant text-center">
          {!sidebarCollapsed && <span>Karma v1.0 • Academic Platform</span>}
        </div>
      </aside>
    </>
  )
}
