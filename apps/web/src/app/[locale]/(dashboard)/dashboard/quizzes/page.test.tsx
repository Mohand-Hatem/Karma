import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import QuizzesPage from './page'

function renderQuizzesPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <QuizzesPage />
    </NextIntlClientProvider>
  )
}

describe('QuizzesPage (Assessment Center Stitch Clone)', () => {
  it('renders Assessment Center header, bento stats, and assessment rows', () => {
    renderQuizzesPage()

    expect(screen.getByText('Assessment Center')).toBeInTheDocument()
    expect(screen.getByText('Active Quizzes')).toBeInTheDocument()
    expect(screen.getByText('Needs Grading')).toBeInTheDocument()
    expect(screen.getByText('Avg. Completion Rate')).toBeInTheDocument()
    expect(screen.getByText('Biology 101 - Cell Structure')).toBeInTheDocument()
    expect(screen.getByText('Calculus - Limits & Derivatives')).toBeInTheDocument()
  })

  it('filters assessments by search query', () => {
    renderQuizzesPage()

    const searchInput = screen.getByPlaceholderText('Search assessments...')
    fireEvent.change(searchInput, { target: { value: 'Calculus' } })

    expect(screen.getByText('Calculus - Limits & Derivatives')).toBeInTheDocument()
    expect(screen.queryByText('Biology 101 - Cell Structure')).not.toBeInTheDocument()
  })

  it('switches to Quiz Builder mode when Create Assessment is clicked', () => {
    renderQuizzesPage()

    const createBtn = screen.getByText('Create Assessment')
    fireEvent.click(createBtn)

    expect(screen.getByText('Quiz Builder')).toBeInTheDocument()
    expect(screen.getByText('Questions')).toBeInTheDocument()
    expect(screen.getByText('Save Draft')).toBeInTheDocument()
    expect(screen.getByText('Publish Quiz')).toBeInTheDocument()
  })

  it('switches to Online Quiz Taking mode and displays timer and questions', () => {
    renderQuizzesPage()

    const editBtns = screen.getAllByText('Edit')
    fireEvent.click(editBtns[0])

    const previewBtn = screen.getByText('Preview')
    fireEvent.click(previewBtn)

    expect(screen.getByText(/remaining/i)).toBeInTheDocument()
    expect(screen.getByText('Question Navigator')).toBeInTheDocument()
    expect(screen.getByText('Next Question')).toBeInTheDocument()
  })
})
