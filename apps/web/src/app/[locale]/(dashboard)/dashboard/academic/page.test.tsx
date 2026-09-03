import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import AcademicPage from './page'

function renderAcademicPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AcademicPage />
    </NextIntlClientProvider>
  )
}

describe('AcademicPage (Academic Years & Terms Stitch Clone)', () => {
  it('renders Academic Years title, buttons, and timeline cycles', () => {
    renderAcademicPage()

    expect(screen.getByText('Academic Years')).toBeInTheDocument()
    expect(screen.getByText('Configure Terms')).toBeInTheDocument()
    expect(screen.getByText('Add Academic Year')).toBeInTheDocument()

    // Cycles (rendered in card headers)
    expect(screen.getAllByText('2025/2026').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('CURRENT ACTIVE')).toBeInTheDocument()
    expect(screen.getAllByText('2026/2027').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('UPCOMING')).toBeInTheDocument()
    expect(screen.getAllByText('2024/2025').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('ARCHIVED')).toBeInTheDocument()
  })

  it('renders terms breakdown with instructional days and progress bars', () => {
    renderAcademicPage()

    // 180 Instructional Days
    expect(screen.getAllByText('180 Instructional Days').length).toBeGreaterThanOrEqual(1)

    // Terms in 2025/2026
    expect(screen.getAllByText('Term 1').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('Fall Semester').length).toBeGreaterThanOrEqual(1)
    expect(screen.getAllByText('72 Days').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('45%')).toBeInTheDocument()
  })

  it('opens Add Academic Year drawer and registers a new academic cycle', () => {
    renderAcademicPage()

    const addBtn = screen.getByText('Add Academic Year')
    fireEvent.click(addBtn)

    expect(screen.getByText('Create Academic Year Cycle')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('e.g. 2027/2028')
    fireEvent.change(nameInput, { target: { value: '2027/2028' } })

    const saveBtn = screen.getByText('Create Academic Cycle')
    fireEvent.click(saveBtn)

    expect(screen.getAllByText('2027/2028').length).toBeGreaterThanOrEqual(1)
  })
})
