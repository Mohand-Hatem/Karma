import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../i18n/messages/en.json'
import ForgotPasswordPage from './forgot-password/page'
import ResetPasswordPage from './reset-password/page'
import OnboardingPage from './onboarding/page'

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
  }),
}))

describe('Secondary Auth & Onboarding Flows (Stitch Screens 08, 10, 06)', () => {
  describe('ForgotPasswordPage (Screen 08)', () => {
    it('renders email input, handles submission and displays confirmation', async () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <ForgotPasswordPage params={Promise.resolve({ locale: 'en' })} />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Reset your password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('e.g. teacher@school.edu')).toBeInTheDocument()
      expect(screen.getByText('Send Reset Link')).toBeInTheDocument()
      expect(screen.getByText('Back to login')).toBeInTheDocument()

      const emailInput = screen.getByPlaceholderText('e.g. teacher@school.edu')
      fireEvent.change(emailInput, { target: { value: 'teacher@school.edu' } })

      const submitBtn = screen.getByText('Send Reset Link')
      fireEvent.click(submitBtn)

      await waitFor(() => {
        expect(screen.getByText('Reset Link Sent')).toBeInTheDocument()
        expect(screen.getByText('teacher@school.edu')).toBeInTheDocument()
      })
    })
  })

  describe('ResetPasswordPage (Screen 10)', () => {
    it('renders password checklist and validates live criteria', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <ResetPasswordPage params={Promise.resolve({ locale: 'en' })} />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Set new password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Enter new password')).toBeInTheDocument()
      expect(screen.getByPlaceholderText('Re-enter new password')).toBeInTheDocument()
      expect(screen.getByText('At least 8 characters long')).toBeInTheDocument()
      expect(screen.getByText('Contains an uppercase letter')).toBeInTheDocument()

      const submitBtn = screen.getByText('Reset Password & Sign In')
      expect(submitBtn).toBeDisabled()

      // Fill strong matching password
      const newPwdInput = screen.getByPlaceholderText('Enter new password')
      const confirmPwdInput = screen.getByPlaceholderText('Re-enter new password')

      fireEvent.change(newPwdInput, { target: { value: 'KarmaAdmin2026!' } })
      fireEvent.change(confirmPwdInput, { target: { value: 'KarmaAdmin2026!' } })

      expect(submitBtn).not.toBeDisabled()
    })
  })

  describe('OnboardingPage (Screen 06)', () => {
    it('renders institution invitation, system preferences, and completes setup', () => {
      render(
        <NextIntlClientProvider locale="en" messages={messages}>
          <OnboardingPage params={Promise.resolve({ locale: 'en' })} />
        </NextIntlClientProvider>
      )

      expect(screen.getByText('Welcome to Al-Amal Academy')).toBeInTheDocument()
      expect(screen.getByDisplayValue('ahmed.hassan@alamal.edu')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Ahmed Hassan')).toBeInTheDocument()
      expect(screen.getByText('System Preferences')).toBeInTheDocument()
      expect(screen.getByText('Complete Account Setup & Enter Dashboard')).toBeInTheDocument()

      // Language switcher toggle
      const arabicBtn = screen.getByRole('button', { name: 'العربية' })
      fireEvent.click(arabicBtn)

      // Enter matching valid password
      const pwdInput = screen.getByPlaceholderText('Create a secure password')
      const confirmInput = screen.getByPlaceholderText('Re-enter password')

      fireEvent.change(pwdInput, { target: { value: 'SecurePass123!' } })
      fireEvent.change(confirmInput, { target: { value: 'SecurePass123!' } })

      const submitBtn = screen.getByText('Complete Account Setup & Enter Dashboard')
      expect(submitBtn).not.toBeDisabled()
    })
  })
})
