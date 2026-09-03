import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import SubjectsCataloguePage from './page'

function renderSubjectsPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SubjectsCataloguePage />
    </NextIntlClientProvider>
  )
}

describe('SubjectsCataloguePage (Subjects Catalogue Stitch Clone)', () => {
  it('renders Subjects Catalogue with table rows and controls', () => {
    renderSubjectsPage()

    expect(screen.getByText('Subjects Catalogue')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search by subject code, name, or department...')).toBeInTheDocument()
    expect(screen.getByText('Add Subject')).toBeInTheDocument()

    // Table entries
    expect(screen.getByText('PHY-101')).toBeInTheDocument()
    expect(screen.getByText('Physics')).toBeInTheDocument()
    expect(screen.getByText('الفيزياء')).toBeInTheDocument()
    expect(screen.getByText('MAT-201')).toBeInTheDocument()
    expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument()
  })

  it('filters subjects by department selection', () => {
    renderSubjectsPage()

    const selects = screen.getAllByRole('combobox')
    const deptSelect = selects[0] // Department filter

    fireEvent.change(deptSelect, { target: { value: 'Science' } })

    expect(screen.getByText('PHY-101')).toBeInTheDocument()
    expect(screen.getByText('BIO-301')).toBeInTheDocument()
    // Mathematics should be filtered out
    expect(screen.queryByText('MAT-201')).not.toBeInTheDocument()
  })

  it('toggles between list view and grid view', () => {
    renderSubjectsPage()

    const gridBtn = screen.getByTitle('Grid View')
    fireEvent.click(gridBtn)

    // In grid view, weekly hours badge is rendered
    expect(screen.getByText('5h / week')).toBeInTheDocument()

    const listBtn = screen.getByTitle('List View')
    fireEvent.click(listBtn)

    expect(screen.getByText('Subject Code')).toBeInTheDocument()
  })

  it('opens Add Subject drawer and submits a new subject', () => {
    renderSubjectsPage()

    const addBtn = screen.getByText('Add Subject')
    fireEvent.click(addBtn)

    expect(screen.getByText('Add Academic Subject')).toBeInTheDocument()

    const codeInput = screen.getByPlaceholderText('e.g. CHE-101')
    fireEvent.change(codeInput, { target: { value: 'CHE-101' } })

    const nameEnInput = screen.getByPlaceholderText('e.g. Chemistry')
    fireEvent.change(nameEnInput, { target: { value: 'Chemistry Core' } })

    const nameArInput = screen.getByPlaceholderText('e.g. الكيمياء')
    fireEvent.change(nameArInput, { target: { value: 'الكيمياء العامة' } })

    const submitBtn = screen.getByText('Publish Subject')
    fireEvent.click(submitBtn)

    expect(screen.getByText('CHE-101')).toBeInTheDocument()
    expect(screen.getByText('Chemistry Core')).toBeInTheDocument()
  })
})
