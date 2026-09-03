import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import StudentsPage from './page'

function renderStudentsPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <StudentsPage />
    </NextIntlClientProvider>
  )
}

describe('StudentsPage (Students Directory & 360 Profile Stitch Clone)', () => {
  it('renders Students Directory header, search bar, and student rows', () => {
    renderStudentsPage()

    expect(screen.getByText(/Students Directory/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by name, ID code...')).toBeInTheDocument()
    expect(screen.getByText('Sarah Al-Fayed')).toBeInTheDocument()
    expect(screen.getByText('STU-24-1042')).toBeInTheDocument()
    expect(screen.getByText('Omar Hatem')).toBeInTheDocument()
  })

  it('filters students by search query', () => {
    renderStudentsPage()

    const searchInput = screen.getByPlaceholderText('Search by name, ID code...')
    fireEvent.change(searchInput, { target: { value: 'Omar' } })

    expect(screen.getByText('Omar Hatem')).toBeInTheDocument()
    expect(screen.queryByText('Sarah Al-Fayed')).not.toBeInTheDocument()
  })

  it('opens Student Details 360 profile drawer when a row is clicked', () => {
    renderStudentsPage()

    const omarRow = screen.getByText('Omar Hatem')
    fireEvent.click(omarRow)

    expect(screen.getByText('Academic Overview')).toBeInTheDocument()
    expect(screen.getByText('Attendance Breakdown')).toBeInTheDocument()
    expect(screen.getByText('Primary Contact')).toBeInTheDocument()
    expect(screen.getAllByText('Mariam Hatem').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Physics (HL)')).toBeInTheDocument()
  })

  it('allows enrolling a new student via the Enroll Student drawer', () => {
    renderStudentsPage()

    const enrollBtn = screen.getByText('Enroll Student')
    fireEvent.click(enrollBtn)

    expect(screen.getByText('Enroll New Student')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('e.g. Ziad Mansour')
    fireEvent.change(nameInput, { target: { value: 'Laila Hassan' } })

    const submitBtn = screen.getByText('Save Student')
    fireEvent.click(submitBtn)

    expect(screen.getByText('Laila Hassan')).toBeInTheDocument()
  })
})
