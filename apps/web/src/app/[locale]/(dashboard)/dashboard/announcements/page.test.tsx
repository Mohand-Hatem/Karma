import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import AnnouncementsPage from './page'

function renderAnnouncementsPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <AnnouncementsPage />
    </NextIntlClientProvider>
  )
}

describe('AnnouncementsPage (Announcements Board & Notifications Stitch Clone)', () => {
  it('renders Announcements Board with feed cards and filters', () => {
    renderAnnouncementsPage()

    expect(screen.getByText('Announcements')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Search announcements, students, classes...')).toBeInTheDocument()
    expect(screen.getByText('Post Announcement')).toBeInTheDocument()

    // Announcement cards
    expect(screen.getByText('Updated Term 1 Examination Schedule')).toBeInTheDocument()
    expect(screen.getByText('Dr. Sarah Jenkins')).toBeInTheDocument()
    expect(screen.getByText('Term1_Revised_Schedule.pdf')).toBeInTheDocument()
  })

  it('filters announcements by audience category', () => {
    renderAnnouncementsPage()

    const studentsFilterBtn = screen.getByRole('button', { name: 'Students' })
    fireEvent.click(studentsFilterBtn)

    expect(screen.getByText('Varsity Soccer Tryouts Registration Open')).toBeInTheDocument()
    // Parents-only announcement should be hidden
    expect(
      screen.queryByText('Annual Charity Gala & Book Fair Volunteer Call')
    ).not.toBeInTheDocument()
  })

  it('opens Post Announcement drawer and submits a new announcement', () => {
    renderAnnouncementsPage()

    const postBtn = screen.getByText('Post Announcement')
    fireEvent.click(postBtn)

    expect(screen.getByText('New School Announcement')).toBeInTheDocument()

    const titleInput = screen.getByPlaceholderText('e.g. Winter Term Schedule Update')
    fireEvent.change(titleInput, { target: { value: 'Science Fair 2026 Announcement' } })

    const bodyInput = screen.getByPlaceholderText('Type your official announcement or circular here...')
    fireEvent.change(bodyInput, { target: { value: 'Registration for STEM science fair is open to all students.' } })

    const submitBtn = screen.getByText('Publish Announcement')
    fireEvent.click(submitBtn)

    expect(screen.getByText('Science Fair 2026 Announcement')).toBeInTheDocument()
  })

  it('switches to Notification Center and displays notification items', () => {
    renderAnnouncementsPage()

    const notifTab = screen.getByText('Notification Center')
    fireEvent.click(notifTab)

    expect(
      screen.getByText('Physics Lab Report #3 has been graded')
    ).toBeInTheDocument()
    expect(screen.getByText('Schedule Change Alert')).toBeInTheDocument()
    expect(screen.getByText('Mark all as read')).toBeInTheDocument()

    // Mark all as read
    const markReadBtn = screen.getByText('Mark all as read')
    fireEvent.click(markReadBtn)

    expect(screen.getByText('All notifications marked as read.')).toBeInTheDocument()
  })
})
