'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Menu, Globe, Building2, UserCheck, LogOut, Bell } from 'lucide-react'
import { useShellStore, type UserRole } from '../../stores/shell-store'

const ROLES: UserRole[] = ['ADMIN', 'TEACHER', 'STUDENT', 'PARENT']

export function Topbar({ locale }: { locale: string }) {
  const tAuth = useTranslations('auth')
  const tRoles = useTranslations('roles')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const { setMobileNavOpen, activeRole, setActiveRole, activeOrganization } = useShellStore()

  // Build target link to switch locale while preserving path
  const targetLocale = locale === 'en' ? 'ar' : 'en'
  const switchedPath = pathname.replace(`/${locale}`, `/${targetLocale}`)

  return (
    <header className="h-16 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 bg-surface-container-lowest/90 backdrop-blur-md border-b border-outline-variant">
      <div className="flex items-center gap-3">
        {/* Mobile menu trigger */}
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="lg:hidden p-2 rounded-lg text-on-surface-variant hover:bg-surface-container active:scale-95 transition-all"
          aria-label="Open navigation drawer"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Mobile Logo on topbar */}
        <Link href={`/${locale}/dashboard`} className="flex lg:hidden items-center gap-2">
          <Image
            src="/logo.png"
            alt="Karma Logo"
            width={32}
            height={32}
            className="h-8 w-auto object-contain"
            priority
          />
        </Link>

        {/* Organization Name Pill */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface-container border border-outline-variant text-on-surface text-xs font-semibold shadow-xs">
          <Building2 className="w-3.5 h-3.5 text-primary" />
          <span>{activeOrganization?.name || 'Karma School'}</span>
        </div>
      </div>

      {/* Center/Right Controls: Role Switcher, Language Toggle, Sign Out */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Role Demo Quick Switcher */}
        <div className="flex items-center p-1 rounded-xl bg-surface-container border border-outline-variant text-xs">
          <span className="px-2 font-medium text-on-surface-variant flex items-center gap-1">
            <UserCheck className="w-3 h-3" />
            Role:
          </span>
          {ROLES.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => setActiveRole(role)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all active:scale-95 ${
                activeRole === role
                  ? 'bg-primary text-on-primary shadow-xs font-semibold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              {tRoles(role)}
            </button>
          ))}
        </div>

        {/* Notification Center Bell */}
        <Link
          href={`/${locale}/dashboard/notifications`}
          className="relative p-2 rounded-xl text-on-surface-variant hover:text-primary hover:bg-surface-container active:scale-95 transition-all shadow-xs border border-outline-variant bg-surface-container-lowest"
          title="Notification Center"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-error rounded-full ring-2 ring-surface-container-lowest" />
        </Link>

        {/* Language Switcher */}
        <Link
          href={switchedPath}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-outline-variant text-xs font-medium text-on-surface bg-surface-container-lowest hover:bg-surface-container active:scale-95 transition-all shadow-xs"
          title="Switch Language"
        >
          <Globe className="w-3.5 h-3.5 text-on-surface-variant" />
          <span>{tCommon('switchLang')}</span>
        </Link>

        {/* Sign Out Link */}
        <Link
          href={`/${locale}/login`}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 rounded-xl text-xs font-medium text-error hover:bg-error/10 active:scale-95 transition-all"
          title={tAuth('logout')}
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">{tAuth('logout')}</span>
        </Link>
      </div>
    </header>
  )
}
