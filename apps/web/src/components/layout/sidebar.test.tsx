import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messagesEn from '../../../i18n/messages/en.json'
import messagesAr from '../../../i18n/messages/ar.json'
import { Sidebar } from './sidebar'
import { useShellStore } from '../../stores/shell-store'

vi.mock('next/navigation', () => ({
  usePathname: () => '/en/dashboard',
}))

describe('Sidebar Component', () => {
  beforeEach(() => {
    useShellStore.setState({
      activeRole: 'ADMIN',
      sidebarCollapsed: false,
      mobileNavOpen: false,
    })
  })

  it('renders admin navigation items in English', () => {
    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        <Sidebar locale="en" />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('Karma')).toBeInTheDocument()
    expect(screen.getByText('Students & Rosters')).toBeInTheDocument()
    expect(screen.getByText('Teachers & Staff')).toBeInTheDocument()
    expect(screen.getByText('Academic Structure')).toBeInTheDocument()
  })

  it('filters navigation items when role switches to STUDENT', () => {
    useShellStore.setState({ activeRole: 'STUDENT' })

    render(
      <NextIntlClientProvider locale="en" messages={messagesEn}>
        <Sidebar locale="en" />
      </NextIntlClientProvider>
    )

    expect(screen.queryByText('Students & Rosters')).not.toBeInTheDocument()
    expect(screen.queryByText('Teachers & Staff')).not.toBeInTheDocument()
    expect(screen.getByText('Lessons & Curriculum')).toBeInTheDocument()
    expect(screen.getByText('Assignments & Grading')).toBeInTheDocument()
  })

  it('renders parent specific items for PARENT role in Arabic', () => {
    useShellStore.setState({ activeRole: 'PARENT' })

    render(
      <NextIntlClientProvider locale="ar" messages={messagesAr}>
        <Sidebar locale="ar" />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('أبنائي')).toBeInTheDocument()
    expect(screen.getByText('سجل الدرجات والشهادات')).toBeInTheDocument()
    expect(screen.queryByText('المعلمون وهيئة التدريس')).not.toBeInTheDocument()
  })
})
