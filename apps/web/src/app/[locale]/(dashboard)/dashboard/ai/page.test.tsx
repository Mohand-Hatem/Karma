import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import EduAiPage from './page'

function renderEduAiPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <EduAiPage />
    </NextIntlClientProvider>
  )
}

describe('EduAiPage (EduAI Assistant Workspace Stitch Clone)', () => {
  it('renders chat history sidebar and security disclaimer bar', () => {
    renderEduAiPage()

    expect(screen.getByText('EduAI Chat')).toBeInTheDocument()
    expect(screen.getByText('10A Attendance Analysis')).toBeInTheDocument()
    expect(screen.getByText('Physics Curriculum Planning')).toBeInTheDocument()
    expect(
      screen.getByText(
        'EduAI operates with role-scoped permissions and real school data.'
      )
    )
  })

  it('renders initial active conversation with tool citation badge and structured attendance data', () => {
    renderEduAiPage()

    // User message
    expect(
      screen.getByText(
        'Which students in 10A have attendance below 80% this semester?'
      )
    ).toBeInTheDocument()

    // Tool citation pill
    expect(
      screen.getByText('Queried Class 10A Attendance Service')
    ).toBeInTheDocument()

    // Structured table entries
    expect(screen.getByText('Sarah Jenkins')).toBeInTheDocument()
    expect(screen.getByText('#10042')).toBeInTheDocument()
    expect(screen.getByText('76.5%')).toBeInTheDocument()
    expect(screen.getByText('Michael Chang')).toBeInTheDocument()
  })

  it('starts a new chat session via New Chat trigger', () => {
    renderEduAiPage()

    const newChatBtn = screen.getByTitle('New Chat')
    fireEvent.click(newChatBtn)

    expect(
      screen.getByText('How can EduAI assist you today?')
    ).toBeInTheDocument()
    expect(
      screen.getAllByText('Draft intervention notice').length
    ).toBeGreaterThan(0)
  })

  it('populates and sends message through suggestion chips', () => {
    renderEduAiPage()

    const chip = screen.getAllByText('Draft intervention notice')[0]
    fireEvent.click(chip)

    // User message should appear in chat feed
    expect(
      screen.getAllByText('Draft intervention notice').length
    ).toBeGreaterThanOrEqual(2)
  })

  it('copies message to clipboard and confirms with toast', () => {
    renderEduAiPage()

    const copyBtn = screen.getByTitle('Copy')
    fireEvent.click(copyBtn)

    expect(screen.getByText('Copied to clipboard!')).toBeInTheDocument()
  })
})
