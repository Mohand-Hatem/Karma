import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import ChildrenPage from './page'

function renderChildrenPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <ChildrenPage />
    </NextIntlClientProvider>
  )
}

describe('ChildrenPage (Parent Monitoring Dashboard Stitch Clone)', () => {
  it('renders Parent Dashboard with child switcher and key metrics', () => {
    renderChildrenPage()

    expect(screen.getByText('Parent Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Omar Hatem')).toBeInTheDocument()
    expect(screen.getByText('Sara Hatem')).toBeInTheDocument()

    // Metrics for default selected child (Omar)
    expect(screen.getByText('3.85')).toBeInTheDocument()
    expect(screen.getAllByText('96.2%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Top 15% of class')).toBeInTheDocument()
  })

  it('renders recent published grades with teacher feedback and exam timeline', () => {
    renderChildrenPage()

    expect(screen.getByText('Recent Published Term Grades')).toBeInTheDocument()
    expect(screen.getByText('Advanced Mathematics')).toBeInTheDocument()
    expect(screen.getByText('Physics (HL)')).toBeInTheDocument()
    expect(screen.getByText('World Literature')).toBeInTheDocument()

    expect(screen.getByText('Upcoming Exams & Due Dates')).toBeInTheDocument()
    expect(screen.getByText('History Midterm Examination')).toBeInTheDocument()
    expect(screen.getByText('English Literature Essay Draft')).toBeInTheDocument()
  })

  it('switches child profile when segmented tab is clicked', () => {
    renderChildrenPage()

    const saraTab = screen.getByText('Sara Hatem')
    fireEvent.click(saraTab)

    // Sara's metrics
    expect(screen.getByText('3.92')).toBeInTheDocument()
    expect(screen.getAllByText('98.8%').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Top 8% of class')).toBeInTheDocument()
    expect(screen.getByText('Middle School Science')).toBeInTheDocument()
    expect(screen.getByText('Pre-Algebra & Geometry')).toBeInTheDocument()
  })

  it('renders homeroom advisor contact options and attendance breakdown', () => {
    renderChildrenPage()

    expect(screen.getByText('Homeroom Advisor')).toBeInTheDocument()
    expect(screen.getByText('Mr. Ahmed Hassan')).toBeInTheDocument()
    expect(screen.getByText('Contact Subject Teacher')).toBeInTheDocument()
    expect(screen.getByText('Attendance Record (Term 1)')).toBeInTheDocument()
    expect(screen.getByText('Present Days')).toBeInTheDocument()
  })
})
