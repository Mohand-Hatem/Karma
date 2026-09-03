import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import AttendancePage from './page'

function renderAttendancePage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AttendancePage />
    </NextIntlClientProvider>
  )
}

describe('AttendancePage (Attendance Register & Analytics Heatmap Stitch Clone)', () => {
  it('renders Attendance Register header, roster table, and bottom metrics summary bar', () => {
    renderAttendancePage()

    expect(screen.getByText(/Attendance Register: Grade 10A — Physics/i)).toBeInTheDocument()
    expect(screen.getByText(/24-Hour Teacher Edit Window Active/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search student by name or code...')).toBeInTheDocument()
    expect(screen.getByText('Mark All Present')).toBeInTheDocument()

    // Students in roster
    expect(screen.getByText('Omar Al-Farsi')).toBeInTheDocument()
    expect(screen.getByText('STD-10042')).toBeInTheDocument()
    expect(screen.getByText('Faisal Abdullah')).toBeInTheDocument()

    // Bottom summary bar
    expect(screen.getByText('Total: 8')).toBeInTheDocument()
    expect(screen.getByText('Save as Draft')).toBeInTheDocument()
    expect(screen.getByText('Submit Register')).toBeInTheDocument()
  })

  it('filters students by search input', () => {
    renderAttendancePage()

    const searchInput = screen.getByPlaceholderText('Search student by name or code...')
    fireEvent.change(searchInput, { target: { value: 'Layla' } })

    expect(screen.getByText('Layla Mahmoud')).toBeInTheDocument()
    expect(screen.queryByText('Omar Al-Farsi')).not.toBeInTheDocument()
    expect(screen.queryByText('Faisal Abdullah')).not.toBeInTheDocument()
  })

  it('marks all students present when Mark All Present is clicked', () => {
    renderAttendancePage()

    const markAllBtn = screen.getByText('Mark All Present')
    fireEvent.click(markAllBtn)

    // All 8 students should now be marked Present
    expect(screen.getByText('Present: 8 (100%)')).toBeInTheDocument()
    expect(screen.getByText('Absent: 0')).toBeInTheDocument()
  })

  it('allows changing an individual student status using segmented buttons', () => {
    renderAttendancePage()

    // Find row for Omar Al-Farsi and click Absent button (title="Absent")
    const absentButtons = screen.getAllByTitle('Absent')
    fireEvent.click(absentButtons[0]) // Change Omar from P to A

    expect(screen.getByText('Absent: 2')).toBeInTheDocument()
  })

  it('submits the register and displays a success toast', () => {
    renderAttendancePage()

    const submitBtn = screen.getByText('Submit Register')
    fireEvent.click(submitBtn)

    expect(
      screen.getByText('Attendance register submitted successfully! Parents notified.')
    ).toBeInTheDocument()
  })

  it('switches to Analytics & Heatmap tab and displays KPI cards and watchlist', () => {
    renderAttendancePage()

    const analyticsTab = screen.getByText('Analytics & Heatmap')
    fireEvent.click(analyticsTab)

    // Analytics Header & KPI Cards
    expect(screen.getByText('Attendance Analytics')).toBeInTheDocument()
    expect(screen.getByText('Average Daily Attendance')).toBeInTheDocument()
    expect(screen.getAllByText('94.2%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Chronically Absent')).toBeInTheDocument()
    expect(screen.getByText('4.8%')).toBeInTheDocument()
    expect(screen.getByText('Perfect Attendance')).toBeInTheDocument()

    // Heatmap Title & Grade Cohorts
    expect(screen.getByText('Daily Attendance Rate')).toBeInTheDocument()
    expect(screen.getByText('Grade Cohort Attendance')).toBeInTheDocument()

    // Chronic Absenteeism Watchlist
    expect(screen.getByText('Chronic Absenteeism Watchlist')).toBeInTheDocument()
    const notifyBtns = screen.getAllByText('Notify Parent')
    expect(notifyBtns.length).toBeGreaterThanOrEqual(1)

    // Click notify parent
    fireEvent.click(notifyBtns[0])
    expect(screen.getByText(/Parent notification alert dispatched/i)).toBeInTheDocument()
  })
})
