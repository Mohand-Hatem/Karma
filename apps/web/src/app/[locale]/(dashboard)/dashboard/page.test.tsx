import { describe, expect, it, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../i18n/messages/en.json'
import DashboardPage from './page'
import { useShellStore } from '../../../../stores/shell-store'

function renderDashboardPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <DashboardPage params={Promise.resolve({ locale: 'en' })} />
    </NextIntlClientProvider>
  )
}

describe('DashboardPage (Role-Based Stitch Clones & Executive Analytics)', () => {
  beforeEach(() => {
    useShellStore.getState().setActiveRole('ADMIN')
  })

  it('renders Admin view with School Overview and switches to Executive Analytics', () => {
    renderDashboardPage()

    // Overview KPIs
    expect(screen.getByRole('heading', { name: 'School Overview' })).toBeInTheDocument()
    expect(screen.getByText('1,248')).toBeInTheDocument()
    expect(screen.getByText('84')).toBeInTheDocument()
    expect(screen.getByText('96.2%')).toBeInTheDocument()
    expect(screen.getByText('42')).toBeInTheDocument()

    // Switch to Executive Analytics
    const execTabBtn = screen.getByRole('button', { name: 'Executive Analytics' })
    fireEvent.click(execTabBtn)

    // Executive Metrics
    expect(screen.getByText('3.42')).toBeInTheDocument()
    expect(screen.getByText('94.8%')).toBeInTheDocument()
    expect(screen.getByText('142')).toBeInTheDocument()
    expect(screen.getByText('7.8/10')).toBeInTheDocument()
    expect(screen.getByText('Grade Distribution')).toBeInTheDocument()
    expect(screen.getByText('Subject Performance')).toBeInTheDocument()
  })

  it('renders Teacher dashboard when activeRole is TEACHER', () => {
    useShellStore.getState().setActiveRole('TEACHER')
    renderDashboardPage()

    expect(screen.getByText('Welcome back, Mr. Ahmed Hassan')).toBeInTheDocument()
    expect(screen.getByText("Today's Teaching Schedule")).toBeInTheDocument()
    expect(screen.getAllByText('Grade 10A Physics').length).toBeGreaterThan(0)
    expect(screen.getByText('Grade 11B Physics')).toBeInTheDocument()

    // Grading queue
    expect(screen.getByText('Kinematics Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Lab Report: Forces')).toBeInTheDocument()
    expect(screen.getByText('72%')).toBeInTheDocument()
  })

  it('renders Student dashboard when activeRole is STUDENT', () => {
    useShellStore.getState().setActiveRole('STUDENT')
    renderDashboardPage()

    expect(screen.getByText('Good morning, Omar!')).toBeInTheDocument()
    expect(screen.getByText("Today's Timetable")).toBeInTheDocument()
    expect(screen.getByText('Physics (HL)')).toBeInTheDocument()
    expect(screen.getByText('In Progress')).toBeInTheDocument()
    expect(screen.getByText('Physics Lab Report: Kinematics')).toBeInTheDocument()
    expect(screen.getByText('96.5%')).toBeInTheDocument()
  })

  it('renders Parent dashboard when activeRole is PARENT', () => {
    useShellStore.getState().setActiveRole('PARENT')
    renderDashboardPage()

    expect(screen.getByText('Welcome back, Mr. Nabil!')).toBeInTheDocument()
    expect(screen.getByText('View 360° Child Portal')).toBeInTheDocument()
    expect(screen.getByText('Omar Hatem (Grade 10A), Layla Hatem (Grade 6B)')).toBeInTheDocument()
  })
})
