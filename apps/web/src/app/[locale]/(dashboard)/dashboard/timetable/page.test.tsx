import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import TimetablePage from './page'

function renderTimetablePage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TimetablePage />
    </NextIntlClientProvider>
  )
}

describe('TimetablePage (Timetable Grid & Events Calendar Stitch Clone)', () => {
  it('renders Timetable Matrix header, controls, and schedule grid', () => {
    renderTimetablePage()

    expect(screen.getByText('Timetable Matrix')).toBeInTheDocument()
    expect(screen.getByText('Print Schedule')).toBeInTheDocument()
    expect(screen.getByText('Publish')).toBeInTheDocument()

    // Periods
    expect(screen.getByText('Period 1')).toBeInTheDocument()
    expect(screen.getByText('Period 2')).toBeInTheDocument()
    expect(screen.getByText(/Morning Break/i)).toBeInTheDocument()

    // Days & Subjects (multiple instances in week)
    expect(screen.getAllByText('Advanced Calculus').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Dr. A. Turing').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Physics 101')).toBeInTheDocument()
  })

  it('renders room conflict alert for double booked slots', () => {
    renderTimetablePage()

    expect(screen.getByText('Room 302 (Conflict)')).toBeInTheDocument()
    expect(screen.getByTitle('Double Booked Room 302 with Grade 11A!')).toBeInTheDocument()
  })

  it('publishes timetable and shows confirmation toast', () => {
    renderTimetablePage()

    const publishBtn = screen.getByText('Publish')
    fireEvent.click(publishBtn)

    expect(
      screen.getByText('Timetable published to teachers and students successfully!')
    ).toBeInTheDocument()
  })

  it('switches to School Events Calendar view', () => {
    renderTimetablePage()

    const calendarTab = screen.getByText('School Events Calendar')
    fireEvent.click(calendarTab)

    expect(screen.getByText('October 2026')).toBeInTheDocument()
    expect(screen.getByText('School Events')).toBeInTheDocument()
    expect(screen.getByText('Holidays')).toBeInTheDocument()
    expect(screen.getByText('Exams')).toBeInTheDocument()

    // Scheduled events
    expect(screen.getByText('Calculus Midterm Examination')).toBeInTheDocument()
  })

  it('opens Create Event drawer and submits new calendar event', () => {
    renderTimetablePage()

    const calendarTab = screen.getByText('School Events Calendar')
    fireEvent.click(calendarTab)

    // Click the trigger button to open the drawer
    const createEventButtons = screen.getAllByRole('button', { name: 'Create Event' })
    fireEvent.click(createEventButtons[0])

    const titleInput = screen.getByPlaceholderText('e.g. Science Fair Presentation')
    fireEvent.change(titleInput, { target: { value: 'Annual Drama Production' } })

    // Click submit button inside the form (the second Create Event button)
    const submitBtn = screen.getAllByRole('button', { name: 'Create Event' })[1]
    fireEvent.click(submitBtn)

    expect(screen.getByText('Annual Drama Production')).toBeInTheDocument()
  })
})
