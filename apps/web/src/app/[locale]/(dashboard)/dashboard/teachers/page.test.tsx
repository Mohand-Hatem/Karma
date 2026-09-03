import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import TeachersPage from './page'

function renderTeachersPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <TeachersPage />
    </NextIntlClientProvider>
  )
}

describe('TeachersPage (Teaching Staff Directory & 360° Profile Stitch Clone)', () => {
  it('renders Teaching Staff directory header, cards, and export button', () => {
    renderTeachersPage()

    expect(screen.getByText('Teaching Staff')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by name, subject, or class...')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Mr. Ahmed Hassan')).toBeInTheDocument()
    expect(screen.getByText('Dr. Sarah Williams')).toBeInTheDocument()
    expect(screen.getByText('Elena Rostova')).toBeInTheDocument()
  })

  it('filters teachers by search query', () => {
    renderTeachersPage()

    const searchInput = screen.getByPlaceholderText('Search by name, subject, or class...')
    fireEvent.change(searchInput, { target: { value: 'Ahmed' } })

    expect(screen.getByText('Mr. Ahmed Hassan')).toBeInTheDocument()
    expect(screen.queryByText('Dr. Sarah Williams')).not.toBeInTheDocument()
    expect(screen.queryByText('Elena Rostova')).not.toBeInTheDocument()
  })

  it('filters teachers by department', () => {
    renderTeachersPage()

    const selects = screen.getAllByRole('combobox')
    const deptSelect = selects[0] // First select is department
    fireEvent.change(deptSelect, { target: { value: 'Humanities & Languages' } })

    expect(screen.getByText('Elena Rostova')).toBeInTheDocument()
    expect(screen.queryByText('Mr. Ahmed Hassan')).not.toBeInTheDocument()
  })

  it('opens Teacher Details 360 profile drawer when View Profile is clicked', () => {
    renderTeachersPage()

    const viewProfileButtons = screen.getAllByText('View Profile')
    fireEvent.click(viewProfileButtons[0]) // First teacher: Mr. Ahmed Hassan

    expect(screen.getByText('Teaching Schedule & Timetable')).toBeInTheDocument()
    expect(screen.getByText('EMP-2018-042')).toBeInTheDocument()
    expect(screen.getByText('Science Block B, Rm 302')).toBeInTheDocument()
    expect(screen.getByText('M.Sc. Applied Physics (Cairo Univ)')).toBeInTheDocument()
  })

  it('shows empty state when no teachers match query and allows clearing filters', () => {
    renderTeachersPage()

    const searchInput = screen.getByPlaceholderText('Search by name, subject, or class...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentFaculty123' } })

    expect(screen.getByText('No teachers found')).toBeInTheDocument()

    const clearBtn = screen.getByText('Clear Filters')
    fireEvent.click(clearBtn)

    expect(screen.getByText('Mr. Ahmed Hassan')).toBeInTheDocument()
  })

  it('allows opening the invite drawer and submitting a new teacher', () => {
    renderTeachersPage()

    const inviteBtn = screen.getByText('+ Invite Teacher')
    fireEvent.click(inviteBtn)

    expect(screen.getByText('Invite New Teacher')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('e.g. Dr. Maria Garcia')
    const nameArInput = screen.getByPlaceholderText('مثال: د. ماريا جارسيا')
    const emailInput = screen.getByPlaceholderText('m.garcia@karma-edu.com')

    fireEvent.change(nameInput, { target: { value: 'Dr. Maria Garcia' } })
    fireEvent.change(nameArInput, { target: { value: 'د. ماريا جارسيا' } })
    fireEvent.change(emailInput, { target: { value: 'maria.garcia@karma-edu.com' } })

    const sendBtn = screen.getByText('Send Invitation')
    fireEvent.click(sendBtn)

    expect(screen.getByText('Dr. Maria Garcia')).toBeInTheDocument()
    expect(screen.getByText('د. ماريا جارسيا')).toBeInTheDocument()
  })
})
