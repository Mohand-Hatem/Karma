import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { NextIntlClientProvider } from 'next-intl'
import messages from '../../../i18n/messages/ar.json'
import HomePage from './page'

describe('HomePage (ar locale)', () => {
  it('renders the Arabic title', () => {
    render(
      <NextIntlClientProvider locale="ar" messages={messages}>
        <HomePage />
      </NextIntlClientProvider>
    )
    expect(screen.getByText('كارما')).toBeInTheDocument()
  })
})
