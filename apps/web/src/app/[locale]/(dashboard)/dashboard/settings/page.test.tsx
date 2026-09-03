import { describe, expect, it } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../../../../i18n/messages/en.json'
import SettingsPage from './page'

function renderSettingsPage() {
  return render(
    <NextIntlClientProvider locale="en" messages={messages}>
      <SettingsPage />
    </NextIntlClientProvider>
  )
}

describe('SettingsPage (Org Settings, Profile & Audit Log Stitch Clone)', () => {
  it('renders Organization Profile and Plan Quota meters', () => {
    renderSettingsPage()

    expect(screen.getByText('School Settings')).toBeInTheDocument()
    expect(screen.getByText('Cairo International Academy')).toBeInTheDocument()
    expect(screen.getByText('cia-main')).toBeInTheDocument()
    expect(screen.getByText('Africa/Cairo')).toBeInTheDocument()

    // Subscription & Meters
    expect(screen.getByText('School Enterprise Plan')).toBeInTheDocument()
    expect(screen.getByText('120 / 500 (24%)')).toBeInTheDocument()
    expect(screen.getByText('18 / 50 (36%)')).toBeInTheDocument()
    expect(screen.getByText('1.2 GB / 5.0 GB (24%)')).toBeInTheDocument()
    expect(screen.getByText('140 / 1,000 (14%)')).toBeInTheDocument()
  })

  it('opens Edit Organization drawer and updates profile', () => {
    renderSettingsPage()

    const editBtn = screen.getByText('Edit Profile')
    fireEvent.click(editBtn)

    expect(screen.getByText('Edit Organization Profile')).toBeInTheDocument()

    const nameInput = screen.getByDisplayValue('Cairo International Academy')
    fireEvent.change(nameInput, { target: { value: 'New Cairo Academy' } })

    const saveButtons = screen.getAllByText('Save Changes')
    fireEvent.click(saveButtons[saveButtons.length - 1])

    expect(screen.getByText('New Cairo Academy')).toBeInTheDocument()
  })

  it('switches to Profile & Preferences tab and updates personal information', () => {
    renderSettingsPage()

    const profileTab = screen.getByText('Profile & Preferences')
    fireEvent.click(profileTab)

    expect(screen.getByText('Personal Information')).toBeInTheDocument()
    expect(screen.getByText('Preferences & Notifications')).toBeInTheDocument()

    // Email is locked
    const emailInput = screen.getByDisplayValue('admin@karmasaas.com')
    expect(emailInput).toBeDisabled()

    // Save changes
    const saveBtn = screen.getByRole('button', { name: 'Save Changes' })
    fireEvent.click(saveBtn)

    expect(screen.getByText('Profile information updated successfully.')).toBeInTheDocument()
  })

  it('updates password and verifies match confirmation', () => {
    renderSettingsPage()

    const profileTab = screen.getByText('Profile & Preferences')
    fireEvent.click(profileTab)

    const inputs = screen.getAllByLabelText(/Password/i)
    // current, new, confirm
    fireEvent.change(inputs[0], { target: { value: 'oldpass123' } })
    fireEvent.change(inputs[1], { target: { value: 'newsecurepass' } })
    fireEvent.change(inputs[2], { target: { value: 'newsecurepass' } })

    const updateBtn = screen.getByText('Update Password')
    fireEvent.click(updateBtn)

    expect(screen.getByText('Password updated successfully.')).toBeInTheDocument()
  })

  it('switches to Audit Log tab, displays KPI metrics and inspects event details', () => {
    renderSettingsPage()

    const auditTab = screen.getByText('Audit Log Explorer')
    fireEvent.click(auditTab)

    expect(screen.getByText('Audit Log')).toBeInTheDocument()
    expect(screen.getByText('12,458')).toBeInTheDocument()
    expect(screen.getByText('342')).toBeInTheDocument()
    expect(screen.getByText('Normal')).toBeInTheDocument()

    // Events in table
    expect(screen.getByText('RESULT_PUBLISHED')).toBeInTheDocument()
    expect(screen.getByText('ATTENDANCE_OVERRIDDEN')).toBeInTheDocument()
    expect(screen.getByText('USER_ROLE_UPDATED')).toBeInTheDocument()

    // Click on an event row to inspect details
    fireEvent.click(screen.getByText('RESULT_PUBLISHED'))

    expect(screen.getByText('Audit Event Details')).toBeInTheDocument()
    expect(screen.getByText('192.168.1.45')).toBeInTheDocument()
    expect(screen.getByText('GB-2026-TERM1')).toBeInTheDocument()
  })
})
