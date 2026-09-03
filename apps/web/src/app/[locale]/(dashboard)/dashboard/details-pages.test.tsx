import { describe, expect, it, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../i18n/messages/en.json'

import StudentDetailsPage from './students/[id]/page'
import TeacherDetailsPage from './teachers/[id]/page'
import ClassDetailsPage from './classes/[id]/page'
import LessonDetailsPage from './lessons/[id]/page'
import AssignmentGradingPage from './assignments/[id]/page'
import QuizBuilderPage from './quizzes/builder/page'
import OnlineQuizTakingPage from './quizzes/[id]/take/page'
import EventsCalendarPage from './calendar/page'
import NotificationCenterPage from './notifications/page'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({ locale: 'en', id: '1' }),
  usePathname: () => '/en/dashboard',
  useSearchParams: () => new URLSearchParams(),
}))

describe('Dedicated Full-Page Detail Routes (Stitch Faithfulness & Rule #2)', () => {
  it('renders Student 360° Profile full page (Stitch Screen 01)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <StudentDetailsPage params={Promise.resolve({ locale: 'en', id: 'stu-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getAllByText('Omar Hatem').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('STU-2026-0042')).toBeInTheDocument()
    expect(screen.getByText('Homeroom')).toBeInTheDocument()
    expect(screen.getByText('Mr. David Miller')).toBeInTheDocument()
    expect(screen.getByText('96.2%')).toBeInTheDocument()
    expect(screen.getByText('Academic Overview')).toBeInTheDocument()
    expect(screen.getByText('Enrolled Subjects')).toBeInTheDocument()
    expect(screen.getByText('Physics (HL)')).toBeInTheDocument()
  })

  it('renders Teacher Details full page (Stitch Screen 19)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <TeacherDetailsPage params={Promise.resolve({ locale: 'en', id: 'tch-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getAllByText('Mr. Ahmed Hassan').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Senior Physics Teacher')).toBeInTheDocument()
    expect(screen.getByText('EMP-2018-042')).toBeInTheDocument()
    expect(screen.getByText('Qualifications')).toBeInTheDocument()
    expect(screen.getByText('MSc. Applied Physics')).toBeInTheDocument()
    expect(screen.getByText('Weekly Teaching Timetable')).toBeInTheDocument()
  })

  it('renders Class Details & Student Roster full page (Stitch Screen 12)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <ClassDetailsPage params={Promise.resolve({ locale: 'en', id: 'cls-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getAllByText('Class 10A').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Student Roster (28)')).toBeInTheDocument()
    expect(screen.getByText('Layla Mahmoud')).toBeInTheDocument()
    expect(screen.getByText('Enroll Student')).toBeInTheDocument()
  })

  it('renders Lesson Details & Resources full page (Stitch Screen 22)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <LessonDetailsPage params={Promise.resolve({ locale: 'en', id: 'les-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getByText('Circular Motion & Gravitation')).toBeInTheDocument()
    expect(screen.getByText('1. Uniform Circular Motion')).toBeInTheDocument()
    expect(screen.getByText('Centripetal Acceleration')).toBeInTheDocument()
    expect(screen.getByText('Lesson 4 Slides')).toBeInTheDocument()
  })

  it('renders Assignment Details & Grading Workspace (Stitch Screen 04)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <AssignmentGradingPage params={Promise.resolve({ locale: 'en', id: 'asg-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getByText("Physics Lab Report #3: Newton's Laws")).toBeInTheDocument()
    expect(screen.getByText('Student Submissions (4)')).toBeInTheDocument()
    expect(screen.getAllByText('Zainab Al-Fassi (10A)').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByText('Rubric Breakdown')).toBeInTheDocument()
  })

  it('renders Quiz Builder Workspace (Stitch Screen 25)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <QuizBuilderPage params={Promise.resolve({ locale: 'en' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getAllByText('Quiz Builder').length).toBeGreaterThanOrEqual(1)
    expect(screen.getByDisplayValue('Midterm Assessment: Cellular Biology')).toBeInTheDocument()
    expect(screen.getByText('Questions')).toBeInTheDocument()
    expect(screen.getByText('Publish Quiz')).toBeInTheDocument()
  })

  it('renders Online Quiz Taking full page (Stitch Screen 27)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <OnlineQuizTakingPage params={Promise.resolve({ locale: 'en', id: 'quiz-1' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getByText('Physics Midterm Quiz 1')).toBeInTheDocument()
    expect(screen.getByText('Kinematics')).toBeInTheDocument()
    expect(screen.getByText('100.0 m')).toBeInTheDocument()
    expect(screen.getByText('Previous Question')).toBeInTheDocument()
  })

  it('renders Events Calendar full page (Stitch Screen 26)', async () => {
    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <EventsCalendarPage />
      </NextIntlClientProvider>
    )

    expect(screen.getByText('October 2025')).toBeInTheDocument()
    expect(screen.getByText('School Events')).toBeInTheDocument()
    expect(screen.getByText('Holidays')).toBeInTheDocument()
    expect(screen.getByText('Parent Meetings')).toBeInTheDocument()
  })

  it('renders Notification Center full page (Stitch Screen 30)', async () => {
    await act(async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <NotificationCenterPage params={Promise.resolve({ locale: 'en' })} />
        </NextIntlClientProvider>
      )
    })

    expect(screen.getByText('Notification Center')).toBeInTheDocument()
    expect(screen.getByText('All Notifications')).toBeInTheDocument()
    expect(screen.getByText('Physics Lab Report #3 has been graded')).toBeInTheDocument()
  })
})
