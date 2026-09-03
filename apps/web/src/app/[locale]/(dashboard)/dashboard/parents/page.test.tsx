import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import ParentsPage from './page'

function renderParentsPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ParentsPage />
    </NextIntlClientProvider>
  )
}

describe('ParentsPage (Parents Directory Stitch Clone)', () => {
  it('renders Parents Management title, search bar, and parent records', () => {
    renderParentsPage()

    expect(screen.getByText('Parents Management')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search parents by name, email, or child...')).toBeInTheDocument()
    expect(screen.getByText('Export CSV')).toBeInTheDocument()
    expect(screen.getByText('Ahmed Hatem')).toBeInTheDocument()
    expect(screen.getByText('Fatima Mahmoud')).toBeInTheDocument()
    expect(screen.getByText('Mariam Al-Sayed')).toBeInTheDocument()
  })

  it('renders linked children pills with relations and grades', () => {
    renderParentsPage()

    expect(screen.getByText('Omar Hatem')).toBeInTheDocument()
    expect(screen.getByText('[Son - Grade 10A]')).toBeInTheDocument()
    expect(screen.getByText('Sara Hatem')).toBeInTheDocument()
    expect(screen.getByText('[Daughter - Grade 7B]')).toBeInTheDocument()
  })

  it('filters parents by live search query', () => {
    renderParentsPage()

    const searchInput = screen.getByPlaceholderText('Search parents by name, email, or child...')
    fireEvent.change(searchInput, { target: { value: 'Fatima' } })

    expect(screen.getByText('Fatima Mahmoud')).toBeInTheDocument()
    expect(screen.queryByText('Ahmed Hatem')).not.toBeInTheDocument()
    expect(screen.queryByText('Mariam Al-Sayed')).not.toBeInTheDocument()
  })

  it('shows empty state when search returns no matches and allows clearing filters', () => {
    renderParentsPage()

    const searchInput = screen.getByPlaceholderText('Search parents by name, email, or child...')
    fireEvent.change(searchInput, { target: { value: 'NonexistentParentXYZ' } })

    expect(screen.getByText('No parents found')).toBeInTheDocument()

    const clearBtn = screen.getByText('Clear Filters')
    fireEvent.click(clearBtn)

    expect(screen.getByText('Ahmed Hatem')).toBeInTheDocument()
  })

  it('opens Register Parent drawer and registers a new parent', () => {
    renderParentsPage()

    const addBtn = screen.getByText('+ Add Parent')
    fireEvent.click(addBtn)

    expect(screen.getByText('Register Parent / Guardian')).toBeInTheDocument()

    const nameInput = screen.getByPlaceholderText('e.g. Tariq Mansour')
    const nameArInput = screen.getByPlaceholderText('مثال: طارق منصور')
    const emailInput = screen.getByPlaceholderText('parent@example.com')

    fireEvent.change(nameInput, { target: { value: 'Hossam Radwan' } })
    fireEvent.change(nameArInput, { target: { value: 'حسام رضوان' } })
    fireEvent.change(emailInput, { target: { value: 'h.radwan@example.com' } })

    const saveBtn = screen.getByText('Register Parent')
    fireEvent.click(saveBtn)

    expect(screen.getByText('Hossam Radwan')).toBeInTheDocument()
    expect(screen.getByText('حسام رضوان')).toBeInTheDocument()
  })

  it('opens Link Child drawer when + Link Child action is clicked', () => {
    renderParentsPage()

    const linkButtons = screen.getAllByText('+ Link Child')
    fireEvent.click(linkButtons[0]) // First parent: Ahmed Hatem

    expect(screen.getByText(/Link Student to Parent/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText('e.g. Omar Hatem')).toBeInTheDocument()
  })
})
