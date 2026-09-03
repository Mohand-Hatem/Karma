import type { ReactNode } from 'react'
import { DashboardShell } from '../../../components/layout/dashboard-shell'

export default async function DashboardLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params

  return <DashboardShell locale={locale}>{children}</DashboardShell>
}
