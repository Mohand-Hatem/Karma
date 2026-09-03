import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import ClassesPage from './page'

function renderClassesPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ClassesPage />
    </NextIntlClientProvider>
  )
}

describe('ClassesPage (Stitch Clone)', () => {
  it('renders page header and grade sections', () => {
    renderClassesPage()

    expect(screen.getByText('Classes Management')).toBeInTheDocument()
    expect(screen.getByText('Grade 10')).toBeInTheDocument()
    expect(screen.getByText('Grade 11')).toBeInTheDocument()
    expect(screen.getByText('Class 10A')).toBeInTheDocument()
    expect(screen.getByText('Class 11A')).toBeInTheDocument()
  })

  it('filters classes by search query', () => {
    renderClassesPage()

    const searchInput = screen.getByPlaceholderText('Search classes...')
    fireEvent.change(searchInput, { target: { value: 'Elena' } })

    expect(screen.getByText('Class 11A')).toBeInTheDocument()
    expect(screen.queryByText('Class 10A')).not.toBeInTheDocument()
  })

  it('opens student roster drawer when Manage Roster is clicked', () => {
    renderClassesPage()

    const manageRosterBtns = screen.getAllByText('Manage Roster')
    fireEvent.click(manageRosterBtns[0])

    expect(screen.getByText('Student Name')).toBeInTheDocument()
    expect(screen.getByText('Ahmad Ibrahim')).toBeInTheDocument()
    expect(screen.getByText('STU-2025-001')).toBeInTheDocument()
  })

  it('allows adding a new student to the roster', () => {
    renderClassesPage()

    const manageRosterBtns = screen.getAllByText('Manage Roster')
    fireEvent.click(manageRosterBtns[0])

    const enrollToggleBtn = screen.getByText('Enroll Student')
    fireEvent.click(enrollToggleBtn)

    const nameInput = screen.getByPlaceholderText('e.g. Ziad Mansour')
    fireEvent.change(nameInput, { target: { value: 'Karim Mostafa' } })

    const saveBtn = screen.getByText('Save')
    fireEvent.click(saveBtn)

    expect(screen.getByText('Student enrolled successfully!')).toBeInTheDocument()
    expect(screen.getByText('Karim Mostafa')).toBeInTheDocument()
  })
})
