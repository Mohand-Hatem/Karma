'use client'

import type { ReactNode } from 'react'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'
import { useShellStore } from '../../stores/shell-store'

export function DashboardShell({
  children,
  locale,
}: {
  children: ReactNode
  locale: string
}) {
  const { sidebarCollapsed } = useShellStore()
  const isRtl = locale === 'ar'

  return (
    <div className="min-h-screen bg-app text-on-surface flex flex-col antialiased">
      <Sidebar locale={locale} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isRtl
            ? sidebarCollapsed
              ? 'lg:mr-20'
              : 'lg:mr-64'
            : sidebarCollapsed
              ? 'lg:ml-20'
              : 'lg:ml-64'
        }`}
      >
        <Topbar locale={locale} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
